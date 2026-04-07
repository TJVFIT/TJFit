import { NextRequest, NextResponse } from "next/server";

import { programs } from "@/lib/content";
import { isLocale, type Locale } from "@/lib/i18n";
import { localizeProgram } from "@/lib/program-localization";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const slug = String(sp.get("slug") ?? "").trim();
  const localeRaw = String(sp.get("locale") ?? "en");
  const locale: Locale = isLocale(localeRaw) ? localeRaw : "en";
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const program = programs.find((p) => p.slug === slug && p.is_free);
  if (!program) {
    return NextResponse.json({ error: "Free resource not found" }, { status: 404 });
  }

  const localized = localizeProgram(program, locale);
  const body = [
    `${localized.title}`,
    `Category: ${localized.category}`,
    `Difficulty: ${localized.difficulty}`,
    `Duration: ${localized.duration}`,
    "",
    `${localized.description}`,
    "",
    "Included assets:",
    ...program.assets.map((a, i) => `${i + 1}. ${a.label}`),
    "",
    "Use this resource with the free TDEE calculator and community support inside TJFit.",
    "This is a free download from Start Free."
  ].join("\n");

  const safeName = slug.replace(/[^a-z0-9\-]/gi, "-");
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}.txt"`
    }
  });
}
