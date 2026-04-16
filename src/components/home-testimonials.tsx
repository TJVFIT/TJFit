"use client";

import { useEffect, useState } from "react";
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

const COPY: Record<Locale, { title: string; sub: string; disclaimer: string }> = {
  en: {
    title: "Proof, not hype.",
    sub: "Members describe outcomes in their own words — no stock photography, no fake star rows.",
    disclaimer: "Results vary. Individual outcomes depend on consistency, diet, and starting fitness level.",
  },
  tr: {
    title: "Gerçek İnsanlar. Gerçek Sonuçlar.",
    sub: "TJFit ile dönüşen binlerce kişiye katılın.",
    disclaimer: "Sonuçlar kişiden kişiye değişir. Sonuç; tutarlılık, beslenme ve başlangıç seviyesine bağlıdır.",
  },
  ar: {
    title: "أشخاص حقيقيون. نتائج حقيقية.",
    sub: "انضم إلى الآلاف الذين يغيرون أجسامهم مع TJFit.",
    disclaimer: "النتائج تختلف. تعتمد النتيجة على الالتزام والتغذية ومستوى البداية.",
  },
  es: {
    title: "Personas reales. Resultados reales.",
    sub: "Unete a miles que ya se transforman con TJFit.",
    disclaimer: "Los resultados varian. Dependen de constancia, dieta y nivel inicial.",
  },
  fr: {
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

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActiveIdx((i) => (i + 1) % total);
    }, 5200);
    return () => window.clearInterval(id);
  }, [paused, total]);

  return (
    <section
      className="border-y border-[#1E2028] bg-[#0A0A0B] px-6 py-24 lg:px-12 lg:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-12 lg:gap-16">
        <header className="lg:col-span-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#52525B]">Members</p>
          <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{copy.title}</h3>
          <p className="mt-4 text-sm leading-relaxed text-[#A1A1AA]">{copy.sub}</p>

          <nav className="mt-10 flex flex-col gap-1 border-t border-[#1E2028] pt-8" aria-label="Testimonials">
            {TESTIMONIALS.map((t, idx) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={cn(
                  "flex w-full items-baseline justify-between gap-3 border-b border-[#1E2028] py-3 text-left text-[13px] transition-colors",
                  idx === activeIdx ? "text-white" : "text-[#52525B] hover:text-[#A1A1AA]"
                )}
              >
                <span className="font-medium">{t.name}</span>
                <span className="shrink-0 font-mono text-[10px] text-[#52525B] tabular-nums">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </button>
            ))}
          </nav>
        </header>

        <div className="relative lg:col-span-8">
          <article
            key={activeIdx}
            className="tj-testimonial-swap border border-[#1E2028] bg-[#111215] p-8 sm:p-10 lg:p-12"
          >
            <p className="font-display text-2xl font-normal leading-snug tracking-tight text-white sm:text-[1.65rem] lg:text-[1.85rem] lg:leading-[1.35]">
              {active.quote}
            </p>
            <div className="mt-10 border-t border-[#1E2028] pt-8">
              <p className="text-sm font-medium text-white">{active.name}</p>
              <p className="mt-1 text-xs text-[#71717A]">{active.tag}</p>
            </div>
          </article>
          <p className="mt-6 text-[11px] leading-relaxed text-[#52525B]">{copy.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
