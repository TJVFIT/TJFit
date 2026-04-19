"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import type { Locale } from "@/lib/i18n";

const COPY: Record<
  Locale,
  {
    tag: string;
    title: string;
    sub: string;
    points: string[];
    cta: string;
    mockTitle: string;
    mockStudents: string;
    mockRevenue: string;
    mockRating: string;
  }
> = {
  en: {
    tag: "FOR FITNESS PROFESSIONALS",
    title: "Monetize Your Expertise.",
    sub: "Publish programs. Coach clients. Earn globally.",
    points: [
      "Sell programs to thousands of members",
      "Available in English, Turkish, Arabic, Spanish, and French",
      "You set the price — we handle payments",
    ],
    cta: "Apply to Become a Coach →",
    mockTitle: "Your performance",
    mockStudents: "Students",
    mockRevenue: "Revenue",
    mockRating: "Rating",
  },
  tr: {
    tag: "FITNESS PROFESYONELLERI ICIN",
    title: "Uzmanligini Gelire Donustur.",
    sub: "Program yayinla. Ogrenci calistir. Global kazan.",
    points: [
      "Programlarini binlerce uyeye sat",
      "Ingilizce, Turkce, Arapca, Ispanyolca ve Fransizca",
      "Fiyati sen belirle — odemeleri biz yonetelim",
    ],
    cta: "Koc Olmak Icin Basvur →",
    mockTitle: "Performansin",
    mockStudents: "Ogrenci",
    mockRevenue: "Gelir",
    mockRating: "Puan",
  },
  ar: {
    tag: "لمحترفي اللياقة",
    title: "حوّل خبرتك إلى دخل.",
    sub: "انشر البرامج. درّب العملاء. اربح عالمياً.",
    points: [
      "بع برامجك لآلاف الأعضاء",
      "بالإنجليزية والتركية والعربية والإسبانية والفرنسية",
      "أنت تضع السعر — نتولى المدفوعات",
    ],
    cta: "قدّم لتصبح مدرباً →",
    mockTitle: "أداؤك",
    mockStudents: "طلاب",
    mockRevenue: "الإيرادات",
    mockRating: "التقييم",
  },
  es: {
    tag: "PARA PROFESIONALES FITNESS",
    title: "Monetiza tu experiencia.",
    sub: "Publica programas. Entrena clientes. Gana en global.",
    points: [
      "Vende programas a miles de miembros",
      "En ingles, turco, arabe, espanol y frances",
      "Tu pones el precio — nosotros los pagos",
    ],
    cta: "Postular como Coach →",
    mockTitle: "Tu rendimiento",
    mockStudents: "Alumnos",
    mockRevenue: "Ingresos",
    mockRating: "Valoracion",
  },
  fr: {
    tag: "POUR LES PROFESSIONNELS DU FITNESS",
    title: "Monetisez votre expertise.",
    sub: "Publiez des programmes. Coachez. Gagnez mondialement.",
    points: [
      "Vendez vos programmes a des milliers de membres",
      "EN, TR, AR, ES, FR",
      "Vous fixez le prix — nous gerons les paiements",
    ],
    cta: "Postuler comme Coach →",
    mockTitle: "Votre performance",
    mockStudents: "Eleves",
    mockRevenue: "Revenus",
    mockRating: "Note",
  },
};

export function HomeCoachCta({ locale }: { locale: Locale }) {
  const copy = COPY[locale] ?? COPY.en;
  const bars = [36, 58, 42, 72, 48];

  return (
    <section className="reveal-section relative overflow-hidden border-y border-[rgba(255,255,255,0.06)] bg-[#09090B] px-6 py-[clamp(3.5rem,8vw,7rem)] lg:px-12">
      <span className="ghost-text pointer-events-none end-0 top-10 max-md:opacity-[0.02] md:end-8" aria-hidden>
        COACHES
      </span>

      <div className="relative z-[1] mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#22D3EE]">{copy.tag}</p>
            <h3 className="mt-4 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold tracking-[-0.02em] text-white">
              {copy.title}
            </h3>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#A1A1AA]">{copy.sub}</p>
            <ul className="mt-10 space-y-4">
              {copy.points.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-relaxed text-[#D4D4D8]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[rgba(34,211,238,0.25)] bg-[rgba(34,211,238,0.08)] text-[#22D3EE]">
                    <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href={`/${locale}/become-a-coach`}
              className="mt-10 inline-flex min-h-[50px] items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.14)] px-8 text-sm font-semibold text-white transition-[border-color,color,background-color,transform] duration-200 hover:border-[rgba(34,211,238,0.4)] hover:bg-[rgba(34,211,238,0.04)] hover:text-[#22D3EE] hover:-translate-y-px"
            >
              {copy.cta}
            </Link>
          </div>

          <div className="relative flex justify-center lg:col-span-5">
            <div
              className="glass-panel relative hidden w-full max-w-[280px] rotate-[-2deg] rounded-2xl border border-[rgba(255,255,255,0.06)] p-5 shadow-[0_0_60px_rgba(34,211,238,0.08)] lg:block"
              aria-hidden
            >
              <p className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-[#A1A1AA]">{copy.mockTitle}</p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(17,18,21,0.6)] px-2 py-3">
                  <p className="font-display text-lg font-bold tabular-nums text-white">142</p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[#52525B]">{copy.mockStudents}</p>
                </div>
                <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(17,18,21,0.6)] px-2 py-3">
                  <p className="font-display text-lg font-bold tabular-nums text-[#22D3EE]">€2,840</p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[#52525B]">{copy.mockRevenue}</p>
                </div>
                <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(17,18,21,0.6)] px-2 py-3">
                  <p className="text-lg font-bold text-amber-300">★ 4.9</p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[#52525B]">{copy.mockRating}</p>
                </div>
              </div>
              <div className="mt-6 flex h-24 items-end justify-center gap-2 border-t border-[rgba(255,255,255,0.04)] pt-5">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="w-5 rounded-t-sm bg-gradient-to-t from-[rgba(34,211,238,0.15)] to-[rgba(34,211,238,0.55)]"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
