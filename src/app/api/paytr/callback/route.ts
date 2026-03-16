import { NextRequest, NextResponse } from "next/server";

import { verifyPaytrCallback } from "@/lib/paytr";
import { getSupabaseServerClient } from "@/lib/supabase-server";

function logPaytrCallback(
  event: "received" | "duplicate" | "invalid" | "processed" | "error",
  merchantOid: string,
  details?: Record<string, unknown>
) {
  const payload = {
    event: `paytr_callback_${event}`,
    merchant_oid: merchantOid,
    timestamp: new Date().toISOString(),
    ...details
  };
  console.log(JSON.stringify(payload));
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const merchantOid = String(formData.get("merchant_oid") ?? "");
    const status = String(formData.get("status") ?? "");
    const totalAmount = String(formData.get("total_amount") ?? "");
    const hash = String(formData.get("hash") ?? "");

    if (!merchantOid || !status || !totalAmount || !hash) {
      logPaytrCallback("invalid", merchantOid || "unknown", { reason: "missing_fields" });
      return new NextResponse("Missing callback fields", { status: 400 });
    }

    const isValid = verifyPaytrCallback({
      merchantOid,
      status,
      totalAmount,
      hash
    });

    if (!isValid) {
      logPaytrCallback("invalid", merchantOid, { reason: "bad_signature" });
      return new NextResponse("Invalid callback signature", { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data: existing } = await supabase
        .from("paytr_callbacks")
        .select("merchant_oid")
        .eq("merchant_oid", merchantOid)
        .single();

      if (existing) {
        logPaytrCallback("duplicate", merchantOid);
        return new NextResponse("OK", { status: 200 });
      }

      const rawPayload: Record<string, string> = {};
      formData.forEach((value, key) => {
        rawPayload[key] = String(value);
      });

      const { error } = await supabase.from("paytr_callbacks").insert({
        merchant_oid: merchantOid,
        status,
        total_amount: totalAmount,
        raw_payload: rawPayload
      });

      if (error) {
        if (error.code === "23505") {
          logPaytrCallback("duplicate", merchantOid);
          return new NextResponse("OK", { status: 200 });
        }
        logPaytrCallback("error", merchantOid, { error: error.message });
        throw error;
      }

      logPaytrCallback("processed", merchantOid, { status, total_amount: totalAmount });
    } else {
      logPaytrCallback("received", merchantOid, { status, total_amount: totalAmount });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    logPaytrCallback("error", "unknown", {
      message: error instanceof Error ? error.message : "Callback failed"
    });
    return new NextResponse(error instanceof Error ? error.message : "Callback failed", {
      status: 500
    });
  }
}
