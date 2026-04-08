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
      "Get discovered by Turkish, Arabic, English, Spanish, and French speakers"
    ],
    cta: "Apply to Become a Coach →"
  },
  tr: {
    tag: "FITNESS PROFESYONELLERI ICIN",
    title: "Uzmanligini Gelire Donustur. Dunyaya Ulas.",
    sub: "Programlarini yayinla, ogrencilerini yonet, global kitleye sat. 5 dil destegi.",
    points: [
      "Programlarini binlerce uyeye sat",
      "Ogrencilerinle platform icinde direkt mesajlas",
      "Turkce, Arapca, Ingilizce, Ispanyolca ve Fransizca kullanicilar seni bulsun"
    ],
    cta: "Koc Olmak Icin Basvur →"
  },
  ar: {
    tag: "لمحترفي اللياقة",
    title: "حوّل خبرتك إلى دخل. واصل العالم.",
    sub: "انشر برامجك، أدر عملاءك، واربح من جمهور عالمي. متاح بـ 5 لغات.",
    points: [
      "بع برامجك لآلاف الأعضاء",
      "تواصل مباشرة مع عملائك داخل المنصة",
      "اكتسب ظهوراً لدى المتحدثين بالعربية والتركية والإنجليزية والإسبانية والفرنسية"
    ],
    cta: "قدّم لتصبح مدرباً →"
  },
  es: {
    tag: "PARA PROFESIONALES FITNESS",
    title: "Monetiza tu experiencia. Llega al mundo.",
    sub: "Publica tus programas, gestiona clientes y gana con una audiencia global. Disponible en 5 idiomas.",
    points: [
      "Vende programas a miles de miembros",
      "Chatea directo con tus clientes en la plataforma",
      "Hazte visible para hablantes de turco, arabe, ingles, espanol y frances"
    ],
    cta: "Postular como Coach →"
  },
  fr: {
    tag: "POUR LES PROFESSIONNELS DU FITNESS",
    title: "Monetisez votre expertise. Touchez le monde.",
    sub: "Publiez vos programmes, gerez vos clients et gagnez avec une audience mondiale. Disponible en 5 langues.",
    points: [
      "Vendez vos programmes a des milliers de membres",
      "Discutez directement avec vos clients sur la plateforme",
      "Soyez visible en turc, arabe, anglais, espagnol et francais"
    ],
    cta: "Postuler comme Coach →"
  }
};

export function HomeCoachCta({ locale }: { locale: Locale }) {
  const copy = COPY[locale] ?? COPY.en;
  return (
    <section className="border-y border-[#1E2028] bg-[linear-gradient(180deg,#09090B_0%,#10131A_100%)] px-6 py-16 lg:px-12 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#22D3EE]">{copy.tag}</p>
          <h3 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">{copy.title}</h3>
          <p className="mt-3 max-w-2xl text-sm text-[#A1A1AA] sm:text-base">{copy.sub}</p>
          <ul className="mt-6 space-y-2 text-sm text-zinc-200">
            {copy.points.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span className="mt-0.5 text-[#22D3EE]">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <Link
            href={`/${locale}/become-a-coach`}
            className="mt-6 inline-flex min-h-[46px] items-center justify-center rounded-full border border-cyan-400/35 px-6 text-sm font-semibold text-cyan-300 transition-colors hover:bg-cyan-400/10"
          >
            {copy.cta}
          </Link>
        </div>
        <div className="rounded-2xl border border-[#1E2028] bg-[#111215] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[#52525B]">Coach dashboard preview</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#1E2028] bg-[#0E1015] p-3">
              <p className="text-[11px] text-[#A1A1AA]">Your Programs</p>
              <p className="mt-1 text-xl font-bold text-white">3</p>
            </div>
            <div className="rounded-xl border border-[#1E2028] bg-[#0E1015] p-3">
              <p className="text-[11px] text-[#A1A1AA]">Students</p>
              <p className="mt-1 text-xl font-bold text-white">142</p>
            </div>
            <div className="rounded-xl border border-[#1E2028] bg-[#0E1015] p-3">
              <p className="text-[11px] text-[#A1A1AA]">Earnings</p>
              <p className="mt-1 text-xl font-bold text-white">€2,840</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-[#1E2028] bg-[#0E1015] p-3">
            <div className="h-2 w-full rounded-full bg-white/5">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#0EA5E9]" />
            </div>
            <p className="mt-2 text-xs text-[#A1A1AA]">Client retention trend this month</p>
          </div>
        </div>
      </div>
    </section>
  );
}
