import type { Locale } from "@/lib/i18n";

export type TJAIChatCopy = { suggestions: { label: string; prompt: string }[]; emptyPrompt: string; askTitle: string; askBody: string; memory: string; tapToAsk: string; refine: string; send: string };

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
    send: "Send"
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
    send: "Gonder"
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
    send: "إرسال"
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
    send: "Enviar"
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
    send: "Envoyer"
  }
};

export function getTJAIChatCopy(locale: Locale): TJAIChatCopy {
  return TJAI_CHAT_COPY[locale] ?? TJAI_CHAT_COPY.en;
}
