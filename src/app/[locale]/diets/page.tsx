import type { Metadata } from "next";
import Link from "next/link";

import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { listDiets } from "@/lib/diets";
import type { Locale } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";

const TITLES: Record<Locale, string> = {
  en: "Diets",
  tr: "Diyetler",
  ar: "الأنظمة الغذائية",
  es: "Dietas",
  fr: "Régimes"
};

const SUBTITLES: Record<Locale, string> = {
  en: "Real food, real macros, real lives. Pick a plan that fits the way you actually eat.",
  tr: "Gerçek yemek, gerçek makrolar, gerçek hayatlar. Gerçekten yediğin şekle uyan bir plan seç.",
  ar: "طعام حقيقي، ماكروز حقيقية، حياة حقيقية. اختر خطة تناسب طريقتك في الأكل فعلاً.",
  es: "Comida real, macros reales, vidas reales. Elige un plan que encaje con cómo comes de verdad.",
  fr: "Vraie nourriture, vrais macros, vraies vies. Choisis un plan qui colle à ta vraie façon de manger."
};

const COMING_SOON: Record<Locale, string> = {
  en: "Catalog launches with the v4 content sprint. The first one is below — preview the structure.",
  tr: "Katalog v4 içerik sprintiyle açılıyor. İlki aşağıda — yapıyı önizleyin.",
  ar: "الكتالوج يُفتح مع سبرنت محتوى v4. الأول أدناه — معاينة الهيكل.",
  es: "El catálogo se abre con el sprint de contenido v4. El primero está abajo — preview de la estructura.",
  fr: "Le catalogue s'ouvre avec le sprint de contenu v4. Le premier est ci-dessous — aperçu de la structure."
};

const PRICE_LABEL: Record<Locale, string> = {
  en: "from",
  tr: "fiyat",
  ar: "ابتداءً من",
  es: "desde",
  fr: "à partir de"
};

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = requireLocaleParam(params.locale);
  return {
    title: `${TITLES[locale]} | TJFit`,
    description: SUBTITLES[locale]
  };
}

export default function DietsPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const diets = listDiets();
  return (
    <>
      <AmbientBackground variant="cyan" />
      <div className="relative z-[1] mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
          {TITLES[locale]}
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
          {SUBTITLES[locale]}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">{COMING_SOON[locale]}</p>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {diets.map((diet) => (
            <Link
              key={diet.slug}
              href={`/${locale}/diets/${diet.slug}`}
              className="tj-breathe tj-breathe-diet group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-[#0E0F12] p-5 transition-colors duration-200 hover:border-cyan-300/[0.18]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent/80">
                {diet.category}
              </p>
              <h2 className="mt-3 font-display text-lg font-semibold tracking-tight text-white">
                {diet.goal[locale]}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {diet.who_for[locale]}
              </p>
              <div className="mt-4 flex items-center justify-between text-[11px] text-faint">
                <span>{diet.duration_weeks} weeks</span>
                <span className="font-semibold text-white/80">
                  {PRICE_LABEL[locale]} ${diet.pricing_usd.toFixed(2)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
