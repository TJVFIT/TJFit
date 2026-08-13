import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

import { rateLimit } from "@/lib/rate-limit";

/**
 * CSP violation collector (WP-SEC-03 stage 1). Receives both wire formats:
 * legacy `report-uri` posts (`application/csp-report`, single object) and
 * Reporting-API `report-to` batches (`application/reports+json`, array).
 *
 * Public and unauthenticated by nature, so: 16 KB body cap (real UTF-8
 * bytes), best-effort IP rate-limit (in-memory today, sliding-window once
 * WP-SEC-01 wires Upstash — do not lean on it as the sole defense; the body
 * cap + always-204 are the real backstops), and it never reflects payload
 * data back. Each violation logs one compact SANITIZED line (fields are
 * newline-stripped + length-capped so a hostile blocked-uri can't forge log
 * lines) and mirrors to Sentry under surface:csp-report once the DSN exists.
 * Always 204 on accepted input — reporters ignore the response anyway.
 */

const MAX_BODY_BYTES = 16 * 1024;
const MAX_FIELD_CHARS = 300;

/** Collapse CR/LF/control chars to a space and cap length: a hostile
 * blocked-uri can't forge a second `[csp-report]` log line or bloat Sentry. */
function sanitizeField(value: unknown): string {
  return String(value)
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .slice(0, MAX_FIELD_CHARS);
}

type ViolationDigest = { directive: string; blocked: string; doc: string };

function digestFromLegacy(body: unknown): ViolationDigest | null {
  const r = (body as { "csp-report"?: Record<string, unknown> })?.["csp-report"];
  if (!r || typeof r !== "object") return null;
  return {
    directive: sanitizeField(r["effective-directive"] ?? r["violated-directive"] ?? "unknown"),
    blocked: sanitizeField(r["blocked-uri"] ?? "unknown"),
    doc: sanitizeField(r["document-uri"] ?? "unknown")
  };
}

function digestsFromReportingApi(body: unknown): ViolationDigest[] {
  if (!Array.isArray(body)) return [];
  return body
    .filter((entry) => (entry as { type?: string })?.type === "csp-violation")
    .map((entry) => {
      const b = ((entry as { body?: Record<string, unknown> }).body ?? {}) as Record<string, unknown>;
      return {
        directive: sanitizeField(b.effectiveDirective ?? "unknown"),
        blocked: sanitizeField(b.blockedURL ?? "unknown"),
        doc: sanitizeField(b.documentURL ?? "unknown")
      };
    });
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const limiter = await rateLimit({ key: `csp-report:${ip}`, limit: 60, windowMs: 60_000 });
  if (!limiter.success) return new NextResponse(null, { status: 204 });

  const raw = await request.text().catch(() => "");
  // Byte length, not raw.length: multi-byte chars must count against the cap.
  if (!raw || Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 400 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const digests = [digestFromLegacy(parsed), ...digestsFromReportingApi(parsed)].filter(
    (d): d is ViolationDigest => d !== null
  );

  for (const d of digests.slice(0, 10)) {
    console.warn(`[csp-report] directive=${d.directive} blocked=${d.blocked} doc=${d.doc}`);
    Sentry.captureMessage(`CSP violation: ${d.directive}`, {
      level: "warning",
      tags: { surface: "csp-report", directive: d.directive },
      extra: { blocked: d.blocked, doc: d.doc }
    });
  }

  return new NextResponse(null, { status: 204 });
}
