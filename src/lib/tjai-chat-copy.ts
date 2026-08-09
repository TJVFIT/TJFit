import type { Locale } from "@/lib/i18n";

export type TJAIChatCopy = {
  suggestions: { label: string; prompt: string }[];
  emptyPrompt: string;
  askTitle: string;
  askBody: string;
  memory: string;
  online: string;
  copyLabel: string;
  tapToAsk: string;
  refine: string;
  send: string;
  stop: string;
  retry: string;
  jumpToLatest: string;
  followUps: {
    simplify: string;
    deeper: string;
    nextStep: string;
    protein: string;
    timeCrunch: string;
    deload: string;
  };
  ongoing: {
    nutrition: string[];
    training: string[];
  };
  /**
   * Data-driven chips, keyed by CoachSuggestionKey from the chat route's
   * `done` event. Chip text is also the prompt sent when tapped (user voice),
   * matching how `ongoing` chips behave.
   */
  contextual: {
    generate_plan: string;
    restart_training: string;
    diagnose_progress: string;
    plan_checkin: string;
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
  /**
   * Strings used only by the standalone chat surface (TJAIChatStandalone):
   * conversation sidebar, voice input, greeting, trial footer, source chips.
   * The standalone component reuses the shared keys above for everything
   * else — it must not fork its own copy of them.
   */
  standalone: {
    newChat: string;
    fallbackConversation: string;
    chatFailed: string;
    errorGeneric: string;
    errorTimeout: string;
    voiceUnsupported: string;
    voiceInput: string;
    voiceUnsupportedInline: string;
    askPlaceholder: string;
    listening: string;
    voice: string;
    coreRemaining: string;
    proUnlocked: string;
    apexUnlimited: string;
    trialUsed: string;
    trialSub: string;
    upgradeCta: string;
    close: string;
    starter: string;
    tryLabel: string;
    quickPrompts: string[];
    sources: {
      plan: string;
      grocery: string;
      swap: string;
      progress: string;
      bundle: string;
    };
    greeting: string;
    greetingSub: string;
    recent: string;
    conversationsLabel: string;
    disclaimer: string;
  };
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
    online: "Online",
    copyLabel: "Copy",
    tapToAsk: "Tap to ask",
    refine: "Refine",
    send: "Send",
    stop: "Stop",
    retry: "Retry",
    jumpToLatest: "Jump to latest",
    followUps: {
      simplify: "Simplify",
      deeper: "More detail",
      nextStep: "Next step",
      protein: "Protein",
      timeCrunch: "35 min",
      deload: "Deload"
    },
    ongoing: {
      nutrition: ["Turn this into a grocery list", "Fit this to my calories"],
      training: ["Plan my next session", "Add progression for next week"]
    },
    contextual: {
      generate_plan: "What plan should I start with for my goal?",
      restart_training: "I haven't trained this week — give me a session to restart today.",
      diagnose_progress: "My weight trend doesn't match my plan — diagnose why.",
      plan_checkin: "Review my recent workouts and tell me what to adjust next week."
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
    trialRemaining: (n, limit) => `${n} of ${limit} preview messages — go unlimited`,
    standalone: {
      newChat: "New Chat",
      fallbackConversation: "New chat",
      chatFailed: "I could not respond right now. Please try again.",
      errorGeneric: "TJAI is having trouble. Please try again.",
      errorTimeout: "TJAI request timed out. Please try again.",
      voiceUnsupported: "Voice not supported in this browser",
      voiceInput: "Voice input",
      voiceUnsupportedInline: "Voice input is not supported in this browser.",
      askPlaceholder: "Ask TJAI...",
      listening: "Listening...",
      voice: "Voice",
      coreRemaining: "messages remaining",
      proUnlocked: "Unlimited TJAI chat",
      apexUnlimited: "Unlimited chat",
      trialUsed: "You've reached your TJAI chat preview limit",
      trialSub: "Upgrade to Pro or Apex for unlimited coaching conversations.",
      upgradeCta: "Upgrade membership",
      close: "Close",
      starter: "Starter",
      tryLabel: "Try",
      quickPrompts: [
        "Swap chicken for fish",
        "Deload this week",
        "Cut 200 kcal",
        "Add a 20-min finisher"
      ],
      sources: {
        plan: "Open My Plan",
        grocery: "Grocery list",
        swap: "Meal Swap",
        progress: "Progress",
        bundle: "View bundle"
      },
      greeting: "How can I coach you today?",
      greetingSub: "Training, nutrition, recovery — ask anything.",
      recent: "Recent",
      conversationsLabel: "Chats",
      disclaimer: "TJAI can make mistakes — check key details."
    }
  },
  tr: {
    suggestions: [
      { label: "Plan özeti", prompt: "TJAI planımın genel özetini ve ana prensiplerini anlatır mısın?" },
      { label: "Antrenman öncesi", prompt: "Antrenmandan önce ne yemeliyim ve ne zaman yemeliyim?" },
      { label: "Seansı kaçırdım", prompt: "Dünkü antrenmanı kaçırdım. Telafi mi etmeliyim yoksa atlamalı mıyım?" },
      { label: "Öğün değişimi", prompt: "Öğünlerimden biri için alternatif önerebilir misin? Hangisi olduğunu söyleyeceğim." },
      { label: "Diz dostu seçenekler", prompt: "Diz ağrısı yaşıyorum. Hangi egzersizlerden kaçınmalıyım ve güvenli alternatifler neler?" },
      { label: "Plateau kır", prompt: "2 haftadır aynı kilodayım. Bunu kırabilmek için ne değiştirmeliyim?" }
    ],
    emptyPrompt: "Öğünler, seanslar veya planın hakkında sor...",
    askTitle: "TJAI'ye sor",
    askBody: "Koçun planını ve kayıtlı seanslarını bilir. Daha keskin cevaplar için net sorular sor.",
    memory: "Hafıza",
    online: "Çevrimiçi",
    copyLabel: "Kopyala",
    tapToAsk: "Sormak için dokun",
    refine: "Netleştir",
    send: "Gönder",
    stop: "Durdur",
    retry: "Tekrar dene",
    jumpToLatest: "En sona git",
    followUps: {
      simplify: "Sadeleştir",
      deeper: "Daha fazla detay",
      nextStep: "Sonraki adım",
      protein: "Protein",
      timeCrunch: "35 dk",
      deload: "Deload"
    },
    ongoing: {
      nutrition: ["Bunu alışveriş listesine çevir", "Bunu kalorilerime uyarla"],
      training: ["Sonraki seansımı planla", "Gelecek hafta için ilerleme ekle"]
    },
    contextual: {
      generate_plan: "Hedefime göre hangi planla başlamalıyım?",
      restart_training: "Bu hafta antrenman yapmadım — bugün yeniden başlamak için bir seans ver.",
      diagnose_progress: "Kilo eğilimim planımla uyuşmuyor — nedenini analiz et.",
      plan_checkin: "Son antrenmanlarımı incele ve gelecek hafta neyi değiştireceğimi söyle."
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
    trialRemaining: (n, limit) => `${n}/${limit} önizleme mesajı — sınırsıza geç`,
    standalone: {
      newChat: "Yeni sohbet",
      fallbackConversation: "Yeni sohbet",
      chatFailed: "Şu anda yanıt veremedim. Lütfen tekrar dene.",
      errorGeneric: "TJAI'de bir sorun var. Lütfen tekrar dene.",
      errorTimeout: "TJAI isteği zaman aşımına uğradı. Lütfen tekrar dene.",
      voiceUnsupported: "Bu tarayıcıda sesli giriş desteklenmiyor",
      voiceInput: "Sesli giriş",
      voiceUnsupportedInline: "Bu tarayıcıda sesli giriş desteklenmiyor.",
      askPlaceholder: "TJAI'ye sor...",
      listening: "Dinleniyor...",
      voice: "Ses",
      coreRemaining: "mesaj kaldı",
      proUnlocked: "Sınırsız TJAI sohbeti",
      apexUnlimited: "Sınırsız sohbet",
      trialUsed: "TJAI sohbet önizleme sınırına ulaştın",
      trialSub: "Sınırsız koçluk sohbetleri için Pro veya Apex'e yükselt.",
      upgradeCta: "Üyeliği yükselt",
      close: "Kapat",
      starter: "Başlangıç",
      tryLabel: "Dene",
      quickPrompts: [
        "Tavuğu balıkla değiştir",
        "Bu hafta deload yap",
        "200 kcal azalt",
        "20 dakikalık bitirici ekle"
      ],
      sources: {
        plan: "Planımı aç",
        grocery: "Alışveriş listesi",
        swap: "Öğün değiştir",
        progress: "İlerleme",
        bundle: "Paketi gör"
      },
      greeting: "Bugün sana nasıl koçluk edeyim?",
      greetingSub: "Antrenman, beslenme, toparlanma — ne istersen sor.",
      recent: "Son sohbetler",
      conversationsLabel: "Sohbetler",
      disclaimer: "TJAI hata yapabilir — önemli bilgileri doğrula."
    }
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
    online: "متصل",
    copyLabel: "نسخ",
    tapToAsk: "اضغط للسؤال",
    refine: "حسّن السؤال",
    send: "إرسال",
    stop: "إيقاف",
    retry: "إعادة المحاولة",
    jumpToLatest: "الانتقال إلى الأحدث",
    followUps: {
      simplify: "بسّط",
      deeper: "تفاصيل أكثر",
      nextStep: "الخطوة التالية",
      protein: "بروتين",
      timeCrunch: "35 دقيقة",
      deload: "تخفيف الحمل"
    },
    ongoing: {
      nutrition: ["حوّل هذا إلى قائمة تسوق", "وافق هذا مع سعراتي"],
      training: ["خطط لحصتي القادمة", "أضف تدرجاً للأسبوع القادم"]
    },
    contextual: {
      generate_plan: "بأي خطة أبدأ بما يناسب هدفي؟",
      restart_training: "لم أتدرب هذا الأسبوع — أعطني جلسة أستأنف بها اليوم.",
      diagnose_progress: "اتجاه وزني لا يطابق خطتي — حلّل السبب.",
      plan_checkin: "راجع تماريني الأخيرة وأخبرني بما أعدّله الأسبوع القادم."
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
    trialRemaining: (n, limit) => `${n}/${limit} رسالة معاينة — انتقل لبلا حدود`,
    standalone: {
      newChat: "محادثة جديدة",
      fallbackConversation: "محادثة جديدة",
      chatFailed: "تعذر الرد الآن. حاول مرة أخرى.",
      errorGeneric: "يواجه TJAI مشكلة. حاول مرة أخرى.",
      errorTimeout: "انتهت مهلة طلب TJAI. حاول مرة أخرى.",
      voiceUnsupported: "الإدخال الصوتي غير مدعوم في هذا المتصفح",
      voiceInput: "إدخال صوتي",
      voiceUnsupportedInline: "الإدخال الصوتي غير مدعوم في هذا المتصفح.",
      askPlaceholder: "اسأل TJAI...",
      listening: "جاري الاستماع...",
      voice: "صوت",
      coreRemaining: "رسائل متبقية",
      proUnlocked: "دردشة TJAI غير محدودة",
      apexUnlimited: "دردشة غير محدودة",
      trialUsed: "لقد وصلت إلى حد معاينة دردشة TJAI",
      trialSub: "قم بالترقية إلى Pro أو Apex لمحادثات تدريب غير محدودة.",
      upgradeCta: "ترقية العضوية",
      close: "إغلاق",
      starter: "بداية",
      tryLabel: "جرّب",
      quickPrompts: [
        "بدّل الدجاج بالسمك",
        "خفّف الحمل هذا الأسبوع",
        "قلّل 200 سعرة",
        "أضف تمريناً ختامياً 20 دقيقة"
      ],
      sources: {
        plan: "افتح خطتي",
        grocery: "قائمة التسوق",
        swap: "تبديل الوجبة",
        progress: "التقدم",
        bundle: "عرض الباقة"
      },
      greeting: "كيف أدرّبك اليوم؟",
      greetingSub: "تدريب، تغذية، تعافٍ — اسأل عن أي شيء.",
      recent: "الأخيرة",
      conversationsLabel: "المحادثات",
      disclaimer: "قد يخطئ TJAI — تحقق من التفاصيل المهمة."
    }
  },
  es: {
    suggestions: [
      { label: "Resumen del plan", prompt: "Dame un resumen de mi plan TJAI y explica los principios principales." },
      { label: "Antes de entrenar", prompt: "¿Qué debería comer antes de entrenar y cuándo debería hacerlo?" },
      { label: "Sesión perdida", prompt: "Me perdí el entrenamiento de ayer. ¿Debería recuperarlo o saltarlo?" },
      { label: "Cambio de comida", prompt: "¿Puedes sugerir una alternativa para una de mis comidas? Te diré cuál." },
      { label: "Opciones para rodilla", prompt: "Tengo dolor de rodilla. ¿Qué ejercicios debo evitar y qué alternativas son seguras?" },
      { label: "Romper estancamiento", prompt: "Llevo 2 semanas con el mismo peso. ¿Qué cambios hago para avanzar?" }
    ],
    emptyPrompt: "Pregunta sobre comidas, sesiones o tu plan...",
    askTitle: "Pregunta a TJAI",
    askBody: "Tu coach conoce tu plan y tus sesiones registradas. Pregunta con detalles para respuestas más precisas.",
    memory: "Memoria",
    online: "En línea",
    copyLabel: "Copiar",
    tapToAsk: "Toca para preguntar",
    refine: "Refinar",
    send: "Enviar",
    stop: "Detener",
    retry: "Reintentar",
    jumpToLatest: "Ir a lo más reciente",
    followUps: {
      simplify: "Simplificar",
      deeper: "Más detalle",
      nextStep: "Siguiente paso",
      protein: "Proteína",
      timeCrunch: "35 min",
      deload: "Deload"
    },
    ongoing: {
      nutrition: ["Convierte esto en lista de la compra", "Ajusta esto a mis calorías"],
      training: ["Planifica mi próxima sesión", "Añade progresión para la próxima semana"]
    },
    contextual: {
      generate_plan: "¿Con qué plan debería empezar según mi objetivo?",
      restart_training: "No he entrenado esta semana — dame una sesión para retomar hoy.",
      diagnose_progress: "Mi tendencia de peso no coincide con mi plan — diagnostica por qué.",
      plan_checkin: "Revisa mis últimos entrenamientos y dime qué ajustar la próxima semana."
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
    trialRemaining: (n, limit) => `${n}/${limit} mensajes de vista previa — hazlo ilimitado`,
    standalone: {
      newChat: "Nuevo chat",
      fallbackConversation: "Nuevo chat",
      chatFailed: "No pude responder ahora mismo. Inténtalo de nuevo.",
      errorGeneric: "TJAI tiene problemas. Inténtalo de nuevo.",
      errorTimeout: "La solicitud de TJAI agotó el tiempo. Inténtalo de nuevo.",
      voiceUnsupported: "La entrada de voz no es compatible con este navegador",
      voiceInput: "Entrada de voz",
      voiceUnsupportedInline: "La entrada de voz no es compatible con este navegador.",
      askPlaceholder: "Pregunta a TJAI...",
      listening: "Escuchando...",
      voice: "Voz",
      coreRemaining: "mensajes restantes",
      proUnlocked: "Chat TJAI ilimitado",
      apexUnlimited: "Chat ilimitado",
      trialUsed: "Has alcanzado el límite de vista previa del chat TJAI",
      trialSub: "Mejora a Pro o Apex para conversaciones de coaching ilimitadas.",
      upgradeCta: "Mejorar membresía",
      close: "Cerrar",
      starter: "Inicio",
      tryLabel: "Prueba",
      quickPrompts: [
        "Cambia pollo por pescado",
        "Haz deload esta semana",
        "Recorta 200 kcal",
        "Añade un finisher de 20 min"
      ],
      sources: {
        plan: "Abrir mi plan",
        grocery: "Lista de la compra",
        swap: "Cambiar comida",
        progress: "Progreso",
        bundle: "Ver paquete"
      },
      greeting: "¿Cómo te entreno hoy?",
      greetingSub: "Entrenamiento, nutrición, recuperación — pregunta lo que quieras.",
      recent: "Recientes",
      conversationsLabel: "Chats",
      disclaimer: "TJAI puede cometer errores — verifica los detalles clave."
    }
  },
  fr: {
    suggestions: [
      { label: "Résumé du plan", prompt: "Peux-tu me donner un résumé de mon plan TJAI et expliquer les principes principaux ?" },
      { label: "Avant entraînement", prompt: "Que dois-je manger avant mon entraînement, et quand ?" },
      { label: "Séance manquée", prompt: "J'ai manqué l'entraînement d'hier. Dois-je le rattraper ou le sauter ?" },
      { label: "Remplacer un repas", prompt: "Peux-tu proposer une alternative pour l'un de mes repas ? Je te dirai lequel." },
      { label: "Options genou", prompt: "J'ai mal au genou. Quels exercices éviter et quelles alternatives sont sûres ?" },
      { label: "Casser un plateau", prompt: "Je stagne au même poids depuis 2 semaines. Quels changements faire ?" }
    ],
    emptyPrompt: "Pose une question sur tes repas, séances ou ton plan...",
    askTitle: "Demander à TJAI",
    askBody: "Ton coach connaît ton plan et tes séances enregistrées. Donne des détails pour des réponses plus nettes.",
    memory: "Mémoire",
    online: "En ligne",
    copyLabel: "Copier",
    tapToAsk: "Appuyer pour demander",
    refine: "Affiner",
    send: "Envoyer",
    stop: "Arrêter",
    retry: "Réessayer",
    jumpToLatest: "Aller au plus récent",
    followUps: {
      simplify: "Simplifier",
      deeper: "Plus de détail",
      nextStep: "Étape suivante",
      protein: "Protéines",
      timeCrunch: "35 min",
      deload: "Deload"
    },
    ongoing: {
      nutrition: ["Transforme ceci en liste de courses", "Ajuste ceci à mes calories"],
      training: ["Planifie ma prochaine séance", "Ajoute une progression pour la semaine prochaine"]
    },
    contextual: {
      generate_plan: "Quel plan devrais-je commencer selon mon objectif ?",
      restart_training: "Je ne me suis pas entraîné cette semaine — donne-moi une séance pour reprendre aujourd'hui.",
      diagnose_progress: "Ma tendance de poids ne correspond pas à mon plan — diagnostique pourquoi.",
      plan_checkin: "Analyse mes dernières séances et dis-moi quoi ajuster la semaine prochaine."
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
    trialRemaining: (n, limit) => `${n}/${limit} messages d'aperçu — passe à l'illimité`,
    standalone: {
      newChat: "Nouveau chat",
      fallbackConversation: "Nouveau chat",
      chatFailed: "Je n'ai pas pu répondre pour l'instant. Réessaie.",
      errorGeneric: "TJAI rencontre un problème. Réessaie.",
      errorTimeout: "La requête TJAI a expiré. Réessaie.",
      voiceUnsupported: "La saisie vocale n'est pas prise en charge dans ce navigateur",
      voiceInput: "Saisie vocale",
      voiceUnsupportedInline:
        "La saisie vocale n'est pas prise en charge dans ce navigateur.",
      askPlaceholder: "Demande à TJAI...",
      listening: "Écoute...",
      voice: "Voix",
      coreRemaining: "messages restants",
      proUnlocked: "Chat TJAI illimité",
      apexUnlimited: "Chat illimité",
      trialUsed: "Tu as atteint la limite d'aperçu du chat TJAI",
      trialSub: "Passe à Pro ou Apex pour des conversations de coaching illimitées.",
      upgradeCta: "Améliorer l'abonnement",
      close: "Fermer",
      starter: "Démarrage",
      tryLabel: "Essaie",
      quickPrompts: [
        "Remplace le poulet par du poisson",
        "Fais un deload cette semaine",
        "Réduis de 200 kcal",
        "Ajoute un finisher de 20 min"
      ],
      sources: {
        plan: "Ouvrir mon plan",
        grocery: "Liste de courses",
        swap: "Changer le repas",
        progress: "Progression",
        bundle: "Voir le pack"
      },
      greeting: "Comment puis-je te coacher aujourd'hui ?",
      greetingSub: "Entraînement, nutrition, récupération — pose ta question.",
      recent: "Récents",
      conversationsLabel: "Discussions",
      disclaimer: "TJAI peut se tromper — vérifie les détails importants."
    }
  }
};

export function getTJAIChatCopy(locale: Locale): TJAIChatCopy {
  return TJAI_CHAT_COPY[locale] ?? TJAI_CHAT_COPY.en;
}
