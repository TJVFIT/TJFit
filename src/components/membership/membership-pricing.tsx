"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

import { Button } from "@/components/ui/Button";
import { type Locale } from "@/lib/i18n";
import { getMembershipTierCopy } from "@/lib/membership-tier-copy";
import { TJAI_ONE_TIME_PRICE_USD, TJAI_SUBSCRIPTION_PRICES_USD, getAnnualSavingsPercent } from "@/lib/tjai-pricing";

type BillingMode = "monthly" | "annual";

function useCountUp(target: number, duration = 500) {
  const [value, setValue] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    if (prev.current === target) return;
    const from = prev.current;
    prev.current = target;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export function MembershipPricing({ locale }: { locale: Locale }) {
  const copy = getMembershipTierCopy(locale);
  const [mode, setMode] = useState<BillingMode>("monthly");
  const [working, setWorking] = useState<"pro" | "apex" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveBadgeVisible, setSaveBadgeVisible] = useState(false);
  const paddlePromiseRef = useRef<Promise<Paddle | undefined> | null>(null);

  const annualSavings = getAnnualSavingsPercent(TJAI_SUBSCRIPTION_PRICES_USD.pro.monthly, TJAI_SUBSCRIPTION_PRICES_USD.pro.annual);
  const price = useMemo(
    () => ({
      pro: mode === "monthly" ? TJAI_SUBSCRIPTION_PRICES_USD.pro.monthly : TJAI_SUBSCRIPTION_PRICES_USD.pro.annual,
      apex: mode === "monthly" ? TJAI_SUBSCRIPTION_PRICES_USD.apex.monthly : TJAI_SUBSCRIPTION_PRICES_USD.apex.annual
    }),
    [mode]
  );

  const proPriceDisplay = useCountUp(price.pro);
  const apexPriceDisplay = useCountUp(price.apex);

  const switchMode = (m: BillingMode) => {
    setMode(m);
    if (m === "annual") {
      setSaveBadgeVisible(true);
    } else {
      setSaveBadgeVisible(false);
    }
  };

  const checkout = async (tier: "pro" | "apex") => {
    setError(null);
    setWorking(tier);
    try {
      const priceId =
        tier === "pro"
          ? mode === "monthly"
            ? process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID?.trim()
            : process.env.NEXT_PUBLIC_PADDLE_PRO_ANNUAL_PRICE_ID?.trim()
          : mode === "monthly"
            ? process.env.NEXT_PUBLIC_PADDLE_APEX_MONTHLY_PRICE_ID?.trim()
            : process.env.NEXT_PUBLIC_PADDLE_APEX_ANNUAL_PRICE_ID?.trim();
      const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.trim();
      if (!priceId || !token) {
        throw new Error(copy.checkoutError);
      }
      if (!paddlePromiseRef.current) {
        const env = (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT ?? process.env.NEXT_PUBLIC_PADDLE_ENV ?? "production")
          .trim()
          .toLowerCase();
        paddlePromiseRef.current = initializePaddle({ environment: env === "sandbox" ? "sandbox" : "production", token });
      }
      const paddle = await paddlePromiseRef.current;
      if (!paddle) throw new Error(copy.checkoutError);
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        settings: {
          displayMode: "overlay",
          theme: "dark",
          locale,
          successUrl: `${origin}/${locale}/membership?status=success&tier=${tier}`
        },
        customData: { tier, billing_mode: mode }
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.checkoutError);
    } finally {
      setWorking(null);
    }
  };

  const bool = (value: boolean) => (value ? "✓" : "—");

  return (
    <section className="tj-page-in mt-8">
      {/* Header + billing toggle */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1E2028] bg-[#111215] p-6 sm:p-8" style={{ backdropFilter: "blur(24px)" }}>
        <div
          className="pointer-events-none absolute inset-x-0 -top-20 h-40 bg-[radial-gradient(ellipse_60%_80%_at_50%_100%,rgba(34,211,238,0.18),transparent_70%)]"
          aria-hidden
        />
        <h1 className="relative font-display text-3xl font-extrabold tracking-tight text-white">{copy.title}</h1>
        <p className="relative mt-2 text-sm text-[#A1A1AA]">{copy.sub}</p>

        {/* Sliding pill toggle — ME2 */}
        <div className="mt-6 flex items-center gap-3">
          <div className="relative flex rounded-full border border-[#1E2028] bg-[#0D0E12] p-1">
            <div
              className="absolute top-1 h-[calc(100%-8px)] rounded-full bg-[#22D3EE] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                left: mode === "monthly" ? "4px" : "calc(50%)",
                width: "calc(50% - 4px)"
              }}
              aria-hidden
            />
            <button
              type="button"
              onClick={() => switchMode("monthly")}
              className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-200 ${mode === "monthly" ? "text-[#09090B]" : "text-[#A1A1AA]"}`}
            >
              {copy.monthly}
            </button>
            <button
              type="button"
              onClick={() => switchMode("annual")}
              className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-200 ${mode === "annual" ? "text-[#09090B]" : "text-[#A1A1AA]"}`}
            >
              {copy.annual}
            </button>
          </div>
          {/* ME15 — animated save badge */}
          <span
            className="inline-flex items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              opacity: saveBadgeVisible ? 1 : 0,
              transform: saveBadgeVisible ? "scale(1)" : "scale(0.7)",
              pointerEvents: "none"
            }}
          >
            {copy.saveBadge || `Save ${annualSavings}%`}
          </span>
        </div>
      </div>

      <div id="tjai-one-time" className="mt-6 rounded-2xl border border-[#1E2028] bg-[#111215] p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#22D3EE]">Standalone TJAI</p>
            <h2 className="mt-2 text-2xl font-extrabold text-white">${TJAI_ONE_TIME_PRICE_USD} one time</h2>
            <p className="mt-2 text-sm text-[#A1A1AA]">
              One adaptive TJAI assessment, one personalized plan, and PDF export. Subscriptions are optional add-ons for ongoing coaching.
            </p>
          </div>
          <a
            href={`/${locale}/tjai`}
            className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[#22D3EE] px-5 text-sm font-semibold text-[#22D3EE] hover:bg-[rgba(34,211,238,0.06)]"
          >
            Unlock TJAI
          </a>
        </div>
      </div>

      {/* Glassmorphic pricing cards — M4 */}
      <div className="tj-stagger mt-6 grid gap-4 md:grid-cols-3">
        {/* Core */}
        <article
          className="tj-card-lift tj-card-shine group relative overflow-hidden rounded-2xl border border-[#1E2028] p-6 transition-[border-color,box-shadow,transform] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_24px_64px_-24px_rgba(0,0,0,0.6)]"
          style={{ background: "rgba(17,18,21,0.72)", backdropFilter: "blur(24px)" }}
        >
          <h3 className="font-display text-xl font-bold text-white">{copy.cards.core.name}</h3>
          <p className="mt-3 text-3xl font-extrabold text-white">{copy.cards.core.priceFree}</p>
          <Button variant="secondary" className="mt-4 w-full" disabled>
            {copy.cards.core.cta}
          </Button>
          <ul className="mt-5 space-y-2.5 text-sm text-[#A1A1AA]">
            {copy.cards.core.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-[7px] inline-block h-1 w-1 rounded-full bg-[#52525B]" aria-hidden />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </article>

        {/* Pro */}
        <article
          className="tj-card-lift tj-card-shine group relative overflow-hidden rounded-2xl border border-cyan-400/40 p-6 shadow-[0_0_48px_rgba(34,211,238,0.18),0_0_0_1px_rgba(34,211,238,0.15)_inset] transition-[border-color,box-shadow,transform] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-cyan-400/60 hover:shadow-[0_34px_90px_rgba(34,211,238,0.26),0_0_0_1px_rgba(34,211,238,0.3)_inset]"
          style={{ background: "linear-gradient(165deg, rgba(34,211,238,0.06) 0%, rgba(17,18,21,0.85) 60%)", backdropFilter: "blur(24px)" }}
        >
          <div className="tj-tier-badge mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-300">
            {copy.cards.pro.badge}
          </div>
          <h3 className="font-display text-xl font-bold text-white">{copy.cards.pro.name}</h3>
          <p className="mt-3 text-3xl font-extrabold text-white">
            <span className="text-[#A1A1AA]">$</span>
            <span className="tabular-nums [text-shadow:0_0_24px_rgba(34,211,238,0.35)]">{proPriceDisplay}</span>{" "}
            <span className="text-sm font-medium text-[#A1A1AA]">{mode === "monthly" ? copy.perMonthSuffix : copy.perYearSuffix}</span>
          </p>
          <Button className="mt-4 w-full" disabled={working !== null} onClick={() => void checkout("pro")}>
            {working === "pro" ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#0A0A0B]" />
                {copy.cards.pro.cta}
              </span>
            ) : copy.cards.pro.cta}
          </Button>
          <ul className="mt-5 space-y-2.5 text-sm text-[#E4E4E7]/90">
            {copy.cards.pro.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-[1px] inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(34,211,238,0.15)] text-[#22D3EE]">
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden>
                    <path d="M2 6.5L4.5 9L10 3.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </article>

        {/* Apex — rotating border */}
        <article
          className="apex-card tj-card-lift tj-card-shine group relative overflow-hidden rounded-2xl p-6 transition-[transform,box-shadow] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:shadow-[0_44px_110px_rgba(167,139,250,0.28)]"
          style={{ background: "linear-gradient(165deg, rgba(167,139,250,0.08) 0%, rgba(17,18,21,0.9) 60%)", backdropFilter: "blur(24px)" }}
        >
          {/* Animated conic border */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl" style={{ padding: "1px", background: "conic-gradient(from var(--apex-angle, 0deg), #A78BFA, #22D3EE, #A78BFA)", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} aria-hidden />
          <div className="tj-tier-badge mb-3 inline-flex rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-300">
            {copy.cards.apex.badge}
          </div>
          <h3 className="font-display text-xl font-bold text-white">{copy.cards.apex.name}</h3>
          <p className="mt-3 text-3xl font-extrabold text-white">
            <span className="text-[#A1A1AA]">$</span>
            <span className="tabular-nums [text-shadow:0_0_24px_rgba(167,139,250,0.4)]">{apexPriceDisplay}</span>{" "}
            <span className="text-sm font-medium text-[#A1A1AA]">{mode === "monthly" ? copy.perMonthSuffix : copy.perYearSuffix}</span>
          </p>
          <Button className="tj-shine mt-4 w-full overflow-hidden bg-gradient-to-r from-violet-500 to-cyan-500 font-bold text-white hover:opacity-95" disabled={working !== null} onClick={() => void checkout("apex")}>
            {working === "apex" ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
                {copy.cards.apex.cta}
              </span>
            ) : copy.cards.apex.cta}
          </Button>
          <ul className="mt-5 space-y-2.5 text-sm text-[#E4E4E7]/90">
            {copy.cards.apex.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-[1px] inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(167,139,250,0.18)] text-[#A78BFA]">
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden>
                    <path d="M2 6.5L4.5 9L10 3.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="mt-8 rounded-2xl border border-[#1E2028] bg-[#111215] p-6">
        <h2 className="text-lg font-semibold text-white">{copy.tableTitle}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E2028] text-[#52525B]">
                <th className="py-2 text-left">Feature</th>
                <th className="py-2 text-center">{copy.cards.core.name}</th>
                <th className="py-2 text-center">{copy.cards.pro.name}</th>
                <th className="py-2 text-center">{copy.cards.apex.name}</th>
              </tr>
            </thead>
            <tbody>
              {copy.tableRows.map((row) => (
                <tr key={row.feature} className="border-b border-[#1E2028]/70">
                  <td className="py-2 text-[#A1A1AA]">{row.feature}</td>
                  <td className="py-2 text-center text-white">{bool(row.core)}</td>
                  <td className="py-2 text-center text-white">{bool(row.pro)}</td>
                  <td className="py-2 text-center text-white">{bool(row.apex)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-[#EF4444]">{error}</p> : null}
    </section>
  );
}
