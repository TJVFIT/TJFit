import type { Locale } from "@/lib/i18n";

export type EarlyAccessPopupCopy = {
  headline: string;
  body: string;
  cta: string;
  secondaryCta: string;
  closeLabel: string;
};

const copy: Record<Locale, EarlyAccessPopupCopy> = {
  en: {
    headline: "Start your fitness journey",
    body: "Join early access for member-only perks, free program drops, and first access when TJAI coaching goes live.",
    cta: "Join early access",
    secondaryCta: "Browse programs",
    closeLabel: "Close"
  },
  tr: {
    headline: "Fitness yolculuğuna başla",
    body: "Üyelere özel ayrıcalıklar, ücretsiz program duyuruları ve TJAI koçluğu yayına çıktığında ilk sıraya geçmek için erken erişime katıl.",
    cta: "Erken erişime katıl",
    secondaryCta: "Programlara göz at",
    closeLabel: "Kapat"
  },
  ar: {
    headline: "ابدأ رحلتك الرياضية",
    body: "انضم للوصول المبكر لمزايا حصرية للأعضاء، وبرامج مجانية قادمة، وكن أول من يستفيد عند إطلاق TJAI.",
    cta: "انضم للوصول المبكر",
    secondaryCta: "تصفح البرامج",
    closeLabel: "إغلاق"
  },
  es: {
    headline: "Comienza tu viaje fitness",
    body: "Únete al acceso anticipado: ventajas para miembros, programas gratuitos y prioridad cuando lancemos TJAI.",
    cta: "Unirme al acceso anticipado",
    secondaryCta: "Ver programas",
    closeLabel: "Cerrar"
  },
  fr: {
    headline: "Commencez votre parcours fitness",
    body: "Rejoignez l’accès anticipé : avantages membres, programmes gratuits à venir, et priorité au lancement de TJAI.",
    cta: "Rejoindre l’accès anticipé",
    secondaryCta: "Voir les programmes",
    closeLabel: "Fermer"
  }
};

export function getEarlyAccessPopupCopy(locale: Locale): EarlyAccessPopupCopy {
  return copy[locale] ?? copy.en;
}
