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
    emailPlaceholder: "Email address",
    submit: "Send",
    submitting: "Sending…",
    successTitle: "You are in",
    successBody: "Check your inbox for the roadmap. We will only send useful updates.",
    invalidEmail: "Please enter a valid email.",
    genericError: "Something went wrong. Try again in a moment.",
    privacyNote: "No spam. Unsubscribe anytime.",
    closePanel: "Close"
  },
  tr: {
    emailPlaceholder: "E-posta",
    submit: "Gonder",
    submitting: "Gonderiliyor…",
    successTitle: "Listeye eklendiniz",
    successBody: "Yol haritasi icin gelen kutunuzu kontrol edin. Sadece faydali guncellemeler.",
    invalidEmail: "Gecerli bir e-posta girin.",
    genericError: "Bir sorun oldu. Biraz sonra tekrar deneyin.",
    privacyNote: "Spam yok. Istediginiz zaman cikabilirsiniz.",
    closePanel: "Kapat"
  },
  ar: {
    emailPlaceholder: "البريد الإلكتروني",
    submit: "إرسال",
    submitting: "جاري الإرسال…",
    successTitle: "تم التسجيل",
    successBody: "تحقق من بريدك للخارطة. نرسل فقط تحديثات مفيدة.",
    invalidEmail: "يرجى إدخال بريد صالح.",
    genericError: "حدث خطأ. أعد المحاولة لاحقاً.",
    privacyNote: "بدون إزعاج. يمكنك إلغاء الاشتراك في أي وقت.",
    closePanel: "إغلاق"
  },
  es: {
    emailPlaceholder: "Correo electronico",
    submit: "Enviar",
    submitting: "Enviando…",
    successTitle: "Listo",
    successBody: "Revisa tu bandeja para la guia. Solo enviamos actualizaciones utiles.",
    invalidEmail: "Introduce un email valido.",
    genericError: "Algo salio mal. Intentalo de nuevo.",
    privacyNote: "Sin spam. Cancela cuando quieras.",
    closePanel: "Cerrar"
  },
  fr: {
    emailPlaceholder: "Adresse e-mail",
    submit: "Envoyer",
    submitting: "Envoi…",
    successTitle: "C'est note",
    successBody: "Consultez votre boite pour la feuille de route. Mises a jour utiles seulement.",
    invalidEmail: "Entrez une adresse e-mail valide.",
    genericError: "Une erreur s'est produite. Reessayez plus tard.",
    privacyNote: "Pas de spam. Desinscription a tout moment.",
    closePanel: "Fermer"
  }
};

export function getLeadCaptureCopy(locale: Locale): LeadCaptureCopy {
  return copies[locale] ?? copies.en;
}
