"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { BodySilhouetteSelector } from "@/components/tjai/body-silhouette-selector";
import { useMagneticButton } from "@/hooks/useMagneticButton";
import type { Locale } from "@/lib/i18n";
import { normalizeQuizAnswers } from "@/lib/tjai-intake";
import { getMarketQuizOptions } from "@/lib/tjai/market-data";
import { calculateTJAIMetrics } from "@/lib/tjai-science";
import { cn } from "@/lib/utils";
import type { QuizAnswers, QuizOption, QuizStep, TJAICopy } from "@/lib/tjai-types";

const QUIZ_PROGRESS_KEY = "tjai_quiz_progress";
const QUIZ_PROGRESS_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Step-funnel beacon (fire-and-forget, drop-off analytics). One
// quiz_step_reached per (quiz session, step id); the server derives drop-off
// from each session's furthest step, so a lost or duplicate beacon can only
// under-count — it can never corrupt the funnel. Analytics must never break
// the quiz, hence the double swallow.
function sendQuizStepBeacon(payload: {
  stepId: string;
  stepIndex: number;
  totalSteps: number;
  quizSessionId: string;
  locale: string;
}) {
  try {
    void fetch("/api/tjai/quiz-events", {
      method: "POST",
      keepalive: true,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => undefined);
  } catch {
    /* ignore */
  }
}
const QUIZ_UI_COPY = {
  en: {
    categoryPersonal: "Personal Info",
    categoryBody: "Body Statistics",
    categoryGoal: "Your Goal",
    categoryHistory: "Training History",
    categoryLifestyle: "Lifestyle",
    categoryPrefs: "Preferences",
    categoryFinal: "Final Details",
    resumeTitle: "Resume your TJAI quiz? You left off at question",
    resume: "Resume",
    startOver: "Start Over",
    numbersTitle: "Your Numbers So Far",
    bmr: "BMR",
    tdee: "TDEE",
    target: "Daily Target",
    formula: "Estimates based on Mifflin-St Jeor formula.",
    question: "Question"
  },
  tr: {
    categoryPersonal: "Kisisel Bilgiler",
    categoryBody: "Vucut Olculeri",
    categoryGoal: "Hedefin",
    categoryHistory: "Antrenman Gecmisi",
    categoryLifestyle: "Yasam Tarzi",
    categoryPrefs: "Tercihler",
    categoryFinal: "Son Detaylar",
    resumeTitle: "TJAI testine devam etmek ister misin? Kaldigin soru:",
    resume: "Devam Et",
    startOver: "Bastan Basla",
    numbersTitle: "Simdiki Tahmini Degerlerin",
    bmr: "BMR",
    tdee: "TDEE",
    target: "Gunluk Hedef",
    formula: "Tahminler Mifflin-St Jeor formulune gore hesaplanir.",
    question: "Soru"
  },
  ar: {
    categoryPersonal: "المعلومات الشخصية",
    categoryBody: "قياسات الجسم",
    categoryGoal: "هدفك",
    categoryHistory: "سجل التدريب",
    categoryLifestyle: "نمط الحياة",
    categoryPrefs: "التفضيلات",
    categoryFinal: "التفاصيل النهائية",
    resumeTitle: "هل تريد المتابعة من حيث توقفت؟ توقفت عند السؤال",
    resume: "متابعة",
    startOver: "ابدأ من جديد",
    numbersTitle: "أرقامك الحالية",
    bmr: "BMR",
    tdee: "TDEE",
    target: "الهدف اليومي",
    formula: "تقديرات مبنية على معادلة Mifflin-St Jeor.",
    question: "السؤال"
  },
  es: {
    categoryPersonal: "Informacion Personal",
    categoryBody: "Estadisticas Corporales",
    categoryGoal: "Tu Objetivo",
    categoryHistory: "Historial de Entrenamiento",
    categoryLifestyle: "Estilo de Vida",
    categoryPrefs: "Preferencias",
    categoryFinal: "Detalles Finales",
    resumeTitle: "Quieres continuar tu quiz de TJAI? Te quedaste en la pregunta",
    resume: "Continuar",
    startOver: "Empezar de Nuevo",
    numbersTitle: "Tus Numeros Hasta Ahora",
    bmr: "BMR",
    tdee: "TDEE",
    target: "Objetivo Diario",
    formula: "Estimaciones basadas en la formula de Mifflin-St Jeor.",
    question: "Pregunta"
  },
  fr: {
    categoryPersonal: "Infos Personnelles",
    categoryBody: "Statistiques Corporelles",
    categoryGoal: "Votre Objectif",
    categoryHistory: "Historique d'Entrainement",
    categoryLifestyle: "Mode de Vie",
    categoryPrefs: "Preferences",
    categoryFinal: "Details Finaux",
    resumeTitle: "Reprendre votre quiz TJAI ? Vous etiez a la question",
    resume: "Reprendre",
    startOver: "Recommencer",
    numbersTitle: "Vos Chiffres Actuels",
    bmr: "BMR",
    tdee: "TDEE",
    target: "Objectif Quotidien",
    formula: "Estimations basees sur la formule Mifflin-St Jeor.",
    question: "Question"
  },
  de: {
    categoryPersonal: "Persönliche Daten",
    categoryBody: "Körperdaten",
    categoryGoal: "Dein Ziel",
    categoryHistory: "Trainingsverlauf",
    categoryLifestyle: "Lebensstil",
    categoryPrefs: "Präferenzen",
    categoryFinal: "Letzte Details",
    resumeTitle: "Möchtest du dein TJAI-Quiz fortsetzen? Du warst bei Frage",
    resume: "Fortsetzen",
    startOver: "Neu starten",
    numbersTitle: "Deine aktuellen Werte",
    bmr: "BMR",
    tdee: "TDEE",
    target: "Tagesziel",
    formula: "Schätzungen basieren auf der Mifflin-St-Jeor-Formel.",
    question: "Frage"
  },
  hi: {
    categoryPersonal: "व्यक्तिगत जानकारी",
    categoryBody: "शरीर का माप",
    categoryGoal: "आपका लक्ष्य",
    categoryHistory: "प्रशिक्षण इतिहास",
    categoryLifestyle: "जीवनशैली",
    categoryPrefs: "पसंद",
    categoryFinal: "अंतिम विवरण",
    resumeTitle: "अपना TJAI क्विज़ जारी रखें? आप यहाँ रुके थे: प्रश्न",
    resume: "जारी रखें",
    startOver: "फिर से शुरू करें",
    numbersTitle: "आपके अब तक के नंबर",
    bmr: "BMR",
    tdee: "TDEE",
    target: "दैनिक लक्ष्य",
    formula: "अनुमान Mifflin-St Jeor फॉर्मूले पर आधारित हैं।",
    question: "प्रश्न"
  },
  id: {
    categoryPersonal: "Info Pribadi",
    categoryBody: "Statistik Tubuh",
    categoryGoal: "Tujuanmu",
    categoryHistory: "Riwayat Latihan",
    categoryLifestyle: "Gaya Hidup",
    categoryPrefs: "Preferensi",
    categoryFinal: "Detail Terakhir",
    resumeTitle: "Lanjutkan kuis TJAI? Kamu berhenti di pertanyaan",
    resume: "Lanjutkan",
    startOver: "Mulai Ulang",
    numbersTitle: "Angka Sementara Anda",
    bmr: "BMR",
    tdee: "TDEE",
    target: "Target Harian",
    formula: "Estimasi berdasarkan rumus Mifflin-St Jeor.",
    question: "Pertanyaan"
  },
  pt: {
    categoryPersonal: "Informações Pessoais",
    categoryBody: "Medidas Corporais",
    categoryGoal: "Seu Objetivo",
    categoryHistory: "Histórico de Treino",
    categoryLifestyle: "Estilo de Vida",
    categoryPrefs: "Preferências",
    categoryFinal: "Detalhes Finais",
    resumeTitle: "Continuar seu quiz do TJAI? Você parou na pergunta",
    resume: "Continuar",
    startOver: "Recomeçar",
    numbersTitle: "Seus Números Até Agora",
    bmr: "BMR",
    tdee: "TDEE",
    target: "Meta Diária",
    formula: "Estimativas baseadas na fórmula de Mifflin-St Jeor.",
    question: "Pergunta"
  },
  ru: {
    categoryPersonal: "Личные данные",
    categoryBody: "Параметры тела",
    categoryGoal: "Ваша цель",
    categoryHistory: "История тренировок",
    categoryLifestyle: "Образ жизни",
    categoryPrefs: "Предпочтения",
    categoryFinal: "Финальные детали",
    resumeTitle: "Продолжить квиз TJAI? Вы остановились на вопросе",
    resume: "Продолжить",
    startOver: "Начать заново",
    numbersTitle: "Ваши текущие показатели",
    bmr: "BMR",
    tdee: "TDEE",
    target: "Дневная цель",
    formula: "Оценки основаны на формуле Миффлина-Сан-Жеора.",
    question: "Вопрос"
  }
} as const;

type QuizExtraCopy = {
  reviewEyebrow: string;
  reviewTitle: string;
  reviewSub: string;
  reviewEdit: string;
  reviewSkipped: string;
  reviewCta: string;
  reviewBack: string;
  injuryAreasQuestion: string;
  injuryAreasSub: string;
  injuryAreaOptions: QuizOption[];
  injurySeverityQuestion: string;
  injurySeveritySub: string;
  injurySeverityOptions: QuizOption[];
  dislikedQuestion: string;
  dislikedSub: string;
  dislikedOptions: QuizOption[];
  splitQuestion: string;
  splitSub: string;
  splitOptions: QuizOption[];
};

const QUIZ_EXTRA_COPY: Record<"en" | "tr" | "ar" | "es" | "fr", QuizExtraCopy> = {
  en: {
    reviewEyebrow: "Final Review",
    reviewTitle: "Review your answers",
    reviewSub: "Take a moment to confirm everything is accurate — TJAI builds your entire plan from these details.",
    reviewEdit: "Edit",
    reviewSkipped: "Skipped",
    reviewCta: "Review answers",
    reviewBack: "Back to questions",
    injuryAreasQuestion: "Which areas are affected?",
    injuryAreasSub: "Select every area that applies. TJAI will protect these in your exercise selection.",
    injuryAreaOptions: [
      { label: "Knee", value: "knee" },
      { label: "Shoulder", value: "shoulder" },
      { label: "Lower back", value: "lower_back" },
      { label: "Wrist", value: "wrist" },
      { label: "Ankle", value: "ankle" },
      { label: "Hip", value: "hip" },
      { label: "Neck", value: "neck" },
      { label: "Other", value: "other" }
    ],
    injurySeverityQuestion: "How limiting is it right now?",
    injurySeveritySub: "An honest answer helps TJAI set a safe intensity and smart substitutions.",
    injurySeverityOptions: [
      { label: "Mild discomfort — it only flares up sometimes", value: "mild_discomfort" },
      { label: "Working around it — I avoid certain movements", value: "working_around" },
      { label: "Recovering from an injury — still rebuilding capacity", value: "recovering" }
    ],
    dislikedQuestion: "Any exercises you would rather avoid?",
    dislikedSub: "Optional — TJAI will program equally effective alternatives instead.",
    dislikedOptions: [
      { label: "Burpees", value: "burpees" },
      { label: "Running", value: "running" },
      { label: "Jumping / plyometrics", value: "jumping" },
      { label: "Overhead pressing", value: "overhead_press" },
      { label: "Deep squats", value: "deep_squats" },
      { label: "Deadlifts", value: "deadlifts" },
      { label: "Pull-ups", value: "pull_ups" },
      { label: "Planks", value: "planks" }
    ],
    splitQuestion: "Do you have a preferred training split?",
    splitSub: "TJAI will respect your preference whenever it fits your schedule and goal.",
    splitOptions: [
      { label: "Full body — train everything each session", value: "full_body" },
      { label: "Upper / lower split", value: "upper_lower" },
      { label: "Push / pull / legs", value: "push_pull_legs" },
      { label: "No preference — let TJAI decide", value: "no_preference" }
    ]
  },
  tr: {
    reviewEyebrow: "Son Kontrol",
    reviewTitle: "Cevaplarını gözden geçir",
    reviewSub: "Her şeyin doğru olduğundan emin ol — TJAI tüm planını bu detaylardan oluşturur.",
    reviewEdit: "Düzenle",
    reviewSkipped: "Atlandı",
    reviewCta: "Cevapları gözden geçir",
    reviewBack: "Sorulara dön",
    injuryAreasQuestion: "Hangi bölgeler etkileniyor?",
    injuryAreasSub: "Geçerli olan tüm bölgeleri seç. TJAI egzersiz seçiminde bu bölgeleri koruyacak.",
    injuryAreaOptions: [
      { label: "Diz", value: "knee" },
      { label: "Omuz", value: "shoulder" },
      { label: "Bel", value: "lower_back" },
      { label: "El bileği", value: "wrist" },
      { label: "Ayak bileği", value: "ankle" },
      { label: "Kalça", value: "hip" },
      { label: "Boyun", value: "neck" },
      { label: "Diğer", value: "other" }
    ],
    injurySeverityQuestion: "Şu anda seni ne kadar kısıtlıyor?",
    injurySeveritySub: "Dürüst bir cevap, TJAI'nin güvenli yoğunluk ve akıllı alternatifler belirlemesine yardımcı olur.",
    injurySeverityOptions: [
      { label: "Hafif rahatsızlık — sadece ara sıra hissediyorum", value: "mild_discomfort" },
      { label: "İdare ediyorum — belirli hareketlerden kaçınıyorum", value: "working_around" },
      { label: "Sakatlıktan toparlanıyorum — hâlâ güç kazanıyorum", value: "recovering" }
    ],
    dislikedQuestion: "Kaçınmak istediğin egzersizler var mı?",
    dislikedSub: "İsteğe bağlı — TJAI bunların yerine aynı derecede etkili alternatifler programlar.",
    dislikedOptions: [
      { label: "Burpee", value: "burpees" },
      { label: "Koşu", value: "running" },
      { label: "Sıçrama / pliometrik", value: "jumping" },
      { label: "Baş üstü itiş", value: "overhead_press" },
      { label: "Derin squat", value: "deep_squats" },
      { label: "Deadlift", value: "deadlifts" },
      { label: "Barfiks", value: "pull_ups" },
      { label: "Plank", value: "planks" }
    ],
    splitQuestion: "Tercih ettiğin bir antrenman düzeni var mı?",
    splitSub: "Programına ve hedefine uyduğu sürece TJAI tercihine saygı gösterir.",
    splitOptions: [
      { label: "Tüm vücut — her seansta her şeyi çalış", value: "full_body" },
      { label: "Üst / alt vücut ayrımı", value: "upper_lower" },
      { label: "İtiş / çekiş / bacak", value: "push_pull_legs" },
      { label: "Fark etmez — TJAI karar versin", value: "no_preference" }
    ]
  },
  ar: {
    reviewEyebrow: "المراجعة النهائية",
    reviewTitle: "راجع إجاباتك",
    reviewSub: "تأكد أن كل شيء صحيح — يبني TJAI خطتك كاملة من هذه التفاصيل.",
    reviewEdit: "تعديل",
    reviewSkipped: "تم التخطي",
    reviewCta: "مراجعة الإجابات",
    reviewBack: "العودة إلى الأسئلة",
    injuryAreasQuestion: "ما المناطق المتأثرة؟",
    injuryAreasSub: "اختر كل منطقة تنطبق عليك. سيحمي TJAI هذه المناطق عند اختيار التمارين.",
    injuryAreaOptions: [
      { label: "الركبة", value: "knee" },
      { label: "الكتف", value: "shoulder" },
      { label: "أسفل الظهر", value: "lower_back" },
      { label: "المعصم", value: "wrist" },
      { label: "الكاحل", value: "ankle" },
      { label: "الورك", value: "hip" },
      { label: "الرقبة", value: "neck" },
      { label: "أخرى", value: "other" }
    ],
    injurySeverityQuestion: "ما مدى تأثيرها عليك الآن؟",
    injurySeveritySub: "الإجابة الصادقة تساعد TJAI على تحديد شدة آمنة وبدائل ذكية.",
    injurySeverityOptions: [
      { label: "انزعاج خفيف — يظهر أحيانًا فقط", value: "mild_discomfort" },
      { label: "أتعايش معها — أتجنب حركات معينة", value: "working_around" },
      { label: "أتعافى من إصابة — ما زلت أستعيد قدرتي", value: "recovering" }
    ],
    dislikedQuestion: "هل هناك تمارين تفضل تجنبها؟",
    dislikedSub: "اختياري — سيبرمج TJAI بدائل فعالة بنفس القدر.",
    dislikedOptions: [
      { label: "بيربي", value: "burpees" },
      { label: "الجري", value: "running" },
      { label: "القفز / البلايومترية", value: "jumping" },
      { label: "الضغط فوق الرأس", value: "overhead_press" },
      { label: "السكوات العميق", value: "deep_squats" },
      { label: "الرفعة الميتة", value: "deadlifts" },
      { label: "العقلة", value: "pull_ups" },
      { label: "البلانك", value: "planks" }
    ],
    splitQuestion: "هل لديك تقسيم تدريبي مفضل؟",
    splitSub: "سيحترم TJAI تفضيلك عندما يناسب جدولك وهدفك.",
    splitOptions: [
      { label: "الجسم كامل — تدريب كل العضلات في كل جلسة", value: "full_body" },
      { label: "علوي / سفلي", value: "upper_lower" },
      { label: "دفع / سحب / أرجل", value: "push_pull_legs" },
      { label: "لا تفضيل — دع TJAI يقرر", value: "no_preference" }
    ]
  },
  es: {
    reviewEyebrow: "Revisión Final",
    reviewTitle: "Revisa tus respuestas",
    reviewSub: "Confirma que todo sea correcto: TJAI construye tu plan completo a partir de estos detalles.",
    reviewEdit: "Editar",
    reviewSkipped: "Omitida",
    reviewCta: "Revisar respuestas",
    reviewBack: "Volver a las preguntas",
    injuryAreasQuestion: "¿Qué zonas están afectadas?",
    injuryAreasSub: "Selecciona todas las zonas que apliquen. TJAI las protegerá al elegir tus ejercicios.",
    injuryAreaOptions: [
      { label: "Rodilla", value: "knee" },
      { label: "Hombro", value: "shoulder" },
      { label: "Zona lumbar", value: "lower_back" },
      { label: "Muñeca", value: "wrist" },
      { label: "Tobillo", value: "ankle" },
      { label: "Cadera", value: "hip" },
      { label: "Cuello", value: "neck" },
      { label: "Otra", value: "other" }
    ],
    injurySeverityQuestion: "¿Cuánto te limita ahora mismo?",
    injurySeveritySub: "Una respuesta honesta ayuda a TJAI a fijar una intensidad segura y sustituciones inteligentes.",
    injurySeverityOptions: [
      { label: "Molestia leve — solo aparece a veces", value: "mild_discomfort" },
      { label: "Lo manejo — evito ciertos movimientos", value: "working_around" },
      { label: "Recuperándome de una lesión — aún gano capacidad", value: "recovering" }
    ],
    dislikedQuestion: "¿Hay ejercicios que prefieres evitar?",
    dislikedSub: "Opcional — TJAI programará alternativas igual de efectivas.",
    dislikedOptions: [
      { label: "Burpees", value: "burpees" },
      { label: "Correr", value: "running" },
      { label: "Saltos / pliometría", value: "jumping" },
      { label: "Press por encima de la cabeza", value: "overhead_press" },
      { label: "Sentadillas profundas", value: "deep_squats" },
      { label: "Peso muerto", value: "deadlifts" },
      { label: "Dominadas", value: "pull_ups" },
      { label: "Planchas", value: "planks" }
    ],
    splitQuestion: "¿Tienes una división de entrenamiento preferida?",
    splitSub: "TJAI respetará tu preferencia cuando encaje con tu horario y tu objetivo.",
    splitOptions: [
      { label: "Cuerpo completo — todo en cada sesión", value: "full_body" },
      { label: "Tren superior / inferior", value: "upper_lower" },
      { label: "Empuje / tirón / pierna", value: "push_pull_legs" },
      { label: "Sin preferencia — que decida TJAI", value: "no_preference" }
    ]
  },
  fr: {
    reviewEyebrow: "Vérification Finale",
    reviewTitle: "Vérifiez vos réponses",
    reviewSub: "Confirmez que tout est exact — TJAI construit l'intégralité de votre plan à partir de ces détails.",
    reviewEdit: "Modifier",
    reviewSkipped: "Ignorée",
    reviewCta: "Vérifier les réponses",
    reviewBack: "Retour aux questions",
    injuryAreasQuestion: "Quelles zones sont concernées ?",
    injuryAreasSub: "Sélectionnez toutes les zones concernées. TJAI les protégera dans le choix des exercices.",
    injuryAreaOptions: [
      { label: "Genou", value: "knee" },
      { label: "Épaule", value: "shoulder" },
      { label: "Bas du dos", value: "lower_back" },
      { label: "Poignet", value: "wrist" },
      { label: "Cheville", value: "ankle" },
      { label: "Hanche", value: "hip" },
      { label: "Cou", value: "neck" },
      { label: "Autre", value: "other" }
    ],
    injurySeverityQuestion: "À quel point cela vous limite-t-il actuellement ?",
    injurySeveritySub: "Une réponse honnête aide TJAI à définir une intensité sûre et des substitutions intelligentes.",
    injurySeverityOptions: [
      { label: "Gêne légère — elle ne se manifeste que parfois", value: "mild_discomfort" },
      { label: "Je compose avec — j'évite certains mouvements", value: "working_around" },
      { label: "En convalescence — je reconstruis encore mes capacités", value: "recovering" }
    ],
    dislikedQuestion: "Des exercices que vous préférez éviter ?",
    dislikedSub: "Facultatif — TJAI programmera des alternatives tout aussi efficaces.",
    dislikedOptions: [
      { label: "Burpees", value: "burpees" },
      { label: "Course à pied", value: "running" },
      { label: "Sauts / pliométrie", value: "jumping" },
      { label: "Développé au-dessus de la tête", value: "overhead_press" },
      { label: "Squats profonds", value: "deep_squats" },
      { label: "Soulevés de terre", value: "deadlifts" },
      { label: "Tractions", value: "pull_ups" },
      { label: "Planches", value: "planks" }
    ],
    splitQuestion: "Avez-vous une répartition d'entraînement préférée ?",
    splitSub: "TJAI respectera votre préférence si elle correspond à votre emploi du temps et à votre objectif.",
    splitOptions: [
      { label: "Full body — tout le corps à chaque séance", value: "full_body" },
      { label: "Haut / bas du corps", value: "upper_lower" },
      { label: "Pousser / tirer / jambes", value: "push_pull_legs" },
      { label: "Aucune préférence — laissez TJAI décider", value: "no_preference" }
    ]
  }
};

type Props = {
  locale: Locale;
  copy: TJAICopy;
  steps: QuizStep[];
  direction: "ltr" | "rtl";
  onSubmit: (answers: QuizAnswers) => void;
  onAnswersChange?: (answers: QuizAnswers) => void;
};

function matchesShowIf(step: QuizStep, answers: QuizAnswers): boolean {
  if (!step.showIf || step.showIf.conditions.length === 0) return true;
  const mode = step.showIf.mode ?? "all";
  const checks = step.showIf.conditions.map((condition) => {
    const parent = answers[condition.stepId];
    const expected = Array.isArray(condition.value) ? condition.value : [condition.value];
    const list = Array.isArray(parent) ? parent : parent == null ? [] : [parent];
    if (list.length === 0) return false;
    if (condition.operator === "includes") {
      return expected.some((value) => list.includes(value));
    }
    if (condition.operator === "not_equals") {
      return expected.every((value) => !list.includes(value));
    }
    return expected.some((value) => list.includes(value));
  });
  return mode === "any" ? checks.some(Boolean) : checks.every(Boolean);
}

function hasAnswer(step: QuizStep, answer: QuizAnswers[string] | undefined): boolean {
  if (step.type === "multi") return Array.isArray(answer) && answer.length > 0;
  if (step.type === "text") return typeof answer === "string" ? answer.trim().length > 0 : !step.required;
  if (step.type === "number" || step.type === "slider" || step.type === "scale") return typeof answer === "number";
  if (typeof answer === "number" || typeof answer === "boolean") return true;
  return typeof answer === "string" && answer.trim().length > 0;
}

export function TJAIQuiz({ locale, copy, steps, direction, onSubmit, onAnswersChange }: Props) {
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [idx, setIdx] = useState(0);
  const [showError, setShowError] = useState(false);
  const [shake, setShake] = useState(false);
  const [resumePrompt, setResumePrompt] = useState<{ currentStep: number; currentStepId?: string; answers: QuizAnswers } | null>(null);
  const [resumeHandled, setResumeHandled] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [returnToReview, setReturnToReview] = useState(false);
  const magneticGenerateRef = useMagneticButton<HTMLButtonElement>(0.3);
  const quizSessionIdRef = useRef<string>("");
  const sentStepsRef = useRef<Set<string>>(new Set());

  const localeKey = locale as keyof typeof QUIZ_UI_COPY;
  const uiCopy = QUIZ_UI_COPY[localeKey] ?? QUIZ_UI_COPY.en;
  const extraCopy = QUIZ_EXTRA_COPY[locale as keyof typeof QUIZ_EXTRA_COPY] ?? QUIZ_EXTRA_COPY.en;
  const mergedSteps = useMemo(() => {
    // Adaptive follow-up steps injected client-side. Base steps, their order,
    // and their answer keys stay untouched so old drafts and analytics keep working.
    const injuryShowIf: QuizStep["showIf"] = {
      mode: "any",
      conditions: [
        {
          stepId: "s17_injuries",
          operator: "includes",
          value: ["knee", "lower_back", "shoulder", "hip", "wrist_elbow", "recent_surgery", "chronic_condition"]
        }
      ]
    };
    const out: QuizStep[] = [];
    for (const baseStep of steps) {
      out.push(baseStep);
      if (baseStep.id === "s17_injuries") {
        out.push(
          {
            id: "s17_injury_areas",
            section: baseStep.section,
            sectionNumber: baseStep.sectionNumber,
            totalSections: baseStep.totalSections,
            question: extraCopy.injuryAreasQuestion,
            sub: extraCopy.injuryAreasSub,
            type: "multi",
            options: extraCopy.injuryAreaOptions,
            required: true,
            showIf: injuryShowIf
          },
          {
            id: "s17_injury_severity",
            section: baseStep.section,
            sectionNumber: baseStep.sectionNumber,
            totalSections: baseStep.totalSections,
            question: extraCopy.injurySeverityQuestion,
            sub: extraCopy.injurySeveritySub,
            type: "single",
            options: extraCopy.injurySeverityOptions,
            required: true,
            showIf: injuryShowIf
          }
        );
      }
      if (baseStep.id === "s5_training_preference") {
        out.push(
          {
            id: "s6_disliked_exercises",
            section: baseStep.section,
            sectionNumber: baseStep.sectionNumber,
            totalSections: baseStep.totalSections,
            question: extraCopy.dislikedQuestion,
            sub: extraCopy.dislikedSub,
            type: "multi",
            options: extraCopy.dislikedOptions,
            required: false
          },
          {
            id: "s6_preferred_split",
            section: baseStep.section,
            sectionNumber: baseStep.sectionNumber,
            totalSections: baseStep.totalSections,
            question: extraCopy.splitQuestion,
            sub: extraCopy.splitSub,
            type: "single",
            options: extraCopy.splitOptions,
            required: true
          }
        );
      }
    }
    return out;
  }, [steps, extraCopy]);
  const filteredSteps = useMemo(() => mergedSteps.filter((step) => matchesShowIf(step, answers)), [mergedSteps, answers]);
  // Resolve a saved draft's position against the CURRENT step list (steps can
  // be added between deploys): prefer the saved step id, fall back to the
  // clamped numeric index for drafts saved before ids were stored.
  const resumeTargetIdx = useMemo(() => {
    if (!resumePrompt) return 0;
    const list = mergedSteps.filter((step) => matchesShowIf(step, resumePrompt.answers));
    const byId = resumePrompt.currentStepId ? list.findIndex((step) => step.id === resumePrompt.currentStepId) : -1;
    if (byId >= 0) return byId;
    return Math.min(resumePrompt.currentStep, Math.max(0, list.length - 1));
  }, [mergedSteps, resumePrompt]);
  const total = filteredSteps.length;
  const safeIdx = total > 0 ? Math.min(Math.max(idx, 0), total - 1) : 0;
  const step = filteredSteps[safeIdx];
  const progress = total > 0 ? ((safeIdx + 1) / total) * 100 : 0;

  useEffect(() => {
    if (typeof window === "undefined" || resumeHandled) return;
    const raw = window.localStorage.getItem(QUIZ_PROGRESS_KEY);
    if (!raw) {
      setResumeHandled(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { currentStep?: number; currentStepId?: string; answers?: QuizAnswers; savedAt?: number };
      const savedAt = Number(parsed?.savedAt ?? 0);
      if (!savedAt || Date.now() - savedAt > QUIZ_PROGRESS_MAX_AGE_MS) {
        window.localStorage.removeItem(QUIZ_PROGRESS_KEY);
        setResumeHandled(true);
        return;
      }
      const savedStep = Number(parsed?.currentStep ?? 0);
      const savedStepId = typeof parsed?.currentStepId === "string" ? parsed.currentStepId : undefined;
      const savedAnswers = normalizeQuizAnswers((parsed?.answers ?? {}) as Record<string, unknown>);
      if (savedStep > 0 && savedAnswers && typeof savedAnswers === "object") {
        setResumePrompt({ currentStep: savedStep, currentStepId: savedStepId, answers: savedAnswers });
      }
    } catch {
      window.localStorage.removeItem(QUIZ_PROGRESS_KEY);
    } finally {
      setResumeHandled(true);
    }
  }, [resumeHandled]);

  useEffect(() => {
    if (typeof window === "undefined" || !resumeHandled) return;
    if (quizSessionIdRef.current) return;
    // Funnel-session id: reuse the draft's so an abandoned-then-resumed run
    // counts as one session; a fresh start mints a new one.
    let saved: string | undefined;
    try {
      const raw = window.localStorage.getItem(QUIZ_PROGRESS_KEY);
      const parsed = raw ? (JSON.parse(raw) as { sessionId?: string }) : null;
      saved = typeof parsed?.sessionId === "string" ? parsed.sessionId : undefined;
    } catch {
      saved = undefined;
    }
    quizSessionIdRef.current =
      saved && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(saved)
        ? saved
        : crypto.randomUUID();
  }, [resumeHandled]);

  useEffect(() => {
    if (typeof window === "undefined" || !resumeHandled || resumePrompt) return;
    window.localStorage.setItem(
      QUIZ_PROGRESS_KEY,
      JSON.stringify({
        currentStep: idx,
        // Step id survives step-list changes between deploys; the numeric
        // index is only a fallback for drafts saved before ids were stored.
        currentStepId: filteredSteps[safeIdx]?.id,
        sessionId: quizSessionIdRef.current || undefined,
        answers,
        savedAt: Date.now()
      })
    );
  }, [answers, idx, safeIdx, filteredSteps, resumeHandled, resumePrompt]);

  // Drop-off analytics: fire once per (session, step id) the first time a
  // step is displayed. Deduped client-side; back-navigation never re-fires.
  useEffect(() => {
    const stepId = filteredSteps[safeIdx]?.id;
    if (!stepId || !resumeHandled || resumePrompt) return;
    const quizSessionId = quizSessionIdRef.current;
    if (!quizSessionId || sentStepsRef.current.has(stepId)) return;
    sentStepsRef.current.add(stepId);
    sendQuizStepBeacon({
      stepId,
      stepIndex: safeIdx,
      totalSteps: filteredSteps.length,
      quizSessionId,
      locale
    });
  }, [filteredSteps, safeIdx, resumeHandled, resumePrompt, locale]);

  // The review screen is the funnel's final pre-submit step.
  useEffect(() => {
    if (!reviewing || !resumeHandled) return;
    const quizSessionId = quizSessionIdRef.current;
    if (!quizSessionId || sentStepsRef.current.has("review")) return;
    sentStepsRef.current.add("review");
    sendQuizStepBeacon({
      stepId: "review",
      stepIndex: filteredSteps.length,
      totalSteps: filteredSteps.length,
      quizSessionId,
      locale
    });
  }, [reviewing, resumeHandled, filteredSteps, locale]);

  useEffect(() => {
    if (!step) return;
    if (idx > total - 1) setIdx(Math.max(0, total - 1));
  }, [idx, step, total]);

  useEffect(() => {
    if (!step) return;
    if (step.type !== "slider") return;
    if (typeof answers[step.id] === "number") return;
    const min = step.min ?? 0;
    const max = step.max ?? 100;
    const defaultValue = step.defaultValue ?? Math.round((min + max) / 2);
    setAnswers((prev) => normalizeQuizAnswers({ ...prev, [step.id]: defaultValue }));
  }, [answers, step]);

  if (!step) {
    return (
      <section className="relative min-h-[100svh] overflow-hidden bg-background px-4 py-6 text-white sm:py-10">
        <div className="mx-auto flex min-h-[50svh] w-full max-w-[640px] items-center justify-center">
          <p className="text-sm text-muted">Loading quiz...</p>
        </div>
      </section>
    );
  }

  const currentAnswer = answers[step.id];
  const canContinue = !step.required || hasAnswer(step, currentAnswer);

  const questionNumber = safeIdx + 1;
  const categoryLabel = step.section || uiCopy.categoryGoal;
  const liveMetrics = (() => {
    try {
      const normalized = normalizeQuizAnswers(answers);
      if (
        typeof normalized.s1_weight !== "number" ||
        typeof normalized.s1_height !== "number" ||
        typeof normalized.s1_age !== "number"
      ) {
        return null;
      }
      return calculateTJAIMetrics(normalized);
    } catch {
      return null;
    }
  })();
  const bmr = liveMetrics?.bmr ?? null;
  const tdee = liveMetrics?.tdee ?? null;
  const targetCalories = liveMetrics?.calorieTarget ?? null;

  const findFirstIncompleteIdx = () =>
    filteredSteps.findIndex((candidate) => candidate.required && !hasAnswer(candidate, answers[candidate.id]));

  const editStep = (stepIdx: number) => {
    setReviewing(false);
    setReturnToReview(true);
    setShowError(false);
    setIdx(stepIdx);
  };

  const submitAll = () => {
    const incompleteIdx = findFirstIncompleteIdx();
    if (incompleteIdx !== -1) {
      editStep(incompleteIdx);
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(QUIZ_PROGRESS_KEY);
    }
    onSubmit(normalizeQuizAnswers(answers));
  };

  const goNext = () => {
    if (!canContinue) {
      setShowError(true);
      setShake(true);
      window.setTimeout(() => setShake(false), 320);
      return;
    }
    setShowError(false);
    if (returnToReview) {
      // Editing from the review screen: surface any newly revealed required
      // follow-up first, otherwise return straight to the summary.
      const incompleteIdx = findFirstIncompleteIdx();
      if (incompleteIdx !== -1) {
        setIdx(incompleteIdx);
        return;
      }
      setReturnToReview(false);
      setReviewing(true);
      return;
    }
    if (idx >= total - 1) {
      setReviewing(true);
      return;
    }
    setIdx((v) => Math.min(total - 1, v + 1));
  };

  const updateAnswer = (value: QuizAnswers[string], autoAdvance = false) => {
    setAnswers((prev) => {
      const next = normalizeQuizAnswers({ ...prev, [step.id]: value });
      onAnswersChange?.(next);
      return next;
    });
    setShowError(false);
    if (autoAdvance) {
      window.setTimeout(() => {
        setIdx((v) => Math.min(total - 1, v + 1));
      }, 400);
    }
  };

  const renderInput = () => {
    if (step.id === "s3_body_silhouette") {
      const currentBody =
        currentAnswer === "very_lean"
          ? "Very Lean"
          : currentAnswer === "lean"
            ? "Lean"
            : currentAnswer === "average"
              ? "Average"
              : currentAnswer === "overweight"
                ? "Overweight"
                : currentAnswer === "obese"
                  ? "Obese"
                  : undefined;
      return (
        <BodySilhouetteSelector
          gender={typeof answers.s1_gender === "string" ? answers.s1_gender : undefined}
          value={currentBody as "Very Lean" | "Lean" | "Average" | "Overweight" | "Obese" | undefined}
          onSelect={(selection) => {
            setAnswers((prev) => {
              const next = {
                ...prev,
                s3_body_silhouette:
                  selection.bodyType === "Very Lean"
                    ? "very_lean"
                    : selection.bodyType === "Lean"
                      ? "lean"
                      : selection.bodyType === "Average"
                        ? "average"
                        : selection.bodyType === "Overweight"
                          ? "overweight"
                          : "obese",
                s3_body_type:
                  selection.bodyType === "Very Lean"
                    ? "very_lean"
                    : selection.bodyType === "Lean"
                      ? "lean"
                      : selection.bodyType === "Average"
                        ? "average"
                        : selection.bodyType === "Overweight"
                          ? "overweight"
                          : "obese",
                s3_estimated_bf: selection.estimatedBF
              };
              onAnswersChange?.(next);
              return next;
            });
            setShowError(false);
            if (!returnToReview) {
              window.setTimeout(() => setIdx((v) => Math.min(total - 1, v + 1)), 500);
            }
          }}
        />
      );
    }

    if (step.type === "single") {
      const singleOptions =
        step.dynamicOptions === "markets_by_country"
          ? getMarketQuizOptions(answers.s20_country)
          : Array.isArray(step.options)
            ? step.options
            : [];
      if (singleOptions.length === 0) {
        return (
          <div className="rounded-[10px] border border-divider bg-surface p-4 text-sm text-muted">
            This question failed to load options. Please tap Continue to move to the next question.
          </div>
        );
      }
      return (
        <div className="grid gap-3">
          {singleOptions.map((option) => {
            const selected = currentAnswer === option.value;
            return (
              <button
                key={`${step.id}-${String(option.value)}`}
                type="button"
                aria-pressed={selected}
                onClick={() => updateAnswer(option.value, idx < total - 1 && !returnToReview)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[10px] border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 ease-out",
                  selected
                    ? "border-accent bg-[rgba(168,85,247,0.08)] text-white"
                    : "border-divider bg-surface text-muted hover:border-[rgba(168,85,247,0.3)] hover:bg-[rgba(168,85,247,0.04)] hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "relative inline-flex h-[18px] w-[18px] shrink-0 rounded-full border-[1.5px]",
                    selected ? "border-accent bg-accent" : "border-current"
                  )}
                >
                  {selected ? <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" /> : null}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      );
    }

    if (step.type === "multi") {
      const selected = Array.isArray(currentAnswer) ? currentAnswer : [];
      const multiOptions = Array.isArray(step.options) ? step.options : [];
      if (multiOptions.length === 0) {
        return (
          <div className="rounded-[10px] border border-divider bg-surface p-4 text-sm text-muted">
            This question failed to load options. Please tap Continue to move to the next question.
          </div>
        );
      }
      const toggle = (optionValue: string) => {
        if (selected.includes(optionValue)) {
          updateAnswer(selected.filter((v) => v !== optionValue));
        } else {
          updateAnswer([...selected, optionValue]);
        }
      };
      return (
        <div className="grid gap-3">
          {multiOptions.map((option) => {
            const optionValue = String(option.value);
            const active = selected.includes(optionValue);
            return (
              <button
                key={`${step.id}-${optionValue}`}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(optionValue)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[10px] border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 ease-out",
                  active
                    ? "border-accent bg-[rgba(168,85,247,0.08)] text-white"
                    : "border-divider bg-surface text-muted hover:border-[rgba(168,85,247,0.3)] hover:bg-[rgba(168,85,247,0.04)] hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px]",
                    active ? "border-accent bg-accent text-[#09090B]" : "border-current"
                  )}
                >
                  {active ? "✓" : ""}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      );
    }

    if (step.type === "number") {
      return (
        <div>
          <div className="mb-4 text-center text-5xl font-extrabold text-accent">
            {typeof currentAnswer === "number" ? currentAnswer : "--"}
          </div>
          <div className="relative">
            <input
              type="number"
              aria-labelledby={`tjai-q-${step.id}`}
              min={step.min}
              max={step.max}
              value={typeof currentAnswer === "number" ? currentAnswer : ""}
              onChange={(event) => updateAnswer(Number(event.target.value))}
              className="w-full rounded-[10px] border border-divider bg-surface px-4 py-3 text-base text-white outline-none transition-all focus:border-accent focus:ring-2 focus:ring-[rgba(168,85,247,0.2)]"
            />
            <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-sm text-dim">{step.unit}</span>
          </div>
        </div>
      );
    }

    if (step.type === "slider") {
      const min = step.min ?? 0;
      const max = step.max ?? 100;
      const value = typeof currentAnswer === "number" ? currentAnswer : min;
      const pct = ((value - min) / Math.max(1, max - min)) * 100;
      const sliderFill = direction === "rtl" ? `linear-gradient(to left,#A855F7 ${pct}%,#1E2028 ${pct}%)` : `linear-gradient(to right,#A855F7 ${pct}%,#1E2028 ${pct}%)`;
      return (
        <div>
          <div className="text-center">
            <div className="text-5xl font-extrabold text-accent">{value}</div>
            <div className="mt-2 text-sm text-muted">{step.unit}</div>
          </div>
          <div className="mt-6">
            <input
              type="range"
              aria-labelledby={`tjai-q-${step.id}`}
              aria-valuetext={`${value}${step.unit ? ` ${step.unit}` : ""}`}
              min={min}
              max={max}
              step={step.step ?? 1}
              value={value}
              onChange={(event) => updateAnswer(Number(event.target.value))}
              className={cn("tjai-slider w-full", direction === "rtl" && "scale-x-[-1]")}
              style={{ background: sliderFill }}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-dim">
              <span>{min}</span>
              <span>{max}</span>
            </div>
          </div>
        </div>
      );
    }

    if (step.type === "scale") {
      const value = typeof currentAnswer === "number" ? currentAnswer : 0;
      return (
        <div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {Array.from({ length: 10 }).map((_, i) => {
              const n = i + 1;
              const active = n <= value;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => updateAnswer(n)}
                  className={cn(
                    "h-10 rounded-full border text-sm transition-all",
                    active ? "border-accent bg-accent text-[#09090B]" : "border-divider text-muted hover:border-accent"
                  )}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-dim">
            <span>{copy.quiz.notAtAll}</span>
            <span>{copy.quiz.extremely}</span>
          </div>
        </div>
      );
    }

    const textValue = typeof currentAnswer === "string" ? currentAnswer : "";
    return (
      <div>
        <textarea
          value={textValue}
          onChange={(event) => updateAnswer(event.target.value)}
          placeholder={step.placeholder}
          className="min-h-[120px] w-full rounded-xl border border-divider bg-surface p-4 text-sm text-white outline-none transition-all placeholder:text-dim focus:border-accent focus:ring-2 focus:ring-[rgba(168,85,247,0.2)]"
        />
        <div className="mt-2 text-right text-xs text-dim">
          {textValue.length} {copy.quiz.chars}
        </div>
      </div>
    );
  };

  const formatAnswerForReview = (reviewStep: QuizStep): string | null => {
    const answer = answers[reviewStep.id];
    const options =
      reviewStep.dynamicOptions === "markets_by_country"
        ? getMarketQuizOptions(answers.s20_country)
        : Array.isArray(reviewStep.options)
          ? reviewStep.options
          : [];
    if (reviewStep.type === "multi") {
      const values = Array.isArray(answer) ? answer : [];
      if (values.length === 0) return null;
      return values
        .map((value) => options.find((option) => String(option.value) === String(value))?.label ?? String(value))
        .join(", ");
    }
    if (reviewStep.type === "single") {
      if (answer == null || answer === "") return null;
      return options.find((option) => String(option.value) === String(answer))?.label ?? String(answer);
    }
    if (typeof answer === "number") {
      return `${answer}${reviewStep.unit ? ` ${reviewStep.unit}` : ""}`;
    }
    if (typeof answer === "string") {
      const trimmed = answer.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    return null;
  };

  if (reviewing) {
    return (
      <section className="relative min-h-[100svh] overflow-hidden bg-background px-4 py-6 text-white sm:py-10">
        <div className="pointer-events-none absolute left-1/2 top-[-160px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent opacity-[0.07] blur-[60px]" />
        <div className="pointer-events-none absolute bottom-[-120px] right-[-80px] h-[400px] w-[400px] rounded-full bg-accent-violet opacity-[0.05] blur-[60px]" />

        <div className="mx-auto flex min-h-[90svh] w-full max-w-[640px] flex-col">
          <div className="pt-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-accent">{extraCopy.reviewEyebrow}</p>
            <div className="h-[2px] overflow-hidden rounded-full bg-divider">
              <div
                className="tjai-progress-fill h-full bg-[linear-gradient(90deg,#A855F7,#7C3AED)]"
                style={{ width: "100%", marginLeft: direction === "rtl" ? "auto" : undefined }}
              />
            </div>
          </div>

          <div className="question-enter mt-8 flex-1">
            <h1 className="text-[clamp(1.375rem,3vw,1.75rem)] font-bold leading-[1.3] text-white">{extraCopy.reviewTitle}</h1>
            <p className="mt-2 text-sm leading-6 text-muted">{extraCopy.reviewSub}</p>
            <div className="mt-7 overflow-hidden rounded-xl border border-divider bg-surface">
              {filteredSteps.map((reviewStep, i) => {
                const formatted = formatAnswerForReview(reviewStep);
                return (
                  <div key={reviewStep.id} className={cn("flex items-start gap-3 px-4 py-3.5", i > 0 && "border-t border-divider")}>
                    <div className="min-w-0 flex-1 text-start">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-dim">{reviewStep.section}</p>
                      <p className="mt-0.5 text-sm font-medium text-white">{reviewStep.question}</p>
                      <p className={cn("mt-1 text-sm", formatted ? "text-accent" : "text-dim")}>
                        {formatted ?? extraCopy.reviewSkipped}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => editStep(i)}
                      aria-label={`${extraCopy.reviewEdit}: ${reviewStep.question}`}
                      className="min-h-9 shrink-0 rounded-full border border-divider px-3 text-xs text-muted transition-colors hover:border-[rgba(168,85,247,0.4)] hover:text-white"
                    >
                      {extraCopy.reviewEdit}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sticky bottom-0 mt-8 border-t border-divider/80 bg-background/90 py-4 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setReviewing(false)}
                className="min-h-11 rounded-full border border-divider px-4 text-sm text-muted transition-colors hover:border-[rgba(255,255,255,0.2)] hover:text-white"
              >
                {extraCopy.reviewBack}
              </button>
              <button
                type="button"
                ref={magneticGenerateRef}
                onClick={submitAll}
                className="tj-cta-sheen min-h-11 rounded-full bg-[linear-gradient(135deg,#A855F7,#7C3AED)] px-5 text-sm font-bold text-[#09090B] shadow-[0_0_24px_rgba(168,85,247,0.25)] transition-transform hover:scale-[1.02] motion-safe:animate-[tjai-pulse_1.8s_ease-in-out_infinite]"
              >
                {copy.nav.generate}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-background px-4 py-6 text-white sm:py-10">
      <div className="pointer-events-none absolute left-1/2 top-[-160px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent opacity-[0.07] blur-[60px]" />
      <div className="pointer-events-none absolute bottom-[-120px] right-[-80px] h-[400px] w-[400px] rounded-full bg-accent-violet opacity-[0.05] blur-[60px]" />

      <div className="mx-auto flex min-h-[90svh] w-full max-w-[640px] flex-col">
        <div className="pt-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-accent">
            {uiCopy.question} {questionNumber} of {total} · {categoryLabel}
          </p>
          <div className="h-[2px] overflow-hidden rounded-full bg-divider">
            <div
              className="tjai-progress-fill h-full bg-[linear-gradient(90deg,#A855F7,#7C3AED)]"
              style={{ width: `${progress}%`, marginLeft: direction === "rtl" ? "auto" : undefined }}
            />
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-accent">
            {copy.nav.sectionOf} {step.sectionNumber} / {step.totalSections} - {step.section}
          </p>
        </div>

        {resumePrompt ? (
          <div className="mt-4 rounded-xl border border-divider bg-surface p-4">
            <p className="text-sm text-white">{uiCopy.resumeTitle} {resumeTargetIdx + 1}.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setAnswers(resumePrompt.answers);
                  setIdx(resumeTargetIdx);
                  setResumePrompt(null);
                }}
                className="tj-cta-sheen rounded-full bg-[linear-gradient(135deg,#A855F7,#7C3AED)] px-4 py-2 text-xs font-semibold text-[#09090B] shadow-[0_0_18px_rgba(168,85,247,0.22)] transition-[transform,box-shadow] duration-200 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(168,85,247,0.35)]"
              >
                {uiCopy.resume}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.localStorage.removeItem(QUIZ_PROGRESS_KEY);
                  }
                  setResumePrompt(null);
                }}
                className="rounded-full border border-divider px-4 py-2 text-xs text-muted"
              >
                {uiCopy.startOver}
              </button>
            </div>
          </div>
        ) : null}

        <aside className="mt-4 rounded-xl border border-[rgba(168,85,247,0.15)] bg-[rgba(168,85,247,0.05)] p-4">
          <p className="text-sm font-semibold text-white">{uiCopy.numbersTitle}</p>
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
            <div className="rounded-lg border border-divider bg-[#0F1116] p-3">
              <p className="text-xs text-muted">{uiCopy.bmr}</p>
              <p className="text-lg font-bold text-accent">{bmr ? Math.round(bmr) : "..."} {bmr ? "kcal" : ""}</p>
            </div>
            <div className="rounded-lg border border-divider bg-[#0F1116] p-3">
              <p className="text-xs text-muted">{uiCopy.tdee}</p>
              <p className="text-lg font-bold text-accent">{tdee ? Math.round(tdee) : "..."} {tdee ? "kcal" : ""}</p>
            </div>
            <div className="rounded-lg border border-divider bg-[#0F1116] p-3">
              <p className="text-xs text-muted">{uiCopy.target}</p>
              <p className="text-lg font-bold text-accent">{targetCalories ?? "..."} {targetCalories ? "kcal" : ""}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">{uiCopy.formula}</p>
        </aside>

        <div
          key={step.id}
          className="question-enter mt-8 flex-1"
        >
          <div className="mb-4 text-[11px] uppercase tracking-[0.2em] text-accent">{step.section}</div>
          <h1 id={`tjai-q-${step.id}`} className="text-[clamp(1.375rem,3vw,1.75rem)] font-bold leading-[1.3] text-white">{step.question}</h1>
          {step.sub ? <p className="mt-2 text-sm leading-6 text-muted">{step.sub}</p> : null}
          <div className="mt-7">{renderInput()}</div>
          {showError && !canContinue ? (
            <p className="mt-3 text-sm text-danger" role="alert" aria-live="assertive">
              {copy.validation.required}
            </p>
          ) : null}
        </div>

        <div className="sticky bottom-0 mt-8 border-t border-divider/80 bg-background/90 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-dim">
              {copy.nav.stepOf} {idx + 1} / {total}
            </span>
            <div className="flex items-center gap-2">
              {safeIdx > 0 ? (
                <button
                  type="button"
                  onClick={() => setIdx((v) => Math.max(0, v - 1))}
                  className="min-h-11 rounded-full border border-divider px-4 text-sm text-muted transition-all hover:border-[rgba(255,255,255,0.2)] hover:text-white"
                >
                  <span className="sm:hidden">{"←"}</span>
                  <span className="hidden sm:inline">{copy.nav.back}</span>
                </button>
              ) : null}
              <button
                type="button"
                ref={safeIdx === total - 1 ? magneticGenerateRef : undefined}
                onClick={goNext}
                disabled={!canContinue}
                className={cn(
                  "tj-cta-sheen min-h-11 rounded-full px-5 text-sm font-bold text-[#09090B] transition-all disabled:cursor-not-allowed disabled:opacity-40",
                  safeIdx === total - 1
                    ? "bg-[linear-gradient(135deg,#A855F7,#7C3AED)] shadow-[0_0_24px_rgba(168,85,247,0.25)] hover:scale-[1.02] motion-safe:animate-[tjai-pulse_1.8s_ease-in-out_infinite]"
                    : "bg-[linear-gradient(135deg,#A855F7,#7C3AED)] hover:scale-[1.02]",
                  shake && "animate-[tjai-shake_300ms_ease]"
                )}
              >
                {returnToReview || safeIdx === total - 1 ? extraCopy.reviewCta : copy.nav.continue}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

