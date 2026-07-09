"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { type Locale } from "@/lib/i18n";
import { getMembershipTierCopy } from "@/lib/membership-tier-copy";
import { TJAI_ONE_TIME_PRICE_USD, TJAI_SUBSCRIPTION_PRICES_USD, getAnnualSavingsPercent } from "@/lib/tjai-pricing";

type BillingMode = "monthly" | "annual";

// Hosted Gumroad subscription checkout URLs. NEXT_PUBLIC_* vars are inlined at
// build time, so referencing each literal lets the client gate the CTA: when a
// tier/mode has no configured URL the button is disabled rather than letting a
// buyer click a primary CTA straight into an error.
const SUB_URLS = {
  pro: {
    monthly: (process.env.NEXT_PUBLIC_GUMROAD_PRO_MONTHLY_URL ?? "").trim(),
    annual: (process.env.NEXT_PUBLIC_GUMROAD_PRO_ANNUAL_URL ?? "").trim()
  },
  apex: {
    monthly: (process.env.NEXT_PUBLIC_GUMROAD_APEX_MONTHLY_URL ?? "").trim(),
    annual: (process.env.NEXT_PUBLIC_GUMROAD_APEX_ANNUAL_URL ?? "").trim()
  }
} as const;

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

  const checkout = (tier: "pro" | "apex") => {
    setError(null);
    setWorking(tier);
    try {
      const url = SUB_URLS[tier][mode];
      if (!url) throw new Error(copy.checkoutError);
      const target = new URL(url);
      target.searchParams.set("wanted", "true");
      target.searchParams.set("tjfit_tier", tier);
      target.searchParams.set("tjfit_billing_mode", mode);
      window.location.href = target.toString();
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.checkoutError);
    } finally {
      setWorking(null);
    }
  };

  const bool = (value: boolean) => (value ? "✓" : "—");

  const proConfigured = Boolean(SUB_URLS.pro[mode]);
  const apexConfigured = Boolean(SUB_URLS.apex[mode]);

  return (
    <section className="mt-8">
      {/* Header + billing toggle */}
      <div className="rounded-2xl border border-divider bg-surface/70 p-6 sm:p-8" style={{ backdropFilter: "blur(24px)" }}>
        <h1 className="text-3xl font-extrabold text-white">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted">{copy.sub}</p>

        {/* Sliding pill toggle — ME2 */}
        <div className="mt-6 flex items-center gap-3">
          <div className="relative flex rounded-full border border-divider bg-[#0D0E12] p-1">
            <div
              className="absolute top-1 h-[calc(100%-8px)] rounded-full bg-accent transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                left: mode === "monthly" ? "4px" : "calc(50%)",
                width: "calc(50% - 4px)"
              }}
              aria-hidden
            />
            <button
              type="button"
              onClick={() => switchMode("monthly")}
              className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-200 ${mode === "monthly" ? "text-[#09090B]" : "text-muted"}`}
            >
              {copy.monthly}
            </button>
            <button
              type="button"
              onClick={() => switchMode("annual")}
              className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-200 ${mode === "annual" ? "text-[#09090B]" : "text-muted"}`}
            >
              {copy.annual}
            </button>
          </div>
          {/* ME15 — animated save badge */}
          <span
            className="inline-flex items-center rounded-full border border-purple-400/25 bg-purple-400/10 px-3 py-1 text-xs font-semibold text-purple-300 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
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

      <div id="tjai-one-time" className="mt-6 rounded-2xl border border-divider bg-surface p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{copy.standalone.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-extrabold text-white tabular-nums">
              ${TJAI_ONE_TIME_PRICE_USD} <span className="text-base font-semibold text-muted">{copy.standalone.oneTimeSuffix}</span>
            </h2>
            <p className="mt-2 text-sm text-muted">
              {copy.standalone.body}
            </p>
          </div>
          <a
            href={`/${locale}/tjai`}
            className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-accent px-5 text-sm font-semibold text-accent hover:bg-[rgba(168,85,247,0.06)]"
          >
            {copy.standalone.cta}
          </a>
        </div>
      </div>

      {/* Glassmorphic pricing cards — M4 */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {/* Core */}
        <article
          className="group relative overflow-hidden rounded-2xl border border-divider p-6 transition-[border-color,box-shadow] duration-300 hover:border-white/10 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
          style={{ background: "rgba(17,18,21,0.7)", backdropFilter: "blur(24px)" }}
        >
          <h3 className="text-xl font-bold text-white">{copy.cards.core.name}</h3>
          <p className="mt-3 text-3xl font-extrabold text-white">{copy.cards.core.priceFree}</p>
          <Button variant="secondary" className="mt-4 w-full" disabled>
            {copy.cards.core.cta}
          </Button>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {copy.cards.core.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2"><span className="text-dim">•</span>{feature}</li>
            ))}
          </ul>
        </article>

        {/* Pro */}
        <article
          className="group relative overflow-hidden rounded-2xl border border-purple-400/35 p-6 shadow-[0_0_40px_rgba(168,85,247,0.14)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-purple-400/55 hover:shadow-[0_30px_80px_rgba(168,85,247,0.18)]"
          style={{ background: "linear-gradient(165deg, rgba(168,85,247,0.05) 0%, rgba(17,18,21,0.85) 60%)", backdropFilter: "blur(24px)" }}
        >
          <div className="mb-3 inline-flex rounded-full border border-purple-400/30 bg-purple-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-purple-300">
            {copy.cards.pro.badge}
          </div>
          <h3 className="text-xl font-bold text-white">{copy.cards.pro.name}</h3>
          <p className="mt-3 text-3xl font-extrabold text-white">
            $<span className="tabular-nums">{proPriceDisplay}</span>{" "}
            <span className="text-sm font-medium text-muted">{mode === "monthly" ? copy.perMonthSuffix : copy.perYearSuffix}</span>
          </p>
          <Button className="mt-4 w-full" disabled={working !== null || !proConfigured} onClick={() => checkout("pro")}>
            {working === "pro" ? "..." : copy.cards.pro.cta}
          </Button>
          {!proConfigured ? (
            <p className="mt-2 text-center text-xs text-muted">{copy.checkoutError}</p>
          ) : null}
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {copy.cards.pro.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2"><span className="text-accent">✓</span>{feature}</li>
            ))}
          </ul>
        </article>

        {/* Apex — ME15 rotating border */}
        <article
          className="apex-card group relative overflow-hidden rounded-2xl p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-2 hover:shadow-[0_40px_100px_rgba(124,58,237,0.22)]"
          style={{ background: "linear-gradient(165deg, rgba(124,58,237,0.07) 0%, rgba(17,18,21,0.9) 60%)", backdropFilter: "blur(24px)" }}
        >
          {/* Animated conic border */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl" style={{ padding: "1px", background: "conic-gradient(from var(--apex-angle, 0deg), #7C3AED, #A855F7, #7C3AED)", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} aria-hidden />
          <div className="mb-3 inline-flex rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-300">
            {copy.cards.apex.badge}
          </div>
          <h3 className="text-xl font-bold text-white">{copy.cards.apex.name}</h3>
          <p className="mt-3 text-3xl font-extrabold text-white">
            $<span className="tabular-nums">{apexPriceDisplay}</span>{" "}
            <span className="text-sm font-medium text-muted">{mode === "monthly" ? copy.perMonthSuffix : copy.perYearSuffix}</span>
          </p>
          <Button className="mt-4 w-full bg-gradient-to-r from-purple-400 to-violet-500 font-bold text-white shadow-[0_0_24px_rgba(168,85,247,0.22)] transition-[transform,box-shadow,filter] duration-200 hover:scale-[1.01] hover:shadow-[0_0_36px_rgba(168,85,247,0.35)] hover:brightness-110 [--goo-body:linear-gradient(90deg,#c084fc,#8b5cf6)]" disabled={working !== null || !apexConfigured} onClick={() => checkout("apex")}>
            {working === "apex" ? "..." : copy.cards.apex.cta}
          </Button>
          {!apexConfigured ? (
            <p className="mt-2 text-center text-xs text-muted">{copy.checkoutError}</p>
          ) : null}
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {copy.cards.apex.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2"><span className="text-accent-violet">✓</span>{feature}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="mt-8 rounded-2xl border border-divider bg-surface p-6">
        <h2 className="text-lg font-semibold text-white">{copy.tableTitle}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-divider text-dim">
                <th className="py-2 text-left">{copy.tableFeatureHeader}</th>
                <th className="py-2 text-center">{copy.cards.core.name}</th>
                <th className="py-2 text-center">{copy.cards.pro.name}</th>
                <th className="py-2 text-center">{copy.cards.apex.name}</th>
              </tr>
            </thead>
            <tbody>
              {copy.tableRows.map((row) => (
                <tr key={row.feature} className="border-b border-divider/70">
                  <td className="py-2 text-muted">{row.feature}</td>
                  <td className="py-2 text-center text-white">{bool(row.core)}</td>
                  <td className="py-2 text-center text-white">{bool(row.pro)}</td>
                  <td className="py-2 text-center text-white">{bool(row.apex)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
    </section>
  );
}
