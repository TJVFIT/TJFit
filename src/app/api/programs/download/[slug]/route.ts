import { NextResponse } from "next/server";

import { programs } from "@/lib/content";
import { isCatalogDiet } from "@/lib/diet-catalog";
import { buildDietPdf } from "@/lib/diet-pdf-builder";
import { buildProgramPdf } from "@/lib/program-pdf-builder";
import { programBlueprints } from "@/lib/program-blueprints";
import { hasPurchasedProgram } from "@/lib/purchases";
import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/programs/download/[slug]
 * Returns the premium obsidian+champagne PDF for a purchased program or diet.
 * - Gated by auth + paid `program_orders` row (or `is_free`).
 * - Streams the PDF as application/pdf with a filename-safe Content-Disposition.
 */
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const slug = params.slug;
  const program = programs.find((p) => p.slug === slug);
  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  if (!program.is_free) {
    const paid = await hasPurchasedProgram(auth.supabase, auth.user.id, slug);
    if (!paid) {
      return NextResponse.json({ error: "Purchase required" }, { status: 403 });
    }
  }

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("full_name")
    .eq("id", auth.user.id)
    .maybeSingle();
  const buyerName = profile?.full_name ?? auth.user.email?.split("@")[0];

  const pdf = isCatalogDiet(program)
    ? buildDietPdf({ program, buyerName, issuedAt: new Date().toISOString() })
    : buildProgramPdf({
        program,
        blueprint: programBlueprints[program.slug],
        buyerName,
        issuedAt: new Date().toISOString()
      });

  const arrayBuffer = pdf.output("arraybuffer") as ArrayBuffer;
  const filename = `tjfit-${slug}.pdf`;

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store"
    }
  });
}
