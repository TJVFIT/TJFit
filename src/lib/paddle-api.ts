import { getPaddleApiBase, getPaddleApiKey } from "@/lib/paddle-config";
import { paddleLogDebug, paddleLogWarn, redactPaddleId } from "@/lib/paddle-safe-log";

type PaddleErrorBody = {
  error?: { detail?: string; message?: string; code?: string };
  meta?: { request_id?: string };
};

export type CreatePaddleTransactionParams = {
  items: { priceId: string; quantity: number }[];
  /** Paddle custom_data values are typically strings */
  customData: Record<string, string>;
  discountId?: string | null;
};

/**
 * Creates an automatically-collected Paddle Billing transaction (draft until checkout collects customer).
 */
export async function paddleCreateTransaction(
  params: CreatePaddleTransactionParams
): Promise<{ id: string } | { error: string }> {
  const apiKey = getPaddleApiKey();
  if (!apiKey) {
    paddleLogWarn("transaction", "create skipped: PADDLE_API_KEY missing");
    return { error: "PADDLE_API_KEY is not configured." };
  }

  const body: Record<string, unknown> = {
    items: params.items.map((i) => ({ price_id: i.priceId, quantity: i.quantity })),
    collection_mode: "automatic",
    custom_data: params.customData
  };

  if (params.discountId?.trim()) {
    body.discount_id = params.discountId.trim();
  }

  const t0 = Date.now();
  const base = getPaddleApiBase();
  const itemCount = params.items.length;
  const pricePreview = params.items.map((i) => redactPaddleId(i.priceId, 16));

  paddleLogDebug("transaction", "POST /transactions starting", {
    baseUrl: base,
    itemCount,
    priceIds: pricePreview,
    hasDiscountId: Boolean(params.discountId?.trim()),
    customDataKeys: Object.keys(params.customData)
  });

  const res = await fetch(`${base}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Paddle-Version": "1"
    },
    body: JSON.stringify(body)
  });

  const json = (await res.json()) as { data?: { id?: string } } & PaddleErrorBody;
  const ms = Date.now() - t0;
  const requestId = json.meta?.request_id;

  if (!res.ok) {
    const detail =
      json.error?.detail ?? json.error?.message ?? `Paddle API error (${res.status})`;
    paddleLogWarn("transaction", "POST /transactions failed", {
      httpStatus: res.status,
      ms,
      requestId: requestId ?? "(none)",
      errorCode: json.error?.code ?? "(none)",
      // Paddle error messages are usually safe; truncate very long responses
      detailPreview: detail.length > 200 ? `${detail.slice(0, 200)}…` : detail
    });
    return { error: detail };
  }

  const id = json.data?.id;
  if (!id || typeof id !== "string") {
    paddleLogWarn("transaction", "unexpected response shape (no data.id)", {
      httpStatus: res.status,
      ms,
      requestId: requestId ?? "(none)"
    });
    return { error: "Paddle returned an unexpected response." };
  }

  paddleLogDebug("transaction", "POST /transactions ok", {
    httpStatus: res.status,
    ms,
    requestId: requestId ?? "(none)",
    transactionId: redactPaddleId(id, 18)
  });

  return { id };
}
