import { NextResponse } from "next/server";
import { resolvePaymentBackend } from "@/lib/payments";
import { getLemonCheckoutConfig } from "@/lib/payments/lemon/config";
import { isTjaiPassCheckoutReady } from "@/lib/payments/lemon/readiness";

export const dynamic = "force-dynamic";
export async function GET() {
  const config = resolvePaymentBackend().providerId === "lemonsqueezy" ? getLemonCheckoutConfig() : null;
  const programSlugs = config ? Object.keys(config.products).filter(slug => slug !== "tjai-pass" || isTjaiPassCheckoutReady(config.testMode)) : [];
  return NextResponse.json({ available: programSlugs.length > 0, testMode: config?.testMode ?? false, programSlugs }, { headers: { "Cache-Control": "no-store" } });
}
