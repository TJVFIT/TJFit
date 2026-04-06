import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body?.plan || !body?.metrics) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  return NextResponse.json({ ok: true, message: "Use client-side jsPDF generation for download." });
}

