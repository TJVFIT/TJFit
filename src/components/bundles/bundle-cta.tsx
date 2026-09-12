"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileDown, Loader2, ShoppingBag } from "lucide-react";
import { openLemonCheckout } from "@/lib/payments/lemon/browser";
import { getDigitalCheckoutCopy } from "@/lib/payments/checkout-copy";
import { isLocale } from "@/lib/i18n";
import { getBundleLanguageNotice } from "@/lib/bundle-language-copy";

type Labels = { download: string; buy: string; getFree: string; processing: string };

/**
 * Bundle call-to-action. Free bundles claim a $0 entitlement then download;
 * paid bundles run the create-order → prepare-session → Lemon overlay
 * flow (mirrors the checkout page). On any failure it surfaces a short
 * inline message and never silently no-ops.
 */
export function BundleCta({
  slug,
  locale,
  isFree,
  priceLabel,
  labels,
  className
}: {
  slug: string;
  locale: string;
  isFree: boolean;
  priceLabel: string; // e.g. "$10"
  labels: Labels;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const copy = getDigitalCheckoutCopy(isLocale(locale) ? locale : "en");
  useEffect(() => {
    if (isFree) return;
    let disposed = false;
    fetch("/api/checkout/availability", { cache: "no-store" }).then(response => response.json()).then(data => {
      if (!disposed) { setAvailable(data.available === true && Array.isArray(data.programSlugs) && data.programSlugs.includes(slug)); setTestMode(data.testMode === true); }
    }).catch(() => {});
    return () => { disposed = true; };
  }, [isFree, slug]);

  const downloadHref = `/api/bundles/download/${slug}?locale=${locale}`;

  const run = async () => {
    if (busy || (!isFree && !available)) return;
    setBusy(true);
    setError(null);
    try {
      if (isFree) {
        const res = await fetch("/api/bundles/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ slug })
        });
        if (res.status === 401) {
          window.location.href = `/${locale}/login?redirect=${encodeURIComponent(`/${locale}/bundles`)}`;
          return;
        }
        if (!res.ok) throw new Error("claim failed");
        window.location.href = downloadHref;
        return;
      }

      // Paid: server-owned intent → verified Lemon session → overlay or hosted fallback.
      const createRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ programSlug: slug, locale })
      });
      if (createRes.status === 401) {
        window.location.href = `/${locale}/login?redirect=${encodeURIComponent(`/${locale}/bundles`)}`;
        return;
      }
      const createData = await createRes.json().catch(() => ({}));
      if (!createRes.ok) throw new Error(createData?.error ?? "create-order failed");

      const flow = createData?.clientFlow as { action?: string; orderId?: string } | undefined;
      const orderId = flow?.orderId;
      if (!orderId || flow?.action !== "redirect_lemon") throw new Error("Invalid checkout flow");

      const prepRes = await fetch("/api/checkout/prepare-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId })
      });
      const prep = (await prepRes.json().catch(() => ({}))) as { url?: string; error?: string; code?: string };
      if (!prepRes.ok || !prep.url) throw new Error(prep.error ?? "Checkout is temporarily unavailable.");
      await openLemonCheckout(prep.url);
      setPaymentOrderId(orderId);
    } catch (e) {
      console.error("[bundle-cta]", e);
      setError(copy.failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <p className="mb-3 text-xs leading-relaxed text-muted">{getBundleLanguageNotice(isLocale(locale) ? locale : "en")}</p>
      <button
        type="button"
        onClick={run}
        disabled={busy || (!isFree && !available)}
        aria-label={isFree ? `${labels.getFree} ${slug}` : `${labels.buy} ${slug} ${priceLabel}`}
        className="tj-cta-sheen relative inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#A855F7_0%,#7C3AED_100%)] px-4 py-2.5 text-sm font-bold text-[#0A0A0B] shadow-[0_0_24px_rgba(168,85,247,0.22)] transition-[filter,box-shadow,transform] duration-150 hover:brightness-110 hover:shadow-[0_0_32px_rgba(168,85,247,0.32)] motion-safe:active:scale-[0.97] disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />
        ) : isFree ? (
          <FileDown className="h-4 w-4" aria-hidden />
        ) : (
          <ShoppingBag className="h-4 w-4" aria-hidden />
        )}
        <span>{busy ? labels.processing : isFree ? labels.getFree : !available ? copy.closed : `${labels.buy} · ${priceLabel}`}</span>
      </button>
      {!isFree && testMode ? <p className="mt-2 text-xs text-amber-200">{copy.testLabel}</p> : null}
      {paymentOrderId ? <Link className="mt-3 block text-sm text-purple-200" href={`/${locale}/checkout?program=${encodeURIComponent(slug)}&orderId=${paymentOrderId}`}>{copy.check}</Link> : null}
      {error ? (
        <p className="mt-2 text-xs text-red-300" role="alert" aria-live="assertive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
