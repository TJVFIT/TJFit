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
  weightPlaceholder: string;
  bodyFatPlaceholder: string;
  exercisePlaceholder: string;
  milestonePlaceholder: string;
  done: string;
};

type MessagesCopy = {
  title: string;
  subtitle: string;
  noConversations: string;
  startCall: string;
  startVideoCall: string;
  send: string;
  encrypted: string;
  loadError: string;
  decryptError: string;
  sendError: string;
  signAttachmentError: string;
  uploadAttachmentError: string;
  postAttachmentError: string;
  sendFileError: string;
  startCallError: string;
  encryptedMessage: string;
  chatLocked: string;
  startSecureChat: string;
  createPrivateThread: string;
  participantPlaceholder: string;
  openChat: string;
  create: string;
  chatUnavailable: string;
  endCall: string;
  linkButton: string;
  fileButton: string;
  linkPlaceholder: string;
  missingPublicKeys: string;
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
    complete: "Complete",
    weightPlaceholder: "Weight (kg)",
    bodyFatPlaceholder: "Body fat (%)",
    exercisePlaceholder: "Exercise",
    milestonePlaceholder: "Milestone",
    done: "Done"
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
    complete: "Tamamla",
    weightPlaceholder: "Kilo (kg)",
    bodyFatPlaceholder: "Yag orani (%)",
    exercisePlaceholder: "Egzersiz",
    milestonePlaceholder: "Hedef",
    done: "Tamamlandi"
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
    complete: "إكمال",
    weightPlaceholder: "الوزن (كغ)",
    bodyFatPlaceholder: "نسبة الدهون (%)",
    exercisePlaceholder: "التمرين",
    milestonePlaceholder: "الهدف",
    done: "تم"
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
    complete: "Completar",
    weightPlaceholder: "Peso (kg)",
    bodyFatPlaceholder: "Grasa corporal (%)",
    exercisePlaceholder: "Ejercicio",
    milestonePlaceholder: "Meta",
    done: "Hecho"
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
    complete: "Terminer",
    weightPlaceholder: "Poids (kg)",
    bodyFatPlaceholder: "Graisse corporelle (%)",
    exercisePlaceholder: "Exercice",
    milestonePlaceholder: "Objectif",
    done: "Termine"
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
    encrypted: "End-to-end encrypted",
    loadError: "Unable to load messages.",
    decryptError: "Unable to decrypt conversation.",
    sendError: "Unable to send message.",
    signAttachmentError: "Unable to sign attachment upload.",
    uploadAttachmentError: "Attachment upload failed.",
    postAttachmentError: "Unable to post attachment message.",
    sendFileError: "Unable to send file.",
    startCallError: "Unable to start call.",
    encryptedMessage: "Encrypted message",
    chatLocked: "Chat unlocks after you are assigned to a coach and the coach service is paid.",
    startSecureChat: "Start secure chat with your coach",
    createPrivateThread: "Create private thread by participant user ID",
    participantPlaceholder: "participant user id",
    openChat: "Open Chat",
    create: "Create",
    chatUnavailable: "Chat is not available on this account yet.",
    endCall: "End",
    linkButton: "Link",
    fileButton: "File",
    linkPlaceholder: "https://...",
    missingPublicKeys: "Public keys are missing for one of the users."
  },
  tr: {
    title: "Mesajlar",
    subtitle: "Ozel sifreli koç-ogrenci sohbeti.",
    noConversations: "Henuz sohbet yok.",
    startCall: "Ara",
    startVideoCall: "Goruntulu ara",
    send: "Gonder",
    encrypted: "Uctan uca sifreli",
    loadError: "Mesajlar yuklenemedi.",
    decryptError: "Sohbet cozulmedi.",
    sendError: "Mesaj gonderilemedi.",
    signAttachmentError: "Ek yukleme imzasi alinamadi.",
    uploadAttachmentError: "Ek yuklemesi basarisiz.",
    postAttachmentError: "Ek mesaji gonderilemedi.",
    sendFileError: "Dosya gonderilemedi.",
    startCallError: "Arama baslatilamadi.",
    encryptedMessage: "Sifreli mesaj",
    chatLocked: "Sohbet, bir koça atanip koçluk hizmeti odendikten sonra acilir.",
    startSecureChat: "Koçunla guvenli sohbet baslat",
    createPrivateThread: "Katilimci kullanici ID'si ile ozel sohbet olustur",
    participantPlaceholder: "katilimci kullanici id",
    openChat: "Sohbeti Ac",
    create: "Olustur",
    chatUnavailable: "Bu hesapta sohbet henuz kullanilamiyor.",
    endCall: "Bitir",
    linkButton: "Baglanti",
    fileButton: "Dosya",
    linkPlaceholder: "https://...",
    missingPublicKeys: "Kullanicilardan biri icin ortak anahtar eksik."
  },
  ar: {
    title: "الرسائل",
    subtitle: "محادثة خاصة مشفرة بين المدرب والطالب.",
    noConversations: "لا توجد محادثات بعد.",
    startCall: "اتصال",
    startVideoCall: "مكالمة فيديو",
    send: "إرسال",
    encrypted: "تشفير طرف إلى طرف",
    loadError: "تعذر تحميل الرسائل.",
    decryptError: "تعذر فك تشفير المحادثة.",
    sendError: "تعذر ارسال الرسالة.",
    signAttachmentError: "تعذر توقيع رفع المرفق.",
    uploadAttachmentError: "فشل رفع المرفق.",
    postAttachmentError: "تعذر ارسال رسالة المرفق.",
    sendFileError: "تعذر ارسال الملف.",
    startCallError: "تعذر بدء الاتصال.",
    encryptedMessage: "رسالة مشفرة",
    chatLocked: "يتم فتح المحادثة بعد ربطك بمدرب ودفع خدمة التدريب.",
    startSecureChat: "ابدأ محادثة آمنة مع مدربك",
    createPrivateThread: "انشئ محادثة خاصة عبر معرف المستخدم",
    participantPlaceholder: "معرف المستخدم",
    openChat: "فتح المحادثة",
    create: "انشاء",
    chatUnavailable: "المحادثة غير متاحة لهذا الحساب بعد.",
    endCall: "انهاء",
    linkButton: "رابط",
    fileButton: "ملف",
    linkPlaceholder: "https://...",
    missingPublicKeys: "المفاتيح العامة مفقودة لاحد المستخدمين."
  },
  es: {
    title: "Mensajes",
    subtitle: "Chat privado cifrado entre coach y estudiante.",
    noConversations: "Aun no hay conversaciones.",
    startCall: "Llamar",
    startVideoCall: "Videollamada",
    send: "Enviar",
    encrypted: "Cifrado de extremo a extremo",
    loadError: "No se pudieron cargar los mensajes.",
    decryptError: "No se pudo descifrar la conversacion.",
    sendError: "No se pudo enviar el mensaje.",
    signAttachmentError: "No se pudo firmar la subida del archivo.",
    uploadAttachmentError: "La subida del archivo fallo.",
    postAttachmentError: "No se pudo publicar el mensaje con archivo.",
    sendFileError: "No se pudo enviar el archivo.",
    startCallError: "No se pudo iniciar la llamada.",
    encryptedMessage: "Mensaje cifrado",
    chatLocked: "El chat se desbloquea cuando se te asigna un coach y se paga el servicio.",
    startSecureChat: "Inicia chat seguro con tu coach",
    createPrivateThread: "Crea un hilo privado con el ID del participante",
    participantPlaceholder: "id del usuario participante",
    openChat: "Abrir chat",
    create: "Crear",
    chatUnavailable: "El chat aun no esta disponible para esta cuenta.",
    endCall: "Finalizar",
    linkButton: "Enlace",
    fileButton: "Archivo",
    linkPlaceholder: "https://...",
    missingPublicKeys: "Faltan claves publicas para uno de los usuarios."
  },
  fr: {
    title: "Messages",
    subtitle: "Chat prive chiffre entre coach et eleve.",
    noConversations: "Aucune conversation pour le moment.",
    startCall: "Appeler",
    startVideoCall: "Appel video",
    send: "Envoyer",
    encrypted: "Chiffre de bout en bout",
    loadError: "Impossible de charger les messages.",
    decryptError: "Impossible de dechiffrer la conversation.",
    sendError: "Impossible d'envoyer le message.",
    signAttachmentError: "Impossible de signer l'envoi du fichier.",
    uploadAttachmentError: "Le televersement du fichier a echoue.",
    postAttachmentError: "Impossible d'envoyer le message avec fichier.",
    sendFileError: "Impossible d'envoyer le fichier.",
    startCallError: "Impossible de demarrer l'appel.",
    encryptedMessage: "Message chiffre",
    chatLocked: "Le chat se debloque quand un coach vous est assigne et que le service est paye.",
    startSecureChat: "Demarrer un chat securise avec votre coach",
    createPrivateThread: "Creer un fil prive avec l'identifiant du participant",
    participantPlaceholder: "identifiant utilisateur du participant",
    openChat: "Ouvrir le chat",
    create: "Creer",
    chatUnavailable: "Le chat n'est pas encore disponible pour ce compte.",
    endCall: "Terminer",
    linkButton: "Lien",
    fileButton: "Fichier",
    linkPlaceholder: "https://...",
    missingPublicKeys: "Les cles publiques manquent pour un des utilisateurs."
  }
};

export function getProgressCopy(locale: Locale) {
  return progressCopy[locale];
}

export function getMessagesCopy(locale: Locale) {
  return messagesCopy[locale];
}

