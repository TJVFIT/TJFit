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
import type { CheckoutClientFlow } from "@/lib/payments/types";

function isCheckoutClientFlow(value: unknown): value is CheckoutClientFlow {
  if (!value || typeof value !== "object") return false;
  const o = value as { action?: string; orderId?: unknown; url?: unknown };
  if (o.action === "complete_simulated") {
    return typeof o.orderId === "string";
  }
  if (o.action === "redirect_gumroad") {
    return typeof o.orderId === "string";
  }
  return false;
}

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
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "error" | "pending">("neutral");
  const [working, setWorking] = useState(false);
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null);
  const [pendingAmountTry, setPendingAmountTry] = useState<number | null>(null);
  const activeGatewayOrderRef = useRef<string | null>(null);
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

  const pollUntilOrderPaid = useCallback(
    async (orderId: string) => {
      for (let i = 0; i < 24; i++) {
        const r = await fetch(`/api/checkout/order-status?orderId=${encodeURIComponent(orderId)}`, {
          credentials: "include"
        });
        const j = (await r.json()) as { status?: string };
        if (j.status === "paid") {
          setStatusTone("success");
          setStatus(copy.successPurchase);
          setPromoCodeInput("");
          setAppliedPromoCode("");
          setPromoMessage(null);
          setSavedOrderId(null);
          setPendingAmountTry(null);
          activeGatewayOrderRef.current = null;
          return;
        }
        await new Promise((res) => setTimeout(res, 1250));
      }
      setStatusTone("pending");
      setStatus(copy.paddleWebhookWait);
    },
    [copy.paddleWebhookWait, copy.successPurchase]
  );

  pollUntilPaidRef.current = pollUntilOrderPaid;

  const openGumroadCheckout = async () => {
    if (!savedOrderId) return;
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
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      activeGatewayOrderRef.current = savedOrderId;
      setStatusTone("pending");
      setStatus(copy.paddleOpening);
      window.location.href = data.url;
    } catch (e) {
      // Log raw details for debugging but show the user a localized,
      // non-leaky message. Raw stack/JS error strings are not safe to
      // surface (Baymard adaptive-validation guidance).
      console.error("[checkout] gateway open failed:", e);
      setStatusTone("error");
      setStatus(copy.errorPrefix);
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
    if (!localeValid) return;
    trackMarketingEvent("checkout_start", { locale });
  }, [locale, localeValid]);

  if (!localeValid) {
    notFound();
  }

  const completePurchase = async () => {
    if (!selectedProgram) return;
    setWorking(true);
    setStatus(null);
    setStatusTone("neutral");
    setSavedOrderId(null);
    setPendingAmountTry(null);

    const discountCodeForOrder =
      appliedPromoCode || promoCodeInput.trim().toUpperCase() || undefined;

    const createRes = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        programSlug: selectedProgram.slug,
        discountCode: discountCodeForOrder,
        locale
      })
    });
    const createData = await createRes.json();
    if (!createRes.ok) {
      console.error("[checkout] create-order failed:", createData?.error);
      setWorking(false);
      setStatusTone("error");
      setStatus(copy.errorPrefix);
      return;
    }

    const clientFlow = createData.clientFlow;
    if (!isCheckoutClientFlow(clientFlow)) {
      console.error("[checkout] invalid client flow shape:", clientFlow);
      setWorking(false);
      setStatusTone("error");
      setStatus(copy.errorPrefix);
      return;
    }

    if (clientFlow.action === "redirect_gumroad") {
      setWorking(false);
      setSavedOrderId(clientFlow.orderId);
      setPendingAmountTry(baseTry);
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
      console.error("[checkout] complete-order failed:", completeData?.error);
      setStatusTone("error");
      setStatus(copy.errorPrefix);
      return;
    }

    setStatusTone("success");
    setStatus(copy.successPurchase);
    setPromoCodeInput("");
    setAppliedPromoCode("");
    setPromoMessage(null);
    setSavedOrderId(null);
    setPendingAmountTry(null);
  };

  const statusClass =
    statusTone === "error"
      ? "text-red-300"
      : statusTone === "success"
        ? "text-emerald-300"
        : statusTone === "pending"
          ? "text-cyan-200/90"
          : "text-muted";

  return (
    <ProtectedRoute locale={rawLocale as Locale}>
      <PremiumPageShell>
        <PremiumPanel padding="lg" className="mb-8">
          <span className="lux-badge inline-flex">{copy.badge}</span>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-faint sm:text-base">{copy.lead}</p>
        </PremiumPanel>

        {savedOrderId ? (
          <PremiumPanel className="mb-8 border-cyan-400/20 bg-cyan-950/10">
            <p className="text-sm font-semibold text-cyan-100">{copy.pendingTitle}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{copy.pendingBody}</p>
            {pendingAmountTry != null ? (
              <p className="mt-4 text-sm text-bright">
                <span className="text-faint">{copy.amountDue}: </span>
                <span className="font-medium text-white">{formatProgramPrice(pendingAmountTry, locale)}</span>
              </p>
            ) : null}
            <p className="mt-3 font-mono text-xs text-dim">ID · {savedOrderId}</p>
            {pendingAmountTry != null ? (
              <button
                type="button"
                onClick={() => void openGumroadCheckout()}
                disabled={working}
                className="gradient-button mt-6 w-full rounded-full px-5 py-3.5 text-sm font-semibold text-background disabled:opacity-50"
              >
                {working ? copy.paddleOpening : copy.gatewayPayCta}
              </button>
            ) : null}
            <p className="mt-4 text-center text-xs text-faint">{copy.securePaymentTrust}</p>
          </PremiumPanel>
        ) : null}

        <div className="grid gap-6">
          <PremiumPanel>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dim">{copy.selectProgram}</p>
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
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dim">{copy.orderSummary}</p>
                <p className="mt-3 text-lg font-semibold text-white">{selectedProgram.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-faint">{selectedProgram.description}</p>
                <p className="mt-4 text-sm text-muted">
                  {copy.price}: <span className="font-medium text-white">{basePrice}</span>
                </p>
              </div>
            )}

            <div className="mt-6">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-dim">
                  {copy.promoCodeLabel}
                </span>
                <input
                  type="text"
                  className="input mt-2 font-mono uppercase"
                  value={promoCodeInput}
                  onChange={(e) => {
                    setPromoCodeInput(e.target.value.toUpperCase());
                    setPromoMessage(null);
                  }}
                  placeholder={copy.promoCodePlaceholder}
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={64}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  const code = promoCodeInput.trim().toUpperCase();
                  setAppliedPromoCode(code);
                  setPromoMessage(code ? `${copy.promoAppliedPrefix} ${code}` : null);
                }}
                disabled={working}
                className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-bright transition-colors hover:border-white/25 hover:text-white disabled:opacity-50"
              >
                {copy.promoApplyCta}
              </button>
              {promoMessage ? <p className="mt-2 text-xs text-cyan-300">{promoMessage}</p> : null}
            </div>

            <button
              type="button"
              onClick={completePurchase}
              disabled={working || !selectedProgram}
              className="gradient-button mt-8 w-full rounded-full px-5 py-3.5 text-sm font-semibold text-background disabled:opacity-50"
            >
              {working ? copy.ctaWorking : copy.ctaPay}
            </button>
            <p className="mt-3 text-center text-xs text-faint">{copy.securePaymentTrust}</p>
            <p className="mt-4 text-xs leading-relaxed text-dim">{copy.footnote}</p>
            {status ? (
              <p
                className={`mt-4 text-sm ${statusClass}`}
                role={statusTone === "error" ? "alert" : "status"}
                aria-live={statusTone === "error" ? "assertive" : "polite"}
              >
                {status}
              </p>
            ) : null}
          </PremiumPanel>
        </div>
      </PremiumPageShell>
    </ProtectedRoute>
  );
}
