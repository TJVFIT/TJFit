import type { Locale } from "@/lib/i18n";

type ProgressCopy = {
  title: string;
  subtitle: string;
  metrics: string;
  workouts: string;
  milestones: string;
  noData: string;
  save: string;
  add: string;
  complete: string;
};

type MessagesCopy = {
  title: string;
  subtitle: string;
  noConversations: string;
  startCall: string;
  startVideoCall: string;
  send: string;
  encrypted: string;
};

const progressCopy: Record<Locale, ProgressCopy> = {
  en: {
    title: "Progress",
    subtitle: "Track your body metrics, workout logs, and milestones.",
    metrics: "Body metrics",
    workouts: "Workout logs",
    milestones: "Milestones",
    noData: "No data yet.",
    save: "Save",
    add: "Add",
    complete: "Complete"
  },
  tr: {
    title: "Ilerleme",
    subtitle: "Vucut metriklerini, antrenman kayitlarini ve hedeflerini takip et.",
    metrics: "Vucut metrikleri",
    workouts: "Antrenman kayitlari",
    milestones: "Hedefler",
    noData: "Henuz veri yok.",
    save: "Kaydet",
    add: "Ekle",
    complete: "Tamamla"
  },
  ar: {
    title: "التقدم",
    subtitle: "تابع مقاييس الجسم وسجل التمارين والأهداف.",
    metrics: "مقاييس الجسم",
    workouts: "سجل التمارين",
    milestones: "الأهداف",
    noData: "لا توجد بيانات بعد.",
    save: "حفظ",
    add: "إضافة",
    complete: "إكمال"
  },
  es: {
    title: "Progreso",
    subtitle: "Sigue tus metricas corporales, entrenamientos y metas.",
    metrics: "Metricas corporales",
    workouts: "Registro de entrenos",
    milestones: "Metas",
    noData: "Aun no hay datos.",
    save: "Guardar",
    add: "Agregar",
    complete: "Completar"
  },
  fr: {
    title: "Progression",
    subtitle: "Suivez vos mesures corporelles, entrainements et objectifs.",
    metrics: "Mesures corporelles",
    workouts: "Journal d'entrainement",
    milestones: "Objectifs",
    noData: "Pas encore de donnees.",
    save: "Enregistrer",
    add: "Ajouter",
    complete: "Terminer"
  }
};

const messagesCopy: Record<Locale, MessagesCopy> = {
  en: {
    title: "Messages",
    subtitle: "Private encrypted coach-student chat.",
    noConversations: "No conversations yet.",
    startCall: "Call",
    startVideoCall: "Video call",
    send: "Send",
    encrypted: "End-to-end encrypted"
  },
  tr: {
    title: "Mesajlar",
    subtitle: "Ozel sifreli koç-ogrenci sohbeti.",
    noConversations: "Henuz sohbet yok.",
    startCall: "Ara",
    startVideoCall: "Goruntulu ara",
    send: "Gonder",
    encrypted: "Uctan uca sifreli"
  },
  ar: {
    title: "الرسائل",
    subtitle: "محادثة خاصة مشفرة بين المدرب والطالب.",
    noConversations: "لا توجد محادثات بعد.",
    startCall: "اتصال",
    startVideoCall: "مكالمة فيديو",
    send: "إرسال",
    encrypted: "تشفير طرف إلى طرف"
  },
  es: {
    title: "Mensajes",
    subtitle: "Chat privado cifrado entre coach y estudiante.",
    noConversations: "Aun no hay conversaciones.",
    startCall: "Llamar",
    startVideoCall: "Videollamada",
    send: "Enviar",
    encrypted: "Cifrado de extremo a extremo"
  },
  fr: {
    title: "Messages",
    subtitle: "Chat prive chiffre entre coach et eleve.",
    noConversations: "Aucune conversation pour le moment.",
    startCall: "Appeler",
    startVideoCall: "Appel video",
    send: "Envoyer",
    encrypted: "Chiffre de bout en bout"
  }
};

export function getProgressCopy(locale: Locale) {
  return progressCopy[locale];
}

export function getMessagesCopy(locale: Locale) {
  return messagesCopy[locale];
}

