import { resolveCopyLocale } from "@/lib/i18n";

/**
 * Localized copy for the homepage body strips that `immersive-home` renders
 * with hardcoded English: the TJAI overview section, the editorial rail, and
 * the stats band. Kept as a small dedicated module (same pattern as
 * `bundles-copy.ts`) rather than threaded through the larger
 * `home-luxury-copy.ts`.
 */

export type HomeSectionsCopy = {
  tjai: { heading: string; body: string; cta: string };
  /** Five short phrases shown in the editorial rail, joined with separators. */
  editorialRail: string[];
  stats: { bundles: string; weeks: string; languages: string };
  /** Platform-spec section header (the two-tone heading splits lead/tail). */
  platformSpec: { eyebrow: string; headingLead: string; headingTail: string; body: string };
  /** Six platform feature cards — order matches the icon/accent meta array. */
  features: { title: string; desc: string }[];
};

const COPY: Record<"en" | "tr" | "ar" | "es" | "fr", HomeSectionsCopy> = {
  en: {
    tjai: {
      heading: "Your AI coach, built for your body.",
      body: "Answer 25 questions — TJAI generates a full 12-week training plan, diet, and supplement stack tuned to your goals, equipment and time. Preview it free; unlock the full plan when you're ready.",
      cta: "Try TJAI"
    },
    editorialRail: [
      "12-week periodization",
      "Macro-aware meals",
      "TJAI · GPT-4o",
      "Coach marketplace",
      "10 languages"
    ],
    stats: { bundles: "Bundles", weeks: "Weeks Per Plan", languages: "Languages" },
    platformSpec: {
      eyebrow: "The stack",
      headingLead: "Built like training software,",
      headingTail: " not a toy app.",
      body: "Structured plans, real nutrition systems, AI that respects constraints, and human coaches when you want them — one surface, one visual language."
    },
    features: [
      {
        title: "TJAI — Your AI Coach",
        desc: "Adaptive intake, progress-aware memory, and AI-built 12-week transformation plans. Diet + training + supplements."
      },
      {
        title: "20+ Expert Programs",
        desc: "12-week structured plans for home or gym. Fat loss, muscle gain — all levels."
      },
      {
        title: "Full Diet Systems",
        desc: "Daily meal plans with macros, recipes, grocery lists. Halal, vegan, budget — covered."
      },
      {
        title: "Coach Marketplace",
        desc: "Book certified coaches. 1-on-1 guidance and personalized feedback."
      },
      {
        title: "Leaderboards",
        desc: "Compete on weekly boards and build streaks alongside the community."
      },
      {
        title: "10 Languages",
        desc: "Training and nutrition flows support 10 locales from the first visit."
      }
    ]
  },
  tr: {
    tjai: {
      heading: "Bedenine göre kurulmuş yapay zeka koçun.",
      body: "25 soru yanıtla — TJAI; hedeflerine, ekipmanına ve zamanına göre ayarlanmış 12 haftalık eksiksiz bir antrenman planı, diyet ve takviye paketi üretir. Ücretsiz önizle; hazır olduğunda tüm planı aç.",
      cta: "TJAI'yi dene"
    },
    editorialRail: [
      "12 haftalık periyotlama",
      "Makro odaklı öğünler",
      "TJAI · GPT-4o",
      "Koç pazarı",
      "10 dil"
    ],
    stats: { bundles: "Paket", weeks: "Plan Başına Hafta", languages: "Dil" },
    platformSpec: {
      eyebrow: "Sistem",
      headingLead: "Antrenman yazılımı gibi kuruldu,",
      headingTail: " oyuncak bir uygulama değil.",
      body: "Yapılandırılmış planlar, gerçek beslenme sistemleri, kısıtlara saygı duyan yapay zeka ve istediğinde insan koçlar — tek yüzey, tek görsel dil."
    },
    features: [
      {
        title: "TJAI — Yapay Zeka Koçun",
        desc: "Uyarlanabilir değerlendirme, ilerlemeni hatırlayan hafıza ve yapay zekayla kurulmuş 12 haftalık dönüşüm planları. Diyet + antrenman + takviye."
      },
      {
        title: "20+ Uzman Programı",
        desc: "Ev veya salon için 12 haftalık yapılandırılmış planlar. Yağ yakım, kas kazanımı — her seviye."
      },
      {
        title: "Eksiksiz Diyet Sistemleri",
        desc: "Makro, tarif ve market listesiyle günlük öğün planları. Helal, vegan, ekonomik — hepsi dahil."
      },
      {
        title: "Koç Pazarı",
        desc: "Sertifikalı koçlar ayarla. Birebir rehberlik ve kişisel geri bildirim."
      },
      {
        title: "Liderlik Tabloları",
        desc: "Haftalık tablolarda yarış, toplulukla birlikte istikrar serileri oluştur."
      },
      {
        title: "10 Dil",
        desc: "Antrenman ve beslenme akışları ilk ziyaretten itibaren 10 dili destekler."
      }
    ]
  },
  ar: {
    tjai: {
      heading: "مدرّبك بالذكاء الاصطناعي، مبني على جسدك.",
      body: "أجب عن 25 سؤالاً — يولّد TJAI خطة تدريب كاملة لمدة 12 أسبوعاً ونظاماً غذائياً وحزمة مكمّلات مضبوطة على أهدافك ومعداتك ووقتك. عاينها مجاناً؛ وافتح الخطة كاملة عندما تكون مستعداً.",
      cta: "جرّب TJAI"
    },
    editorialRail: [
      "تخطيط دوري لـ12 أسبوعاً",
      "وجبات واعية بالماكروز",
      "TJAI · GPT-4o",
      "سوق المدربين",
      "10 لغات"
    ],
    stats: { bundles: "حزم", weeks: "أسابيع لكل خطة", languages: "لغات" },
    platformSpec: {
      eyebrow: "المنظومة",
      headingLead: "مبني مثل برمجيات التدريب،",
      headingTail: " وليس تطبيقاً ترفيهياً.",
      body: "خطط منظّمة، وأنظمة تغذية حقيقية، وذكاء اصطناعي يحترم القيود، ومدربون بشريون عندما تريد — سطح واحد، ولغة بصرية واحدة."
    },
    features: [
      {
        title: "TJAI — مدربك بالذكاء الاصطناعي",
        desc: "تقييم تكيّفي، وذاكرة واعية بتقدّمك، وخطط تحوّل لمدة 12 أسبوعاً يبنيها الذكاء الاصطناعي. تغذية + تدريب + مكمّلات."
      },
      {
        title: "أكثر من 20 برنامجاً احترافياً",
        desc: "خطط منظّمة لمدة 12 أسبوعاً للمنزل أو الصالة. حرق دهون، بناء عضل — لكل المستويات."
      },
      {
        title: "أنظمة غذائية كاملة",
        desc: "خطط وجبات يومية مع الماكروز والوصفات وقوائم التسوّق. حلال، نباتي، اقتصادي — كل ذلك مشمول."
      },
      {
        title: "سوق المدربين",
        desc: "احجز مدربين معتمدين. توجيه فردي وملاحظات شخصية."
      },
      {
        title: "لوحات الصدارة",
        desc: "نافس على اللوحات الأسبوعية، وابنِ سلاسل الاستمرارية مع المجتمع."
      },
      {
        title: "10 لغات",
        desc: "تدعم مسارات التدريب والتغذية 10 لغات من أول زيارة."
      }
    ]
  },
  es: {
    tjai: {
      heading: "Tu coach con IA, construido para tu cuerpo.",
      body: "Responde 25 preguntas — TJAI genera un plan de entrenamiento completo de 12 semanas, dieta y stack de suplementos ajustado a tus objetivos, equipo y tiempo. Previsualízalo gratis; desbloquea el plan completo cuando estés listo.",
      cta: "Prueba TJAI"
    },
    editorialRail: [
      "Periodización de 12 semanas",
      "Comidas conscientes de macros",
      "TJAI · GPT-4o",
      "Mercado de coaches",
      "10 idiomas"
    ],
    stats: { bundles: "Paquetes", weeks: "Semanas Por Plan", languages: "Idiomas" },
    platformSpec: {
      eyebrow: "El stack",
      headingLead: "Construido como software de entrenamiento,",
      headingTail: " no una app de juguete.",
      body: "Planes estructurados, sistemas de nutrición reales, IA que respeta las restricciones y coaches humanos cuando los quieras — una superficie, un lenguaje visual."
    },
    features: [
      {
        title: "TJAI — Tu Coach con IA",
        desc: "Evaluación adaptativa, memoria consciente del progreso y planes de transformación de 12 semanas creados por IA. Dieta + entrenamiento + suplementos."
      },
      {
        title: "Más de 20 Programas Expertos",
        desc: "Planes estructurados de 12 semanas para casa o gimnasio. Pérdida de grasa, ganancia muscular — todos los niveles."
      },
      {
        title: "Sistemas de Dieta Completos",
        desc: "Planes de comidas diarios con macros, recetas y listas de compra. Halal, vegano, económico — todo cubierto."
      },
      {
        title: "Mercado de Coaches",
        desc: "Reserva coaches certificados. Orientación 1 a 1 y feedback personalizado."
      },
      {
        title: "Tablas de Clasificación",
        desc: "Compite en tablas semanales y construye rachas con la comunidad."
      },
      {
        title: "10 Idiomas",
        desc: "Los flujos de entrenamiento y nutrición admiten 10 idiomas desde la primera visita."
      }
    ]
  },
  fr: {
    tjai: {
      heading: "Ton coach IA, conçu pour ton corps.",
      body: "Réponds à 25 questions — TJAI génère un plan d'entraînement complet de 12 semaines, une diète et un stack de compléments ajustés à tes objectifs, ton équipement et ton temps. Aperçu gratuit ; débloque le plan complet quand tu es prêt.",
      cta: "Essayer TJAI"
    },
    editorialRail: [
      "Périodisation sur 12 semaines",
      "Repas pensés macros",
      "TJAI · GPT-4o",
      "Place de marché coachs",
      "10 langues"
    ],
    stats: { bundles: "Packs", weeks: "Semaines Par Plan", languages: "Langues" },
    platformSpec: {
      eyebrow: "Le stack",
      headingLead: "Conçu comme un logiciel d'entraînement,",
      headingTail: " pas une appli gadget.",
      body: "Des plans structurés, de vrais systèmes de nutrition, une IA qui respecte les contraintes et des coachs humains quand tu le veux — une seule surface, un seul langage visuel."
    },
    features: [
      {
        title: "TJAI — Ton Coach IA",
        desc: "Évaluation adaptative, mémoire consciente de ta progression et plans de transformation de 12 semaines créés par l'IA. Diète + entraînement + compléments."
      },
      {
        title: "Plus de 20 Programmes Experts",
        desc: "Plans structurés de 12 semaines pour la maison ou la salle. Perte de graisse, prise de muscle — tous niveaux."
      },
      {
        title: "Systèmes de Diète Complets",
        desc: "Plans de repas quotidiens avec macros, recettes et listes de courses. Halal, végane, économique — tout est couvert."
      },
      {
        title: "Place de Marché Coachs",
        desc: "Réserve des coachs certifiés. Accompagnement individuel et retours personnalisés."
      },
      {
        title: "Classements",
        desc: "Rivalise sur les tableaux hebdomadaires et construis des séries avec la communauté."
      },
      {
        title: "10 Langues",
        desc: "Les parcours d'entraînement et de nutrition prennent en charge 10 langues dès la première visite."
      }
    ]
  }
};

export function getHomeSectionsCopy(locale: string): HomeSectionsCopy {
  return COPY[resolveCopyLocale(locale)];
}
