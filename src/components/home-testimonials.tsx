"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Testimonial = {
  quote: string;
  name: string;
  tag: string;
};

// HONEST-EMPTY (2026-08-13, same pattern as the May content.ts honesty pass):
// the previous five entries were fabricated — invented names, cities, and
// specific outcome claims ("Lost 8kg") presented as real member quotes under
// a "Real People. Real Results." heading. Fake testimonials are a legal
// exposure (FTC and EU/TR equivalents), not just a truth problem.
// The section renders nothing while this list is empty. Real entries come
// from actual members (program_completions / user_transformations are the
// intended sources — Wave 2, WP-SOCIAL-03) with written consent, and go
// through the owner before shipping.
const TESTIMONIALS: Testimonial[] = [];

const COPY: Record<Locale, { label: string; title: string; sub: string; disclaimer: string }> = {
  en: {
    label: "Real transformations",
    title: "Real People. Real Results.",
    sub: "Members describe outcomes in their own words.",
    disclaimer: "Results vary. Individual outcomes depend on consistency, diet, and starting fitness level.",
  },
  tr: {
    label: "Gerçek dönüşümler",
    title: "Gerçek İnsanlar. Gerçek Sonuçlar.",
    sub: "Üyeler sonuçlarını kendi sözleriyle anlatıyor.",
    disclaimer: "Sonuçlar kişiden kişiye değişir. Sonuç; tutarlılık, beslenme ve başlangıç seviyesine bağlıdır.",
  },
  ar: {
    label: "تحولات حقيقية",
    title: "أشخاص حقيقيون. نتائج حقيقية.",
    sub: "يصف الأعضاء نتائجهم بكلماتهم الخاصة.",
    disclaimer: "النتائج تختلف. تعتمد النتيجة على الالتزام والتغذية ومستوى البداية.",
  },
  es: {
    label: "Transformaciones reales",
    title: "Personas reales. Resultados reales.",
    sub: "Los miembros describen sus resultados con sus propias palabras.",
    disclaimer: "Los resultados varian. Dependen de constancia, dieta y nivel inicial.",
  },
  fr: {
    label: "Transformations reelles",
    title: "De vraies personnes. De vrais resultats.",
    sub: "Les membres decrivent leurs resultats avec leurs propres mots.",
    disclaimer: "Les resultats varient selon la regularite, l'alimentation et le niveau initial.",
  },
};

export function HomeTestimonials({ locale }: { locale: Locale }) {
  const copy = COPY[locale] ?? COPY.en;
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = TESTIMONIALS.length;
  const active = total > 0 ? TESTIMONIALS[activeIdx % total] : undefined;

  const go = useCallback(
    (dir: -1 | 1) => {
      setActiveIdx((i) => (i + dir + total) % total);
    },
    [total]
  );

  useEffect(() => {
    if (paused || total === 0) return;
    const id = window.setInterval(() => {
      setActiveIdx((i) => (i + 1) % total);
    }, 5000);
    return () => window.clearInterval(id);
  }, [paused, total]);

  // No real testimonials yet — render nothing rather than fabrications.
  if (!active) return null;

  return (
    <section
      className="reveal-section relative overflow-hidden border-y border-[rgba(255,255,255,0.06)] bg-background px-6 py-[clamp(3.5rem,8vw,7.5rem)] lg:px-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className="ghost-text pointer-events-none start-1/2 top-16 -translate-x-1/2" aria-hidden>
        RESULTS
      </span>

      <div className="relative z-[1] mx-auto max-w-6xl">
        <header className="mb-10 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-accent">{copy.label}</p>
          <h3 className="mt-4 font-display text-[clamp(1.75rem,5vw,3rem)] font-extrabold tracking-[-0.02em] text-white">
            <span className="tj-title-shimmer">{copy.title}</span>
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">{copy.sub}</p>
        </header>

        <div className="relative">
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute start-0 top-1/2 z-[2] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(13,15,18,0.85)] text-muted backdrop-blur-md transition-[border-color,color,box-shadow,transform] duration-200 hover:border-purple-300/40 hover:text-purple-100 hover:shadow-[0_0_18px_rgba(168,85,247,0.18)] md:flex"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute end-0 top-1/2 z-[2] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(13,15,18,0.85)] text-muted backdrop-blur-md transition-[border-color,color,box-shadow,transform] duration-200 hover:border-purple-300/40 hover:text-purple-100 hover:shadow-[0_0_18px_rgba(168,85,247,0.18)] md:flex"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="overflow-hidden md:mx-12">
            <div
              className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{
                width: `${total * 100}%`,
                transform: `translate3d(-${(100 / total) * activeIdx}%, 0, 0)`,
              }}
            >
              {TESTIMONIALS.map((t) => (
                <article
                  key={t.name}
                  className="glass-panel-glow shrink-0 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(13,15,18,0.65)] px-6 py-8 sm:px-10 sm:py-10"
                  style={{ width: `${100 / total}%` }}
                >
                  <div className="flex gap-0.5 text-[#EDE9FE]" aria-hidden>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="mt-5 line-clamp-4 text-[15px] italic leading-[1.7] text-white">{t.quote}</p>
                  <div className="mt-8 flex items-center gap-3 border-t border-[rgba(255,255,255,0.06)] pt-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(168,85,247,0.2)] bg-[rgba(168,85,247,0.08)] text-sm font-bold text-accent">
                      {t.name.slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <span className="mt-1 inline-flex rounded-full border border-[rgba(34,197,94,0.22)] bg-[rgba(34,197,94,0.1)] px-2 py-0.5 text-[11px] font-semibold text-success">
                        {t.tag}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <nav className="mt-8 flex justify-center gap-2" aria-label="Testimonials">
          {TESTIMONIALS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={cn(
                "relative h-2 rounded-full transition-[width,background-color] duration-300 ease-out before:absolute before:left-1/2 before:top-1/2 before:h-6 before:w-6 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
                idx === activeIdx ? "w-6 bg-accent" : "w-2 border border-[rgba(168,85,247,0.35)] bg-transparent hover:bg-[rgba(168,85,247,0.2)]"
              )}
              aria-label={`Slide ${idx + 1}`}
              aria-current={idx === activeIdx}
            />
          ))}
        </nav>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-dim">{copy.disclaimer}</p>
      </div>
    </section>
  );
}
