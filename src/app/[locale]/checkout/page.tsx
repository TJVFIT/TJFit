"use client";

import { notFound } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { programs } from "@/lib/content";
import { getCheckoutCopy } from "@/lib/premium-public-copy";
import { Locale, isLocale } from "@/lib/i18n";
import { formatProgramPrice, getProgramBasePriceTry, localizeProgram } from "@/lib/program-localization";
import { ProtectedRoute } from "@/components/protected-route";
import { PremiumPageShell, PremiumPanel } from "@/components/premium";
import { trackMarketingEvent } from "@/lib/analytics-events";
import { TJFIT_COINS_PER_PROGRAM_PURCHASE, TJFIT_COINS_PER_USD } from "@/lib/tjfit-coin";
import type { CheckoutClientFlow } from "@/lib/payments/types";

function paddleCheckoutLocale(locale: Locale): string {
  const map: Record<Locale, string> = { en: "en", tr: "tr", ar: "ar", es: "es", fr: "fr" };
  return map[locale] ?? "en";
}

function isCheckoutClientFlow(value: unknown): value is CheckoutClientFlow {
  if (!value || typeof value !== "object") return false;
  const o = value as { action?: string; orderId?: unknown; amount?: unknown };
  if (o.action === "complete_simulated") {
    return typeof o.orderId === "string";
  }
  if (o.action === "await_gateway") {
    const amt = o.amount as { value?: unknown; currency?: unknown } | undefined;
    return (
      typeof o.orderId === "string" &&
      !!amt &&
      typeof amt.value === "number" &&
      typeof amt.currency === "string"
    );
  }
  return false;
}

type WalletResponse = {
  wallet: { balance: number; lifetime_earned: number; lifetime_spent: number };
  offers: Array<{ key: string; title: string; coin_cost: number; discount_percent: number }>;
  codes: Array<{ code: string; discount_percent: number; offer_key: string }>;
};

type CheckoutProgramOption = {
  slug: string;
  title: string;
  description: string;
  baseTry: number;
};

export default function CheckoutPage({ params }: { params: { locale: string } }) {
  const rawLocale = params?.locale ?? "";
  const localeValid = isLocale(rawLocale);
  const locale = (localeValid ? rawLocale : "en") as Locale;
  const copy = getCheckoutCopy(locale);
  const [activeSlug, setActiveSlug] = useState(programs[0]?.slug ?? "");
  const [customPrograms, setCustomPrograms] = useState<CheckoutProgramOption[]>([]);
  const [walletData, setWalletData] = useState<WalletResponse | null>(null);
  const [selectedCode, setSelectedCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "error" | "pending">("neutral");
  const [working, setWorking] = useState(false);
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null);
  const [pendingAmountTry, setPendingAmountTry] = useState<number | null>(null);
  const activeGatewayOrderRef = useRef<string | null>(null);
  const paddleInitRef = useRef<Promise<import("@paddle/paddle-js").Paddle | undefined> | null>(null);
  const pollUntilPaidRef = useRef<(orderId: string) => Promise<void>>(async () => {});

  const staticProgramOptions = useMemo<CheckoutProgramOption[]>(
    () =>
      programs
        .filter((program) => !program.is_free)
        .map((program) => {
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
    () => allProgramOptions.find((p) => p.slug === activeSlug) ?? allProgramOptions[0],
    [allProgramOptions, activeSlug]
  );
  const baseTry = selectedProgram ? selectedProgram.baseTry : 0;
  const basePrice = formatProgramPrice(baseTry, locale);

  const refreshWallet = useCallback(async () => {
    const res = await fetch("/api/coins/wallet", { credentials: "include" });
    if (!res.ok) return;
    const data = (await res.json()) as WalletResponse;
    setWalletData(data);
  }, []);

  const pollUntilOrderPaid = useCallback(
    async (orderId: string) => {
      for (let i = 0; i < 24; i++) {
        const r = await fetch(`/api/checkout/order-status?orderId=${encodeURIComponent(orderId)}`, {
          credentials: "include"
        });
        const j = (await r.json()) as { status?: string };
        if (j.status === "paid") {
          setStatusTone("success");
          setStatus(
            `${copy.successPurchase} +${TJFIT_COINS_PER_PROGRAM_PURCHASE} TJFITcoin`
          );
          setSelectedCode("");
          setSavedOrderId(null);
          setPendingAmountTry(null);
          activeGatewayOrderRef.current = null;
          await refreshWallet();
          return;
        }
        await new Promise((res) => setTimeout(res, 1250));
      }
      setStatusTone("pending");
      setStatus(copy.paddleWebhookWait);
    },
    [copy.paddleWebhookWait, copy.successPurchase, refreshWallet]
  );

  pollUntilPaidRef.current = pollUntilOrderPaid;

  const ensurePaddle = useCallback(async () => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.trim();
    if (!token) return undefined;
    if (!paddleInitRef.current) {
      const pub = (
        process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT ??
        process.env.NEXT_PUBLIC_PADDLE_ENV ??
        "production"
      )
        .trim()
        .toLowerCase();
      const env = pub === "sandbox" ? "sandbox" : "production";
      paddleInitRef.current = import("@paddle/paddle-js").then(({ initializePaddle }) =>
        initializePaddle({
          environment: env,
          token,
          eventCallback: (event) => {
            if (event.name === "checkout.completed" && activeGatewayOrderRef.current) {
              void pollUntilPaidRef.current(activeGatewayOrderRef.current);
            }
          }
        })
      );
    }
    return paddleInitRef.current;
  }, []);

  const openPaddleCheckout = async () => {
    if (!savedOrderId) return;
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.trim();
    if (!token) {
      setStatusTone("error");
      setStatus(copy.paddleInitError);
      return;
    }
    setWorking(true);
    setStatus(null);
    setStatusTone("neutral");
    try {
      const res = await fetch("/api/checkout/prepare-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId: savedOrderId })
      });
      const data = (await res.json()) as {
        transactionId?: string;
        customerEmail?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      if (!data.transactionId) {
        throw new Error("Missing transaction from server.");
      }
      activeGatewayOrderRef.current = savedOrderId;
      setStatusTone("pending");
      setStatus(copy.paddleOpening);
      const paddle = await ensurePaddle();
      if (!paddle) {
        throw new Error(copy.paddleInitError);
      }
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const programSlug = selectedProgram?.slug;
      paddle.Checkout.open({
        transactionId: data.transactionId,
        customer: data.customerEmail ? { email: data.customerEmail } : undefined,
        settings: {
          displayMode: "overlay",
          theme: "dark",
          locale: paddleCheckoutLocale(locale),
          successUrl:
            origin && programSlug
              ? `${origin}/${locale}/programs/${encodeURIComponent(programSlug)}?success=1`
              : undefined
        }
      });
    } catch (e) {
      setStatusTone("error");
      setStatus(`${copy.errorPrefix} ${e instanceof Error ? e.message : ""}`.trim());
      activeGatewayOrderRef.current = null;
    } finally {
      setWorking(false);
    }
  };

  useEffect(() => {
    const loadCustomPrograms = async () => {
      const res = await fetch(`/api/programs/custom?locale=${locale}`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const options = (data.programs ?? []).map((item: { slug: string; title: string; description?: string; price_try?: number }) => ({
        slug: String(item.slug),
        title: String(item.title),
        description: String(item.description ?? ""),
        baseTry: Number(item.price_try ?? 400)
      })) as CheckoutProgramOption[];
      setCustomPrograms(options);
    };
    loadCustomPrograms();
  }, [locale]);

  useEffect(() => {
    const querySlug = new URLSearchParams(window.location.search).get("program");
    if (!querySlug) return;
    const match = programs.find((p) => p.slug === querySlug);
    if (match?.is_free) {
      const fallback = programs.find((p) => !p.is_free)?.slug;
      if (fallback) setActiveSlug(fallback);
      return;
    }
    setActiveSlug(querySlug);
  }, [locale]);

  useEffect(() => {
    void refreshWallet();
  }, [refreshWallet]);

  useEffect(() => {
    if (!localeValid) return;
    trackMarketingEvent("checkout_start", { locale });
  }, [locale, localeValid]);

  if (!localeValid) {
    notFound();
  }

  const redeemOffer = async (offerKey: string) => {
    setWorking(true);
    setStatus(null);
    setStatusTone("neutral");
    const res = await fetch("/api/coins/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ offerKey })
    });
    const data = await res.json();
    setWorking(false);
    if (!res.ok) {
      setStatusTone("error");
      setStatus(`${copy.errorPrefix} ${data.error ?? ""}`.trim());
      return;
    }
    setStatusTone("success");
    setStatus(`${data.code ?? ""}`);
    await refreshWallet();
  };

  const completePurchase = async () => {
    if (!selectedProgram) return;
    setWorking(true);
    setStatus(null);
    setStatusTone("neutral");
    setSavedOrderId(null);
    setPendingAmountTry(null);

    const createRes = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        programSlug: selectedProgram.slug,
        discountCode: selectedCode || undefined
      })
    });
    const createData = await createRes.json();
    if (!createRes.ok) {
      setWorking(false);
      setStatusTone("error");
      setStatus(`${copy.errorPrefix} ${createData.error ?? ""}`.trim());
      return;
    }

    const clientFlow = createData.clientFlow;
    if (!isCheckoutClientFlow(clientFlow)) {
      setWorking(false);
      setStatusTone("error");
      setStatus(`${copy.errorPrefix} Invalid checkout response.`);
      return;
    }

    if (clientFlow.action === "await_gateway") {
      setWorking(false);
      setSavedOrderId(clientFlow.orderId);
      setPendingAmountTry(clientFlow.amount.value);
      setStatusTone("pending");
      setStatus(copy.pendingBody);
      return;
    }

    const completeRes = await fetch("/api/checkout/complete-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ orderId: clientFlow.orderId })
    });
    const completeData = await completeRes.json();
    setWorking(false);
    if (!completeRes.ok) {
      setStatusTone("error");
      setStatus(`${copy.errorPrefix} ${completeData.error ?? ""}`.trim());
      return;
    }

    setStatusTone("success");
    setStatus(
      `${copy.successPurchase} +${completeData.coinsEarned ?? TJFIT_COINS_PER_PROGRAM_PURCHASE} TJFITcoin`
    );
    setSelectedCode("");
    setSavedOrderId(null);
    setPendingAmountTry(null);
    await refreshWallet();
  };

  const statusClass =
    statusTone === "error"
      ? "text-red-300"
      : statusTone === "success"
        ? "text-emerald-300"
        : statusTone === "pending"
          ? "text-cyan-200/90"
          : "text-zinc-400";

  return (
    <ProtectedRoute locale={rawLocale as Locale}>
      <PremiumPageShell>
        <PremiumPanel padding="lg" className="mb-8">
          <span className="lux-badge inline-flex">{copy.badge}</span>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">{copy.lead}</p>
          <p className="mt-4 text-xs text-zinc-600 sm:text-sm">
            {TJFIT_COINS_PER_PROGRAM_PURCHASE} TJFITcoin / purchase · 1 USD ≈ {TJFIT_COINS_PER_USD} TJFITcoin
          </p>
        </PremiumPanel>

        {savedOrderId ? (
          <PremiumPanel className="mb-8 border-cyan-400/20 bg-cyan-950/10">
            <p className="text-sm font-semibold text-cyan-100">{copy.pendingTitle}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{copy.pendingBody}</p>
            {pendingAmountTry != null ? (
              <p className="mt-4 text-sm text-zinc-300">
                <span className="text-zinc-500">{copy.amountDue}: </span>
                <span className="font-medium text-white">{formatProgramPrice(pendingAmountTry, locale)}</span>
              </p>
            ) : null}
            <p className="mt-3 font-mono text-xs text-zinc-600">ID · {savedOrderId}</p>
            {pendingAmountTry != null ? (
              <button
                type="button"
                onClick={() => void openPaddleCheckout()}
                disabled={working}
                className="gradient-button mt-6 w-full rounded-full px-5 py-3.5 text-sm font-semibold text-[#05080a] disabled:opacity-50"
              >
                {working ? copy.paddleOpening : copy.gatewayPayCta}
              </button>
            ) : null}
            <p className="mt-4 text-center text-xs text-zinc-500">{copy.securePaymentTrust}</p>
          </PremiumPanel>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <PremiumPanel>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">{copy.selectProgram}</p>
            <select
              className="input mt-3"
              value={activeSlug}
              onChange={(e) => setActiveSlug(e.target.value)}
            >
              {allProgramOptions.map((program) => (
                <option key={program.slug} value={program.slug}>
                  {program.title}
                </option>
              ))}
            </select>

            {selectedProgram && (
              <div className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">{copy.orderSummary}</p>
                <p className="mt-3 text-lg font-semibold text-white">{selectedProgram.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{selectedProgram.description}</p>
                <p className="mt-4 text-sm text-zinc-400">
                  {copy.price}: <span className="font-medium text-white">{basePrice}</span>
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {copy.coinsOnPurchase}:{" "}
                  <span className="font-medium text-white">{TJFIT_COINS_PER_PROGRAM_PURCHASE}</span>
                </p>
              </div>
            )}

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">{copy.discountLabel}</p>
              <select
                className="input mt-3"
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
              >
                <option value="">{copy.noDiscount}</option>
                {(walletData?.codes ?? []).map((code) => (
                  <option key={code.code} value={code.code}>
                    {code.code} ({code.discount_percent}%)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={completePurchase}
              disabled={working || !selectedProgram}
              className="gradient-button mt-8 w-full rounded-full px-5 py-3.5 text-sm font-semibold text-[#05080a] disabled:opacity-50"
            >
              {working ? copy.ctaWorking : copy.ctaPay}
            </button>
            <p className="mt-3 text-center text-xs text-zinc-500">{copy.securePaymentTrust}</p>
            <p className="mt-4 text-xs leading-relaxed text-zinc-600">{copy.footnote}</p>
            {status ? <p className={`mt-4 text-sm ${statusClass}`}>{status}</p> : null}
          </PremiumPanel>

          <div className="space-y-6">
            <PremiumPanel>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">{copy.walletTitle}</p>
              <p className="mt-3 font-display text-3xl font-semibold tabular-nums text-white">
                {walletData?.wallet.balance ?? 0}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                {copy.walletLifetime}: {walletData?.wallet.lifetime_earned ?? 0} /{" "}
                {walletData?.wallet.lifetime_spent ?? 0}
              </p>
            </PremiumPanel>

            <PremiumPanel>
              <p className="text-lg font-semibold text-white">{copy.discountStore}</p>
              <div className="mt-4 space-y-3">
                {(walletData?.offers ?? []).map((offer) => (
                  <div
                    key={offer.key}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-white">{offer.title}</p>
                      <p className="text-sm text-zinc-500">
                        {offer.discount_percent}% · {offer.coin_cost} coins
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => redeemOffer(offer.key)}
                      disabled={working}
                      className="lux-btn-secondary shrink-0 rounded-full px-4 py-2 text-xs font-medium text-zinc-200 disabled:opacity-50"
                    >
                      {copy.redeem}
                    </button>
                  </div>
                ))}
              </div>
            </PremiumPanel>
          </div>
        </div>
      </PremiumPageShell>
    </ProtectedRoute>
  );
}
