import { NextResponse } from "next/server";

import { buildBundlePdf } from "@/lib/bundle-pdf-builder";
import { localizeBundle } from "@/lib/bundle-localization";
import { getBundle } from "@/lib/bundles";
import { isAdminEmail } from "@/lib/auth-utils";
import { hasPurchasedProgram } from "@/lib/purchases";
import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/bundles/download/[slug]?locale=
 * Returns the branded PDF dossier in the requested locale.
 *
 * Gating (tight): only paid orders OR admin emails. `isFree` no longer
 * bypasses the check — every download requires entitlement.
 */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { slug } = await params;
  const bundle = getBundle(slug);
  if (!bundle) {
    return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
  }

  const admin = !!auth.user.email && isAdminEmail(auth.user.email);
  if (!admin) {
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

  const url = new URL(req.url);
  const locale = url.searchParams.get("locale") ?? "en";
  const copy = localizeBundle(bundle, locale);

  const pdf = buildBundlePdf({
    bundle,
    copy,
    locale,
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
