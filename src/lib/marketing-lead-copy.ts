import type { Locale } from "@/lib/i18n";

export type LeadCaptureCopy = {
  emailPlaceholder: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  invalidEmail: string;
  genericError: string;
  privacyNote: string;
  closePanel: string;
};

const copies: Record<Locale, LeadCaptureCopy> = {
  en: {
    emailPlaceholder: "Your email",
    submit: "Get the roadmap",
    submitting: "Sending…",
    successTitle: "You’re on the list",
    successBody: "Roadmap’s on its way. We only send what’s worth opening.",
    invalidEmail: "That email doesn’t look right.",
    genericError: "Something broke on our side. Try again shortly.",
    privacyNote: "No spam. One-click unsubscribe.",
    closePanel: "Close"
  },
  tr: {
    emailPlaceholder: "E-postan",
    submit: "Yol haritasını gönder",
    submitting: "Gönderiliyor…",
    successTitle: "Listeye eklendin",
    successBody: "Yol haritası yolda. Sadece işine yarayan şeyleri göndeririz.",
    invalidEmail: "E-posta adresi geçerli görünmüyor.",
    genericError: "Bizde bir şey takıldı. Az sonra tekrar dene.",
    privacyNote: "Spam yok. Tek tıkla ayrıl.",
    closePanel: "Kapat"
  },
  ar: {
    emailPlaceholder: "بريدك",
    submit: "أرسل الخارطة",
    submitting: "جارٍ الإرسال…",
    successTitle: "أنت على القائمة",
    successBody: "الخارطة في الطريق. نرسل فقط ما يستحق الفتح.",
    invalidEmail: "البريد غير صالح.",
    genericError: "عطل لدينا. أعد المحاولة قريباً.",
    privacyNote: "بلا إزعاج. إلغاء بنقرة.",
    closePanel: "إغلاق"
  },
  es: {
    emailPlaceholder: "Tu correo",
    submit: "Enviar guía",
    submitting: "Enviando…",
    successTitle: "Estás dentro",
    successBody: "La guía va en camino. Solo correos que valen la pena.",
    invalidEmail: "Ese correo no cuadra.",
    genericError: "Fallo nuestro. Prueba otra vez en un momento.",
    privacyNote: "Sin spam. Baja en un clic.",
    closePanel: "Cerrar"
  },
  fr: {
    emailPlaceholder: "Votre e-mail",
    submit: "Recevoir le guide",
    submitting: "Envoi…",
    successTitle: "C’est enregistré",
    successBody: "La feuille de route arrive. On n’envoie que l’essentiel.",
    invalidEmail: "Cet e-mail semble incorrect.",
    genericError: "Souci de notre côté. Réessayez bientôt.",
    privacyNote: "Pas de spam. Désinscription en un clic.",
    closePanel: "Fermer"
  }
};

export function getLeadCaptureCopy(locale: Locale): LeadCaptureCopy {
  return copies[locale] ?? copies.en;
}
