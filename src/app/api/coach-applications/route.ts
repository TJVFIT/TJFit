import { NextRequest, NextResponse } from "next/server";

import { rateLimit } from "@/lib/rate-limit";
import { readRequestJson } from "@/lib/read-request-json";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const FULL_NAME_MAX = 120;
const SPECIALTY_MAX = 200;
const LANGUAGES_MAX = 200;
const COUNTRY_MAX = 80;
const CERTS_MAX = 4000;
const LOCALE_MAX = 8;
const AGE_MIN = 20;
const AGE_MAX = 100;

function clampString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t ? t.slice(0, max) : null;
}

export async function POST(request: NextRequest) {
  try {
    // Anonymous public endpoint — rate limit by IP (auth.user not available).
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const limiter = await rateLimit({
      key: `coach-application:${ip}`,
      limit: 5,
      windowMs: 60_000
    });

    if (!limiter.success) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const parsed = await readRequestJson(request);
    if (!parsed.ok) return parsed.response;
    const body = parsed.value as Record<string, unknown>;

    // Bounded + validated inputs. Previously every string was accepted up to
    // unlimited length — a bot could submit 1MB applications to bloat the
    // table or hide payloads inside the cert field.
    const ageRaw = Number(body.age);
    const age = Number.isFinite(ageRaw) ? Math.floor(ageRaw) : NaN;
    const fullName = clampString(body.full_name, FULL_NAME_MAX);
    const specialty = clampString(body.specialty, SPECIALTY_MAX);
    const languages = clampString(body.languages, LANGUAGES_MAX);
    const country = clampString(body.country, COUNTRY_MAX);
    const certs = clampString(body.certifications_and_style, CERTS_MAX);
    const locale = clampString(body.locale, LOCALE_MAX);

    if (
      !Number.isFinite(age) || age < AGE_MIN || age > AGE_MAX ||
      !fullName || !specialty || !languages || !country || !certs
    ) {
      return NextResponse.json(
        { error: "Invalid or missing required fields." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 503 }
      );
    }

    const { error } = await supabase.from("coach_applications").insert({
      age,
      full_name: fullName,
      specialty,
      languages,
      country,
      certifications_and_style: certs,
      locale
    });

    if (error) {
      console.error("[coach-applications] insert failed", error.message, error.code);
      return NextResponse.json({ error: "Failed to save application." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[coach-applications] crash", e);
    return NextResponse.json(
      { success: false, error: "Unable to submit application." },
      { status: 500 }
    );
  }
}
