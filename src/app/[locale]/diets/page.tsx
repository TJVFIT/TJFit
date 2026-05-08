import type { Metadata } from "next";

import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { DietsCatalogClient, type DietCatalogItem } from "@/components/diets/diets-catalog-client";
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

type FilterCopy = {
  goalLabel: string;
  lengthLabel: string;
  allLabel: string;
  clearLabel: string;
  weeksSuffix: string;
  goalFatLoss: string;
  goalMuscleGain: string;
  goalMaintenance: string;
  length4: string;
  length12: string;
  emptyTitle: string;
  emptyBody: string;
  emptyCta: string;
};

const FILTER_COPY: Record<Locale, FilterCopy> = {
  en: {
    goalLabel: "Goal",
    lengthLabel: "Length",
    allLabel: "All",
    clearLabel: "Clear",
    weeksSuffix: "weeks",
    goalFatLoss: "Fat loss",
    goalMuscleGain: "Muscle gain",
    goalMaintenance: "Maintenance",
    length4: "4 weeks",
    length12: "12 weeks",
    emptyTitle: "No diets match those filters.",
    emptyBody: "Reset the filters to see the full diet catalog.",
    emptyCta: "Reset filters"
  },
  tr: {
    goalLabel: "Hedef",
    lengthLabel: "Süre",
    allLabel: "Tümü",
    clearLabel: "Temizle",
    weeksSuffix: "hafta",
    goalFatLoss: "Yağ yakımı",
    goalMuscleGain: "Kas kazanımı",
    goalMaintenance: "Koruma",
    length4: "4 hafta",
    length12: "12 hafta",
    emptyTitle: "Bu filtrelerle diyet bulunamadı.",
    emptyBody: "Tüm diyet kataloğunu görmek için filtreleri temizle.",
    emptyCta: "Filtreleri sıfırla"
  },
  ar: {
    goalLabel: "الهدف",
    lengthLabel: "المدة",
    allLabel: "الكل",
    clearLabel: "مسح",
    weeksSuffix: "أسابيع",
    goalFatLoss: "خسارة الدهون",
    goalMuscleGain: "زيادة العضلات",
    goalMaintenance: "محافظة",
    length4: "٤ أسابيع",
    length12: "١٢ أسبوعًا",
    emptyTitle: "لا توجد أنظمة تطابق هذه المرشحات.",
    emptyBody: "أعد ضبط المرشحات لمشاهدة الكتالوج كاملًا.",
    emptyCta: "إعادة ضبط المرشحات"
  },
  es: {
    goalLabel: "Objetivo",
    lengthLabel: "Duración",
    allLabel: "Todo",
    clearLabel: "Limpiar",
    weeksSuffix: "semanas",
    goalFatLoss: "Pérdida de grasa",
    goalMuscleGain: "Ganancia muscular",
    goalMaintenance: "Mantenimiento",
    length4: "4 semanas",
    length12: "12 semanas",
    emptyTitle: "Ninguna dieta coincide con esos filtros.",
    emptyBody: "Restablece los filtros para ver todo el catálogo.",
    emptyCta: "Restablecer filtros"
  },
  fr: {
    goalLabel: "Objectif",
    lengthLabel: "Durée",
    allLabel: "Tout",
    clearLabel: "Effacer",
    weeksSuffix: "semaines",
    goalFatLoss: "Perte de gras",
    goalMuscleGain: "Prise de muscle",
    goalMaintenance: "Maintien",
    length4: "4 semaines",
    length12: "12 semaines",
    emptyTitle: "Aucun régime ne correspond à ces filtres.",
    emptyBody: "Réinitialisez les filtres pour voir tout le catalogue.",
    emptyCta: "Réinitialiser"
  }
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
  const filterCopy = FILTER_COPY[locale];
  const diets = listDiets();

  const items: DietCatalogItem[] = diets.map((diet) => ({
    slug: diet.slug,
    category: diet.category,
    durationWeeks: diet.duration_weeks,
    goalLabel: diet.goal[locale],
    whoFor: diet.who_for[locale],
    priceUsd: diet.pricing_usd,
    href: `/${locale}/diets/${diet.slug}`,
    priceLabel: `${PRICE_LABEL[locale]} $${diet.pricing_usd.toFixed(2)}`
  }));

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

        <DietsCatalogClient
          items={items}
          goalLabel={filterCopy.goalLabel}
          lengthLabel={filterCopy.lengthLabel}
          allLabel={filterCopy.allLabel}
          clearLabel={filterCopy.clearLabel}
          weeksSuffix={filterCopy.weeksSuffix}
          emptyTitle={filterCopy.emptyTitle}
          emptyBody={filterCopy.emptyBody}
          emptyCta={filterCopy.emptyCta}
          goalOptions={[
            { value: "fat_loss", label: filterCopy.goalFatLoss },
            { value: "muscle_gain", label: filterCopy.goalMuscleGain },
            { value: "maintenance", label: filterCopy.goalMaintenance }
          ]}
          lengthOptions={[
            { value: "4", label: filterCopy.length4 },
            { value: "12", label: filterCopy.length12 }
          ]}
        />
      </div>
    </>
  );
}
