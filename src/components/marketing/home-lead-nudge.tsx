"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";
import { getLeadCaptureCopy } from "@/lib/marketing-lead-copy";
import type { Locale } from "@/lib/i18n";

const STORAGE_KEY = "tjfit_home_lead_nudge_dismissed";

/**
 * Optional exit-intent (desktop) and timed slide-up (mobile) — homepage only, once per device.
 */
export function HomeLeadNudge({
  locale,
  title,
  sub
}: {
  locale: Locale;
  title: string;
  sub: string;
}) {
  const [open, setOpen] = useState(false);
  const copy = getLeadCaptureCopy(locale);
  const mobileTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shown = useRef(false);

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const tryOpen = useCallback(() => {
    if (shown.current) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    shown.current = true;
    setOpen(true);
  }, []);

  useEffect(() => {
    const onLeave = (e: MouseEvent) => {
      if (e.clientY > 24) return;
      if (window.matchMedia("(max-width: 1023px)").matches) return;
      tryOpen();
    };
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => document.documentElement.removeEventListener("mouseleave", onLeave);
  }, [tryOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1023px)");
    if (!mq.matches) return;
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const ratio = doc.scrollTop / max;
      if (ratio < 0.35) return;
      tryOpen();
      window.removeEventListener("scroll", onScroll, true);
    };
    mobileTimer.current = setTimeout(() => {
      window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    }, 12000);
    return () => {
      if (mobileTimer.current) clearTimeout(mobileTimer.current);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [tryOpen]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 px-3 pb-3 pt-16 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tjfit-nudge-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0c0c0e] p-6 shadow-2xl shadow-black/50 sm:p-8">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-300"
          aria-label={copy.closePanel}
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <p id="tjfit-nudge-title" className="pr-10 font-display text-lg font-semibold text-white sm:text-xl">
          {title}
        </p>
        <p className="mt-2 text-sm text-zinc-500">{sub}</p>
        <div className="mt-6">
          <LeadCaptureForm locale={locale} source="home-nudge" variant="compact" />
        </div>
        <p className="mt-4 text-center text-[11px] text-zinc-600">
          <Link href={`/${locale}/privacy-policy`} className="underline-offset-2 hover:text-zinc-400 hover:underline">
            {copy.privacyNote}
          </Link>
        </p>
      </div>
    </div>
  );
}
