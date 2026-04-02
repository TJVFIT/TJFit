import type { Locale } from "@/lib/i18n";

export type StartFunnelCopy = {
  landingHeadline: string;
  landingSubheadline: string;
  ctaFindPlan: string;
  quizProgress: string;
  question1Title: string;
  question2Title: string;
  question3Title: string;
  goalFat: string;
  goalMuscle: string;
  locHome: string;
  locGym: string;
  dietCut: string;
  dietCutHint: string;
  dietBulk: string;
  dietBulkHint: string;
  stepLocationNote: string;
  next: string;
  back: string;
  resultTitle: string;
  resultSubtitle: string;
  resultProgramLabel: string;
  resultDietLabel: string;
  ctaStartFree: string;
  ctaBrowsePrograms: string;
  ctaBrowseDiets: string;
  retakeQuiz: string;
  /** When user picks fat loss + gym — free starter is home-based */
  resultNoteFatGym: string;
  /** When user picks muscle + home — free starter is gym-based */
  resultNoteMuscleHome: string;
};

const c: Record<Locale, StartFunnelCopy> = {
  en: {
    landingHeadline: "Find Your Perfect Program. Start Free.",
    landingSubheadline:
      "Answer 3 quick questions and get your personalized starting plan — no credit card needed.",
    ctaFindPlan: "Find My Plan",
    quizProgress: "Step {current} of {total}",
    question1Title: "What is your main goal?",
    question2Title: "Where will you train?",
    question3Title: "What type of diet fits you?",
    goalFat: "Fat Loss",
    goalMuscle: "Muscle Gain",
    locHome: "At Home",
    locGym: "At the Gym",
    dietCut: "Cutting",
    dietCutHint: "Lose fat",
    dietBulk: "Bulking",
    dietBulkHint: "Build muscle",
    stepLocationNote: "We will match you to the closest free TJFit starter. You can switch anytime in the library.",
    next: "Continue",
    back: "Back",
    resultTitle: "Your free starter plan",
    resultSubtitle: "Based on your answers, start with these — full access after a free account.",
    resultProgramLabel: "Training program",
    resultDietLabel: "Nutrition starter",
    ctaStartFree: "Start Now — It's Free",
    ctaBrowsePrograms: "Browse all programs",
    ctaBrowseDiets: "Browse all diets",
    retakeQuiz: "Start over",
    resultNoteFatGym:
      "Our free fat-loss starter is designed for home training — you can follow it from the gym with small tweaks, or upgrade for a full gym cut later.",
    resultNoteMuscleHome:
      "Our free muscle starter is gym-based — use it when you have access to weights, or explore home options in the full library."
  },
  tr: {
    landingHeadline: "Dogru programi bul. Ucretsiz basla.",
    landingSubheadline: "Uc hizli soru — kisisel baslangic planin. Kart gerekmez.",
    ctaFindPlan: "Planimi Bul",
    quizProgress: "Adim {current} / {total}",
    question1Title: "Ana hedefin ne?",
    question2Title: "Nerede antrenman yapacaksin?",
    question3Title: "Hangi beslenme sana uygun?",
    goalFat: "Yag yakimi",
    goalMuscle: "Kas gelisimi",
    locHome: "Evde",
    locGym: "Salonda",
    dietCut: "Kesim",
    dietCutHint: "Yag azalt",
    dietBulk: "Bulk",
    dietBulkHint: "Kas insa",
    stepLocationNote: "En yakin ucretsiz TJFit baslangicina yonlendiriyoruz; kutuphaneden degistirebilirsin.",
    next: "Devam",
    back: "Geri",
    resultTitle: "Ucretsiz baslangic planin",
    resultSubtitle: "Cevaplarina gore bu ikisiyle basla — tam erisim ucretsiz hesapla.",
    resultProgramLabel: "Antrenman programi",
    resultDietLabel: "Beslenme baslangici",
    ctaStartFree: "Simdi Basla — Ucretsiz",
    ctaBrowsePrograms: "Tum programlar",
    ctaBrowseDiets: "Tum diyetler",
    retakeQuiz: "Bastan basla",
    resultNoteFatGym:
      "Ucretsiz yag yakimi baslangicimiz ev odakli — salondayken ufak uyarlamalarla kullanabilir veya tam salon kesimi icin yukseltebilirsin.",
    resultNoteMuscleHome:
      "Ucretsiz kas baslangicimiz salon agirliklari icin — ev secenekleri icin kutuphaneye goz at."
  },
  ar: {
    landingHeadline: "اعثر على برنامجك المثالي. ابدأ مجاناً.",
    landingSubheadline: "ثلاث أسئلة سريعة — خطة بداية مخصصة. بدون بطاقة بنكية.",
    ctaFindPlan: "اعثر على خطتي",
    quizProgress: "الخطوة {current} من {total}",
    question1Title: "ما هدفك الرئيسي؟",
    question2Title: "أين ستتمرن؟",
    question3Title: "أي نوع نظام غذائي يناسبك؟",
    goalFat: "خسارة دهون",
    goalMuscle: "بناء عضلات",
    locHome: "في المنزل",
    locGym: "في النادي",
    dietCut: "تنشيف",
    dietCutHint: "تقليل الدهون",
    dietBulk: "كتلة",
    dietBulkHint: "بناء عضلة",
    stepLocationNote: "نقترح أقرب بداية مجانية ويمكنك التغيير من المكتبة.",
    next: "متابعة",
    back: "رجوع",
    resultTitle: "خطة البداية المجانية",
    resultSubtitle: "بناءً على إجاباتك — ابدأ بهذين. الوصول الكامل بعد تسجيل مجاني.",
    resultProgramLabel: "برنامج تمارين",
    resultDietLabel: "بداية تغذية",
    ctaStartFree: "ابدأ الآن — مجاناً",
    ctaBrowsePrograms: "كل البرامج",
    ctaBrowseDiets: "كل الأنظمة الغذائية",
    retakeQuiz: "إعادة البدء",
    resultNoteFatGym: "بداية خسارة الدهون المجانية مخصصة للمنزل — يمكنك تكييفها في النادي أو الترقية لاحقاً.",
    resultNoteMuscleHome: "بداية العضلات المجانية للنادي — راجع الخيارات المنزلية في المكتبة."
  },
  es: {
    landingHeadline: "Encuentra tu programa ideal. Empieza gratis.",
    landingSubheadline: "Tres preguntas rapidas — tu plan de inicio personalizado. Sin tarjeta.",
    ctaFindPlan: "Encontrar mi plan",
    quizProgress: "Paso {current} de {total}",
    question1Title: "Cual es tu objetivo principal?",
    question2Title: "Donde entrenaras?",
    question3Title: "Que tipo de dieta te encaja?",
    goalFat: "Perder grasa",
    goalMuscle: "Ganar musculo",
    locHome: "En casa",
    locGym: "En el gimnasio",
    dietCut: "Definicion",
    dietCutHint: "Perder grasa",
    dietBulk: "Volumen",
    dietBulkHint: "Ganar musculo",
    stepLocationNote: "Te acercamos al starter gratuito mas logico; puedes cambiar en la libreria.",
    next: "Siguiente",
    back: "Atras",
    resultTitle: "Tu plan de inicio gratis",
    resultSubtitle: "Segun tus respuestas, empieza con esto — acceso completo con cuenta gratis.",
    resultProgramLabel: "Programa de entreno",
    resultDietLabel: "Inicio de nutricion",
    ctaStartFree: "Empezar ahora — gratis",
    ctaBrowsePrograms: "Ver todos los programas",
    ctaBrowseDiets: "Ver todas las dietas",
    retakeQuiz: "Reiniciar",
    resultNoteFatGym:
      "El starter gratuito de grasa es en casa — adaptable al gym o mejora al plan de corte completo.",
    resultNoteMuscleHome: "El starter gratuito de musculo es de gym — revisa opciones en casa en la libreria."
  },
  fr: {
    landingHeadline: "Trouvez votre programme ideal. Commencez gratuitement.",
    landingSubheadline:
      "Trois questions rapides — votre plan de demarrage personnalise. Sans carte bancaire.",
    ctaFindPlan: "Trouver mon plan",
    quizProgress: "Etape {current} sur {total}",
    question1Title: "Quel est votre objectif principal ?",
    question2Title: "Ou vous entrainerez-vous ?",
    question3Title: "Quel type de nutrition vous convient ?",
    goalFat: "Perte de graisse",
    goalMuscle: "Prise de muscle",
    locHome: "A la maison",
    locGym: "En salle",
    dietCut: "Seche",
    dietCutHint: "Perdre du gras",
    dietBulk: "Prise de masse",
    dietBulkHint: "Construire du muscle",
    stepLocationNote: "Nous alignons le starter gratuit le plus logique — modifiable dans la bibliotheque.",
    next: "Suivant",
    back: "Retour",
    resultTitle: "Votre plan de demarrage gratuit",
    resultSubtitle: "Selon vos reponses — commencez par ce duo. Acces complet avec un compte gratuit.",
    resultProgramLabel: "Programme training",
    resultDietLabel: "Nutrition de demarrage",
    ctaStartFree: "Commencer — gratuit",
    ctaBrowsePrograms: "Tous les programmes",
    ctaBrowseDiets: "Tous les regimes",
    retakeQuiz: "Recommencer",
    resultNoteFatGym:
      "Le starter seche gratuit est pense maison — adaptable en salle ou evoluez vers le programme complet.",
    resultNoteMuscleHome: "Le starter muscle gratuit est en salle — voyez les options maison dans la bibliotheque."
  }
};

export function getStartFunnelCopy(locale: Locale): StartFunnelCopy {
  return c[locale] ?? c.en;
}

export function formatQuizProgress(copy: StartFunnelCopy, current: number, total: number): string {
  return copy.quizProgress.replace("{current}", String(current)).replace("{total}", String(total));
}
