import { resolveCopyLocale } from "@/lib/i18n";

/**
 * Localized copy for the homepage body strips that `immersive-home` renders
 * with hardcoded English: the TJAI overview section, the editorial rail, and
 * the stats band. Kept as a small dedicated module (same pattern as
 * `bundles-copy.ts`) rather than threaded through the larger
 * `home-luxury-copy.ts`.
 */

export type HomeSectionsCopy = {
  tjai: { heading: string; body: string; cta: string };
  /** Five short phrases shown in the editorial rail, joined with separators. */
  editorialRail: string[];
  stats: { bundles: string; weeks: string; languages: string };
};

const COPY: Record<"en" | "tr" | "ar" | "es" | "fr", HomeSectionsCopy> = {
  en: {
    tjai: {
      heading: "Your AI coach, built for your body.",
      body: "Answer 25 questions — TJAI generates a full 12-week training plan, diet, and supplement stack tuned to your goals, equipment and time. Preview it free; unlock the full plan when you're ready.",
      cta: "Try TJAI"
    },
    editorialRail: [
      "12-week periodization",
      "Macro-aware meals",
      "TJAI · GPT-4o",
      "Coach marketplace",
      "10 languages"
    ],
    stats: { bundles: "Free Bundles", weeks: "Weeks Per Plan", languages: "Languages" }
  },
  tr: {
    tjai: {
      heading: "Bedenine göre kurulmuş yapay zeka koçun.",
      body: "25 soru yanıtla — TJAI; hedeflerine, ekipmanına ve zamanına göre ayarlanmış 12 haftalık eksiksiz bir antrenman planı, diyet ve takviye paketi üretir. Ücretsiz önizle; hazır olduğunda tüm planı aç.",
      cta: "TJAI'yi dene"
    },
    editorialRail: [
      "12 haftalık periyotlama",
      "Makro odaklı öğünler",
      "TJAI · GPT-4o",
      "Koç pazarı",
      "10 dil"
    ],
    stats: { bundles: "Ücretsiz Paket", weeks: "Plan Başına Hafta", languages: "Dil" }
  },
  ar: {
    tjai: {
      heading: "مدرّبك بالذكاء الاصطناعي، مبني على جسدك.",
      body: "أجب عن 25 سؤالاً — يولّد TJAI خطة تدريب كاملة لمدة 12 أسبوعاً ونظاماً غذائياً وحزمة مكمّلات مضبوطة على أهدافك ومعداتك ووقتك. عاينها مجاناً؛ وافتح الخطة كاملة عندما تكون مستعداً.",
      cta: "جرّب TJAI"
    },
    editorialRail: [
      "تخطيط دوري لـ12 أسبوعاً",
      "وجبات واعية بالماكروز",
      "TJAI · GPT-4o",
      "سوق المدربين",
      "10 لغات"
    ],
    stats: { bundles: "حزم مجانية", weeks: "أسابيع لكل خطة", languages: "لغات" }
  },
  es: {
    tjai: {
      heading: "Tu coach con IA, construido para tu cuerpo.",
      body: "Responde 25 preguntas — TJAI genera un plan de entrenamiento completo de 12 semanas, dieta y stack de suplementos ajustado a tus objetivos, equipo y tiempo. Previsualízalo gratis; desbloquea el plan completo cuando estés listo.",
      cta: "Prueba TJAI"
    },
    editorialRail: [
      "Periodización de 12 semanas",
      "Comidas conscientes de macros",
      "TJAI · GPT-4o",
      "Mercado de coaches",
      "10 idiomas"
    ],
    stats: { bundles: "Paquetes Gratis", weeks: "Semanas Por Plan", languages: "Idiomas" }
  },
  fr: {
    tjai: {
      heading: "Ton coach IA, conçu pour ton corps.",
      body: "Réponds à 25 questions — TJAI génère un plan d'entraînement complet de 12 semaines, une diète et un stack de compléments ajustés à tes objectifs, ton équipement et ton temps. Aperçu gratuit ; débloque le plan complet quand tu es prêt.",
      cta: "Essayer TJAI"
    },
    editorialRail: [
      "Périodisation sur 12 semaines",
      "Repas pensés macros",
      "TJAI · GPT-4o",
      "Place de marché coachs",
      "10 langues"
    ],
    stats: { bundles: "Packs Gratuits", weeks: "Semaines Par Plan", languages: "Langues" }
  }
};

export function getHomeSectionsCopy(locale: string): HomeSectionsCopy {
  return COPY[resolveCopyLocale(locale)];
}
