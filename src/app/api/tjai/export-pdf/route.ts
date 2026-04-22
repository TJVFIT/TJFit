import { NextResponse } from "next/server";

import { isSupportedLocale, LOCALE_META } from "@/lib/i18n";
import { requireAuth } from "@/lib/require-auth";
import { buildTjaiPdf } from "@/lib/tjai-pdf-builder";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function cleanFilename(name?: string | null): string {
  const base = (name || "tjai-plan")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return (base || "tjai-plan").slice(0, 60);
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.plan || !body?.metrics || !body?.answers) {
    return NextResponse.json(
      { error: "Invalid payload — plan, metrics and answers are required." },
      { status: 400 }
    );
  }

  try {
    const rawLocale = typeof body.locale === "string" ? body.locale : "en";
    const locale = isSupportedLocale(rawLocale) ? rawLocale : "en";
    const meta = LOCALE_META[locale];
    const localeLabel = `${locale.toUpperCase()} · ${meta?.native ?? "English"}`;
    const buyerName =
      typeof body.buyerName === "string" && body.buyerName.trim()
        ? body.buyerName.trim()
        : auth.user.email ?? undefined;
    const issuedAt =
      typeof body.generatedAt === "string" ? body.generatedAt : new Date().toISOString();

    const pdf = buildTjaiPdf({
      plan: body.plan,
      metrics: body.metrics,
      answers: body.answers,
      buyerName,
      issuedAt,
      localeLabel
    });

    const arrayBuffer = pdf.output("arraybuffer");
    const bytes = new Uint8Array(arrayBuffer);
    const filename = `${cleanFilename(buyerName ?? "tjai-plan")}-${locale}.pdf`;

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
        "Content-Length": String(bytes.byteLength)
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    console.error("[TJAI export-pdf] PDF generation failed:", msg);
    return NextResponse.json(
      { error: "PDF generation failed. Please retry in a moment." },
      { status: 500 }
    );
  }
}
