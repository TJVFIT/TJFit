"use client";

import { useEffect, useState } from "react";

import { ProtectedRoute } from "@/components/protected-route";
import { useDynamicIsland } from "@/components/ui/dynamic-island";
import { requireLocaleParam } from "@/lib/require-locale";

type Step = 0 | 1 | 2 | 3 | 4;

function CancellationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const island = useDynamicIsland();
  const [step, setStep] = useState<Step>(1);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, open]);
  if (!open) return null;

  const content = (() => {
    if (step === 1) {
      return (
        <>
          <h3 className="text-xl font-semibold text-white">Are you sure you want to cancel?</h3>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            <li>Unlimited TJAI</li>
            <li>Custom 12-week plans</li>
            <li>75 TJCOIN/month</li>
          </ul>
          <div className="mt-4 flex gap-2">
            <button className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-[#09090B]" onClick={onClose}>
              Keep My Subscription
            </button>
            <button className="rounded-full border border-divider px-4 py-2 text-sm text-bright" onClick={() => setStep(2)}>
              Continue to Cancel
            </button>
          </div>
        </>
      );
    }
    if (step === 2) {
      return (
        <>
          <h3 className="text-xl font-semibold text-white">Need a break?</h3>
          <p className="mt-2 text-sm text-muted">Pause your subscription for 1 or 2 months instead.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded-full border border-cyan-400/30 px-4 py-2 text-sm text-cyan-200" onClick={() => setStep(4)}>
              Pause for 1 Month
            </button>
            <button className="rounded-full border border-cyan-400/30 px-4 py-2 text-sm text-cyan-200" onClick={() => setStep(4)}>
              Pause for 2 Months
            </button>
            <button className="text-sm text-faint" onClick={() => setStep(3)}>
              I still want to cancel
            </button>
          </div>
        </>
      );
    }
    if (step === 3) {
      return (
        <>
          <h3 className="text-xl font-semibold text-white">Stay for less</h3>
          <p className="mt-2 text-sm text-muted">We&apos;d like to offer you 1 month at 50% off.</p>
          <div className="mt-4 flex gap-2">
            <button
              className="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => {
                island?.showNotification("achievement", "Offer applied!");
                onClose();
              }}
            >
              Accept Offer
            </button>
            <button className="text-sm text-faint" onClick={() => setStep(4)}>
              No thanks, cancel
            </button>
          </div>
        </>
      );
    }
    return (
      <>
        <h3 className="text-xl font-semibold text-white">Subscription updated</h3>
        <p className="mt-2 text-sm text-muted">Access continues until your current billing period ends.</p>
        <button className="mt-4 rounded-full border border-divider px-4 py-2 text-sm text-bright" onClick={onClose}>
          Close
        </button>
      </>
    );
  })();

  return (
    <div className="fixed inset-0 z-[120] flex items-end bg-black/70 p-0 sm:items-center sm:justify-center sm:p-4">
      <div className="w-full rounded-t-2xl border border-divider bg-surface p-5 sm:max-w-lg sm:rounded-2xl">{content}</div>
      <button className="absolute inset-0 -z-10" onClick={onClose} aria-label="Close modal backdrop" />
    </div>
  );
}

export default function SettingsSubscriptionPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const [open, setOpen] = useState(false);
  return (
    <ProtectedRoute locale={locale}>
      <section className="mx-auto max-w-3xl space-y-4 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold text-white">Subscription</h1>
        <p className="text-sm text-muted">Manage your current plan and billing preferences.</p>
        <div className="rounded-2xl border border-divider bg-surface p-5">
          <p className="text-sm text-bright">Current tier: Apex</p>
          <button className="mt-4 rounded-full border border-red-500/30 px-4 py-2 text-sm text-red-300" onClick={() => setOpen(true)}>
            Cancel Subscription
          </button>
        </div>
      </section>
      <CancellationModal open={open} onClose={() => setOpen(false)} />
    </ProtectedRoute>
  );
}
