"use client";

import { useState } from "react";
import { FileDown, Loader2, ShoppingBag } from "lucide-react";

type Labels = { download: string; buy: string; getFree: string; processing: string };

/**
 * Bundle call-to-action. Free bundles claim a $0 entitlement then download;
 * paid bundles run the create-order → prepare-session → Gumroad redirect
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

  const downloadHref = `/api/bundles/download/${slug}?locale=${locale}`;

  const run = async () => {
    if (busy) return;
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

      // Paid: create order → resolve Gumroad URL → redirect.
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
      if (!orderId) throw new Error("no order id");

      const prepRes = await fetch("/api/checkout/prepare-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId })
      });
      const prep = (await prepRes.json().catch(() => ({}))) as { url?: string; error?: string; code?: string };
      if (prep.code === "GUMROAD_NOT_CONFIGURED") {
        throw new Error("This bundle isn't connected to checkout yet. Please try again shortly.");
      }
      if (!prepRes.ok || !prep.url) throw new Error(prep.error ?? "Checkout is temporarily unavailable.");
      window.location.href = prep.url;
    } catch (e) {
      console.error("[bundle-cta]", e);
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        aria-label={isFree ? `${labels.getFree} ${slug}` : `${labels.buy} ${slug} ${priceLabel}`}
        className="tj-cta-sheen relative inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#A855F7_0%,#7C3AED_100%)] px-4 py-2.5 text-sm font-bold text-[#0A0A0B] shadow-[0_0_24px_rgba(168, 85, 247,0.22)] transition-[filter,box-shadow,transform] duration-150 hover:brightness-110 hover:shadow-[0_0_32px_rgba(168, 85, 247,0.32)] motion-safe:active:scale-[0.97] disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />
        ) : isFree ? (
          <FileDown className="h-4 w-4" aria-hidden />
        ) : (
          <ShoppingBag className="h-4 w-4" aria-hidden />
        )}
        <span>{busy ? labels.processing : isFree ? labels.getFree : `${labels.buy} · ${priceLabel}`}</span>
      </button>
      {error ? (
        <p className="mt-2 text-xs text-red-300" role="alert" aria-live="assertive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
