// Hard medical-safety guardrails. These run BEFORE the model so refusal
// is deterministic — no jailbreak via prompt phrasing. Patterns are
// intentionally broad; we'd rather refuse a borderline case and offer a
// coach handoff than risk dangerous output.

export type MedicalRiskCategory =
  | "self_harm"
  | "ed"
  | "extreme_cut"
  | "dosing"
  | "injury_red_flag"
  | "pregnancy"
  | "reds"
  | "rhabdo";

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

// Crisis — checked first, routes to a helpline (different intervention
// than a clinician referral).
const SELF_HARM_PATTERNS: RegExp[] = [
  /\b(kill|hurt|harm)\s+(myself|me)\b/i,
  /\b(want|going)\s+to\s+(die|disappear|end\s+it)\b/i,
  /\b(suicid|self[- ]?harm|cut\s+myself)\b/i,
  /\b(no\s+reason\s+to\s+(live|go\s+on))\b/i
];

const PREGNANCY_PATTERNS: RegExp[] = [
  /\b([0-9]{1,2})\s*weeks?\s+pregnant\b/i,
  /\b(i'?m|i\s+am|currently)\s+pregnant\b/i,
  /\b(first|second|third)\s+trimester\b/i,
  /\b(postpartum|post[- ]?partum|just\s+gave\s+birth|after\s+(my\s+)?c[- ]?section)\b/i,
  /\b(breast[- ]?feeding|nursing)\b.*\b(train|lift|diet|cut|deficit)\b/i
];

// Relative Energy Deficiency in Sport (IOC REDs consensus, Cycle 010).
const REDS_PATTERNS: RegExp[] = [
  /\b(lost|missed|haven'?t\s+had|no)\s+(my\s+)?period(s)?\b/i,
  /\b(amenorrh|haven'?t\s+menstruat)/i,
  /\b(period\s+stopped|stopped\s+getting\s+my\s+period)\b/i,
  /\b(always|constantly)\s+(cold|freezing)\b.*\b(diet|deficit|lifting|training)\b/i
];

// Rhabdomyolysis warning signs (CDC NIOSH, Cycle 014).
const RHABDO_PATTERNS: RegExp[] = [
  /\b(dark|brown|cola|tea)[- ]?(colou?red\s+)?(urine|pee|piss)\b/i,
  /\b(urine|pee)\s+(is\s+)?(dark|brown|red|cola)/i,
  /\b(muscle|arm|leg)s?\s+(so\s+)?(swollen|sore).*\bcan'?t\s+(move|straighten)\b/i,
  /\brhabdo/i
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

  // Order = priority. Self-harm first (crisis), then ED, then dosing,
  // then acute physical red flags, then context-specific guards.
  for (const re of SELF_HARM_PATTERNS) {
    const m = text.match(re);
    if (m) return { category: "self_harm", matched: m[0] };
  }
  for (const re of ED_PATTERNS) {
    const m = text.match(re);
    if (m) return { category: "ed", matched: m[0] };
  }
  for (const re of DOSING_PATTERNS) {
    const m = text.match(re);
    if (m) return { category: "dosing", matched: m[0] };
  }
  for (const re of RHABDO_PATTERNS) {
    const m = text.match(re);
    if (m) return { category: "rhabdo", matched: m[0] };
  }
  for (const re of INJURY_RED_FLAG_PATTERNS) {
    const m = text.match(re);
    if (m) return { category: "injury_red_flag", matched: m[0] };
  }
  for (const re of PREGNANCY_PATTERNS) {
    const m = text.match(re);
    if (m) return { category: "pregnancy", matched: m[0] };
  }
  for (const re of REDS_PATTERNS) {
    const m = text.match(re);
    if (m) return { category: "reds", matched: m[0] };
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
  },
  self_harm: {
    en: "I'm really glad you told me, and I want you to be safe. I can't help with this, but you deserve real support right now — please reach out to a crisis line (US/Canada: 988, UK: 116 123, or your local emergency number). If you're in immediate danger, call emergency services. You're not alone in this.",
    ar: "يسعدني أنك أخبرتني، وأريدك أن تكون بأمان. لا أستطيع المساعدة في هذا، لكنك تستحق دعماً حقيقياً الآن — يُرجى التواصل مع خط أزمات أو رقم الطوارئ المحلي فوراً. إن كنت في خطر مباشر فاتصل بالطوارئ. لست وحدك.",
    tr: "Bunu paylaştığın için minnettarım ve güvende olmanı istiyorum. Bu konuda yardımcı olamam ama şu an gerçek desteği hak ediyorsun — lütfen bir kriz hattına ya da yerel acil numarasına hemen ulaş. Ani tehlike varsa acil servisi ara. Bu yolda yalnız değilsin.",
    es: "Me alegra que me lo cuentes y quiero que estés a salvo. No puedo ayudarte con esto, pero mereces apoyo real ahora — por favor contacta una línea de crisis o tu número de emergencias local de inmediato. Si estás en peligro inmediato, llama a emergencias. No estás solo.",
    fr: "Je suis content que tu m'en parles et je veux que tu sois en sécurité. Je ne peux pas t'aider sur ce point, mais tu mérites un vrai soutien maintenant — contacte une ligne d'écoute ou ton numéro d'urgence local immédiatement. En cas de danger immédiat, appelle les secours. Tu n'es pas seul."
  },
  pregnancy: {
    en: "Congratulations — and this is exactly the kind of thing to run by your doctor or midwife, not a chatbot. Training during and after pregnancy can be great, but load, intensity, and which movements are safe depend on your stage and your clinician's guidance. I can share general, gentle principles, but please get cleared first and let your OB lead.",
    ar: "تهانينا — وهذا بالضبط ما يجب مراجعته مع طبيبك أو القابلة، لا مع روبوت محادثة. التمرين أثناء الحمل وبعده قد يكون مفيداً، لكن الحِمل والشدة والحركات الآمنة تعتمد على مرحلتك وإرشاد طبيبك. يمكنني مشاركة مبادئ عامة لطيفة، لكن احصل على موافقة طبيبك أولاً.",
    tr: "Tebrikler — ve bu tam olarak doktoruna ya da ebene danışman gereken bir konu, sohbet botuna değil. Hamilelikte ve sonrasında antrenman faydalı olabilir ama yük, şiddet ve hangi hareketlerin güvenli olduğu dönemine ve doktorunun yönlendirmesine bağlı. Genel, nazik ilkeleri paylaşabilirim ama önce doktorundan onay al.",
    es: "Felicidades — y esto es justo lo que debes consultar con tu médico o matrona, no con un chatbot. Entrenar durante y después del embarazo puede ser estupendo, pero la carga, la intensidad y qué movimientos son seguros dependen de tu etapa y de tu médico. Puedo compartir principios generales y suaves, pero primero busca el alta de tu obstetra.",
    fr: "Félicitations — et c'est exactement le genre de chose à voir avec ton médecin ou ta sage-femme, pas un chatbot. S'entraîner pendant et après la grossesse peut être bénéfique, mais la charge, l'intensité et les mouvements sûrs dépendent de ton stade et de l'avis de ton médecin. Je peux partager des principes généraux et doux, mais obtiens d'abord le feu vert de ton obstétricien."
  },
  reds: {
    en: "A lost or missing period while training hard and eating less is a real warning sign — it can mean you're not eating enough for your activity (low energy availability), which affects bones, hormones, and recovery. This needs a doctor or registered dietitian, not a meal plan from me. The fix is usually more fuel, not less. Please get checked.",
    ar: "غياب الدورة الشهرية أثناء التدريب المكثف وتقليل الأكل علامة تحذير حقيقية — قد يعني أنك لا تأكل ما يكفي لنشاطك، وهذا يؤثر على العظام والهرمونات والتعافي. هذا يحتاج طبيباً أو أخصائي تغذية، لا خطة وجبات مني. الحل عادةً مزيد من الطاقة لا أقل. يُرجى الفحص.",
    tr: "Sıkı antrenman yaparken ve az yerken adetin kesilmesi gerçek bir uyarı işareti — aktiviten için yeterince yemiyor olabilirsin (düşük enerji bulunabilirliği) ve bu kemikleri, hormonları ve toparlanmayı etkiler. Bu benden bir öğün planı değil, bir doktor ya da diyetisyen gerektirir. Çözüm genelde daha az değil daha fazla beslenmek. Lütfen kontrol ettir.",
    es: "Perder o no tener el periodo mientras entrenas fuerte y comes menos es una señal de alarma real — puede significar que no comes lo suficiente para tu actividad (baja disponibilidad de energía), y eso afecta huesos, hormonas y recuperación. Esto necesita un médico o dietista, no un plan de comidas mío. La solución suele ser comer más, no menos. Hazte revisar.",
    fr: "Une absence de règles en t'entraînant dur et en mangeant moins est un vrai signal d'alarme — cela peut signifier que tu ne manges pas assez pour ton activité (faible disponibilité énergétique), ce qui affecte les os, les hormones et la récupération. Cela nécessite un médecin ou une diététicienne, pas un plan de repas de ma part. La solution est souvent de manger plus, pas moins. Fais-toi examiner."
  },
  rhabdo: {
    en: "Stop — dark or cola-colored urine with severe muscle pain after hard exercise can be rhabdomyolysis, which is a medical emergency that can damage your kidneys. Please get to urgent care or an emergency room now and tell them what you described. This is not normal soreness, and it's not something to train through.",
    ar: "توقف — البول الداكن أو بلون الكولا مع ألم عضلي شديد بعد تمرين مكثف قد يكون انحلال الربيدات، وهي حالة طارئة قد تضر الكلى. يُرجى الذهاب إلى الطوارئ الآن وإخبارهم بما وصفت. هذا ليس ألم عضلات عادياً ولا يجوز التمرين رغمه.",
    tr: "Dur — yoğun egzersiz sonrası koyu ya da kola renginde idrar ile şiddetli kas ağrısı rabdomiyoliz olabilir; bu, böbreklere zarar verebilen acil bir durumdur. Lütfen hemen acile git ve anlattıklarını söyle. Bu normal bir kas ağrısı değil ve üstüne antrenman yapılacak bir şey değil.",
    es: "Para — orina oscura o color cola con dolor muscular intenso tras ejercicio duro puede ser rabdomiólisis, una emergencia médica que puede dañar los riñones. Por favor ve a urgencias ahora y diles lo que describiste. No es una agujeta normal y no es algo para entrenar por encima.",
    fr: "Arrête — une urine foncée ou couleur cola avec de fortes douleurs musculaires après un effort intense peut être une rhabdomyolyse, une urgence médicale pouvant endommager les reins. Va aux urgences maintenant et décris-leur ce que tu ressens. Ce n'est pas une courbature normale et il ne faut pas s'entraîner par-dessus."
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
5. If the user expresses self-harm or suicidal intent, do not coach — respond with warmth and direct them to a crisis line / emergency services immediately.
6. If the user is pregnant or postpartum, do not prescribe load/intensity — give only general gentle principles and defer to their doctor/OB/midwife.
7. If the user reports a lost/absent period while dieting or training hard (possible low energy availability / REDs), flag it as a warning sign and refer to a doctor or registered dietitian; the fix is usually more fuel, not less.
8. If the user reports dark/cola-colored urine with severe muscle pain after hard exercise (possible rhabdomyolysis), treat it as an emergency and tell them to seek urgent care now — never "train through" it.
9. When refusing, stay warm and short, then offer a constructive next step you CAN help with.
`.trim();
