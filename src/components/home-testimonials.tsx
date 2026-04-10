"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";

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
    tag: "Lost 8kg · Fat Loss Program"
  },
  {
    quote:
      "The Turkish support is incredible. My coach responds in my language and actually understands my culture. I can train during Ramadan with a modified plan.",
    name: "Meryem Y.",
    tag: "Gym Muscle Builder · Istanbul"
  },
  {
    quote:
      "TJAI is the most accurate thing I've used. It calculated my macros, built my meal plan, and the results speak for themselves. Down 12kg, strongest I've ever been.",
    name: "Omar S.",
    tag: "Lost 12kg · Dubai"
  },
  {
    quote:
      "I'm 58 and had knee surgery. The rehab programs here are safe, progressive, and I actually look forward to training now. Something I never expected.",
    name: "Patricia M.",
    tag: "Rehabilitation Program · Madrid"
  },
  {
    quote:
      "I bought the home program skeptical it would work. 12 weeks later, my friends are asking me what gym I go to. I tell them I train in my living room with TJFit.",
    name: "James L.",
    tag: "Home Fat Burn · London"
  }
];

const COPY: Record<Locale, { title: string; sub: string; disclaimer: string }> = {
  en: {
    title: "Real People. Real Results.",
    sub: "Join thousands already transforming with TJFit.",
    disclaimer: "Results vary. Individual outcomes depend on consistency, diet, and starting fitness level."
  },
  tr: {
    title: "Gerçek İnsanlar. Gerçek Sonuçlar.",
    sub: "TJFit ile dönüşen binlerce kişiye katılın.",
    disclaimer: "Sonuçlar kişiden kişiye değişir. Sonuç; tutarlılık, beslenme ve başlangıç seviyesine bağlıdır."
  },
  ar: {
    title: "أشخاص حقيقيون. نتائج حقيقية.",
    sub: "انضم إلى الآلاف الذين يغيرون أجسامهم مع TJFit.",
    disclaimer: "النتائج تختلف. تعتمد النتيجة على الالتزام والتغذية ومستوى البداية."
  },
  es: {
    title: "Personas reales. Resultados reales.",
    sub: "Unete a miles que ya se transforman con TJFit.",
    disclaimer: "Los resultados varian. Dependen de constancia, dieta y nivel inicial."
  },
  fr: {
    title: "De vraies personnes. De vrais resultats.",
    sub: "Rejoignez des milliers de personnes qui se transforment avec TJFit.",
    disclaimer: "Les resultats varient selon la regularite, l'alimentation et le niveau initial."
  }
};

export function HomeTestimonials({ locale }: { locale: Locale }) {
  const copy = COPY[locale] ?? COPY.en;
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    carouselRef.current?.scrollBy({ left: dir === "right" ? 316 : -316, behavior: "smooth" });
  };

  return (
    <section className="border-y border-[#1E2028] bg-[#09090B] px-6 py-16 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-3xl font-extrabold text-white sm:text-4xl">{copy.title}</h3>
            <p className="mt-2 text-sm text-[#A1A1AA] sm:text-base">{copy.sub}</p>
          </div>
          {/* Desktop arrow navigation */}
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Previous testimonial"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1E2028] bg-[#111215] text-zinc-400 transition hover:border-[rgba(34,211,238,0.3)] hover:text-[#22D3EE]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Next testimonial"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1E2028] bg-[#111215] text-zinc-400 transition hover:border-[rgba(34,211,238,0.3)] hover:text-[#22D3EE]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={carouselRef}
          className="testimonials-carousel mt-8 pb-2"
        >
          {TESTIMONIALS.map((item) => (
            <article
              key={item.name}
              className="w-[300px] min-w-[300px] rounded-2xl border border-[#1E2028] bg-[#111215] p-6 sm:w-[340px] sm:min-w-[340px]"
            >
              <p className="text-[#FBBF24]">★★★★★</p>
              <p className="mt-3 text-[15px] italic leading-[1.6] text-white">{item.quote}</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#1E2028] bg-[#0D0F14] text-sm font-semibold text-[#22D3EE]">
                  {item.name.slice(0, 1)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-[#A1A1AA]">{item.tag}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 text-xs text-[#52525B]">{copy.disclaimer}</p>
      </div>
    </section>
  );
}
