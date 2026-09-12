"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { BUNDLES } from "@/lib/bundles";
import { localizeBundle } from "@/lib/bundle-localization";
import { isLocale, type Locale } from "@/lib/i18n";
import { ProtectedRoute } from "@/components/protected-route";
import { PremiumPageShell, PremiumPanel } from "@/components/premium";
import { getDigitalCheckoutCopy } from "@/lib/payments/checkout-copy";
import { getBundleLanguageNotice } from "@/lib/bundle-language-copy";
import { bundleCheckoutPath } from "@/lib/payments/bundle-recovery";
import { useBundleCheckout } from "@/lib/payments/use-bundle-checkout";

const bundles = BUNDLES.filter(bundle => !bundle.isFree && bundle.priceUsd === 10);
type Selection = { slug: string; orderId: string | null };

export default function CheckoutPage(props: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = use(props.params);
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const [selection, setSelection] = useState<Selection | null>(null);
  const references = useRef(new Map<string, string>());
  useEffect(() => {
    const query = new URLSearchParams(window.location.search), wanted = query.get('program');
    const slug = bundles.some(bundle => bundle.slug === wanted) ? wanted! : bundles[0]?.slug ?? '';
    const orderId = query.get('orderId');
    if (orderId) references.current.set(slug, orderId);
    setSelection({ slug, orderId });
  }, []);
  const changeBundle = (current: Selection, slug: string) => {
    if (current.orderId) references.current.set(current.slug, current.orderId); else references.current.delete(current.slug);
    const orderId = references.current.get(slug) ?? null;
    window.history.replaceState(window.history.state, '', bundleCheckoutPath(locale, slug, orderId));
    setSelection({ slug, orderId });
  };
  if (!isLocale(rawLocale)) notFound();
  return <ProtectedRoute locale={locale}><PremiumPageShell>
    {selection ? <BundleCheckoutForm key={locale + ':' + selection.slug} locale={locale} selection={selection} changeBundle={changeBundle} />
      : <PremiumPanel><p role="status">{getDigitalCheckoutCopy(locale).checking}</p></PremiumPanel>}
  </PremiumPageShell></ProtectedRoute>;
}

function BundleCheckoutForm({ locale, selection, changeBundle }: { locale: Locale; selection: Selection; changeBundle: (current: Selection, slug: string) => void }) {
  const { slug } = selection;
  const { recovery, state, actions, status, error, copy } = useBundleCheckout(locale, slug, selection.orderId);
  const selected = bundles.find(bundle => bundle.slug === slug);
  return <>
    <PremiumPanel padding="lg" className="mb-8">
      <h1 className="font-display text-3xl font-semibold text-white">{copy.title}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-faint">{copy.lead}</p>
    </PremiumPanel>
    <PremiumPanel>
      <label htmlFor="digital-bundle" className="text-sm text-muted">{copy.select}</label>
      <select id="digital-bundle" className="input mt-3" value={slug} onChange={event => changeBundle({ slug, orderId: state.orderId }, event.target.value)} disabled={state.busy}>
        {bundles.map(bundle => <option key={bundle.slug} value={bundle.slug}>{localizeBundle(bundle, locale).name}</option>)}
      </select>
      {selected && <div className="mt-6 border-t border-white/10 pt-6">
        <h2 className="text-lg font-semibold text-white">{localizeBundle(selected, locale).name}</h2>
        <p className="mt-2 text-sm text-faint">{localizeBundle(selected, locale).description}</p>
        <p className="mt-3 text-xs leading-relaxed text-muted">{getBundleLanguageNotice(locale)}</p>
        <p className="mt-4 text-xl text-white">$10 USD</p>
      </div>}
      {(state.testMode || state.receipt?.testMode) && <p className="mt-5 text-sm text-amber-200">{copy.testLabel}</p>}
      {(!state.orderId || state.receipt?.status === 'pending') && <button type="button" onClick={() => void recovery.checkout()} disabled={!actions.canBuy && !actions.canResume} aria-busy={state.busy} className="gradient-button mt-6 min-h-12 w-full rounded-full px-5 py-3 text-sm font-semibold text-background disabled:opacity-50">
        {state.busy ? copy.working : state.checking ? copy.checking : !state.available ? copy.closed : state.orderId ? copy.resume : copy.cta}
      </button>}
      {actions.canStartNew && <button type="button" onClick={recovery.startNew} className="mt-4 min-h-11 text-sm text-purple-200">{copy.startNew}</button>}
      <p className="mt-3 text-xs text-faint">{state.available ? copy.trust : !state.checking ? copy.closed : copy.checking}</p>
      {status && <p role="status" aria-live="polite" className="mt-5 text-sm text-bright">{status}</p>}
      {error && <p role="alert" className="mt-5 text-sm text-amber-200">{error}</p>}
      {(state.orderId || error) && <button type="button" disabled={state.busy || state.checking} className="mt-4 min-h-11 text-sm text-purple-200 disabled:opacity-50" onClick={() => void recovery.refresh()}>{state.checking ? copy.checking : copy.check}</button>}
      <Link className="mt-6 block text-sm text-purple-200" href={'/' + locale + '/bundles'}>{copy.downloads}</Link>
    </PremiumPanel>
  </>;
}
