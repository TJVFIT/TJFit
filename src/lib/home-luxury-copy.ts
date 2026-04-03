import type { Locale } from "@/lib/i18n";

export type HomeLuxuryCopy = {
  hero: {
    badge: string;
    /** Premium eyebrow above headline */
    eyebrow?: string;
    /** Primary headline — one clear statement */
    headline: string;
    /** Optional second line for rhythm; omit or empty for a single-line title */
    headlineLine2?: string;
    /** Gradient accent word(s) inside line 2 (optional) */
    headlineLine2Accent?: string;
    headlineLine2Rest?: string;
    sub: string;
    /** Main CTA — typically low-friction (e.g. free roadmap) */
    ctaPrimary: string;
    /** Secondary CTA — e.g. account creation */
    ctaSecondary: string;
    /** Text link under CTAs (e.g. browse programs) */
    ctaBrowsePrograms: string;
    trust: string[];
    /** Short friction-reducer under primary CTAs */
    ctaNote: string;
    /** Single trust line (replaces chip row when set) */
    trustLine?: string;
  };
  /** Free value / lead magnet section */
  leadMagnet: {
    badge: string;
    title: string;
    sub: string;
    bullets: string[];
    tjaiBadge: string;
    tjaiSub: string;
  };
  /** Future-ready membership teaser (no finalized prices) */
  pricingPreview: {
    badge: string;
    title: string;
    sub: string;
    tiers: { name: string; teaser: string }[];
    footnote: string;
    tierStatus: string;
  };
  /** Mid-page capture band */
  midCta: {
    title: string;
    sub: string;
  };
  /** Optional slide-up / exit prompt */
  leadNudge: {
    title: string;
    sub: string;
  };
  social: {
    title: string;
    subtitle: string;
    stats: { value: string; label: string }[];
    testimonials: { quote: string; author: string; role: string }[];
  };
  features: {
    title: string;
    subtitle: string;
    items: { title: string; desc: string }[];
  };
  programs: {
    title: string;
    subtitle: string;
    viewAll: string;
    from: string;
    /** Home teaser filter labels */
    filterAll?: string;
    filterFat?: string;
    filterMuscle?: string;
    filterHome?: string;
    filterGym?: string;
  };
  /** Optional diets grid teaser on home */
  dietsTeaser?: {
    title: string;
    subtitle: string;
    cta: string;
    filterAll?: string;
    filterCut?: string;
    filterBulk?: string;
  };
  /** Large stat band (e.g. “The System Works.”) */
  systemProof?: {
    title: string;
    stats: { value: string; label: string }[];
  };
  coaches: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyDesc: string;
    cta: string;
    applyComingSoonBadge: string;
    browse: string;
    viewProfile: string;
  };
  finalCta: {
    title: string;
    sub: string;
    primary: string;
    secondary: string;
    /** Soft urgency / scarcity at the bottom of the funnel */
    nudge: string;
  };
};

const en: HomeLuxuryCopy = {
  hero: {
    badge: "TJFit",
    eyebrow: "PREMIUM FITNESS TRANSFORMATION",
    headline: "Train Smarter.",
    headlineLine2: "Transform Completely.",
    headlineLine2Accent: "Transform",
    headlineLine2Rest: " Completely.",
    sub: "Complete 12-week programs and diet systems — structured like a real coach plan.",
    ctaPrimary: "Start Free Today",
    ctaSecondary: "View Programs",
    ctaBrowsePrograms: "Browse programs",
    trust: ["Clear plans", "Vetted coaches", "5 languages"],
    trustLine: "Free to start · No credit card · 20+ programs",
    ctaNote: ""
  },
  leadMagnet: {
    badge: "Free guide",
    title: "The TJFit starter roadmap",
    sub: "A short, practical outline: how to use programs, when a coach helps, and what's planned for deeper personalization — sent once by email.",
    bullets: [
      "Week-one structure you can follow immediately",
      "When to add coaching — and what to expect",
      "How TJAI will fit when it launches — without overwhelming your week"
    ],
    tjaiBadge: "Coming soon",
    tjaiSub: "TJAI personalized planning is not live yet. Use the roadmap above to stay in the loop — no separate AI page to visit."
  },
  pricingPreview: {
    badge: "Membership",
    title: "All-access is in final polish",
    sub: "We are finishing tiers and benefits. Early members will hear first — no surprise charges, no fake price tags today.",
    tiers: [
      { name: "Train", teaser: "Programs + community core" },
      { name: "Coach+", teaser: "Deeper coach touchpoints" },
      { name: "Elite", teaser: "Priority access & premium drops" }
    ],
    footnote: "Exact plans and pricing will be announced when ready. Join the list below to be notified.",
    tierStatus: "Coming soon"
  },
  midCta: {
    title: "Prefer email first?",
    sub: "Get the roadmap, then explore programs when it feels right."
  },
  leadNudge: {
    title: "The roadmap, before you go",
    sub: "One email, zero pressure — explore TJFit when you are ready."
  },
  social: {
    title: "Momentum, without noise",
    subtitle: "Fewer decisions. More follow-through.",
    stats: [
      { value: "12+", label: "Week flagship programs" },
      { value: "5", label: "Languages live" },
      { value: "24/7", label: "Train on your clock" }
    ],
    testimonials: [
      {
        quote: "The clearest training system I've followed. No noise — just execution.",
        author: "Maya R.",
        role: "Member"
      },
      {
        quote: "Finally a fitness product that respects my time and my intelligence.",
        author: "James L.",
        role: "Member"
      }
    ]
  },
  features: {
    title: "Everything You Need. Nothing You Don't.",
    subtitle: "Three pillars — zero clutter.",
    items: [
      {
        title: "Structured Programs",
        desc: "Day-by-day workouts with exact sets, reps, rest, and weekly progression."
      },
      {
        title: "Complete Diet Systems",
        desc: "Full meal plans with calories, macros, recipes, and alternatives."
      },
      {
        title: "Real Transformation",
        desc: "A system built like a real coach plan — home or gym, fat loss or muscle gain."
      }
    ]
  },
  programs: {
    title: "20 Complete Programs",
    subtitle: "Home or gym. Fat loss or muscle. Every goal, fully structured.",
    viewAll: "View All Programs →",
    from: "From",
    filterAll: "All",
    filterFat: "Fat Loss",
    filterMuscle: "Muscle Gain",
    filterHome: "Home",
    filterGym: "Gym"
  },
  dietsTeaser: {
    title: "10 Full Diet Systems",
    subtitle: "Cutting or bulking. Daily meals, macros, recipes, and progression.",
    cta: "View All Diets →",
    filterAll: "All",
    filterCut: "Cutting",
    filterBulk: "Bulking"
  },
  systemProof: {
    title: "The System Works.",
    stats: [
      { value: "20+", label: "Programs" },
      { value: "10+", label: "Diet Systems" },
      { value: "12 Weeks", label: "Per Program" },
      { value: "100%", label: "Structured" }
    ]
  },
  coaches: {
    title: "Coaches",
    subtitle: "Quality over quantity — apply if you lead with craft.",
    emptyTitle: "Coach roster is opening soon",
    emptyDesc:
      "We’re hand-picking verified coaches. Public applications aren’t open yet — browse the directory or dive into programs.",
    cta: "Apply to coach",
    applyComingSoonBadge: "Coming soon",
    browse: "Browse coaches",
    viewProfile: "View profile"
  },
  finalCta: {
    title: "Ready to Transform?",
    sub: "Get your first program free. No credit card needed.",
    primary: "Start Free Today",
    secondary: "Membership news",
    nudge: "We don’t sell your email. Unsubscribe anytime."
  }
};

const tr: HomeLuxuryCopy = {
  hero: {
    badge: "TJFit",
    headline: "Ciddi antrenman için sakin, net bir sistem.",
    sub: "Yapılandırılmış programlar, doğrulanmış koçlar ve derinleşmek istediğinde TJAI — gürültü için değil, bilinçle çalışanlar için.",
    ctaPrimary: "Ücretsiz yol haritanı al",
    ctaSecondary: "Hesap oluştur",
    ctaBrowsePrograms: "Programları keşfet",
    trust: ["Net planlar", "Seçilmiş koçlar", "5 dil"],
    ctaNote: "Yol haritası e-postada · Hesap isteğe bağlı · Karmaşa yok"
  },
  leadMagnet: {
    badge: "Ücretsiz rehber",
    title: "TJFit başlangıç yol haritası",
    sub: "Kısa ve uygulanabilir: programları nasıl kullanırsın, koç ne zaman işe yarar, kişiselleştirme tarafında neler hazırlanıyor — tek e-posta.",
    bullets: [
      "İlk haftanı netleştiren basit çerçeve",
      "Koçluk ne zaman mantıklı — beklenti nedir",
      "TJAI yayına girince haftana nasıl oturur — seni boğmadan"
    ],
    tjaiBadge: "Çok yakında",
    tjaiSub: "TJAI kişisel planlama henüz yayında değil. Üstteki yol haritasıyla haberdar ol — ayrı bir yapay zekâ sayfası yok."
  },
  pricingPreview: {
    badge: "Üyelik",
    title: "Tam erişim son dokunuşta",
    sub: "Seviyeleri ve avantajları netleştiriyoruz. Erken üyeler ilk duyan olacak — bugün sahte fiyat yok.",
    tiers: [
      { name: "Train", teaser: "Programlar + topluluk çekirdeği" },
      { name: "Coach+", teaser: "Koçla daha yakın temas" },
      { name: "Elite", teaser: "Öncelik ve premium içerik" }
    ],
    footnote: "Planlar hazır olunca duyururuz. Aşağıdan haber listesine yazıl.",
    tierStatus: "Çok yakında"
  },
  midCta: {
    title: "Önce e-posta mı istersin?",
    sub: "Yol haritasını gönderelim; programlara sonra göz at."
  },
  leadNudge: {
    title: "Gitmeden — ücretsiz yol haritası",
    sub: "Tek e-posta, baskı yok. TJFit’e kendi temponla dön."
  },
  social: {
    title: "Gürültüsüz ivme",
    subtitle: "Daha az karar. Daha çok süreklilik.",
    stats: [
      { value: "12+", label: "Amiral program haftaları" },
      { value: "5", label: "Canlı dil" },
      { value: "7/24", label: "Senin saatine göre" }
    ],
    testimonials: [
      {
        quote: "Takip ettiğim en net sistem. Gürültü yok — sadece iş.",
        author: "Maya R.",
        role: "Üye"
      },
      {
        quote: "Sonunda zamanıma ve zekâma saygı duyan bir fitness deneyimi.",
        author: "James L.",
        role: "Üye"
      }
    ]
  },
  features: {
    title: "Ne sunuyoruz",
    subtitle: "Dört odaklı katman — fazlalık yok.",
    items: [
      {
        title: "Koçluk",
        desc: "İhtiyaç duyduğunda insan desteği — gerçek hesap verebilirlikle mesajlaşma."
      },
      {
        title: "Programlar",
        desc: "Her zaman bir sonraki adımı bildiğin, ilerlemesi okunaklı planlar."
      },
      {
        title: "Topluluk",
        desc: "Konular, meydan okumalar ve hikâyeler — ilham var, kaos yok."
      },
      {
        title: "Yapay zekâ ve kişiselleştirme",
        desc: "Hedefe daha hızlı otur, yolunu akıllı ve uygulanabilir önerilerle netleştir."
      }
    ]
  },
  programs: {
    title: "Programlar",
    subtitle: "Hafta hafta net yapılı amiral planlar.",
    viewAll: "Tüm programlar",
    from: "Başlangıç"
  },
  coaches: {
    title: "Koçlar",
    subtitle: "Önce kalite — işini ustalıkla yürütüyorsan başvur.",
    emptyTitle: "Koç kadrosu açılıyor",
    emptyDesc:
      "Doğrulanmış koçları tek tek seçiyoruz. Herkese açık başvuru henüz yok — rehbere göz at veya programlara dal.",
    cta: "Koç olarak başvur",
    applyComingSoonBadge: "Çok yakında",
    browse: "Koçları gör",
    viewProfile: "Profili gör"
  },
  finalCta: {
    title: "Hazır olduğunda hesabını aç",
    sub: "Programları keşfet, ilerlemeni kaydet, koç akışları açıldıkça kullan.",
    primary: "Ücretsiz hesap oluştur",
    secondary: "Üyelik haberleri",
    nudge: "E-postanı satmıyoruz. Tek tıkla ayrıl."
  }
};

const ar: HomeLuxuryCopy = {
  hero: {
    badge: "TJFit",
    headline: "نظام هادئ وواضح لتدريب جاد.",
    sub: "برامج مُنظَّمة، مدربون موثوقون، وTJAI عندما تريد أن تتعمق — لمن يتدرب بوعي، لا لمن يبحث عن الضجيج.",
    ctaPrimary: "خارطتك المجانية",
    ctaSecondary: "ابدأ مجاناً",
    ctaBrowsePrograms: "البرامج",
    trust: ["خطط واضحة", "مدربون مختارون", "٥ لغات"],
    ctaNote: "خارطة بالبريد · الحساب اختياري · بلا فوضى"
  },
  leadMagnet: {
    badge: "دليل مجاني",
    title: "خارطة انطلاق TJFit",
    sub: "ملخص قصير وعملي: كيف تستخدم البرامج، متى يضيف المدرب قيمة، وماذا نُجهّز للتخصيص — في رسالة واحدة فقط.",
    bullets: [
      "إطار أسبوعك الأول جاهز للتنفيذ",
      "متى يصبح التدريب مع مدرب منطقياً — وماذا تتوقع",
      "كيف يندمج TJAI بعد الإطلاق — دون أن يثقل أسبوعك"
    ],
    tjaiBadge: "قريباً",
    tjaiSub: "التخطيط الشخصي بـTJAI ليس متاحاً بعد. الخارطة أعلاه تكفي لتبقى على اطلاع — بلا صفحة ذكاء اصطناعي منفصلة."
  },
  pricingPreview: {
    badge: "العضوية",
    title: "الوصول الكامل في اللمسات الأخيرة",
    sub: "ننهي المستويات والمزايا. الأعضاء الأوائل يعلمون أولاً — بلا أسعار وهمية اليوم.",
    tiers: [
      { name: "Train", teaser: "البرامج والمجتمع الأساسي" },
      { name: "Coach+", teaser: "تواصل أعمق مع المدرب" },
      { name: "Elite", teaser: "أولوية ومحتوى مميز" }
    ],
    footnote: "الإعلان عند الجاهزية. سجّل بالأسفل للتنبيه.",
    tierStatus: "قريباً"
  },
  midCta: {
    title: "تفضّل أن نرسل الخارطة بالبريد؟",
    sub: "نرسلها مرة واحدة. زر البرامج عندما يناسبك."
  },
  leadNudge: {
    title: "قبل أن تغادر — خارطتك المجانية",
    sub: "رسالة واحدة، بلا ضغط. ارجع إلى TJFit عندما يناسب جدولك."
  },
  social: {
    title: "زخم بلا ضجيج",
    subtitle: "أقل تردداً. أكثر استمراراً.",
    stats: [
      { value: "+12", label: "أسابيع برامج رئيسية" },
      { value: "5", label: "لغات مفعّلة" },
      { value: "٢٤/٧", label: "تدريب في وقتك" }
    ],
    testimonials: [
      {
        quote: "أوضح نظام تدريب جرّبته. بلا ضجيج — تنفيذ فقط.",
        author: "مايا ر.",
        role: "عضوة"
      },
      {
        quote: "أخيراً منتج لياقة يحترم وقتي وذكائي.",
        author: "جيمس ل.",
        role: "عضو"
      }
    ]
  },
  features: {
    title: "ما الذي تحصل عليه",
    subtitle: "أربع طبقات مركزة — بلا فوضى.",
    items: [
      {
        title: "التدريب",
        desc: "إرشاد بشري عند الحاجة — رسائل وسير عمل مبنية على المساءلة الحقيقية."
      },
      {
        title: "البرامج",
        desc: "خطط تدريجية بهيكل واضح لتعرف دائماً الخطوة التالية."
      },
      {
        title: "المجتمع",
        desc: "نقاشات وتحديات وقصص في مركز هادئ — إلهام بلا فوضى."
      },
      {
        title: "الذكاء والتخصيص",
        desc: "طابق أهدافك أسرع وحسّن مسارك باقتراحات عملية ذكية."
      }
    ]
  },
  programs: {
    title: "البرامج",
    subtitle: "خطط رئيسية بأسابيع واضحة وقابلة للقياس.",
    viewAll: "عرض كل البرامج",
    from: "من"
  },
  coaches: {
    title: "المدربون",
    subtitle: "الجودة قبل العدد — قدّم إذا كانت خبرتك هي رصيدك.",
    emptyTitle: "قائمة المدربين تفتح قريباً",
    emptyDesc:
      "نختار المدربين بعناية. التقديم العام غير مفتوح بعد — تصفّح الدليل أو ابدأ من البرامج.",
    cta: "قدّم طلباً كمدرب",
    applyComingSoonBadge: "قريباً",
    browse: "تصفح المدربين",
    viewProfile: "عرض الملف"
  },
  finalCta: {
    title: "حسابك حين تشعر أن الوقت مناسب",
    sub: "برامج، تقدّم محفوظ، وأدوات للمدربين مع كل تحديث.",
    primary: "سجّل مجاناً",
    secondary: "العضوية",
    nudge: "بريدك ليس للبيع. إلغاء في أي وقت."
  }
};

const es: HomeLuxuryCopy = {
  hero: {
    badge: "TJFit",
    headline: "Un sistema calmado para entrenar en serio.",
    sub: "Programas claros, coaches verificados y TJAI cuando quieras ir más allá — para quien entrena con intención, no por moda.",
    ctaPrimary: "Consigue tu guía gratis",
    ctaSecondary: "Crear cuenta gratis",
    ctaBrowsePrograms: "Explorar programas",
    trust: ["Planes claros", "Coaches seleccionados", "5 idiomas"],
    ctaNote: "Guía por email · Cuenta opcional · Sin ruido"
  },
  leadMagnet: {
    badge: "Guía gratis",
    title: "Tu hoja de ruta inicial en TJFit",
    sub: "Breve y accionable: cómo usar los programas, cuándo sumar a un coach y qué viene en personalización — un solo correo.",
    bullets: [
      "Tu primera semana, ya enmarcada",
      "Cuándo tiene sentido el coaching — y qué esperar",
      "Cómo encajará TJAI al salir — sin saturarte"
    ],
    tjaiBadge: "Muy pronto",
    tjaiSub: "El planning con TJAI aún no está activo. La guía de arriba basta para enterarte — sin página de IA aparte."
  },
  pricingPreview: {
    badge: "Membresía",
    title: "Acceso total, últimos retoques",
    sub: "Estamos cerrando niveles y beneficios. Los primeros en enterarse — sin precios de adorno hoy.",
    tiers: [
      { name: "Train", teaser: "Programas y núcleo de comunidad" },
      { name: "Coach+", teaser: "Más contacto con tu coach" },
      { name: "Elite", teaser: "Prioridad y contenido premium" }
    ],
    footnote: "Lo anunciaremos cuando esté listo. Deja tu correo abajo.",
    tierStatus: "Muy pronto"
  },
  midCta: {
    title: "¿Primero por correo?",
    sub: "Te enviamos la guía una vez. Los programas, cuando quieras."
  },
  leadNudge: {
    title: "Antes de irte — tu guía gratis",
    sub: "Un correo, cero presión. Vuelve a TJFit cuando te encaje."
  },
  social: {
    title: "Impulso, sin ruido",
    subtitle: "Menos dudas. Más constancia.",
    stats: [
      { value: "12+", label: "Semanas en programas flagship" },
      { value: "5", label: "Idiomas activos" },
      { value: "24/7", label: "Entrena a tu ritmo" }
    ],
    testimonials: [
      {
        quote: "El sistema de entrenamiento más claro que he seguido. Sin ruido — solo ejecución.",
        author: "Maya R.",
        role: "Miembro"
      },
      {
        quote: "Por fin un producto fitness que respeta mi tiempo y mi criterio.",
        author: "James L.",
        role: "Miembro"
      }
    ]
  },
  features: {
    title: "Qué incluye",
    subtitle: "Cuatro capas claras — sin relleno.",
    items: [
      {
        title: "Coaching",
        desc: "Guia humana cuando la necesitas — mensajes y flujos con responsabilidad real."
      },
      {
        title: "Programas",
        desc: "Planes progresivos con estructura explicita para saber siempre el siguiente paso."
      },
      {
        title: "Comunidad",
        desc: "Hilos, retos e historias en un hub tranquilo — inspiracion sin caos."
      },
      {
        title: "IA y personalizacion",
        desc: "Alinea objetivos mas rapido y afina tu camino con sugerencias inteligentes."
      }
    ]
  },
  programs: {
    title: "Programas",
    subtitle: "Planes insignia con semanas claras y medibles.",
    viewAll: "Ver todos los programas",
    from: "Desde"
  },
  coaches: {
    title: "Coaches",
    subtitle: "Calidad antes que cantidad — postula si tu oficio te define.",
    emptyTitle: "El roster abre pronto",
    emptyDesc:
      "Elegimos coaches uno a uno. Las postulaciones públicas aún no están — mira el directorio o entra por programas.",
    cta: "Postular como coach",
    applyComingSoonBadge: "Muy pronto",
    browse: "Ver coaches",
    viewProfile: "Ver perfil"
  },
  finalCta: {
    title: "Abre tu cuenta cuando te encaje",
    sub: "Explora programas, guarda avances y activa herramientas de coaching con cada lanzamiento.",
    primary: "Crear cuenta gratis",
    secondary: "Novedades de membresía",
    nudge: "No vendemos tu correo. Te das de baja cuando quieras."
  }
};

const fr: HomeLuxuryCopy = {
  hero: {
    badge: "TJFit",
    headline: "Un cadre posé pour s’entraîner sérieusement.",
    sub: "Programmes structurés, coachs vérifiés, et TJAI quand vous voulez aller plus loin — pour celles et ceux qui s’entraînent avec intention, pas pour le bruit.",
    ctaPrimary: "Recevoir la feuille de route",
    ctaSecondary: "Créer un compte gratuit",
    ctaBrowsePrograms: "Parcourir les programmes",
    trust: ["Plans clairs", "Coachs sélectionnés", "5 langues"],
    ctaNote: "Feuille de route par e-mail · Compte optionnel · Sans surcharge"
  },
  leadMagnet: {
    badge: "Guide gratuit",
    title: "Votre feuille de route TJFit",
    sub: "Court et concret : programmes, quand un coach apporte vraiment plus, et ce qui arrive côté personnalisation — un seul e-mail.",
    bullets: [
      "Votre première semaine, déjà cadrée",
      "Quand le coaching a du sens — et à quoi vous attendre",
      "Comment TJAI s’intègre au lancement — sans vous saturer"
    ],
    tjaiBadge: "Bientôt",
    tjaiSub: "Le planning personnalisé TJAI n’est pas encore en ligne. La feuille de route ci-dessus suffit pour suivre l’actu — pas de page « IA » à part."
  },
  pricingPreview: {
    badge: "Abonnement",
    title: "L'acces complet en derniere passe",
    sub: "Nous finalisons niveaux et avantages. Les premiers membres seront informes — pas de faux prix aujourd'hui.",
    tiers: [
      { name: "Train", teaser: "Programmes et socle communaute" },
      { name: "Coach+", teaser: "Plus de lien avec le coach" },
      { name: "Elite", teaser: "Priorite et contenu premium" }
    ],
    footnote: "On annonce quand c’est prêt. Laissez votre e-mail ci-dessous.",
    tierStatus: "Bientôt"
  },
  midCta: {
    title: "Plutôt un e-mail pour commencer ?",
    sub: "On vous envoie la feuille de route une fois. Les programmes, quand vous voulez."
  },
  leadNudge: {
    title: "Avant de partir — la feuille de route offerte",
    sub: "Un e-mail, zéro pression. Revenez sur TJFit quand ça vous arrange."
  },
  social: {
    title: "De l’élan, sans le bruit",
    subtitle: "Moins d’hésitation. Plus de régularité.",
    stats: [
      { value: "12+", label: "Semaines de programmes phares" },
      { value: "5", label: "Langues actives" },
      { value: "24/7", label: "A votre rythme" }
    ],
    testimonials: [
      {
        quote: "Le systeme d'entrainement le plus clair que j'aie suivi. Pas de bruit — juste l'execution.",
        author: "Maya R.",
        role: "Membre"
      },
      {
        quote: "Enfin un produit fitness qui respecte mon temps et mon intelligence.",
        author: "James L.",
        role: "Membre"
      }
    ]
  },
  features: {
    title: "Ce que vous avez",
    subtitle: "Quatre couches nettes — zéro superflu.",
    items: [
      {
        title: "Coaching",
        desc: "Un guide humain quand il le faut — messagerie et flux avec redevabilite reelle."
      },
      {
        title: "Programmes",
        desc: "Plans progressifs structures pour toujours connaitre la prochaine etape."
      },
      {
        title: "Communaute",
        desc: "Fils, defis et recits dans un hub calme — inspiration sans chaos."
      },
      {
        title: "IA & personnalisation",
        desc: "Alignez vos objectifs plus vite, affinez votre parcours avec des suggestions simples et utiles."
      }
    ]
  },
  programs: {
    title: "Programmes",
    subtitle: "Plans phares, semaine après semaine, lisibles d’un coup d’œil.",
    viewAll: "Tous les programmes",
    from: "À partir de"
  },
  coaches: {
    title: "Coachs",
    subtitle: "La qualité avant le volume — postulez si votre métier parle pour vous.",
    emptyTitle: "Le roster s’ouvre bientôt",
    emptyDesc:
      "On choisit les coachs avec exigence. Candidatures publiques pas encore ouvertes — parcourez l’annuaire ou commencez par les programmes.",
    cta: "Postuler comme coach",
    applyComingSoonBadge: "Bientôt",
    browse: "Voir les coachs",
    viewProfile: "Voir le profil"
  },
  finalCta: {
    title: "Créez votre compte quand vous le sentez",
    sub: "Parcourez les programmes, enregistrez vos progrès, débloquez le coaching au fil des mises en ligne.",
    primary: "Compte gratuit",
    secondary: "Actu abonnement",
    nudge: "On ne revend pas vos e-mails. Désinscription en un clic."
  }
};

const copies: Record<Locale, HomeLuxuryCopy> = {
  en,
  tr,
  ar,
  es,
  fr
};

export function getHomeLuxuryCopy(locale: Locale): HomeLuxuryCopy {
  return copies[locale] ?? copies.en;
}
