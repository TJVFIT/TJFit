"use client";

import { useEffect, useRef } from "react";
import { trackMarketingEvent } from "@/lib/analytics-events";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";
import type { HomeLuxuryCopy } from "@/lib/home-luxury-copy";
import type { Locale } from "@/lib/i18n";

export function PricingPreviewHome({
  locale,
  copy
}: {
  locale: Locale;
  copy: HomeLuxuryCopy["pricingPreview"];
}) {
  const { tierStatus, ...rest } = copy;
  const ref = useRef<HTMLElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting || fired.current) return;
        fired.current = true;
        trackMarketingEvent("pricing_section_view", { surface: "home" });
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="border-t border-white/[0.05] bg-surface/[0.25] py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <span className="lux-badge inline-flex">{rest.badge}</span>
        <h2 className="mt-8 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">{rest.title}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-[15px]">{rest.sub}</p>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {rest.tiers.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-8 ring-1 ring-white/[0.04]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">{tierStatus}</p>
              <p className="mt-4 font-display text-xl font-semibold text-white">{t.name}</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">{t.teaser}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-xs leading-relaxed text-zinc-600 sm:text-sm">{rest.footnote}</p>

        <div className="mt-10 max-w-xl">
          <LeadCaptureForm locale={locale} source="membership-waitlist-home" variant="panel" />
        </div>
      </div>
    </section>
  );
}
