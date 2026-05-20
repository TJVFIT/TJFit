import { NextResponse } from "next/server";

import { buildBundlePdf } from "@/lib/bundle-pdf-builder";
import { getBundle } from "@/lib/bundles";
import { hasPurchasedProgram } from "@/lib/purchases";
import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/bundles/download/[slug]
 * Returns the branded PDF dossier for a bundle.
 *
 * Gating: free bundles are open to any signed-in user. Paid bundles check
 * `program_orders` for a paid row keyed by the bundle slug. Until the owner
 * wires bundle pricing (see feedback_pricing — prices are $0 until set),
 * paid bundles will only be downloadable by users with a real purchase row;
 * the marketing chip ("$10", "$15") is aspirational save copy.
 */
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const bundle = getBundle(params.slug);
  if (!bundle) {
    return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
  }

  if (!bundle.isFree) {
    const paid = await hasPurchasedProgram(auth.supabase, auth.user.id, bundle.slug);
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

  const pdf = buildBundlePdf({
    bundle,
    buyerName,
    issuedAt: new Date().toISOString()
  });

  const arrayBuffer = pdf.output("arraybuffer") as ArrayBuffer;
  const filename = `tjfit-bundle-${bundle.slug}.pdf`;

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store"
    }
  });
}
