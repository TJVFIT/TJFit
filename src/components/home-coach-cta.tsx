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
      "Sell programs to a growing global audience",
      "Available in 10 member languages",
      "You set the price — we handle payments",
    ],
    cta: "Apply to Become a Coach →",
    mockTitle: "Your performance",
    mockStudents: "Students",
    mockRevenue: "Revenue",
    mockRating: "Rating",
  },
  tr: {
    tag: "FITNESS PROFESYONELLERİ İÇİN",
    title: "Uzmanlığını Gelire Dönüştür.",
    sub: "Program yayınla. Öğrenci çalıştır. Global kazan.",
    points: [
      "Programlarını büyüyen global bir kitleye sat",
      "İngilizce, Türkçe, Arapça, İspanyolca ve Fransızca",
      "Fiyatı sen belirle — ödemeleri biz yönetelim",
    ],
    cta: "Koç Olmak İçin Başvur →",
    mockTitle: "Performansın",
    mockStudents: "Öğrenci",
    mockRevenue: "Gelir",
    mockRating: "Puan",
  },
  ar: {
    tag: "لمحترفي اللياقة",
    title: "حوّل خبرتك إلى دخل.",
    sub: "انشر البرامج. درّب العملاء. اربح عالمياً.",
    points: [
      "بع برامجك لجمهور عالمي متنامٍ",
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
      "Vende programas a una audiencia global en crecimiento",
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
      "Vendez vos programmes a une audience mondiale en croissance",
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
    <section className="reveal-section relative overflow-hidden border-y border-[rgba(255,255,255,0.06)] bg-background px-6 py-[clamp(3.5rem,8vw,7rem)] lg:px-12">
      <span className="ghost-text pointer-events-none end-0 top-10 max-md:opacity-[0.02] md:end-8" aria-hidden>
        COACHES
      </span>

      <div className="relative z-[1] mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-accent">{copy.tag}</p>
            <h3 className="mt-4 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold tracking-[-0.02em] text-white">
              <span className="tj-title-shimmer">{copy.title}</span>
            </h3>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{copy.sub}</p>
            <ul className="mt-10 space-y-4">
              {copy.points.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-relaxed text-bright">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[rgba(168,85,247,0.25)] bg-[rgba(168,85,247,0.08)] text-accent">
                    <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href={`/${locale}/become-a-coach`}
              className="tj-cta-sheen mt-10 inline-flex min-h-[50px] items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.14)] px-8 text-sm font-semibold text-white transition-[border-color,color,background-color,box-shadow,transform] duration-200 hover:border-[rgba(168,85,247,0.4)] hover:bg-[rgba(168,85,247,0.04)] hover:text-purple-50 hover:shadow-[0_0_22px_rgba(168,85,247,0.16)] hover:-translate-y-px"
            >
              {copy.cta}
            </Link>
          </div>

          <div className="relative flex justify-center lg:col-span-5">
            <div
              className="glass-panel relative hidden w-full max-w-[280px] rotate-[-2deg] rounded-2xl border border-[rgba(255,255,255,0.06)] p-5 shadow-[0_0_60px_rgba(168,85,247,0.08)] lg:block"
              aria-hidden
            >
              <p className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-muted">{copy.mockTitle}</p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-purple-300/12 bg-[rgba(17,18,21,0.6)] px-2 py-3 shadow-[inset_0_0_18px_-8px_rgba(168,85,247,0.18)]">
                  <p className="font-display text-lg font-bold tabular-nums text-white">142</p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-dim">{copy.mockStudents}</p>
                </div>
                <div className="rounded-lg border border-purple-300/12 bg-[rgba(17,18,21,0.6)] px-2 py-3 shadow-[inset_0_0_18px_-8px_rgba(168,85,247,0.18)]">
                  <p className="font-display text-lg font-bold tabular-nums text-accent">€2,840</p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-dim">{copy.mockRevenue}</p>
                </div>
                <div className="rounded-lg border border-purple-300/12 bg-[rgba(17,18,21,0.6)] px-2 py-3 shadow-[inset_0_0_18px_-8px_rgba(168,85,247,0.18)]">
                  <p className="text-lg font-bold text-purple-300">★ 4.9</p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-dim">{copy.mockRating}</p>
                </div>
              </div>
              <div className="mt-6 flex h-24 items-end justify-center gap-2 border-t border-[rgba(255,255,255,0.04)] pt-5">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="tj-mock-bar w-5 rounded-t-sm bg-gradient-to-t from-[rgba(168,85,247,0.15)] to-[rgba(168,85,247,0.55)]"
                    style={{ height: `${h}px`, animationDelay: `${i * 70}ms` }}
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
