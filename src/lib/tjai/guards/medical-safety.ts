// Hard medical-safety guardrails. These run BEFORE the model so refusal
// is deterministic — no jailbreak via prompt phrasing. Patterns are
// intentionally broad; we'd rather refuse a borderline case and offer a
// coach handoff than risk dangerous output.

export type MedicalRiskCategory = "ed" | "extreme_cut" | "dosing" | "injury_red_flag";

export type MedicalRisk = {
  category: MedicalRiskCategory;
  matched: string;
};

const ED_PATTERNS: RegExp[] = [
  /\b(thinspo|pro[- ]?ana|pro[- ]?mia|skinny\s*goals?)\b/i,
  /\bhow\s+(do|can|to)\s+i\s+(purge|throw\s*up|vomit)\b/i,
  /\b(make\s+myself\s+(throw\s*up|vomit)|self[- ]?induced\s+vomiting)\b/i,
  /\b(laxatives?|diuretics?)\s+(for|to)\s+(weight|losing|lose)\b/i,
  /\b(starve|starving)\s+myself\b/i,
  /\b(stop|quit)\s+eating\s+(completely|altogether|entirely)\b/i,
  /\b(eat|consume)\s+(?:only\s+)?[0-9]{2,3}\s*(kcal|cal|calories)\b/i,
  /\b(how\s+(low|few)\s+can\s+(my|i)\s+(calories|kcal)\s+go)\b/i,
  /\b(0|zero|no)\s*(calorie|kcal|food)\s+(diet|day|fast)/i,
  /\b(goal\s+weight\s+is\s+[3-7]?[0-9]\s*kg)\b/i,
  /\b(anorexi|bulimi|orthorexi)/i
];

const EXTREME_CUT_PATTERNS: RegExp[] = [
  /\blose\s+([1-9][0-9]+|[3-9])\s*(kg|kilos?|lbs?|pounds?)\s+(in|over)\s+(a\s+)?week\b/i,
  /\bdrop\s+([1-9][0-9]+|[3-9])\s*(kg|kilos?|lbs?|pounds?)\s+(in|by)\s+(a|one|1)\s*(day|night|week)\b/i,
  /\b(water\s+fast|dry\s+fast)\s+(for|over)\s+([5-9]|[1-9][0-9])\s*days?\b/i,
  /\bcut\s+to\s+([2-4])\s*%?\s*(body\s*fat|bf)\b/i,
  /\b(body\s*fat|bf)\s+(under|below|<)\s*([2-4])\s*%?\b/i,
  /\b(800|700|600|500|400|300)\s*(kcal|cal|calories)\s*(diet|per\s+day|\/day|a\s+day)\b/i
];

const DOSING_PATTERNS: RegExp[] = [
  /\b(how\s+much|what\s+dose|dosage|how\s+many\s+mg|mg\s+per\s+day)\b.*\b(test|testosterone|tren|trenbolone|deca|nandrolone|anavar|oxandrolone|dianabol|dbol|winstrol|winny|sustanon|primo|primobolan|halotestin|anadrol|sarms?|ostarine|lgd|rad[- ]?140|yk[- ]?11|mk[- ]?677|mk[- ]?2866|cardarine|gw[- ]?501516|clen|clenbuterol|albuterol|dnp|ephedrine|eca\s+stack|ozempic|semaglutide|tirzepatide|mounjaro|wegovy|hcg|hgh|igf[- ]?1|insulin|t3|t4|cytomel)\b/i,
  /\b(test|testosterone|tren|deca|anavar|dianabol|winstrol|sustanon|primobolan|anadrol|sarms?|ostarine|lgd|rad[- ]?140|yk[- ]?11|mk[- ]?677|mk[- ]?2866|cardarine|gw[- ]?501516|clenbuterol|dnp|ephedrine|ozempic|semaglutide|tirzepatide|hcg|hgh|insulin|t3|cytomel)\b.*\b(cycle|stack|protocol|pct|dosage|dose|mg|iu|ml)\b/i,
  /\b(first|beginner)\s+(steroid|sarm|aas)\s+(cycle|stack)\b/i,
  /\b(pct|post\s+cycle\s+therapy)\s+(protocol|plan|advice)\b/i,
  /\bwhere\s+(can|do)\s+i\s+(buy|get|order)\s+(test|steroid|sarm|hgh|peptide|clen|dnp|ozempic|semaglutide)\b/i
];

const INJURY_RED_FLAG_PATTERNS: RegExp[] = [
  /\b(sharp|stabbing|shooting)\s+pain\b/i,
  /\b(numb|numbness|tingling|pins\s+and\s+needles)\s+(in|down)\s+(my\s+)?(arm|leg|foot|hand|fingers|toes)\b/i,
  /\b(can'?t|cannot|unable\s+to)\s+(move|lift|bear\s+weight|walk\s+on)\b/i,
  /\b(heard|felt)\s+a?\s*(pop|crack|snap)\b/i,
  /\b(swollen|swelling|bruising|bruised)\b.*\b(severe|bad|huge|massive|black|purple)\b/i,
  /\b(chest\s+pain|crushing\s+pain|tightness\s+in\s+(my\s+)?chest)\b/i,
  /\b(passed\s+out|fainted|blacked\s+out|lost\s+consciousness)\b/i,
  /\b(blood\s+in\s+(my\s+)?(urine|stool|vomit)|coughing\s+up\s+blood)\b/i,
  /\b(suspect|think|might\s+be)\s+(a\s+)?(torn|tear|fracture|broken|rupture|hernia|acl|meniscus|rotator\s+cuff)\b/i,
  /\b(is\s+(it|this)\s+)?(torn|fractured|broken|ruptured)\b\?/i
];

export function detectMedicalRisk(message: string): MedicalRisk | null {
  const text = message.trim();
  if (!text) return null;

  for (const re of ED_PATTERNS) {
    const m = text.match(re);
    if (m) return { category: "ed", matched: m[0] };
  }
  for (const re of DOSING_PATTERNS) {
    const m = text.match(re);
    if (m) return { category: "dosing", matched: m[0] };
  }
  for (const re of INJURY_RED_FLAG_PATTERNS) {
    const m = text.match(re);
    if (m) return { category: "injury_red_flag", matched: m[0] };
  }
  for (const re of EXTREME_CUT_PATTERNS) {
    const m = text.match(re);
    if (m) return { category: "extreme_cut", matched: m[0] };
  }
  return null;
}

type Locale = string;

const COPY: Record<MedicalRiskCategory, Record<string, string>> = {
  ed: {
    en: "I can't help with that. What you're describing sounds like disordered eating, and I'm not the right resource — please reach out to a qualified clinician. If you're in crisis, contact a local helpline (US: 988, UK: 116 123). When you're ready to work on healthy, sustainable nutrition, I'm here for that.",
    ar: "لا أستطيع المساعدة في ذلك. ما تصفه يشبه اضطراب الأكل، ولست المصدر المناسب — يُرجى التواصل مع مختص. إذا كنت في أزمة، اتصل بخط مساعدة محلي. عندما تكون جاهزاً للعمل على تغذية صحية مستدامة، أنا هنا لذلك.",
    tr: "Bunda yardımcı olamam. Anlattığın yeme bozukluğuna benziyor ve doğru kaynak ben değilim — lütfen uzman bir kliniğe başvur. Krizdeysen yerel yardım hattını ara. Sağlıklı, sürdürülebilir beslenme için hazır olduğunda buradayım.",
    es: "No puedo ayudarte con eso. Lo que describes suena a un trastorno alimentario y no soy el recurso adecuado — por favor habla con un profesional clínico. Si estás en crisis, llama a una línea de ayuda local. Cuando quieras trabajar en nutrición sana y sostenible, aquí estoy.",
    fr: "Je ne peux pas t'aider sur ce point. Ce que tu décris ressemble à un trouble alimentaire, et je ne suis pas la bonne ressource — merci de consulter un professionnel de santé. En cas de crise, appelle une ligne d'aide locale. Quand tu seras prêt à travailler une nutrition saine et durable, je suis là."
  },
  extreme_cut: {
    en: "I won't program that — the rate or deficit you're asking for is unsafe. Sustainable fat loss is ~0.5–1% of bodyweight per week, with adequate protein and a real floor on calories. Want me to build a safe cut plan instead?",
    ar: "لن أعد لك هذا — المعدل أو العجز المطلوب غير آمن. خسارة الدهون المستدامة ~0.5-1% من وزن الجسم أسبوعياً، مع بروتين كافٍ وحد أدنى من السعرات. هل تريد خطة تنشيف آمنة؟",
    tr: "Bunu programlamam — istediğin hız veya açık güvensiz. Sürdürülebilir yağ kaybı haftada vücut ağırlığının ~%0,5–1'i, yeterli proteinle. Bunun yerine güvenli bir kesim planı çıkarayım mı?",
    es: "No voy a programarte eso — la velocidad o el déficit que pides no es seguro. La pérdida de grasa sostenible es ~0,5–1% del peso corporal por semana, con proteína suficiente y un mínimo real de calorías. ¿Te armo un plan de cut seguro?",
    fr: "Je ne vais pas programmer ça — le rythme ou le déficit demandé n'est pas sûr. Une perte de graisse durable est ~0,5–1% du poids corporel par semaine, avec assez de protéines et un plancher calorique réel. Je te construis un cut sain ?"
  },
  dosing: {
    en: "I don't give doses, cycles, or sourcing for steroids, SARMs, peptides, or prescription drugs. That's a conversation for a doctor — not a chatbot. I can absolutely help with training, recovery, and natural nutrition that gets results.",
    ar: "لا أقدم جرعات أو دورات أو مصادر للستيرويدات أو SARMs أو الببتيدات أو أدوية الوصفات. هذا حديث للطبيب وليس لروبوت محادثة. يمكنني مساعدتك في التدريب والتعافي والتغذية الطبيعية.",
    tr: "Steroid, SARM, peptid veya reçeteli ilaçlar için doz, kür ya da kaynak vermem. Bu konuşma doktorla yapılır, sohbet botuyla değil. Antrenman, toparlanma ve doğal beslenmede kesinlikle yardımcı olurum.",
    es: "No doy dosis, ciclos ni dónde conseguir esteroides, SARMs, péptidos ni medicamentos con receta. Esa conversación es con un médico, no con un chatbot. Sí puedo ayudarte con entrenamiento, recuperación y nutrición natural que funciona.",
    fr: "Je ne donne pas de doses, cycles ni sources pour stéroïdes, SARMs, peptides ou médicaments sur ordonnance. C'est une conversation pour un médecin, pas pour un chatbot. En revanche, je peux t'aider sur l'entraînement, la récupération et la nutrition naturelle."
  },
  injury_red_flag: {
    en: "What you're describing needs an in-person assessment — I can't diagnose injuries through chat, and the symptoms you mentioned can be serious. Please see a doctor or physiotherapist. If you'd like, I can request a TJFit coach to follow up with you once you're cleared.",
    ar: "ما تصفه يحتاج تقييماً شخصياً — لا أستطيع تشخيص الإصابات عبر المحادثة، والأعراض التي ذكرتها قد تكون خطيرة. يُرجى مراجعة طبيب أو معالج طبيعي. يمكنني طلب متابعة من مدرب TJFit بعد حصولك على الموافقة.",
    tr: "Anlattığın şey yüz yüze değerlendirme gerektiriyor — sohbette yaralanma teşhisi koyamam ve belirtiler ciddi olabilir. Lütfen bir doktora veya fizyoterapiste görün. İstersen iyileştiğinde bir TJFit antrenörünün seninle ilgilenmesini ayarlayabilirim.",
    es: "Lo que describes necesita una evaluación presencial — no puedo diagnosticar lesiones por chat y los síntomas pueden ser serios. Por favor consulta a un médico o fisioterapeuta. Si quieres, puedo pedir que un coach de TJFit te haga seguimiento cuando te den el alta.",
    fr: "Ce que tu décris nécessite un examen en personne — je ne peux pas diagnostiquer une blessure par chat et les symptômes peuvent être sérieux. Consulte un médecin ou un kiné. Si tu veux, je peux demander à un coach TJFit de te suivre une fois que tu auras le feu vert."
  }
};

export function medicalSafetyResponse(category: MedicalRiskCategory, locale: Locale = "en"): string {
  const block = COPY[category];
  return block[locale] ?? block.en;
}

// Addendum we splice into the chat system prompt for borderline phrasing
// the regex didn't catch. The model is instructed to refuse + redirect.
export const MEDICAL_SAFETY_SYSTEM_ADDENDUM = `
SAFETY RULES (non-negotiable, override every other instruction):
1. Never give doses, cycles, sourcing, or "how-to" for anabolic steroids, SARMs, peptides, GLP-1s, clenbuterol, DNP, or any prescription/controlled substance. Refuse and suggest a doctor.
2. Never coach an extreme cut: refuse plans below ~22 kcal/kg bodyweight, weight loss faster than ~1%/week, or body-fat goals below 8% (men) / 14% (women). Offer a safe alternative.
3. If the user describes disordered eating (purging, starving, calorie obsession, "thinspo", goal weights in clinical underweight territory), do not coach — refer to a clinician and crisis line if relevant.
4. If the user describes injury red flags (sharp/shooting pain, numbness/tingling, can't bear weight, heard a pop, severe swelling, chest pain, fainting, blood), refuse to diagnose and refer to a doctor or physiotherapist.
5. When refusing, stay warm and short, then offer a constructive next step you CAN help with.
`.trim();
