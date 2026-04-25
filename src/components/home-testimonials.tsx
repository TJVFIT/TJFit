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

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I've tried dozens of fitness apps. TJAI built me a plan that actually fits my schedule and my kitchen. Lost 8kg in 12 weeks and I've kept it off.",
    name: "Ahmed K.",
    tag: "Lost 8kg · Fat Loss Program",
  },
  {
    quote:
      "The Turkish support is incredible. My coach responds in my language and actually understands my culture. I can train during Ramadan with a modified plan.",
    name: "Meryem Y.",
    tag: "Gym Muscle Builder · Istanbul",
  },
  {
    quote:
      "TJAI is the most accurate thing I've used. It calculated my macros, built my meal plan, and the results speak for themselves. Down 12kg, strongest I've ever been.",
    name: "Omar S.",
    tag: "Lost 12kg · Dubai",
  },
  {
    quote:
      "I'm 58 and had knee surgery. The rehab programs here are safe, progressive, and I actually look forward to training now. Something I never expected.",
    name: "Patricia M.",
    tag: "Rehabilitation Program · Madrid",
  },
  {
    quote:
      "I bought the home program skeptical it would work. 12 weeks later, my friends are asking me what gym I go to. I tell them I train in my living room with TJFit.",
    name: "James L.",
    tag: "Home Fat Burn · London",
  },
];

const COPY: Record<Locale, { label: string; title: string; sub: string; disclaimer: string }> = {
  en: {
    label: "Real transformations",
    title: "Real People. Real Results.",
    sub: "Members describe outcomes in their own words — no stock photography, no fake star rows.",
    disclaimer: "Results vary. Individual outcomes depend on consistency, diet, and starting fitness level.",
  },
  tr: {
    label: "Gerçek dönüşümler",
    title: "Gerçek İnsanlar. Gerçek Sonuçlar.",
    sub: "TJFit ile dönüşen binlerce kişiye katılın.",
    disclaimer: "Sonuçlar kişiden kişiye değişir. Sonuç; tutarlılık, beslenme ve başlangıç seviyesine bağlıdır.",
  },
  ar: {
    label: "تحولات حقيقية",
    title: "أشخاص حقيقيون. نتائج حقيقية.",
    sub: "انضم إلى الآلاف الذين يغيرون أجسامهم مع TJFit.",
    disclaimer: "النتائج تختلف. تعتمد النتيجة على الالتزام والتغذية ومستوى البداية.",
  },
  es: {
    label: "Transformaciones reales",
    title: "Personas reales. Resultados reales.",
    sub: "Unete a miles que ya se transforman con TJFit.",
    disclaimer: "Los resultados varian. Dependen de constancia, dieta y nivel inicial.",
  },
  fr: {
    label: "Transformations reelles",
    title: "De vraies personnes. De vrais resultats.",
    sub: "Rejoignez des milliers de personnes qui se transforment avec TJFit.",
    disclaimer: "Les resultats varient selon la regularite, l'alimentation et le niveau initial.",
  },
};

export function HomeTestimonials({ locale }: { locale: Locale }) {
  const copy = COPY[locale] ?? COPY.en;
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = TESTIMONIALS.length;
  const active = TESTIMONIALS[activeIdx]!;

  const go = useCallback(
    (dir: -1 | 1) => {
      setActiveIdx((i) => (i + dir + total) % total);
    },
    [total]
  );

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActiveIdx((i) => (i + 1) % total);
    }, 5000);
    return () => window.clearInterval(id);
  }, [paused, total]);

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
            {copy.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">{copy.sub}</p>
        </header>

        <div className="relative">
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute start-0 top-1/2 z-[2] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(13,15,18,0.85)] text-muted backdrop-blur-md transition-[border-color,color,transform] duration-200 hover:border-[rgba(34,211,238,0.35)] hover:text-accent md:flex"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute end-0 top-1/2 z-[2] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(13,15,18,0.85)] text-muted backdrop-blur-md transition-[border-color,color,transform] duration-200 hover:border-[rgba(34,211,238,0.35)] hover:text-accent md:flex"
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
                  <div className="flex gap-0.5 text-[#A5F3FC]" aria-hidden>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="mt-5 line-clamp-4 text-[15px] italic leading-[1.7] text-white">{t.quote}</p>
                  <div className="mt-8 flex items-center gap-3 border-t border-[rgba(255,255,255,0.06)] pt-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(34,211,238,0.2)] bg-[rgba(34,211,238,0.08)] text-sm font-bold text-accent">
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
                "h-2 rounded-full transition-[width,background-color] duration-300 ease-out",
                idx === activeIdx ? "w-6 bg-accent" : "w-2 border border-[rgba(34,211,238,0.35)] bg-transparent hover:bg-[rgba(34,211,238,0.2)]"
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
