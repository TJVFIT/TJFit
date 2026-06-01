// Not implemented server-side. The actual share-card image is generated
// client-side via the <ShareCardGenerator/> component in
// src/components/tjai/share-card-generator.tsx (canvas → PNG download).
// This endpoint is reserved for future server-side rendering (OG images,
// share-card analytics, persisted gallery). Until then it honestly reports
// 501 rather than a misleading success. The auth gate stays so the
// placeholder cannot be probed anonymously.

import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(
    { error: "not_implemented", message: "Server-side share cards are not available; generate client-side." },
    { status: 501 }
  );
}

