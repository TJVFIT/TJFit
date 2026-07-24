"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Script from "next/script";

import { ProtectedRoute } from "@/components/protected-route";
import { programs } from "@/lib/content";
import { isLocale, Locale } from "@/lib/i18n";
import {
  getProgramBasePriceTry,
  localizeProgram
} from "@/lib/program-localization";
import {
  TJFIT_COINS_PER_PROGRAM_PURCHASE,
  TJFIT_COINS_PER_USD
} from "@/lib/tjfit-coin";

type WalletResponse = {
  wallet: {
    balance: number;
    lifetime_earned: number;
    lifetime_spent: number;
  };
  offers: Array<{
    key: string;
    title: string;
    coin_cost: number;
    discount_percent: number;
  }>;
  codes: Array<{
    code: string;
    discount_percent: number;
    offer_key: string;
  }>;
};

type CheckoutProgramOption = {
  slug: string;
  title: string;
  description: string;
  baseTry: number;
};

type OrderStatus = {
  id: string;
  status: "pending" | "paid" | "failed";
  final_amount_minor: number;
  currency: "TRY";
  tjfit_coins_earned: number;
};

type StatusTone = "success" | "error" | "info";

const ORDER_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const numberLocales: Record<Locale, string> = {
  en: "en-US",
  tr: "tr-TR",
  ar: "ar-SA",
  es: "es-ES",
  fr: "fr-FR"
};

function formatTry(amount: number, locale: Locale) {
  return new Intl.NumberFormat(numberLocales[locale], {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function makeIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `checkout_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

const CHECKOUT_INTENT_PREFIX = "tjfit_checkout_intent:";

function getCheckoutIdempotencyKey(intent: string) {
  const storageKey = `${CHECKOUT_INTENT_PREFIX}${intent}`;
  const existing = window.sessionStorage.getItem(storageKey);
  if (existing) return { key: existing, storageKey };

  const key = makeIdempotencyKey();
  window.sessionStorage.setItem(storageKey, key);
  return { key, storageKey };
}

function clearCheckoutIntentKeys() {
  for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = window.sessionStorage.key(index);
    if (key?.startsWith(CHECKOUT_INTENT_PREFIX)) {
      window.sessionStorage.removeItem(key);
    }
  }
}

async function readJson(response: Response) {
  return response
    .json()
    .catch(() => ({})) as Promise<Record<string, unknown>>;
}

export default function CheckoutPage() {
  const params = useParams<{ locale: string }>();
  const routeLocale = params.locale;
  const locale = isLocale(routeLocale)
    ? (routeLocale as Locale)
    : ("en" as Locale);
  const [activeSlug, setActiveSlug] = useState(programs[0]?.slug ?? "");
  const [customPrograms, setCustomPrograms] = useState<
    CheckoutProgramOption[]
  >([]);
  const [walletData, setWalletData] = useState<WalletResponse | null>(null);
  const [selectedCode, setSelectedCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<StatusTone>("info");
  const [working, setWorking] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userPhone, setUserPhone] = useState("");

  const staticProgramOptions = useMemo<CheckoutProgramOption[]>(
    () =>
      programs.map((program) => {
        const localized = localizeProgram(program, locale);
        return {
          slug: program.slug,
          title: localized.title,
          description: localized.description,
          baseTry: getProgramBasePriceTry(program)
        };
      }),
    [locale]
  );

  const allProgramOptions = useMemo(
    () => [...customPrograms, ...staticProgramOptions],
    [customPrograms, staticProgramOptions]
  );
  const selectedProgram = useMemo(
    () =>
      allProgramOptions.find((program) => program.slug === activeSlug) ??
      allProgramOptions[0],
    [allProgramOptions, activeSlug]
  );
  const selectedDiscount = useMemo(
    () =>
      walletData?.codes.find((code) => code.code === selectedCode)
        ?.discount_percent ?? 0,
    [selectedCode, walletData]
  );
  const baseTry = selectedProgram?.baseTry ?? 0;
  const estimatedFinalMinor = Math.max(
    0,
    Math.round((baseTry * 100 * (100 - selectedDiscount)) / 100)
  );

  const setMessage = useCallback((message: string, tone: StatusTone) => {
    setStatus(message);
    setStatusTone(tone);
  }, []);

  const refreshWallet = useCallback(async () => {
    const response = await fetch("/api/coins/wallet", {
      credentials: "include",
      cache: "no-store"
    });
    if (!response.ok) return;
    const data = (await response.json()) as WalletResponse;
    setWalletData(data);
  }, []);

  const verifyOrder = useCallback(
    async (orderId: string, attempts = 15) => {
      if (!ORDER_ID_PATTERN.test(orderId)) return;

      setCheckingPayment(true);
      setCurrentOrderId(orderId);
      setMessage(
        "PayTR returned you to TJFit. We are waiting for the signed payment confirmation.",
        "info"
      );

      for (let attempt = 0; attempt < attempts; attempt += 1) {
        const response = await fetch(
          `/api/checkout/create-order?orderId=${encodeURIComponent(orderId)}`,
          {
            credentials: "include",
            cache: "no-store"
          }
        );
        const payload = await readJson(response);

        if (!response.ok) {
          setCheckingPayment(false);
          setMessage(
            typeof payload.error === "string"
              ? payload.error
              : "We could not verify this order.",
            "error"
          );
          return;
        }

        const order = payload.order as OrderStatus | undefined;
        if (order?.status === "paid") {
          setCheckingPayment(false);
          setIframeUrl(null);
          setSelectedCode("");
          setMessage(
            `Payment confirmed. +${order.tjfit_coins_earned || TJFIT_COINS_PER_PROGRAM_PURCHASE} TJFITcoin added.`,
            "success"
          );
          await refreshWallet();
          clearCheckoutIntentKeys();
          const url = new URL(window.location.href);
          url.searchParams.delete("payment");
          url.searchParams.delete("order");
          window.history.replaceState({}, "", url);
          return;
        }

        if (order?.status === "failed") {
          setCheckingPayment(false);
          setIframeUrl(null);
          setMessage(
            "The payment did not complete. No program access or coins were granted.",
            "error"
          );
          return;
        }

        if (attempt < attempts - 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 2_000));
        }
      }

      setCheckingPayment(false);
      setMessage(
        "Confirmation is taking longer than usual. You can safely check again; access is granted only after PayTR confirms payment.",
        "info"
      );
    },
    [refreshWallet, setMessage]
  );

  useEffect(() => {
    const loadCustomPrograms = async () => {
      const response = await fetch(
        `/api/programs/custom?locale=${encodeURIComponent(locale)}`,
        {
          credentials: "include",
          cache: "no-store"
        }
      );
      if (!response.ok) return;

      const data = await readJson(response);
      const sourcePrograms = Array.isArray(data.programs) ? data.programs : [];
      const options = sourcePrograms
        .map((item: Record<string, unknown>) => ({
          slug: String(item.slug ?? ""),
          title: String(item.title ?? ""),
          description: String(item.description ?? ""),
          baseTry: Number(item.price_try)
        }))
        .filter(
          (item: CheckoutProgramOption) =>
            item.slug && item.title && Number.isSafeInteger(item.baseTry)
        ) as CheckoutProgramOption[];
      setCustomPrograms(options);
    };

    void loadCustomPrograms();
  }, [locale]);

  useEffect(() => {
    const querySlug = new URLSearchParams(window.location.search).get(
      "program"
    );
    if (querySlug) setActiveSlug(querySlug);
  }, [customPrograms.length]);

  useEffect(() => {
    void refreshWallet();
  }, [refreshWallet]);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const payment = search.get("payment");
    const orderId = search.get("order") ?? "";
    if (
      (payment === "processing" || payment === "failed") &&
      ORDER_ID_PATTERN.test(orderId)
    ) {
      void verifyOrder(orderId);
    }
  }, [verifyOrder]);

  if (!isLocale(routeLocale)) {
    return null;
  }

  const redeemOffer = async (offerKey: string) => {
    setWorking(true);
    setStatus(null);

    try {
      const response = await fetch("/api/coins/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ offerKey })
      });
      const data = await readJson(response);

      if (!response.ok) {
        setMessage(
          typeof data.error === "string"
            ? data.error
            : "Could not redeem offer.",
          "error"
        );
        return;
      }

      setMessage(`Discount code created: ${String(data.code)}`, "success");
      await refreshWallet();
    } finally {
      setWorking(false);
    }
  };

  const startCheckout = async () => {
    if (!selectedProgram) return;

    setWorking(true);
    setStatus(null);
    setIframeUrl(null);

    const intent = `${locale}:${selectedProgram.slug}:${selectedCode || "none"}`;
    const idempotency = getCheckoutIdempotencyKey(intent);

    try {
      const createResponse = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotency.key
        },
        credentials: "include",
        body: JSON.stringify({
          programSlug: selectedProgram.slug,
          discountCode: selectedCode || undefined,
          locale,
          userName,
          userAddress,
          userPhone
        })
      });
      const createData = await readJson(createResponse);

      if (!createResponse.ok) {
        if ([409, 502].includes(createResponse.status)) {
          window.sessionStorage.removeItem(idempotency.storageKey);
        }
        setMessage(
          typeof createData.error === "string"
            ? createData.error
            : "Could not create a secure order.",
          "error"
        );
        return;
      }

      const order = createData.order as OrderStatus | undefined;
      if (!order?.id) {
        setMessage("The payment provider returned an invalid order.", "error");
        return;
      }
      setCurrentOrderId(order.id);

      if (createData.alreadyPaid || order.status === "paid") {
        window.sessionStorage.removeItem(idempotency.storageKey);
        setMessage("This order is already paid.", "success");
        await refreshWallet();
        return;
      }

      if (createData.provider === "paytr") {
        const secureIframeUrl =
          typeof createData.iframeUrl === "string"
            ? createData.iframeUrl
            : "";
        try {
          const parsed = new URL(secureIframeUrl);
          if (
            parsed.protocol !== "https:" ||
            parsed.hostname !== "www.paytr.com" ||
            !parsed.pathname.startsWith("/odeme/guvenli/")
          ) {
            throw new Error("invalid_paytr_url");
          }
        } catch {
          setMessage(
            "The secure PayTR payment form could not be opened.",
            "error"
          );
          return;
        }

        setIframeUrl(secureIframeUrl);
        setMessage(
          "Secure PayTR checkout is ready. Complete payment in the form below.",
          "info"
        );
        return;
      }

      if (createData.provider !== "test") {
        setMessage("Payment provider is unavailable.", "error");
        return;
      }

      const completeResponse = await fetch(
        "/api/checkout/complete-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ orderId: order.id })
        }
      );
      const completeData = await readJson(completeResponse);

      if (!completeResponse.ok) {
        setMessage(
          typeof completeData.error === "string"
            ? completeData.error
            : "Could not complete the local test purchase.",
          "error"
        );
        return;
      }

      const coinsEarned = Number(completeData.coinsEarned ?? 0);
      setSelectedCode("");
      window.sessionStorage.removeItem(idempotency.storageKey);
      setMessage(
        completeData.alreadyPaid
          ? "This test order was already completed."
          : `Test purchase completed. +${coinsEarned} TJFITcoin added.`,
        "success"
      );
      await refreshWallet();
    } catch {
      setMessage(
        "Checkout was interrupted before it could finish. Please retry.",
        "error"
      );
    } finally {
      setWorking(false);
    }
  };

  const statusClass =
    statusTone === "success"
      ? "text-emerald-300"
      : statusTone === "error"
        ? "text-red-300"
        : "text-sky-300";

  const resizePaytrIframe = () => {
    const resize = (
      window as Window & {
        iFrameResize?: (
          options: Record<string, unknown>,
          selector: string
        ) => void;
      }
    ).iFrameResize;
    resize?.({ checkOrigin: ["https://www.paytr.com"] }, "#paytriframe");
  };

  return (
    <ProtectedRoute locale={routeLocale}>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
        {iframeUrl && (
          <Script
            src="https://www.paytr.com/js/iframeResizer.min.js"
            strategy="afterInteractive"
            onLoad={resizePaytrIframe}
          />
        )}
        <div className="glass-panel rounded-[32px] p-6">
          <span className="badge">Secure TJFITcoin Checkout</span>
          <h1 className="mt-4 text-3xl font-semibold text-white">
            Buy a program. Earn TJFITcoin.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Every confirmed program purchase earns{" "}
            <span className="text-white">
              {TJFIT_COINS_PER_PROGRAM_PURCHASE} TJFITcoin
            </span>
            . Payment is confirmed server-to-server before access or rewards
            are granted.
          </p>
        </div>

        {status && (
          <div
            aria-live="polite"
            className={`glass-panel rounded-2xl px-5 py-4 text-sm ${statusClass}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p>{status}</p>
              {currentOrderId && !checkingPayment && (
                <button
                  type="button"
                  onClick={() => void verifyOrder(currentOrderId, 5)}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs text-white transition hover:bg-white/5"
                >
                  Check payment status
                </button>
              )}
            </div>
          </div>
        )}

        {iframeUrl && (
          <section className="glass-panel overflow-hidden rounded-[32px] p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">
                  PayTR secure payment
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Card details are entered directly in PayTR&apos;s secure form.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIframeUrl(null)}
                className="rounded-full border border-white/15 px-4 py-2 text-xs text-white transition hover:bg-white/5"
              >
                Close payment form
              </button>
            </div>
            <iframe
              id="paytriframe"
              src={iframeUrl}
              title="PayTR secure payment"
              className="min-h-[640px] w-full rounded-2xl bg-white"
              allow="payment *"
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={resizePaytrIframe}
            />
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-sm text-zinc-400">Select program</p>
            <select
              className="input mt-3"
              value={activeSlug}
              onChange={(event) => setActiveSlug(event.target.value)}
              disabled={working || Boolean(iframeUrl)}
            >
              {allProgramOptions.map((program) => (
                <option key={program.slug} value={program.slug}>
                  {program.title}
                </option>
              ))}
            </select>

            {selectedProgram && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-lg font-semibold text-white">
                  {selectedProgram.title}
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  {selectedProgram.description}
                </p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-4 text-zinc-300">
                    <dt>Program price</dt>
                    <dd>{formatTry(baseTry, locale)}</dd>
                  </div>
                  {selectedDiscount > 0 && (
                    <div className="flex justify-between gap-4 text-emerald-300">
                      <dt>Discount</dt>
                      <dd>-{selectedDiscount}%</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4 border-t border-white/10 pt-2 font-medium text-white">
                    <dt>Total charged in TRY</dt>
                    <dd>{formatTry(estimatedFinalMinor / 100, locale)}</dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="mt-5">
              <label className="text-sm text-zinc-400" htmlFor="discount-code">
                Apply discount code
              </label>
              <select
                id="discount-code"
                className="input mt-3"
                value={selectedCode}
                onChange={(event) => setSelectedCode(event.target.value)}
                disabled={working || Boolean(iframeUrl)}
              >
                <option value="">No discount code</option>
                {(walletData?.codes ?? []).map((code) => (
                  <option key={code.code} value={code.code}>
                    {code.code} ({code.discount_percent}%)
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="mt-5 space-y-3" disabled={working || Boolean(iframeUrl)}>
              <legend className="text-sm text-zinc-400">
                Payment contact details
              </legend>
              <label className="block text-xs text-zinc-500">
                Full name
                <input
                  className="input mt-1"
                  value={userName}
                  onChange={(event) => setUserName(event.target.value)}
                  autoComplete="name"
                  maxLength={60}
                />
              </label>
              <label className="block text-xs text-zinc-500">
                Phone number
                <input
                  className="input mt-1"
                  value={userPhone}
                  onChange={(event) => setUserPhone(event.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={20}
                />
              </label>
              <label className="block text-xs text-zinc-500">
                Billing address
                <textarea
                  className="input mt-1 min-h-24 resize-y"
                  value={userAddress}
                  onChange={(event) => setUserAddress(event.target.value)}
                  autoComplete="street-address"
                  maxLength={400}
                />
              </label>
            </fieldset>

            <button
              type="button"
              onClick={startCheckout}
              disabled={
                working ||
                checkingPayment ||
                !selectedProgram ||
                Boolean(iframeUrl)
              }
              className="gradient-button mt-6 w-full rounded-full px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {working
                ? "Preparing secure checkout..."
                : "Continue to secure payment"}
            </button>
            <p className="mt-3 text-xs leading-relaxed text-zinc-500">
              PayTR processes real card payments. A browser redirect is never
              treated as payment proof; TJFit waits for PayTR&apos;s signed
              server confirmation.
            </p>
          </div>

          <div className="space-y-6">
            <div className="glass-panel rounded-[32px] p-6">
              <p className="text-sm text-zinc-400">TJFITcoin wallet</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {walletData?.wallet.balance ?? 0} coins
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                Lifetime earned: {walletData?.wallet.lifetime_earned ?? 0} ·
                Lifetime spent: {walletData?.wallet.lifetime_spent ?? 0}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Reference conversion: 1 USD = {TJFIT_COINS_PER_USD} TJFITcoin
              </p>
            </div>

            <div className="glass-panel rounded-[32px] p-6">
              <p className="text-lg font-semibold text-white">
                Discount store
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Redeem coins for a single-use checkout code.
              </p>
              <div className="mt-4 space-y-3">
                {(walletData?.offers ?? []).map((offer) => (
                  <div
                    key={offer.key}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div>
                      <p className="font-medium text-white">{offer.title}</p>
                      <p className="text-sm text-zinc-400">
                        {offer.discount_percent}% off · {offer.coin_cost} coins
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void redeemOffer(offer.key)}
                      disabled={working || Boolean(iframeUrl)}
                      className="rounded-full border border-white/15 px-4 py-2 text-xs text-white transition hover:bg-white/5 disabled:opacity-60"
                    >
                      Redeem
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
