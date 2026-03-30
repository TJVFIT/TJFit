import { NextRequest, NextResponse } from "next/server";
import { Locale, locales } from "@/lib/i18n";
import { localizeCustomProgramRow, type CustomProgramRow } from "@/lib/custom-programs";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const BUCKET_NAME = "program-assets";

function getRequestedLocale(request: NextRequest): Locale {
  const value = request.nextUrl.searchParams.get("locale") ?? "en";
  return locales.includes(value as Locale) ? (value as Locale) : "en";
}

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const locale = getRequestedLocale(request);
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("custom_programs")
    .select("*")
    .eq("slug", params.slug)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const row = data as CustomProgramRow;
  const localized = localizeCustomProgramRow(row, locale);

  const { data: signed } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(row.pdf_path, 60 * 20);

  return NextResponse.json({
    program: localized,
    translatedPdfText: row.localized_pdf_text?.[locale] ?? row.source_pdf_text ?? "",
    pdfUrl: signed?.signedUrl ?? null
  });
}
