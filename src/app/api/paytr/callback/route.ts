import { NextRequest, NextResponse } from "next/server";

import { verifyPaytrCallback } from "@/lib/paytr";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { TJFIT_COINS_PER_PROGRAM_PURCHASE } from "@/lib/tjfit-coin";

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

      if (status === "success") {
        const { data: order } = await supabase
          .from("program_orders")
          .select("id,user_id,status,discount_code")
          .eq("provider_order_id", merchantOid)
          .maybeSingle();

        if (order && order.status === "pending") {
          await supabase
            .from("program_orders")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              tjfit_coins_earned: TJFIT_COINS_PER_PROGRAM_PURCHASE
            })
            .eq("id", order.id)
            .eq("status", "pending");

          await supabase.from("tjfit_coin_wallets").upsert({ user_id: order.user_id }, { onConflict: "user_id" });

          const { data: wallet } = await supabase
            .from("tjfit_coin_wallets")
            .select("balance,lifetime_earned,lifetime_spent")
            .eq("user_id", order.user_id)
            .single();

          const balance = wallet?.balance ?? 0;
          const lifetimeEarned = wallet?.lifetime_earned ?? 0;
          const lifetimeSpent = wallet?.lifetime_spent ?? 0;

          await supabase
            .from("tjfit_coin_wallets")
            .update({
              balance: balance + TJFIT_COINS_PER_PROGRAM_PURCHASE,
              lifetime_earned: lifetimeEarned + TJFIT_COINS_PER_PROGRAM_PURCHASE,
              lifetime_spent: lifetimeSpent,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", order.user_id);

          await supabase.from("tjfit_coin_ledger").insert({
            user_id: order.user_id,
            delta: TJFIT_COINS_PER_PROGRAM_PURCHASE,
            reason: "program_purchase_paytr_callback",
            order_id: order.id,
            metadata: { merchantOid }
          });

          if (order.discount_code) {
            await supabase
              .from("tjfit_discount_codes")
              .update({
                status: "used",
                used_at: new Date().toISOString(),
                order_id: order.id
              })
              .eq("code", order.discount_code)
              .eq("user_id", order.user_id)
              .eq("status", "available");
          }
        }
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
