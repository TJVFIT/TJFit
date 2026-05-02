// Stub: this route is intentionally a no-op. The actual share-card
// image is generated client-side via the <ShareCardGenerator/> component
// in src/components/tjai/share-card-generator.tsx (canvas → PNG download).
// This server endpoint is reserved for future use (server-side rendering
// for OG images, share-card analytics, persisted gallery). The auth gate
// stays so the placeholder cannot be hammered anonymously.

import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true, stub: true });
}

