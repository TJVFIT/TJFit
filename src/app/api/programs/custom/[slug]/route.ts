import { NextRequest, NextResponse } from "next/server";
import { Locale, locales } from "@/lib/i18n";
import { toPublicCustomProgramRow, type CustomProgramRow } from "@/lib/custom-programs";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const PUBLIC_PROGRAM_COLUMNS =
  "id,slug,title,description,kind,price_try,difficulty,duration,uploader_role,localized_title,localized_description,translation_status,created_at";

function getRequestedLocale(request: NextRequest): Locale {
  const value = request.nextUrl.searchParams.get("locale") ?? "en";
  return locales.includes(value as Locale) ? (value as Locale) : "en";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const locale = getRequestedLocale(request);
  const { slug: slugParam } = await params;
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured." }, { status: 503 });
  }

  const slug = slugParam.trim();
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("custom_programs")
    .select(PUBLIC_PROGRAM_COLUMNS)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Unable to load the custom program." }, { status: 503 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const row = data as CustomProgramRow;
  return NextResponse.json(
    {
      program: toPublicCustomProgramRow(row, locale)
    },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}
