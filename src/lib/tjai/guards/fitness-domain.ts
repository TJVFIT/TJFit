export const TJAI_CHAT_DOMAIN_GUARD =
  "Please ask me stuff related to health, sports, coaching, or the website.";

export function isLikelyFitnessQuestion(message: string): boolean {
  const m = message.toLowerCase();
  return [
    "workout",
    "work out",
    "training",
    "train",
    "exercise",
    "lift",
    "lifting",
    "strength",
    "hypertrophy",
    "reps",
    "sets",
    "rest day",
    "split",
    "fitness",
    "fat",
    "muscle",
    "body fat",
    "bulk",
    "cut",
    "lose weight",
    "gain weight",
    "diet",
    "nutrition",
    "meal",
    "meal prep",
    "calorie",
    "protein",
    "carb",
    "fat intake",
    "cardio",
    "tdee",
    "bmr",
    "coach",
    "coaching",
    "health",
    "wellness",
    "sleep",
    "hydration",
    "injury",
    "recovery",
    "rehab",
    "program",
    "tjai",
    "tjfit",
    "community",
    "website",
    "supplement",
    "gym",
    "home workout",
    "chest",
    "back",
    "legs",
    "shoulders",
    "arm",
    "abs",
    "progress",
    "weight",
    "plateau",
    "overload",
    "deload",
    "refeed",
    "macros"
  ].some((k) => m.includes(k));
}

export function fallbackCoachReply(message: string, locale: string): string {
  if (!isLikelyFitnessQuestion(message)) return TJAI_CHAT_DOMAIN_GUARD;
  if (locale === "tr")
    return "Hizli plan: 3-4 gun kuvvet + gunluk adim hedefi + protein odakli beslenme ile basla. Her hafta agirlik veya tekrar arttir, 7-9 saat uyku ve duzenli su tuketimi ekle. Saglik sorunun varsa doktoruna danis.";
  if (locale === "ar")
    return "ابدأ بخطة بسيطة: 3-4 أيام مقاومة أسبوعياً + خطوات يومية + بروتين كافٍ. زِد الحمل تدريجياً كل أسبوع، ونَم 7-9 ساعات مع ترطيب جيد. إذا لديك حالة صحية خاصة فاستشر مختصاً.";
  if (locale === "es")
    return "Empieza simple: 3-4 dias de fuerza por semana + objetivo de pasos diarios + proteina suficiente. Sube carga o repeticiones progresivamente, duerme 7-9h y mantente hidratado. Si tienes una condicion medica, consulta a un profesional.";
  if (locale === "fr")
    return "Commencez simple: 3-4 seances de musculation/semaine + objectif de pas quotidiens + apport proteique suffisant. Augmentez progressivement la charge ou les repetitions, dormez 7-9h et hydratez-vous. En cas de probleme de sante, consultez un professionnel.";
  return "Start simple: train strength 3-4 days/week, hit a daily step goal, and prioritize protein. Progress load or reps weekly, sleep 7-9 hours, and stay hydrated. If you have a medical condition, check with a qualified professional.";
}
