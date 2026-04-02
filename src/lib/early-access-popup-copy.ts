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
    headline: "Be first when we unlock the next layer",
    body: "Early list: member perks, program drops, and first access when TJAI coaching ships — one step ahead of the feed.",
    cta: "Join the early list",
    secondaryCta: "Browse programs",
    closeLabel: "Close"
  },
  tr: {
    headline: "Yeni katman açıldığında ilk sıradasın",
    body: "Erken liste: üyelere özel avantajlar, program sürprizleri ve TJAI koçluk yayına girdiğinde öncelik — gürültünün önünde.",
    cta: "Erken listeye yazıl",
    secondaryCta: "Programlara göz at",
    closeLabel: "Kapat"
  },
  ar: {
    headline: "كن أوّل من يستفيد عند الإطلاق التالي",
    body: "قائمة مبكرة: مزايا للأعضاء، برامج جديدة، وأولوية عند إطلاق TJAI — أمام الضجيج.",
    cta: "انضم للقائمة المبكرة",
    secondaryCta: "تصفح البرامج",
    closeLabel: "إغلاق"
  },
  es: {
    headline: "Adelántate al siguiente gran paso",
    body: "Lista early: perks de miembro, programas nuevos y prioridad cuando salga el coaching TJAI — antes que el ruido.",
    cta: "Entrar en la lista early",
    secondaryCta: "Ver programas",
    closeLabel: "Cerrar"
  },
  fr: {
    headline: "Soyez les premiers au prochain palier",
    body: "Liste early : avantages membres, nouveaux programmes et priorité au lancement du coaching TJAI — avant le bruit.",
    cta: "Rejoindre la liste early",
    secondaryCta: "Voir les programmes",
    closeLabel: "Fermer"
  }
};

export function getEarlyAccessPopupCopy(locale: Locale): EarlyAccessPopupCopy {
  return copy[locale] ?? copy.en;
}
