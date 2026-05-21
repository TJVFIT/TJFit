import type { Locale } from "@/lib/i18n";

export type TJAIChatCopy = {
  suggestions: { label: string; prompt: string }[];
  emptyPrompt: string;
  askTitle: string;
  askBody: string;
  memory: string;
  tapToAsk: string;
  refine: string;
  send: string;
  followUps: {
    simplify: string;
    deeper: string;
    nextStep: string;
    protein: string;
    timeCrunch: string;
    deload: string;
  };
  composerHint: string;
  fallbackReply: string;
  connectionLost: string;
  apiErrorRetry: string;
  upgrade: {
    limitTitleHit: string;
    limitTitleExpired: string;
    limitBody: string;
    limitCta: string;
    manualTitle: string;
    manualBody: string;
    manualCta: string;
  };
  trialLeft: (n: number) => string;
  trialRemaining: (n: number, limit: number) => string;
};

const TJAI_CHAT_COPY: Record<Locale, TJAIChatCopy> = {
  en: {
    suggestions: [
      { label: "Plan overview", prompt: "Can you give me an overview of my TJAI plan and explain the main principles?" },
      { label: "Pre-workout fuel", prompt: "What should I eat before my workout, and when should I eat it?" },
      { label: "Missed a session", prompt: "I missed yesterday's workout. What should I do - make it up or skip it?" },
      { label: "Meal swap", prompt: "Can you suggest an alternative for one of my meals? I'll tell you which one." },
      { label: "Knee-friendly options", prompt: "I'm experiencing knee pain. Which exercises should I avoid and what are safe alternatives?" },
      { label: "Break a plateau", prompt: "I've been stuck at the same weight for 2 weeks. What changes should I make to break through?" }
    ],
    emptyPrompt: "Ask about meals, sessions, or your plan...",
    askTitle: "Ask TJAI",
    askBody: "Your coach knows your plan and your logged sessions. Ask with specifics for sharper answers.",
    memory: "Memory",
    tapToAsk: "Tap to ask",
    refine: "Refine",
    send: "Send",
    followUps: {
      simplify: "Simplify",
      deeper: "More detail",
      nextStep: "Next step",
      protein: "Protein",
      timeCrunch: "35 min",
      deload: "Deload"
    },
    composerHint: "Enter to send · Shift + Enter for newline",
    fallbackReply: "TJAI couldn't pick that up — mind asking again?",
    connectionLost: "Lost the connection mid-thought — try again?",
    apiErrorRetry: "Briefly lost connection. Send it again.",
    upgrade: {
      limitTitleHit: "You hit your free messages",
      limitTitleExpired: "Your free trial has ended",
      limitBody:
        "TJAI is still here when you upgrade — unlimited coaching, voice replies, and adaptive weekly plans.",
      limitCta: "Upgrade now",
      manualTitle: "Get unlimited TJAI",
      manualBody:
        "Pro removes the message cap and unlocks voice, swaps, weekly adaptive plans, and coach handoff.",
      manualCta: "See plans"
    },
    trialLeft: (n) => `${n} preview message${n === 1 ? "" : "s"} left — unlock unlimited`,
    trialRemaining: (n, limit) => `${n} of ${limit} preview messages — go unlimited`
  },
  tr: {
    suggestions: [
      { label: "Plan ozeti", prompt: "TJAI planimin genel ozetini ve ana prensiplerini anlatir misin?" },
      { label: "Antrenman oncesi", prompt: "Antrenmandan once ne yemeliyim ve ne zaman yemeliyim?" },
      { label: "Seansi kacirdim", prompt: "Dunku antrenmani kacirdim. Telafi mi etmeliyim yoksa atlamali miyim?" },
      { label: "Ogun degisimi", prompt: "Ogunlerimden biri icin alternatif onerebilir misin? Hangisi oldugunu soyleyecegim." },
      { label: "Diz dostu secenekler", prompt: "Diz agrisi yasiyorum. Hangi egzersizlerden kacinmaliyim ve guvenli alternatifler neler?" },
      { label: "Plateau kir", prompt: "2 haftadir ayni kilodayim. Bunu kirabilmek icin ne degistirmeliyim?" }
    ],
    emptyPrompt: "Ogunler, seanslar veya planin hakkinda sor...",
    askTitle: "TJAI'ye sor",
    askBody: "Kocun planini ve kayitli seanslarini bilir. Daha keskin cevaplar icin net sorular sor.",
    memory: "Hafiza",
    tapToAsk: "Sormak icin dokun",
    refine: "Netlestir",
    send: "Gonder",
    followUps: {
      simplify: "Sadeleştir",
      deeper: "Daha fazla detay",
      nextStep: "Sonraki adım",
      protein: "Protein",
      timeCrunch: "35 dk",
      deload: "Deload"
    },
    composerHint: "Göndermek için Enter · Yeni satır için Shift + Enter",
    fallbackReply: "TJAI bunu tam alamadı — tekrar sorar mısın?",
    connectionLost: "Bağlantı düşünürken koptu — tekrar dener misin?",
    apiErrorRetry: "Bağlantı kısa süre koptu. Tekrar gönder.",
    upgrade: {
      limitTitleHit: "Ücretsiz mesajların bitti",
      limitTitleExpired: "Ücretsiz denemen sona erdi",
      limitBody:
        "Yükselttiğinde TJAI hâlâ burada — sınırsız koçluk, sesli yanıtlar ve uyarlanan haftalık planlar.",
      limitCta: "Şimdi yükselt",
      manualTitle: "Sınırsız TJAI'yi al",
      manualBody:
        "Pro, mesaj sınırını kaldırır; ses, öğün değişimi, haftalık uyarlanan planlar ve koça aktarımı açar.",
      manualCta: "Planları gör"
    },
    trialLeft: (n) => `${n} önizleme mesajı kaldı — sınırsıza geç`,
    trialRemaining: (n, limit) => `${n}/${limit} önizleme mesajı — sınırsıza geç`
  },
  ar: {
    suggestions: [
      { label: "ملخص الخطة", prompt: "هل يمكنك أن تعطيني ملخصاً لخطة TJAI وتشرح المبادئ الأساسية؟" },
      { label: "قبل التمرين", prompt: "ماذا آكل قبل التمرين ومتى آكله؟" },
      { label: "فاتتني حصة", prompt: "فاتني تمرين الأمس. هل أعوضه أم أتجاوزه؟" },
      { label: "بديل وجبة", prompt: "هل يمكنك اقتراح بديل لإحدى وجباتي؟ سأخبرك أي وجبة." },
      { label: "خيارات للركبة", prompt: "أشعر بألم في الركبة. ما التمارين التي أتجنبها وما البدائل الآمنة؟" },
      { label: "كسر الثبات", prompt: "ثبت وزني منذ أسبوعين. ما التغييرات التي تساعدني على التقدم؟" }
    ],
    emptyPrompt: "اسأل عن الوجبات أو الحصص أو خطتك...",
    askTitle: "اسأل TJAI",
    askBody: "مدربك يعرف خطتك وحصصك المسجلة. اسأل بتفاصيل لتحصل على إجابات أدق.",
    memory: "الذاكرة",
    tapToAsk: "اضغط للسؤال",
    refine: "حسّن السؤال",
    send: "إرسال",
    followUps: {
      simplify: "بسّط",
      deeper: "تفاصيل أكثر",
      nextStep: "الخطوة التالية",
      protein: "بروتين",
      timeCrunch: "35 دقيقة",
      deload: "تخفيف الحمل"
    },
    composerHint: "Enter للإرسال · Shift + Enter لسطر جديد",
    fallbackReply: "لم يلتقط TJAI ذلك — هل تسأل مرة أخرى؟",
    connectionLost: "انقطع الاتصال في منتصف الفكرة — حاول مرة أخرى؟",
    apiErrorRetry: "انقطع الاتصال للحظة. أرسلها مرة أخرى.",
    upgrade: {
      limitTitleHit: "انتهت رسائلك المجانية",
      limitTitleExpired: "انتهت فترتك التجريبية المجانية",
      limitBody:
        "TJAI لا يزال معك عند الترقية — تدريب غير محدود، وردود صوتية، وخطط أسبوعية متكيّفة.",
      limitCta: "ترقَّ الآن",
      manualTitle: "احصل على TJAI غير المحدود",
      manualBody:
        "تزيل خطة Pro حد الرسائل وتفتح الصوت وتبديل الوجبات والخطط الأسبوعية المتكيّفة والتحويل إلى مدرب.",
      manualCta: "اعرض الخطط"
    },
    trialLeft: (n) => `بقيت ${n} رسالة معاينة — افتح بلا حدود`,
    trialRemaining: (n, limit) => `${n}/${limit} رسالة معاينة — انتقل لبلا حدود`
  },
  es: {
    suggestions: [
      { label: "Resumen del plan", prompt: "Dame un resumen de mi plan TJAI y explica los principios principales." },
      { label: "Antes de entrenar", prompt: "Que deberia comer antes de entrenar y cuando deberia hacerlo?" },
      { label: "Sesion perdida", prompt: "Me perdi el entrenamiento de ayer. Deberia recuperarlo o saltarlo?" },
      { label: "Cambio de comida", prompt: "Puedes sugerir una alternativa para una de mis comidas? Te dire cual." },
      { label: "Opciones para rodilla", prompt: "Tengo dolor de rodilla. Que ejercicios debo evitar y que alternativas son seguras?" },
      { label: "Romper estancamiento", prompt: "Llevo 2 semanas con el mismo peso. Que cambios hago para avanzar?" }
    ],
    emptyPrompt: "Pregunta sobre comidas, sesiones o tu plan...",
    askTitle: "Pregunta a TJAI",
    askBody: "Tu coach conoce tu plan y tus sesiones registradas. Pregunta con detalles para respuestas mas precisas.",
    memory: "Memoria",
    tapToAsk: "Toca para preguntar",
    refine: "Refinar",
    send: "Enviar",
    followUps: {
      simplify: "Simplificar",
      deeper: "Más detalle",
      nextStep: "Siguiente paso",
      protein: "Proteína",
      timeCrunch: "35 min",
      deload: "Deload"
    },
    composerHint: "Enter para enviar · Shift + Enter para salto de línea",
    fallbackReply: "TJAI no captó eso — ¿lo preguntas de nuevo?",
    connectionLost: "Se perdió la conexión a mitad de la idea — ¿lo intentas de nuevo?",
    apiErrorRetry: "Se perdió la conexión un momento. Envíalo de nuevo.",
    upgrade: {
      limitTitleHit: "Alcanzaste tus mensajes gratis",
      limitTitleExpired: "Tu prueba gratuita ha terminado",
      limitBody:
        "TJAI sigue aquí cuando mejoras tu plan — coaching ilimitado, respuestas de voz y planes semanales adaptativos.",
      limitCta: "Mejorar ahora",
      manualTitle: "Consigue TJAI ilimitado",
      manualBody:
        "Pro elimina el límite de mensajes y desbloquea voz, cambios de comidas, planes semanales adaptativos y traspaso a un coach.",
      manualCta: "Ver planes"
    },
    trialLeft: (n) => `Queda ${n} mensaje de vista previa — desbloquea ilimitado`,
    trialRemaining: (n, limit) => `${n}/${limit} mensajes de vista previa — hazlo ilimitado`
  },
  fr: {
    suggestions: [
      { label: "Resume du plan", prompt: "Peux-tu me donner un resume de mon plan TJAI et expliquer les principes principaux ?" },
      { label: "Avant entrainement", prompt: "Que dois-je manger avant mon entrainement, et quand ?" },
      { label: "Seance manquee", prompt: "J'ai manque l'entrainement d'hier. Dois-je le rattraper ou le sauter ?" },
      { label: "Remplacer un repas", prompt: "Peux-tu proposer une alternative pour l'un de mes repas ? Je te dirai lequel." },
      { label: "Options genou", prompt: "J'ai mal au genou. Quels exercices eviter et quelles alternatives sont sures ?" },
      { label: "Casser un plateau", prompt: "Je stagne au meme poids depuis 2 semaines. Quels changements faire ?" }
    ],
    emptyPrompt: "Pose une question sur tes repas, seances ou ton plan...",
    askTitle: "Demander a TJAI",
    askBody: "Ton coach connait ton plan et tes seances enregistrees. Donne des details pour des reponses plus nettes.",
    memory: "Memoire",
    tapToAsk: "Appuyer pour demander",
    refine: "Affiner",
    send: "Envoyer",
    followUps: {
      simplify: "Simplifier",
      deeper: "Plus de détail",
      nextStep: "Étape suivante",
      protein: "Protéines",
      timeCrunch: "35 min",
      deload: "Deload"
    },
    composerHint: "Entrée pour envoyer · Maj + Entrée pour un saut de ligne",
    fallbackReply: "TJAI n'a pas bien saisi — peux-tu redemander ?",
    connectionLost: "Connexion perdue en pleine réflexion — réessayer ?",
    apiErrorRetry: "Connexion brièvement perdue. Renvoie-le.",
    upgrade: {
      limitTitleHit: "Tu as atteint tes messages gratuits",
      limitTitleExpired: "Ton essai gratuit est terminé",
      limitBody:
        "TJAI reste là quand tu passes à la version supérieure — coaching illimité, réponses vocales et plans hebdomadaires adaptatifs.",
      limitCta: "Mettre à niveau",
      manualTitle: "Obtiens TJAI illimité",
      manualBody:
        "Pro supprime la limite de messages et débloque la voix, les échanges de repas, les plans hebdomadaires adaptatifs et le relais vers un coach.",
      manualCta: "Voir les offres"
    },
    trialLeft: (n) => `Il reste ${n} message d'aperçu — débloque l'illimité`,
    trialRemaining: (n, limit) => `${n}/${limit} messages d'aperçu — passe à l'illimité`
  }
};

export function getTJAIChatCopy(locale: Locale): TJAIChatCopy {
  return TJAI_CHAT_COPY[locale] ?? TJAI_CHAT_COPY.en;
}
