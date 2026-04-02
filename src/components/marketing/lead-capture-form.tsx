"use client";

import { useState } from "react";
import { trackMarketingEvent } from "@/lib/analytics-events";
import { getLeadCaptureCopy } from "@/lib/marketing-lead-copy";
import type { Locale } from "@/lib/i18n";

type Variant = "hero-inline" | "panel" | "footer" | "compact" | "minimal";

export function LeadCaptureForm({
  locale,
  source,
  variant = "panel",
  className = ""
}: {
  locale: Locale;
  source: string;
  variant?: Variant;
  className?: string;
}) {
  const copy = getLeadCaptureCopy(locale);
  const [email, setEmail] = useState("");
  const [working, setWorking] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setErr(copy.invalidEmail);
      return;
    }
    setWorking(true);
    setErr(null);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean, locale, source })
      });
      const data = await res.json().catch(() => ({}));
      setWorking(false);
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : copy.genericError);
        return;
      }
      trackMarketingEvent("lead_submit", { source });
      if (
        source === "free-roadmap" ||
        source === "hero-inline" ||
        source === "mid-page" ||
        source === "home-nudge"
      ) {
        trackMarketingEvent("free_plan_click", { source });
      }
      setDone(true);
    } catch {
      setWorking(false);
      setErr(copy.genericError);
    }
  };

  if (done) {
    return (
      <div
        className={`rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-4 sm:px-5 sm:py-5 ${className}`.trim()}
        role="status"
      >
        <p className="text-sm font-medium text-emerald-100/95">{copy.successTitle}</p>
        <p className="mt-1 text-xs leading-relaxed text-emerald-200/70 sm:text-sm">{copy.successBody}</p>
      </div>
    );
  }

  const wrap =
    variant === "footer"
      ? "flex flex-col gap-3 sm:flex-row sm:items-end"
      : variant === "hero-inline"
        ? "flex flex-col gap-3 sm:flex-row sm:items-stretch"
        : variant === "compact"
          ? "flex flex-col gap-2 sm:flex-row sm:items-center"
          : "flex flex-col gap-3 sm:flex-row sm:items-stretch";

  const inputCls =
    variant === "minimal"
      ? "min-h-[48px] w-full rounded-full border border-white/[0.1] bg-black/30 px-4 text-base text-white placeholder:text-zinc-600 outline-none ring-cyan-400/30 focus:border-cyan-400/35 focus:ring-2 sm:text-sm"
      : "min-h-[52px] w-full rounded-full border border-white/[0.12] bg-white/[0.04] px-5 text-base text-white placeholder:text-zinc-500 outline-none ring-cyan-400/25 focus:border-cyan-400/40 focus:ring-2 sm:min-h-[48px] sm:text-sm";

  const btnCls =
    variant === "footer"
      ? "lux-btn-primary inline-flex min-h-[48px] w-full shrink-0 touch-manipulation items-center justify-center rounded-full px-6 text-base font-semibold text-[#05080a] disabled:opacity-60 sm:w-auto sm:text-sm"
      : "lux-btn-primary inline-flex min-h-[52px] w-full shrink-0 touch-manipulation items-center justify-center rounded-full px-8 text-base font-semibold text-[#05080a] disabled:opacity-60 sm:w-auto sm:min-h-[48px] sm:text-sm";

  return (
    <form onSubmit={submit} className={`${wrap} ${className}`.trim()}>
      <div className="min-w-0 flex-1">
        <label className="sr-only" htmlFor={`tjfit-lead-${source}`}>
          {copy.emailPlaceholder}
        </label>
        <input
          id={`tjfit-lead-${source}`}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder={copy.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={working}
          className={inputCls}
        />
        {err ? <p className="mt-2 text-xs text-rose-300/90">{err}</p> : null}
        <p className="mt-2 text-[11px] text-zinc-600 sm:text-xs">{copy.privacyNote}</p>
      </div>
      <button type="submit" disabled={working} className={btnCls}>
        {working ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
