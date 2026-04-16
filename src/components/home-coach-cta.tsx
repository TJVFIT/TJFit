"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n";

const COPY: Record<
  Locale,
  {
    tag: string;
    title: string;
    sub: string;
    points: string[];
    cta: string;
  }
> = {
  en: {
    tag: "FOR FITNESS PROFESSIONALS",
    title: "Monetize Your Expertise. Reach the World.",
    sub: "Publish your programs, manage clients, and earn from a global audience. Available in 5 languages.",
    points: [
      "Sell programs to thousands of members",
      "Chat directly with your clients in-platform",
      "Get discovered by Turkish, Arabic, English, Spanish, and French speakers",
    ],
    cta: "Apply to Become a Coach →",
  },
  tr: {
    tag: "FITNESS PROFESYONELLERI ICIN",
    title: "Uzmanligini Gelire Donustur. Dunyaya Ulas.",
    sub: "Programlarini yayinla, ogrencilerini yonet, global kitleye sat. 5 dil destegi.",
    points: [
      "Programlarini binlerce uyeye sat",
      "Ogrencilerinle platform icinde direkt mesajlas",
      "Turkce, Arapca, Ingilizce, Ispanyolca ve Fransizca kullanicilar seni bulsun",
    ],
    cta: "Koc Olmak Icin Basvur →",
  },
  ar: {
    tag: "لمحترفي اللياقة",
    title: "حوّل خبرتك إلى دخل. واصل العالم.",
    sub: "انشر برامجك، أدر عملاءك، واربح من جمهور عالمي. متاح بـ 5 لغات.",
    points: [
      "بع برامجك لآلاف الأعضاء",
      "تواصل مباشرة مع عملائك داخل المنصة",
      "اكتسب ظهوراً لدى المتحدثين بالعربية والتركية والإنجليزية والإسبانية والفرنسية",
    ],
    cta: "قدّم لتصبح مدرباً →",
  },
  es: {
    tag: "PARA PROFESIONALES FITNESS",
    title: "Monetiza tu experiencia. Llega al mundo.",
    sub: "Publica tus programas, gestiona clientes y gana con una audiencia global. Disponible en 5 idiomas.",
    points: [
      "Vende programas a miles de miembros",
      "Chatea directo con tus clientes en la plataforma",
      "Hazte visible para hablantes de turco, arabe, ingles, espanol y frances",
    ],
    cta: "Postular como Coach →",
  },
  fr: {
    tag: "POUR LES PROFESSIONNELS DU FITNESS",
    title: "Monetisez votre expertise. Touchez le monde.",
    sub: "Publiez vos programmes, gerez vos clients et gagnez avec une audience mondiale. Disponible en 5 langues.",
    points: [
      "Vendez vos programmes a des milliers de membres",
      "Discutez directement avec vos clients sur la plateforme",
      "Soyez visible en turc, arabe, anglais, espagnol et francais",
    ],
    cta: "Postuler comme Coach →",
  },
};

export function HomeCoachCta({ locale }: { locale: Locale }) {
  const copy = COPY[locale] ?? COPY.en;
  return (
    <section className="border-y border-[#1E2028] bg-[#0A0A0B] px-6 py-24 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-stretch lg:gap-16">
          <div className="lg:col-span-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#52525B]">{copy.tag}</p>
            <h3 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:max-w-[20ch]">
              {copy.title}
            </h3>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#A1A1AA]">{copy.sub}</p>
            <ul className="mt-10 space-y-4 border-l border-[#1E2028] ps-6">
              {copy.points.map((point) => (
                <li key={point} className="text-sm leading-relaxed text-[#D4D4D8]">
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href={`/${locale}/become-a-coach`}
              className="mt-10 inline-flex min-h-[50px] items-center justify-center rounded-full bg-gradient-to-r from-[#22D3EE] to-[#0EA5E9] px-8 text-sm font-semibold text-[#0A0A0B] transition-opacity hover:opacity-90"
            >
              {copy.cta}
            </Link>
          </div>

          <div className="relative min-h-[14rem] overflow-hidden rounded-sm border border-[#1E2028] bg-[#111215] lg:col-span-5">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(34,211,238,0.12) 0%, transparent 42%), linear-gradient(315deg, rgba(167,139,250,0.1) 0%, transparent 48%)",
              }}
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-8 border border-white/[0.06]" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
