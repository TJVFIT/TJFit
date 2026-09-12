"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { BUNDLES } from "@/lib/bundles";
import { localizeBundle } from "@/lib/bundle-localization";
import { isLocale, type Locale } from "@/lib/i18n";
import { ProtectedRoute } from "@/components/protected-route";
import { PremiumPageShell, PremiumPanel } from "@/components/premium";
import { getDigitalCheckoutCopy } from "@/lib/payments/checkout-copy";
import { openLemonCheckout } from "@/lib/payments/lemon/browser";
import { getBundleLanguageNotice } from "@/lib/bundle-language-copy";

const bundles = BUNDLES.filter(bundle => !bundle.isFree && bundle.priceUsd === 10);

export default function CheckoutPage(props: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = use(props.params);
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const copy = getDigitalCheckoutCopy(locale);
  const [slug, setSlug] = useState(bundles[0]?.slug ?? "");
  const [allowed, setAllowed] = useState<string[]>([]);
  const [testMode, setTestMode] = useState(false);
  const [working, setWorking] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const selected = bundles.find(bundle => bundle.slug === slug);
  const enabled = allowed.includes(slug);
  const checkStatus = useCallback(async (id: string) => {
    try {
      const response = await fetch("/api/checkout/order-status?orderId=" + encodeURIComponent(id), { credentials: "include", cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error("Unavailable");
      setStatus(data.status === "paid" ? copy.paid : data.status === "test_paid" ? copy.test : data.status === "refunded" ? copy.refunded : data.status === "review" ? copy.review : copy.pending);
    } catch { setStatus(copy.failed); }
  }, [copy]);

  useEffect(() => {
    let disposed = false;
    fetch("/api/checkout/availability", { cache: "no-store" }).then(response => response.json()).then(data => {
      if (disposed) return;
      setAllowed(data.available && Array.isArray(data.programSlugs) ? data.programSlugs : []);
      setTestMode(data.testMode === true);
    }).catch(() => {});
    const query = new URLSearchParams(window.location.search);
    const wanted = query.get("program");
    if (wanted && bundles.some(bundle => bundle.slug === wanted)) setSlug(wanted);
    const id = query.get("orderId");
    if (id) { setOrderId(id); void checkStatus(id); }
    return () => { disposed = true; };
  }, [checkStatus]);

  async function purchase() {
    if (!enabled || !selected || working) return;
    setWorking(true); setStatus(null);
    try {
      const response = await fetch("/api/checkout/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ programSlug: slug, locale }) });
      const data = await response.json();
      if (!response.ok || data.clientFlow?.action !== "redirect_lemon" || typeof data.clientFlow.orderId !== "string") throw new Error("Unavailable");
      setOrderId(data.clientFlow.orderId);
      const prepared = await fetch("/api/checkout/prepare-session", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ orderId: data.clientFlow.orderId }) });
      const session = await prepared.json();
      if (!prepared.ok || typeof session.url !== "string") throw new Error("Unavailable");
      await openLemonCheckout(session.url);
      setStatus(copy.pending);
    } catch { setStatus(copy.failed); }
    finally { setWorking(false); }
  }

  if (!isLocale(rawLocale)) notFound();
  return <ProtectedRoute locale={locale}>
    <PremiumPageShell>
      <PremiumPanel padding="lg" className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-white">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-faint">{copy.lead}</p>
      </PremiumPanel>
      <PremiumPanel>
        <label htmlFor="digital-bundle" className="text-sm text-muted">{copy.select}</label>
        <select id="digital-bundle" className="input mt-3" value={slug} onChange={event => setSlug(event.target.value)} disabled={working}>
          {bundles.map(bundle => <option key={bundle.slug} value={bundle.slug}>{localizeBundle(bundle, locale).name}</option>)}
        </select>
        {selected && <div className="mt-6 border-t border-white/10 pt-6">
          <h2 className="text-lg font-semibold text-white">{localizeBundle(selected, locale).name}</h2>
          <p className="mt-2 text-sm text-faint">{localizeBundle(selected, locale).description}</p>
          <p className="mt-3 text-xs leading-relaxed text-muted">{getBundleLanguageNotice(locale)}</p>
          <p className="mt-4 text-xl text-white">$10 USD</p>
        </div>}
        {testMode && <p className="mt-5 text-sm text-amber-200">{copy.testLabel}</p>}
        <button type="button" onClick={() => void purchase()} disabled={!enabled || working} className="gradient-button mt-6 min-h-12 w-full rounded-full px-5 py-3 text-sm font-semibold text-background disabled:opacity-50">
          {working ? copy.working : enabled ? copy.cta : copy.closed}
        </button>
        <p className="mt-3 text-xs text-faint">{enabled ? copy.trust : copy.closed}</p>
        {status && <p role="status" aria-live="polite" className="mt-5 text-sm text-bright">{status}</p>}
        {orderId && <button type="button" className="mt-4 min-h-11 text-sm text-purple-200" onClick={() => void checkStatus(orderId)}>{copy.check}</button>}
        <Link className="mt-6 block text-sm text-purple-200" href={`/${locale}/bundles`}>{copy.downloads}</Link>
      </PremiumPanel>
    </PremiumPageShell>
  </ProtectedRoute>;
}
