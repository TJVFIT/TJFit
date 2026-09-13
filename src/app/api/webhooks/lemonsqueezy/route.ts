import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { parseLemonOrderEvent, verifyLemonSignature } from "@/lib/payments/lemon/webhook";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const secrets = [
    { testMode: true, secret: process.env.LEMON_TEST_WEBHOOK_SECRET?.trim(), storeId: process.env.LEMON_TEST_STORE_ID?.trim() },
    { testMode: false, secret: process.env.LEMON_LIVE_WEBHOOK_SECRET?.trim(), storeId: process.env.LEMON_LIVE_STORE_ID?.trim() }
  ].filter(item => item.secret && item.storeId);
  if (!secrets.length || (secrets.length === 2 && secrets[0].secret === secrets[1].secret)) return NextResponse.json({ error: "Webhook unavailable" }, { status: 503 });
  const reader = request.body?.getReader();
  if (!reader) return NextResponse.json({ error: "Body required" }, { status: 400 });
  let raw: Buffer;
  try {
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 65536) { await reader.cancel(); return NextResponse.json({ error: "Body too large" }, { status: 413 }); }
      chunks.push(value);
    }
    raw = Buffer.concat(chunks);
  } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const authenticated = secrets.find(item => verifyLemonSignature(raw, request.headers.get("x-signature"), item.secret!));
  if (!authenticated) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  let event;
  try {
    event = parseLemonOrderEvent(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw)), authenticated.testMode);
    if (event.storeId !== authenticated.storeId) throw new Error("Wrong store");
  } catch { return NextResponse.json({ error: "Invalid payment event" }, { status: 400 }); }
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Webhook storage unavailable" }, { status: 503 });
  // This RPC atomically records the event and changes access. No ack before commit.
  const { data, error } = await admin.rpc("apply_lemon_order_event", { p_event: event, p_payload_sha256: createHash("sha256").update(raw).digest("hex") });
  if (error || !data) return NextResponse.json({ error: "Payment processing will retry" }, { status: 503 });
  return NextResponse.json({ received: true, ...data });
}
