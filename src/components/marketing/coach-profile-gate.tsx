"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";
import { trackMarketingEvent } from "@/lib/analytics-events";
import type { CoachProfileGateCopy } from "@/lib/premium-public-copy";
import type { Locale } from "@/lib/i18n";

export function CoachProfileGate({
  locale,
  slug,
  copy
}: {
  locale: Locale;
  slug: string;
  copy: CoachProfileGateCopy;
}) {
  useEffect(() => {
    trackMarketingEvent("coach_profile_view", { slug, surface: "coach-detail" });
  }, [slug]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="overflow-hidden rounded-[32px] border border-white/[0.1] bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[0_32px_80px_-40px_rgba(0,0,0,0.85)]">
        <div className="aspect-[21/9] bg-gradient-to-br from-cyan-500/15 via-zinc-900/50 to-violet-600/10" aria-hidden />
        <div className="px-8 py-10 sm:px-12 sm:py-12">
          <span className="lux-badge inline-flex">{copy.badge}</span>
          <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{copy.title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{copy.body}</p>

          <div className="mt-10 border-t border-white/[0.08] pt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-faint">{copy.proofTitle}</p>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              {copy.proofItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan-400/70" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <p className="font-medium text-white">{copy.notifyTitle}</p>
            <p className="mt-1 text-sm text-faint">{copy.notifySub}</p>
            <div className="mt-6">
              <LeadCaptureForm locale={locale} source={`coach-profile-${slug}`} variant="panel" />
            </div>
          </div>

          <div className="mt-10">
            <Link
              href={`/${locale}/coaches`}
              className="text-sm font-medium text-cyan-200/90 underline-offset-4 hover:underline"
            >
              ← {copy.ctaBack}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
