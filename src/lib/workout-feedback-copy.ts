import type { Locale } from "@/lib/i18n";

export type WorkoutFeedbackRating = "too_easy" | "right" | "too_hard";

export type WorkoutFeedbackCopy = {
  prompt: string;
  options: Record<WorkoutFeedbackRating, { label: string }>;
  thanks: string;
  retry: string;
};

const workoutFeedbackCopy: Record<Locale, WorkoutFeedbackCopy> = {
  en: {
    prompt: "How was that?",
    options: {
      too_easy: { label: "Too easy" },
      right: { label: "Just right" },
      too_hard: { label: "Too hard" }
    },
    thanks: "Logged — TJAI will use this to adapt your next week.",
    retry: "Couldn't save that. Tap a rating again?"
  },
  tr: {
    prompt: "Nasıldı?",
    options: {
      too_easy: { label: "Çok kolay" },
      right: { label: "Tam yerinde" },
      too_hard: { label: "Çok zor" }
    },
    thanks: "Kaydedildi — TJAI bunu önümüzdeki haftayı uyarlamak için kullanacak.",
    retry: "Kaydedilemedi. Tekrar bir değerlendirme seç?"
  },
  ar: {
    prompt: "كيف كانت؟",
    options: {
      too_easy: { label: "سهلة جداً" },
      right: { label: "مناسبة" },
      too_hard: { label: "صعبة جداً" }
    },
    thanks: "تم الحفظ — سيستخدم TJAI ذلك لتكييف أسبوعك القادم.",
    retry: "تعذر الحفظ. اضغط على تقييم مرة أخرى؟"
  },
  es: {
    prompt: "¿Cómo fue?",
    options: {
      too_easy: { label: "Muy fácil" },
      right: { label: "Justo" },
      too_hard: { label: "Muy duro" }
    },
    thanks: "Guardado — TJAI lo usará para adaptar tu próxima semana.",
    retry: "No se pudo guardar. ¿Toca un rating de nuevo?"
  },
  fr: {
    prompt: "C'était comment ?",
    options: {
      too_easy: { label: "Trop facile" },
      right: { label: "Pile poil" },
      too_hard: { label: "Trop dur" }
    },
    thanks: "Enregistré — TJAI s'en servira pour adapter ta prochaine semaine.",
    retry: "Impossible d'enregistrer. Re-tape un rating ?"
  }
};


export function getWorkoutFeedbackCopy(locale: Locale): WorkoutFeedbackCopy {
  return workoutFeedbackCopy[locale] ?? workoutFeedbackCopy.en;
}
