import { randomBytes } from "node:crypto";
import { isIP } from "node:net";

import { NextRequest, NextResponse } from "next/server";

import { programs } from "@/lib/content";
import {
  getPaytrConfig,
  PAYTR_IFRAME_ORIGIN,
  requestPaytrIframeToken
} from "@/lib/paytr";
import { getProgramBasePriceTry } from "@/lib/program-localization";
import { rateLimit } from "@/lib/rate-limit";
import {
  exceedsDeclaredBodySize,
  getClientAddress,
  isTrustedMutationRequest
} from "@/lib/request-security";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { TJFIT_COINS_PER_PROGRAM_PURCHASE } from "@/lib/tjfit-coin";

const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9:_-]{16,128}$/;
const PROGRAM_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CreatedOrder = {
  id: string;
  user_id: string;
  program_slug: string;
  amount_try: number;
  final_amount_try: number;
  amount_minor: number;
  final_amount_minor: number;
  currency: "TRY";
  provider: "paytr" | "test";
  provider_order_id: string;
  status: "pending" | "paid" | "failed";
  discount_code: string | null;
  discount_percent: number;
  payment_expires_at: string | null;
};

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

function normalizeText(value: unknown, maxLength: number) {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function getClientIp(request: NextRequest) {
  const candidates = [
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0],
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-real-ip"),
    request.headers.get("x-forwarded-for")?.split(",")[0]
  ];

  for (const candidate of candidates) {
    const value = candidate?.trim().replace(/^\[|\]$/g, "");
    if (value && value.length <= 39 && isIP(value)) {
      return value;
    }
  }

  if (process.env.NODE_ENV !== "production") {
    return "127.0.0.1";
  }
  return null;
}

function getTrustedAppUrl(paytrTestMode: boolean) {
  const explicitUrl =
    process.env.PAYTR_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "");

  if (!explicitUrl) return null;

  try {
    const url = new URL(explicitUrl);
    if (url.username || url.password) return null;
    if (
      url.protocol !== "https:" &&
      !(paytrTestMode && process.env.NODE_ENV !== "production")
    ) {
      return null;
    }
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

function makeProviderOrderId() {
  return `TJF${Date.now().toString(36)}${randomBytes(12).toString("hex")}`.toUpperCase();
}

function isValidPaytrEmail(email: string) {
  return (
    email.length <= 100 &&
    /^[\x20-\x7E]+$/.test(email) &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  );
}

function isValidPhone(phone: string) {
  return phone.length <= 20 && /^\+?[0-9 ()-]{7,20}$/.test(phone);
}

export async function GET(request: NextRequest) {
  let supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  try {
    supabase = await createServerSupabaseClient();
  } catch {
    return json({ error: "Authentication service is not configured." }, 503);
  }
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return json({ error: "Unauthorized" }, 401);
  }

  const orderId = request.nextUrl.searchParams.get("orderId")?.trim() ?? "";
  if (!UUID_PATTERN.test(orderId)) {
    return json({ error: "A valid orderId is required." }, 400);
  }

  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return json({ error: "Server not configured." }, 503);
  }

  const { data: order, error: orderError } = await adminClient
    .from("program_orders")
    .select(
      "id,program_slug,amount_try,final_amount_try,amount_minor,final_amount_minor,currency,provider,status,discount_percent,tjfit_coins_earned,created_at,paid_at,payment_expires_at"
    )
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (orderError) {
    return json({ error: "Could not check order status." }, 500);
  }
  if (!order) {
    return json({ error: "Order not found." }, 404);
  }

  return json({ order });
}

export async function POST(request: NextRequest) {
  if (!isTrustedMutationRequest(request)) {
    return json({ error: "Forbidden" }, 403);
  }
  if (exceedsDeclaredBodySize(request, 8 * 1024)) {
    return json({ error: "Request body is too large." }, 413);
  }

  let supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  try {
    supabase = await createServerSupabaseClient();
  } catch {
    return json({ error: "Authentication service is not configured." }, 503);
  }
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return json({ error: "Unauthorized" }, 401);
  }

  const limiter = rateLimit({
    key: `checkout-create:${user.id}:${getClientAddress(request)}`,
    limit: 10,
    windowMs: 60_000
  });
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please wait and retry." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(
            Math.max(1, Math.ceil((limiter.resetAt - Date.now()) / 1000))
          )
        }
      }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ error: "A valid JSON request body is required." }, 400);
  }

  const programSlug = normalizeText(
    (body as Record<string, unknown>).programSlug,
    160
  ).toLowerCase();
  const discountCode = normalizeText(
    (body as Record<string, unknown>).discountCode,
    80
  ).toUpperCase();
  const requestedLocale = normalizeText(
    (body as Record<string, unknown>).locale,
    8
  ).toLowerCase();
  const userName = normalizeText(
    (body as Record<string, unknown>).userName,
    60
  );
  const userAddress = normalizeText(
    (body as Record<string, unknown>).userAddress,
    400
  );
  const userPhone = normalizeText(
    (body as Record<string, unknown>).userPhone,
    20
  );
  const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? "";

  if (!PROGRAM_SLUG_PATTERN.test(programSlug)) {
    return json({ error: "A valid program is required." }, 400);
  }
  if (!IDEMPOTENCY_KEY_PATTERN.test(idempotencyKey)) {
    return json({ error: "A valid Idempotency-Key header is required." }, 400);
  }

  let paytrConfig: ReturnType<typeof getPaytrConfig>;
  try {
    paytrConfig = getPaytrConfig();
  } catch {
    return json({ error: "PayTR environment configuration is invalid." }, 503);
  }
  const allowLocalTestCheckout =
    process.env.ALLOW_TEST_CHECKOUT === "true" &&
    process.env.NODE_ENV !== "production";
  const provider = paytrConfig
    ? ("paytr" as const)
    : allowLocalTestCheckout
      ? ("test" as const)
      : null;

  if (!provider) {
    return json(
      {
        error:
          "Payments are not configured yet. Complete the PayTR setup before accepting purchases."
      },
      503
    );
  }

  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return json({ error: "Server not configured." }, 503);
  }

  const staticProgram = programs.find((item) => item.slug === programSlug);
  let programTitle = staticProgram?.title ?? "";
  let baseTry = staticProgram ? getProgramBasePriceTry(staticProgram) : 0;

  if (!staticProgram) {
    const { data: customProgram, error: customProgramError } = await adminClient
      .from("custom_programs")
      .select("slug,title,price_try,active")
      .eq("slug", programSlug)
      .eq("active", true)
      .maybeSingle();

    if (customProgramError) {
      return json({ error: "Could not load program pricing." }, 500);
    }
    if (!customProgram) {
      return json({ error: "Program not found." }, 404);
    }

    programTitle = normalizeText(customProgram.title, 120);
    baseTry = Number(customProgram.price_try);
  }

  if (!Number.isSafeInteger(baseTry) || baseTry <= 0) {
    return json({ error: "This program does not have a valid price." }, 409);
  }

  let discountPercent = 0;
  if (discountCode) {
    const { data: code, error: codeError } = await adminClient
      .from("tjfit_discount_codes")
      .select(
        "code,discount_percent,status,user_id,reservation_expires_at"
      )
      .eq("code", discountCode)
      .eq("user_id", user.id)
      .maybeSingle();

    if (codeError) {
      return json({ error: "Could not validate the discount code." }, 500);
    }

    if (!code || code.status !== "available") {
      return json(
        { error: "Invalid or unavailable discount code." },
        400
      );
    }

    discountPercent = Number(code.discount_percent);
    if (
      !Number.isInteger(discountPercent) ||
      discountPercent <= 0 ||
      discountPercent > 100
    ) {
      return json({ error: "Invalid discount code." }, 400);
    }
  }

  const amountMinor = baseTry * 100;
  const finalAmountMinor = Math.max(
    0,
    Math.round((amountMinor * (100 - discountPercent)) / 100)
  );
  if (provider === "paytr" && finalAmountMinor < 1) {
    return json(
      { error: "This discount cannot be processed through PayTR." },
      400
    );
  }

  if (provider === "paytr") {
    const email = user.email?.trim() ?? "";
    if (!isValidPaytrEmail(email)) {
      return json(
        {
          error:
            "Your account needs a standard email address before PayTR checkout can begin."
        },
        400
      );
    }
    if (!userName || !userAddress || !isValidPhone(userPhone)) {
      return json(
        {
          error:
            "Name, billing address, and a valid phone number are required for secure checkout."
        },
        400
      );
    }
  }

  const providerOrderId = makeProviderOrderId();
  const timeoutMinutes = paytrConfig?.timeoutLimit ?? 15;
  const paymentExpiresAt = new Date(
    Date.now() + (timeoutMinutes + 10) * 60_000
  ).toISOString();

  const { data: createdOrder, error: createOrderError } =
    await adminClient.rpc("create_program_order", {
      p_user_id: user.id,
      p_program_slug: programSlug,
      p_amount_minor: amountMinor,
      p_final_amount_minor: finalAmountMinor,
      p_currency: "TRY",
      p_provider: provider,
      p_provider_order_id: providerOrderId,
      p_idempotency_key: idempotencyKey,
      p_discount_code: discountCode || null,
      p_discount_percent: discountPercent,
      p_coins_earned: TJFIT_COINS_PER_PROGRAM_PURCHASE,
      p_payment_expires_at: paymentExpiresAt,
      p_paytr_test_mode: paytrConfig?.testMode ?? false
    });

  if (createOrderError || !createdOrder) {
    const invalidDiscount = createOrderError?.message.includes(
      "invalid_or_unavailable_discount"
    );
    return json(
      {
        error: invalidDiscount
          ? "This discount code is no longer available."
          : "Could not create a secure order."
      },
      invalidDiscount ? 409 : 500
    );
  }

  const order = createdOrder as CreatedOrder;
  if (
    order.program_slug !== programSlug ||
    (order.discount_code ?? "") !== (discountCode || "")
  ) {
    return json(
      {
        error:
          "This idempotency key was already used for a different checkout."
      },
      409
    );
  }

  const publicOrder = {
    id: order.id,
    program_slug: order.program_slug,
    amount_try: order.amount_try,
    final_amount_try: order.final_amount_try,
    amount_minor: order.amount_minor,
    final_amount_minor: order.final_amount_minor,
    currency: order.currency,
    provider: order.provider,
    status: order.status,
    discount_code: order.discount_code,
    discount_percent: order.discount_percent,
    payment_expires_at: order.payment_expires_at
  };

  if (order.status === "paid") {
    return json({
      order: publicOrder,
      coinsToEarn: TJFIT_COINS_PER_PROGRAM_PURCHASE,
      provider,
      alreadyPaid: true
    });
  }
  if (order.status !== "pending") {
    return json(
      {
        error:
          "The previous checkout attempt did not complete. Please start a new payment attempt."
      },
      409
    );
  }

  if (provider === "test") {
    return json({
      order: publicOrder,
      coinsToEarn: TJFIT_COINS_PER_PROGRAM_PURCHASE,
      provider
    });
  }

  if (!paytrConfig) {
    return json({ error: "PayTR is not configured." }, 503);
  }

  const userIp = getClientIp(request);
  const appUrl = getTrustedAppUrl(paytrConfig.testMode);
  if (!userIp || !appUrl) {
    await adminClient.rpc("cancel_program_order_setup", {
      p_order_id: order.id,
      p_provider_error: !userIp
        ? "client_ip_unavailable"
        : "trusted_app_url_unavailable"
    });
    return json(
      {
        error:
          "Secure payment could not be initialized. Please contact support."
      },
      503
    );
  }

  const paymentAmountMinor = order.final_amount_minor;
  const userBasket = Buffer.from(
    JSON.stringify([
      [
        programTitle || "TJFit Program",
        (order.final_amount_minor / 100).toFixed(2),
        1
      ]
    ]),
    "utf8"
  ).toString("base64");
  const returnLocale = ["en", "tr", "ar", "es", "fr"].includes(
    requestedLocale
  )
    ? requestedLocale
    : "en";
  const paytrLanguage = returnLocale === "tr" ? "tr" : "en";
  const merchantOkUrl = new URL(
    `/${returnLocale}/checkout`,
    appUrl
  );
  merchantOkUrl.searchParams.set("payment", "processing");
  merchantOkUrl.searchParams.set("order", order.id);
  const merchantFailUrl = new URL(
    `/${returnLocale}/checkout`,
    appUrl
  );
  merchantFailUrl.searchParams.set("payment", "failed");
  merchantFailUrl.searchParams.set("order", order.id);

  try {
    const token = await requestPaytrIframeToken(
      {
        merchantOid: order.provider_order_id,
        userIp,
        email: user.email!.trim(),
        paymentAmountMinor,
        userBasket,
        userName,
        userAddress,
        userPhone,
        merchantOkUrl: merchantOkUrl.toString(),
        merchantFailUrl: merchantFailUrl.toString(),
        language: paytrLanguage
      },
      paytrConfig
    );

    await adminClient
      .from("program_orders")
      .update({ provider_token_created_at: new Date().toISOString() })
      .eq("id", order.id)
      .eq("status", "pending");

    return json({
      order: publicOrder,
      coinsToEarn: TJFIT_COINS_PER_PROGRAM_PURCHASE,
      provider,
      iframeUrl: `${PAYTR_IFRAME_ORIGIN}/odeme/guvenli/${encodeURIComponent(token)}`
    });
  } catch (error) {
    const providerError =
      error instanceof Error ? error.message : "paytr_token_failed";
    console.error(
      JSON.stringify({
        event: "paytr_token_failed",
        order_id: order.id,
        reason: providerError.slice(0, 300),
        timestamp: new Date().toISOString()
      })
    );

    await adminClient.rpc("cancel_program_order_setup", {
      p_order_id: order.id,
      p_provider_error: providerError
    });

    return json(
      {
        error:
          "PayTR could not open the secure payment form. No payment was taken; please retry."
      },
      502
    );
  }
}
