"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ParticleField } from "@/components/particle-field";
import { isLocale, type Locale } from "@/lib/i18n";

const COPY: Record<
  Locale,
  {
    heading: string;
    sub: string;
    home: string;
    programs: string;
    searchTitle: string;
    searchPlaceholder: string;
    popular: string;
    links: { programs: string; diets: string; ai: string; calculator: string; coaches: string; community: string };
  }
> = {
  en: {
    heading: "This page skipped leg day.",
    sub: "Looks like this URL didn't make it through the warm-up.",
    home: "Back to Home",
    programs: "Browse Programs",
    searchTitle: "Looking for something specific?",
    searchPlaceholder: "Search TJFit...",
    popular: "Popular pages:",
    links: { programs: "Programs", diets: "Diets", ai: "TJAI", calculator: "Calculator", coaches: "Coaches", community: "Community" }
  },
  tr: {
    heading: "Bu sayfa bacak gununu atlamis.",
    sub: "Bu URL isinmayi gecememis gibi gorunuyor.",
    home: "Ana Sayfaya Don",
    programs: "Programlari Kesfet",
    searchTitle: "Belirli bir sey mi ariyorsun?",
    searchPlaceholder: "TJFit'te ara...",
    popular: "Populer sayfalar:",
    links: {
      programs: "Programlar",
      diets: "Diyetler",
      ai: "TJAI",
      calculator: "Hesaplayici",
      coaches: "Koclar",
      community: "Topluluk"
    }
  },
  ar: {
    heading: "هذه الصفحة تخلّت عن يوم الأرجل.",
    sub: "يبدو أن هذا الرابط لم ينجح في الإحماء.",
    home: "العودة للرئيسية",
    programs: "تصفح البرامج",
    searchTitle: "تبحث عن شيء محدد؟",
    searchPlaceholder: "ابحث في TJFit...",
    popular: "صفحات شائعة:",
    links: { programs: "البرامج", diets: "الأنظمة الغذائية", ai: "TJAI", calculator: "الحاسبة", coaches: "المدربون", community: "المجتمع" }
  },
  es: {
    heading: "Esta pagina se salto el dia de piernas.",
    sub: "Parece que esta URL no supero el calentamiento.",
    home: "Ir al inicio",
    programs: "Ver programas",
    searchTitle: "¿Buscas algo en concreto?",
    searchPlaceholder: "Buscar en TJFit...",
    popular: "Paginas populares:",
    links: { programs: "Programas", diets: "Dietas", ai: "TJAI", calculator: "Calculadora", coaches: "Coaches", community: "Comunidad" }
  },
  fr: {
    heading: "Cette page a saute le jour des jambes.",
    sub: "Cette URL n'a visiblement pas passe l'echauffement.",
    home: "Aller a l'accueil",
    programs: "Parcourir les programmes",
    searchTitle: "Vous cherchez quelque chose de precis ?",
    searchPlaceholder: "Rechercher sur TJFit...",
    popular: "Pages populaires :",
    links: { programs: "Programmes", diets: "Regimes", ai: "TJAI", calculator: "Calculateur", coaches: "Coachs", community: "Communaute" }
  }
};

export default function LocaleNotFound() {
  const router = useRouter();
  const pathname = usePathname() || "/en";
  const first = pathname.split("/").filter(Boolean)[0] ?? "en";
  const locale = (isLocale(first) ? first : "en") as Locale;
  const c = COPY[locale] ?? COPY.en;
  const [query, setQuery] = useState("");

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">
      <ParticleField className="pointer-events-none absolute inset-0 opacity-20" />
      <LogoMark />
      <p
        className="animate-[tj-fade-up_380ms_ease-out_forwards] text-[clamp(6rem,20vw,120px)] font-extrabold leading-none text-accent"
        style={{ textShadow: "0 0 40px rgba(34,211,238,0.45)", animationDelay: "100ms", opacity: 0 }}
      >
        404
      </p>
      <h1 className="mt-4 animate-[tj-fade-up_380ms_ease-out_forwards] text-3xl font-bold text-white" style={{ animationDelay: "200ms", opacity: 0 }}>
        {c.heading}
      </h1>
      <p className="mt-2 animate-[tj-fade-up_380ms_ease-out_forwards] text-sm text-muted sm:text-base" style={{ animationDelay: "300ms", opacity: 0 }}>
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
          className="inline-flex min-h-[44px] animate-[tj-fade-up_380ms_ease-out_forwards] items-center justify-center rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-bright transition-colors hover:border-white/25 hover:text-white"
          style={{ animationDelay: "450ms", opacity: 0 }}
        >
          {c.programs}
        </Link>
      </div>
      <div className="mt-8 w-full max-w-xl animate-[tj-fade-up_380ms_ease-out_forwards]" style={{ animationDelay: "500ms", opacity: 0 }}>
        <p className="text-sm text-muted">{c.searchTitle}</p>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const clean = query.trim();
            if (!clean) return;
            router.push(`/${locale}/search?q=${encodeURIComponent(clean)}`);
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={c.searchPlaceholder}
            className="min-h-[44px] w-full rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none ring-cyan-400/30 focus:border-cyan-400/35 focus:ring-2"
          />
          <button className="rounded-full bg-accent px-5 text-sm font-semibold text-[#09090B]">Go</button>
        </form>
      </div>
      <div className="mt-7 animate-[tj-fade-up_380ms_ease-out_forwards]" style={{ animationDelay: "560ms", opacity: 0 }}>
        <p className="text-xs uppercase tracking-[0.14em] text-dim">{c.popular}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-muted">
          <Link href={`/${locale}/programs`} className="hover:text-white">
            {c.links.programs}
          </Link>
          <span>·</span>
          <Link href={`/${locale}/diets`} className="hover:text-white">
            {c.links.diets}
          </Link>
          <span>·</span>
          <Link href={`/${locale}/ai`} className="hover:text-white">
            {c.links.ai}
          </Link>
          <span>·</span>
          <Link href={`/${locale}/calculator`} className="hover:text-white">
            {c.links.calculator}
          </Link>
          <span>·</span>
          <Link href={`/${locale}/coaches`} className="hover:text-white">
            {c.links.coaches}
          </Link>
          <span>·</span>
          <Link href={`/${locale}/community`} className="hover:text-white">
            {c.links.community}
          </Link>
        </div>
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
