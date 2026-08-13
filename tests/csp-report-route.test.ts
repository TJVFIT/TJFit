/**
 * POST /api/csp-report (WP-SEC-03 stage 1). Pins: both wire formats produce a
 * digest, rate-limited callers are dropped without processing, oversized or
 * non-JSON bodies get 400, and nothing is ever reflected back.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  limiterSuccess: true,
  captured: [] as Array<{ message: string; directive: string }>
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(async () => ({ success: h.limiterSuccess, remaining: 0 }))
}));
vi.mock("@sentry/nextjs", () => ({
  captureMessage: vi.fn((message: string, ctx: { tags: { directive: string } }) => {
    h.captured.push({ message, directive: ctx.tags.directive });
  })
}));

import type { NextRequest } from "next/server";
import { POST } from "@/app/api/csp-report/route";

function makeRequest(body: string): NextRequest {
  return {
    headers: new Headers({ "x-forwarded-for": "203.0.113.9" }),
    text: () => Promise.resolve(body)
  } as unknown as NextRequest;
}

beforeEach(() => {
  h.limiterSuccess = true;
  h.captured = [];
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("POST /api/csp-report", () => {
  it("accepts a legacy report-uri payload and captures its digest", async () => {
    const res = await POST(
      makeRequest(
        JSON.stringify({
          "csp-report": {
            "effective-directive": "script-src",
            "blocked-uri": "https://evil.example/x.js",
            "document-uri": "https://tjfit.org/en"
          }
        })
      )
    );
    expect(res.status).toBe(204);
    expect(h.captured).toHaveLength(1);
    expect(h.captured[0].directive).toBe("script-src");
  });

  it("accepts a Reporting-API batch and captures each csp-violation entry", async () => {
    const res = await POST(
      makeRequest(
        JSON.stringify([
          {
            type: "csp-violation",
            body: {
              effectiveDirective: "img-src",
              blockedURL: "https://x.example/a.png",
              documentURL: "https://tjfit.org/en"
            }
          },
          { type: "deprecation", body: {} }
        ])
      )
    );
    expect(res.status).toBe(204);
    expect(h.captured).toHaveLength(1);
    expect(h.captured[0].directive).toBe("img-src");
  });

  it("drops rate-limited callers with 204 and zero processing", async () => {
    h.limiterSuccess = false;
    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(204);
    expect(h.captured).toEqual([]);
  });

  it("rejects oversized bodies with 400", async () => {
    const res = await POST(makeRequest("x".repeat(17 * 1024)));
    expect(res.status).toBe(400);
    expect(h.captured).toEqual([]);
  });

  it("rejects non-JSON with 400 and reflects nothing", async () => {
    const res = await POST(makeRequest("<not json>"));
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("");
  });

  it("strips newlines from report fields so a hostile uri can't forge a log line", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    await POST(
      makeRequest(
        JSON.stringify({
          "csp-report": {
            "effective-directive": "script-src",
            "blocked-uri": "https://x/\n[csp-report] directive=FORGED",
            "document-uri": "https://tjfit.org/en"
          }
        })
      )
    );
    // No logged line may carry a newline — that's what would forge a 2nd entry.
    expect(warnSpy.mock.calls.every((c) => !String(c[0]).includes("\n"))).toBe(true);
    // And the one violation is captured with its (newline-free) blocked uri.
    expect(h.captured).toHaveLength(1);
    expect(h.captured[0].message).toBe("CSP violation: script-src");
  });

  it("rejects a body over 16 KB of real UTF-8 bytes even if char count is under", async () => {
    // 15,000 × '€' = 45,000 UTF-8 bytes but only 15,000 JS chars.
    const oversizeMultibyte = JSON.stringify({ "csp-report": { pad: "€".repeat(15_000) } });
    const res = await POST(makeRequest(oversizeMultibyte));
    expect(res.status).toBe(400);
  });
});
