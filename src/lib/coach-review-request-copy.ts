import type { Locale } from "@/lib/i18n";

export type CoachReviewRequestCopy = {
  title: string;
  description: string;
  bullets: string[];
  included: string;
  submitting: string;
  request: string;
  success: string;
  upgrade: string;
  error: string;
};

const coachReviewRequestCopy: Record<Locale, CoachReviewRequestCopy> = {
  en: {
    title: "Want a Coach to Review Your Plan?",
    description: "A certified TJFit coach will review your AI-generated plan, leave personalized comments, and suggest adjustments.",
    bullets: ["Reviewed within 48 hours", "Personalized comments on your diet + program", "One round of adjustments included"],
    included: "Included with TJFit Pro",
    submitting: "Submitting...",
    request: "Request Coach Review",
    success: "Request submitted. A coach will review within 48 hours.",
    upgrade: "Upgrade to TJFit Pro to unlock coach review.",
    error: "Could not submit your request right now."
  },
  tr: {
    title: "Planinizi bir coach incelesin ister misiniz?",
    description: "Sertifikali bir TJFit coach'u AI tarafindan olusturulan planinizi inceler, size ozel yorumlar birakir ve ayarlamalar onerir.",
    bullets: ["48 saat icinde incelenir", "Diyetiniz ve programiniz icin size ozel yorumlar", "Bir tur ayarlama dahildir"],
    included: "TJFit Pro ile dahildir",
    submitting: "Gonderiliyor...",
    request: "Coach incelemesi iste",
    success: "Talebiniz gonderildi. Bir coach 48 saat icinde inceleyecek.",
    upgrade: "Coach incelemesini acmak icin TJFit Pro'ya gecin.",
    error: "Talebiniz su anda gonderilemedi."
  },
  ar: {
    title: "هل تريد أن يراجع مدرب خطتك؟",
    description: "سيراجع مدرب معتمد من TJFit خطتك التي أنشأها الذكاء الاصطناعي، ويترك تعليقات مخصصة، ويقترح تعديلات.",
    bullets: ["تتم المراجعة خلال 48 ساعة", "تعليقات مخصصة على نظامك الغذائي وبرنامجك", "تشمل جولة واحدة من التعديلات"],
    included: "متاح ضمن TJFit Pro",
    submitting: "جار الإرسال...",
    request: "اطلب مراجعة المدرب",
    success: "تم إرسال الطلب. سيراجعه مدرب خلال 48 ساعة.",
    upgrade: "قم بالترقية إلى TJFit Pro لفتح مراجعة المدرب.",
    error: "تعذر إرسال طلبك الآن."
  },
  es: {
    title: "Quieres que un coach revise tu plan?",
    description: "Un coach certificado de TJFit revisara tu plan generado por IA, dejara comentarios personalizados y sugerira ajustes.",
    bullets: ["Revision dentro de 48 horas", "Comentarios personalizados sobre tu dieta + programa", "Incluye una ronda de ajustes"],
    included: "Incluido con TJFit Pro",
    submitting: "Enviando...",
    request: "Solicitar revision de coach",
    success: "Solicitud enviada. Un coach la revisara dentro de 48 horas.",
    upgrade: "Actualiza a TJFit Pro para desbloquear la revision de coach.",
    error: "No se pudo enviar tu solicitud ahora."
  },
  fr: {
    title: "Voulez-vous qu'un coach revise votre plan ?",
    description: "Un coach certifie TJFit revisera votre plan genere par IA, laissera des commentaires personnalises et proposera des ajustements.",
    bullets: ["Revision sous 48 heures", "Commentaires personnalises sur votre dietetique + programme", "Une serie d'ajustements incluse"],
    included: "Inclus avec TJFit Pro",
    submitting: "Envoi...",
    request: "Demander la revision d'un coach",
    success: "Demande envoyee. Un coach la revisera sous 48 heures.",
    upgrade: "Passez a TJFit Pro pour debloquer la revision par un coach.",
    error: "Impossible d'envoyer votre demande pour le moment."
  }
};

export function getCoachReviewRequestCopy(locale: Locale): CoachReviewRequestCopy {
  return coachReviewRequestCopy[locale] ?? coachReviewRequestCopy.en;
}
