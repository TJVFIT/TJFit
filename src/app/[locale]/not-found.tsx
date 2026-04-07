"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ParticleField } from "@/components/particle-field";
import { isLocale, type Locale } from "@/lib/i18n";

const COPY: Record<Locale, { heading: string; sub: string; home: string; programs: string }> = {
  en: {
    heading: "Page Not Found",
    sub: "This page may have moved or been deleted.",
    home: "Go Home",
    programs: "Browse Programs"
  },
  tr: {
    heading: "Sayfa Bulunamadi",
    sub: "Bu sayfa tasinmis veya silinmis olabilir.",
    home: "Ana Sayfaya Don",
    programs: "Programlari Kesfet"
  },
  ar: {
    heading: "الصفحة غير موجودة",
    sub: "قد تكون هذه الصفحة قد نُقلت او حُذفت.",
    home: "العودة للرئيسية",
    programs: "تصفح البرامج"
  },
  es: {
    heading: "Pagina no encontrada",
    sub: "Esta pagina puede haberse movido o eliminado.",
    home: "Ir al inicio",
    programs: "Ver programas"
  },
  fr: {
    heading: "Page introuvable",
    sub: "Cette page a peut-etre ete deplacee ou supprimee.",
    home: "Aller a l'accueil",
    programs: "Parcourir les programmes"
  }
};

export default function LocaleNotFound() {
  const pathname = usePathname() || "/en";
  const first = pathname.split("/").filter(Boolean)[0] ?? "en";
  const locale = (isLocale(first) ? first : "en") as Locale;
  const c = COPY[locale] ?? COPY.en;

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[#09090B] px-6 text-center">
      <ParticleField className="pointer-events-none absolute inset-0 opacity-20" />
      <LogoMark />
      <p
        className="animate-[tj-fade-up_380ms_ease-out_forwards] text-[clamp(6rem,20vw,120px)] font-extrabold leading-none text-[#22D3EE]"
        style={{ textShadow: "0 0 40px rgba(34,211,238,0.45)", animationDelay: "100ms", opacity: 0 }}
      >
        404
      </p>
      <h1 className="mt-4 animate-[tj-fade-up_380ms_ease-out_forwards] text-3xl font-bold text-white" style={{ animationDelay: "200ms", opacity: 0 }}>
        {c.heading}
      </h1>
      <p className="mt-2 animate-[tj-fade-up_380ms_ease-out_forwards] text-sm text-[#A1A1AA] sm:text-base" style={{ animationDelay: "300ms", opacity: 0 }}>
        {c.sub}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`/${locale}`}
          className="inline-flex min-h-[44px] animate-[tj-fade-up_380ms_ease-out_forwards] items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-6 py-2.5 text-sm font-semibold text-cyan-200 transition-colors hover:border-cyan-400/50 hover:text-white"
          style={{ animationDelay: "400ms", opacity: 0 }}
        >
          {c.home}
        </Link>
        <Link
          href={`/${locale}/programs`}
          className="inline-flex min-h-[44px] animate-[tj-fade-up_380ms_ease-out_forwards] items-center justify-center rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
          style={{ animationDelay: "450ms", opacity: 0 }}
        >
          {c.programs}
        </Link>
      </div>
    </section>
  );
}

function LogoMark() {
  return (
    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
      <span className="text-xl font-bold text-white">TJ</span>
    </div>
  );
}
