"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FileDown, Loader2, ShoppingBag } from "lucide-react";
import { getDigitalCheckoutCopy } from "@/lib/payments/checkout-copy";
import { isLocale } from "@/lib/i18n";
import { getBundleLanguageNotice } from "@/lib/bundle-language-copy";
import { useBundleCheckout } from "@/lib/payments/use-bundle-checkout";
import { bundleCheckoutPath } from "@/lib/payments/bundle-recovery";

type Labels = { download: string; buy: string; getFree: string; processing: string };
type Props = { slug: string; locale: string; isFree: boolean; priceLabel: string; labels: Labels; className?: string };
const buttonClass = "tj-cta-sheen relative inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#A855F7_0%,#7C3AED_100%)] px-4 py-2.5 text-sm font-bold text-[#0A0A0B] shadow-[0_0_24px_rgba(168,85,247,0.22)] transition-[filter,box-shadow,transform] duration-150 hover:brightness-110 hover:shadow-[0_0_32px_rgba(168,85,247,0.32)] motion-safe:active:scale-[0.97] disabled:opacity-60";

/** Free claims preserve existing access; paid CTAs share the return-page recovery flow. */
export function BundleCta(props: Props) {
  return props.isFree ? <FreeBundleCta {...props} /> : <PaidBundleCta key={props.locale + ':' + props.slug} {...props} />;
}

function FreeBundleCta({ slug, locale, labels, className }: Props) {
  const [busy, setBusy] = useState(false), busyRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const copy = getDigitalCheckoutCopy(isLocale(locale) ? locale : "en");
  const run = async () => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError(null);
    try {
      const res = await fetch("/api/bundles/claim", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ slug })
      });
      if (res.status === 401) {
        window.location.href = '/' + locale + '/login?redirect=' + encodeURIComponent('/' + locale + '/bundles');
        return;
      }
      if (!res.ok) throw new Error("claim failed");
      window.location.href = '/api/bundles/download/' + slug + '?locale=' + locale;
    } catch { setError(copy.failed); }
    finally { busyRef.current = false; setBusy(false); }
  };
  return <div className={className}>
    <p className="mb-3 text-xs leading-relaxed text-muted">{getBundleLanguageNotice(isLocale(locale) ? locale : "en")}</p>
    <button type="button" onClick={() => void run()} disabled={busy} aria-label={labels.getFree + ' ' + slug} className={buttonClass}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden /> : <FileDown className="h-4 w-4" aria-hidden />}
      <span>{busy ? labels.processing : labels.getFree}</span>
    </button>
    {error && <p className="mt-2 text-xs text-red-300" role="alert" aria-live="assertive">{error}</p>}
  </div>;
}

function PaidBundleCta({ slug, locale: rawLocale, priceLabel, labels, className }: Props) {
  const locale = isLocale(rawLocale) ? rawLocale : 'en';
  const { recovery, state, actions, status, error, copy } = useBundleCheckout(locale, slug);
  const label = state.busy ? labels.processing : state.checking ? copy.checking : !state.available ? copy.closed : state.orderId ? copy.resume : labels.buy + ' · ' + priceLabel;
  return <div className={className}>
    <p className="mb-3 text-xs leading-relaxed text-muted">{getBundleLanguageNotice(locale)}</p>
    {(!state.orderId || state.receipt?.status === 'pending') && <button type="button" onClick={() => void recovery.checkout()} disabled={!actions.canBuy && !actions.canResume} aria-busy={state.busy} aria-label={label + ' ' + slug} className={buttonClass}>
      {state.busy ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden /> : <ShoppingBag className="h-4 w-4" aria-hidden />}<span>{label}</span>
    </button>}
    {(state.testMode || state.receipt?.testMode) && <p className="mt-2 text-xs text-amber-200">{copy.testLabel}</p>}
    {status && <p className="mt-3 text-sm text-bright" role="status" aria-live="polite">{status}</p>}
    {actions.canStartNew && <button type="button" onClick={recovery.startNew} className="mt-3 min-h-11 text-sm text-purple-200">{copy.startNew}</button>}
    {(state.orderId || error) && <Link className="mt-3 block text-sm text-purple-200" href={bundleCheckoutPath(locale, slug, state.orderId)}>{copy.check}</Link>}
    {error && <p className="mt-2 text-xs text-red-300" role="alert">{error}</p>}
  </div>;
}
