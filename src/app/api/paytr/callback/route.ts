import { NextRequest, NextResponse } from "next/server";

import { verifyPaytrCallback } from "@/lib/paytr";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { TJFIT_COINS_PER_PROGRAM_PURCHASE } from "@/lib/tjfit-coin";

const MERCHANT_OID_PATTERN = /^[A-Za-z0-9]{1,64}$/;
const INTEGER_PATTERN = /^(0|[1-9][0-9]{0,17})$/;
const MAX_CALLBACK_BYTES = 16 * 1024;

function text(body: string, status: number) {
  return new NextResponse(body, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function logPaytrCallback(
  event: "duplicate" | "invalid" | "processed" | "error",
  merchantOid: string,
  details?: Record<string, unknown>
) {
  const payload = {
    event: `paytr_callback_${event}`,
    merchant_oid: merchantOid,
    timestamp: new Date().toISOString(),
    ...details
  };

  if (event === "error" || event === "invalid") {
    console.error(JSON.stringify(payload));
  } else {
    console.info(JSON.stringify(payload));
  }
}

function parseMinorAmount(value: string) {
  if (!INTEGER_PATTERN.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export async function POST(request: NextRequest) {
  let merchantOid = "unknown";

  try {
    const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.startsWith("application/x-www-form-urlencoded")) {
      return text("Invalid content type", 415);
    }

    const declaredLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(declaredLength) && declaredLength > MAX_CALLBACK_BYTES) {
      return text("Callback body too large", 413);
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_CALLBACK_BYTES) {
      return text("Callback body too large", 413);
    }

    const formData = new URLSearchParams(rawBody);
    merchantOid = String(formData.get("merchant_oid") ?? "").trim();
    const status = String(formData.get("status") ?? "").trim();
    const totalAmountRaw = String(formData.get("total_amount") ?? "").trim();
    const hash = String(formData.get("hash") ?? "").trim();

    if (
      !MERCHANT_OID_PATTERN.test(merchantOid) ||
      !["success", "failed"].includes(status) ||
      !totalAmountRaw ||
      !hash ||
      hash.length > 256
    ) {
      logPaytrCallback("invalid", merchantOid, { reason: "invalid_fields" });
      return text("Invalid callback fields", 400);
    }

    if (
      !verifyPaytrCallback({
        merchantOid,
        status,
        totalAmount: totalAmountRaw,
        hash
      })
    ) {
      logPaytrCallback("invalid", merchantOid, { reason: "bad_signature" });
      return text("Invalid callback signature", 400);
    }

    const totalAmountMinor = parseMinorAmount(totalAmountRaw);
    const paymentAmountRaw = String(
      formData.get("payment_amount") ?? ""
    ).trim();
    const paymentAmountMinor = paymentAmountRaw
      ? parseMinorAmount(paymentAmountRaw)
      : null;
    const currency = String(formData.get("currency") ?? "")
      .trim()
      .toUpperCase()
      .slice(0, 8);
    const testModeRaw = String(formData.get("test_mode") ?? "0").trim();

    if (
      totalAmountMinor === null ||
      !["0", "1"].includes(testModeRaw) ||
      (status === "success" &&
        (paymentAmountMinor === null || !["TL", "TRY"].includes(currency)))
    ) {
      logPaytrCallback("invalid", merchantOid, {
        reason: "invalid_payment_details"
      });
      return text("Invalid payment details", 400);
    }

    const failedReasonCode = String(
      formData.get("failed_reason_code") ?? ""
    )
      .replace(/[\r\n]+/g, " ")
      .trim()
      .slice(0, 50);
    const failedReasonMsg = String(formData.get("failed_reason_msg") ?? "")
      .replace(/[\r\n]+/g, " ")
      .trim()
      .slice(0, 500);
    const paymentType = String(formData.get("payment_type") ?? "")
      .trim()
      .slice(0, 20);
    const rawPayload = {
      merchant_oid: merchantOid,
      status,
      total_amount: totalAmountRaw,
      payment_amount: paymentAmountRaw || null,
      currency: currency || null,
      test_mode: testModeRaw,
      payment_type: paymentType || null,
      failed_reason_code: failedReasonCode || null,
      failed_reason_msg: failedReasonMsg || null
    };

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      logPaytrCallback("error", merchantOid, {
        reason: "server_not_configured"
      });
      return text("Temporary processing error", 503);
    }

    const { data: result, error: processingError } = await supabase.rpc(
      "process_paytr_callback",
      {
        p_merchant_oid: merchantOid,
        p_status: status,
        p_total_amount_minor: totalAmountMinor,
        p_payment_amount_minor: paymentAmountMinor,
        p_currency: currency || null,
        p_test_mode: testModeRaw === "1",
        p_failed_reason_code: failedReasonCode || null,
        p_failed_reason_msg: failedReasonMsg || null,
        p_raw_payload: rawPayload,
        p_coins_earned: TJFIT_COINS_PER_PROGRAM_PURCHASE
      }
    );

    if (processingError || !result) {
      logPaytrCallback("error", merchantOid, {
        reason: (processingError?.message ?? "empty_rpc_result").slice(0, 300)
      });
      return text("Temporary processing error", 500);
    }

    const value = result as {
      result?: "paid" | "failed" | "duplicate" | "already_paid";
      order_status?: string;
    };
    logPaytrCallback(
      value.result === "duplicate" ? "duplicate" : "processed",
      merchantOid,
      {
        result: value.result ?? "unknown",
        order_status: value.order_status ?? "unknown"
      }
    );

    // PayTR requires exactly plain-text OK after durable processing.
    return text("OK", 200);
  } catch (error) {
    logPaytrCallback("error", merchantOid, {
      reason: error instanceof Error ? error.message.slice(0, 300) : "unknown"
    });
    return text("Temporary processing error", 500);
  }
}
