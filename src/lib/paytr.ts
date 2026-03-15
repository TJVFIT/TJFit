import crypto from "crypto";

type PaytrPayload = {
  merchantOid: string;
  email: string;
  paymentAmount: number;
  userIp: string;
  currency?: "TRY";
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function createPaytrToken(payload: PaytrPayload) {
  const merchantId = getRequiredEnv("PAYTR_MERCHANT_ID");
  const merchantKey = getRequiredEnv("PAYTR_MERCHANT_KEY");
  const merchantSalt = getRequiredEnv("PAYTR_MERCHANT_SALT");

  const hashString = [
    merchantId,
    payload.userIp,
    payload.merchantOid,
    payload.email,
    payload.paymentAmount,
    "card",
    0,
    0,
    payload.currency ?? "TRY",
    1
  ].join("");

  return crypto
    .createHmac("sha256", merchantKey)
    .update(hashString + merchantSalt)
    .digest("base64");
}

export function verifyPaytrCallback({
  merchantOid,
  status,
  totalAmount,
  hash
}: {
  merchantOid: string;
  status: string;
  totalAmount: string;
  hash: string;
}) {
  const merchantKey = getRequiredEnv("PAYTR_MERCHANT_KEY");
  const merchantSalt = getRequiredEnv("PAYTR_MERCHANT_SALT");

  const calculatedHash = crypto
    .createHmac("sha256", merchantKey)
    .update(`${merchantOid}${merchantSalt}${status}${totalAmount}`)
    .digest("base64");

  return calculatedHash === hash;
}
