import { createHmac, timingSafeEqual } from "node:crypto";

const PAYTR_TOKEN_ENDPOINT = "https://www.paytr.com/odeme/api/get-token";
export const PAYTR_IFRAME_ORIGIN = "https://www.paytr.com";

const PAYTR_INSTALLMENT_OPTIONS = new Set([0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

export type PaytrConfig = {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  testMode: boolean;
  debugOn: boolean;
  noInstallment: 0 | 1;
  maxInstallment: number;
  timeoutLimit: number;
};

export type PaytrIframeTokenInput = {
  merchantOid: string;
  userIp: string;
  email: string;
  paymentAmountMinor: number;
  userBasket: string;
  userName: string;
  userAddress: string;
  userPhone: string;
  merchantOkUrl: string;
  merchantFailUrl: string;
  language: "tr" | "en";
};

function getIntegerEnv(name: string, fallback: number) {
  const rawValue = process.env[name]?.trim();
  if (!rawValue) return fallback;
  const value = Number(rawValue);
  return Number.isSafeInteger(value) ? value : fallback;
}

function getBooleanEnv(name: string, fallback = false, required = false) {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) {
    if (required) throw new Error(`${name} must be explicitly configured`);
    return fallback;
  }
  if (value === "1" || value === "true") return true;
  if (value === "0" || value === "false") return false;
  throw new Error(`${name} must be one of: 1, 0, true, false`);
}

export function getPaytrConfig(): PaytrConfig | null {
  const merchantId = process.env.PAYTR_MERCHANT_ID?.trim();
  const merchantKey = process.env.PAYTR_MERCHANT_KEY?.trim();
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT?.trim();

  if (!merchantId || !merchantKey || !merchantSalt) {
    return null;
  }

  const maxInstallmentValue = getIntegerEnv("PAYTR_MAX_INSTALLMENT", 0);
  const timeoutValue = getIntegerEnv("PAYTR_TIMEOUT_LIMIT", 30);
  const testMode = getBooleanEnv("PAYTR_TEST_MODE", false, true);
  if (
    process.env.NODE_ENV === "production" &&
    testMode &&
    !getBooleanEnv("PAYTR_ALLOW_TEST_MODE_IN_PRODUCTION")
  ) {
    throw new Error(
      "PAYTR test mode in production requires PAYTR_ALLOW_TEST_MODE_IN_PRODUCTION=1"
    );
  }

  return {
    merchantId,
    merchantKey,
    merchantSalt,
    testMode,
    debugOn: getBooleanEnv("PAYTR_DEBUG_ON", testMode),
    noInstallment: getBooleanEnv("PAYTR_NO_INSTALLMENT") ? 1 : 0,
    maxInstallment: PAYTR_INSTALLMENT_OPTIONS.has(maxInstallmentValue)
      ? maxInstallmentValue
      : 0,
    timeoutLimit:
      timeoutValue >= 5 && timeoutValue <= 60 ? timeoutValue : 30
  };
}

export function createPaytrIframeRequestToken(
  input: PaytrIframeTokenInput,
  config: PaytrConfig
) {
  const hashInput = [
    config.merchantId,
    input.userIp,
    input.merchantOid,
    input.email,
    String(input.paymentAmountMinor),
    input.userBasket,
    String(config.noInstallment),
    String(config.maxInstallment),
    "TL",
    config.testMode ? "1" : "0",
    config.merchantSalt
  ].join("");

  return createHmac("sha256", config.merchantKey)
    .update(hashInput, "utf8")
    .digest("base64");
}

export async function requestPaytrIframeToken(
  input: PaytrIframeTokenInput,
  config: PaytrConfig
) {
  const body = new URLSearchParams({
    merchant_id: config.merchantId,
    user_ip: input.userIp,
    merchant_oid: input.merchantOid,
    email: input.email,
    payment_amount: String(input.paymentAmountMinor),
    paytr_token: createPaytrIframeRequestToken(input, config),
    user_basket: input.userBasket,
    debug_on: config.debugOn ? "1" : "0",
    no_installment: String(config.noInstallment),
    max_installment: String(config.maxInstallment),
    user_name: input.userName,
    user_address: input.userAddress,
    user_phone: input.userPhone,
    merchant_ok_url: input.merchantOkUrl,
    merchant_fail_url: input.merchantFailUrl,
    timeout_limit: String(config.timeoutLimit),
    currency: "TL",
    test_mode: config.testMode ? "1" : "0",
    lang: input.language
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(PAYTR_TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json"
      },
      body,
      cache: "no-store",
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`paytr_http_${response.status}`);
    }

    const payload = (await response.json().catch(() => null)) as
      | { status?: unknown; token?: unknown; reason?: unknown }
      | null;

    if (
      payload?.status !== "success" ||
      typeof payload.token !== "string" ||
      !/^[A-Za-z0-9_-]{20,200}$/.test(payload.token)
    ) {
      const reason =
        typeof payload?.reason === "string"
          ? payload.reason.replace(/[\r\n]+/g, " ").slice(0, 300)
          : "unknown";
      throw new Error(`paytr_token_rejected:${reason}`);
    }

    return payload.token;
  } finally {
    clearTimeout(timeout);
  }
}

export function verifyPaytrCallback(input: {
  merchantOid: string;
  status: string;
  totalAmount: string;
  hash: string;
}) {
  const config = getPaytrConfig();
  if (!config) return false;

  const expected = createHmac("sha256", config.merchantKey)
    .update(
      `${input.merchantOid}${config.merchantSalt}${input.status}${input.totalAmount}`,
      "utf8"
    )
    .digest();

  let provided: Buffer;
  try {
    provided = Buffer.from(input.hash, "base64");
  } catch {
    return false;
  }

  return provided.length === expected.length && timingSafeEqual(provided, expected);
}
