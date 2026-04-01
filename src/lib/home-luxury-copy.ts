import type { Locale } from "@/lib/i18n";

export type HomeLuxuryCopy = {
  hero: {
    badge: string;
    /** Primary headline — one clear statement */
    headline: string;
    /** Optional second line for rhythm; omit or empty for a single-line title */
    headlineLine2?: string;
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
    headline: "A calm system for serious training.",
    sub: "Structured programs, verified coaches, and TJAI when you want depth — for people who train with intention, not noise.",
    ctaPrimary: "Get the free roadmap",
    ctaSecondary: "Create free account",
    ctaBrowsePrograms: "Browse programs",
    trust: ["Structured plans", "Vetted coaches", "5 languages"],
    ctaNote: "Free roadmap by email · Free account anytime · No clutter"
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
    title: "What you get",
    subtitle: "Four focused layers — no clutter.",
    items: [
      {
        title: "Coaching",
        desc: "Human guidance when you need it — messaging and workflows built around real accountability."
      },
      {
        title: "Programs",
        desc: "Progressive plans with explicit structure so you always know the next right step."
      },
      {
        title: "Community",
        desc: "Threads, challenges, and stories in one calm hub — inspiration without the chaos."
      },
      {
        title: "AI & personalization",
        desc: "Match to goals faster and refine your path with intelligent, practical suggestions."
      }
    ]
  },
  programs: {
    title: "Programs",
    subtitle: "Flagship plans with clear weekly structure.",
    viewAll: "View all programs",
    from: "From"
  },
  coaches: {
    title: "Coaches",
    subtitle: "Quality-first roster — apply if you lead with craft.",
    emptyTitle: "Coach roster opening",
    emptyDesc:
      "We are curating verified coaches. Public coach applications are not open yet — browse the directory or explore programs.",
    cta: "Apply as a coach",
    applyComingSoonBadge: "Coming soon",
    browse: "Browse coaches",
    viewProfile: "View profile"
  },
  finalCta: {
    title: "Create your account when you are ready",
    sub: "Explore programs, save progress, and unlock coaching workflows as they go live.",
    primary: "Create free account",
    secondary: "Membership updates",
    nudge: "We never sell your email. Unsubscribe in one click."
  }
};

const tr: HomeLuxuryCopy = {
  hero: {
    badge: "TJFit",
    headline: "Ciddi antrenman icin sakin bir sistem.",
    sub: "Yapilandirilmis programlar, dogrulanmis koçlar ve derinlik icin TJAI — gurultu degil, niyetle calisanlar icin.",
    ctaPrimary: "Ucretsiz yol haritasi",
    ctaSecondary: "Ucretsiz hesap olustur",
    ctaBrowsePrograms: "Programlari incele",
    trust: ["Yapilandirilmis planlar", "Secilmis koçlar", "5 dil"],
    ctaNote: "E-posta ile ucretsiz harita · Hesap istege bagli · Sade arayuz"
  },
  leadMagnet: {
    badge: "Ucretsiz rehber",
    title: "TJFit baslangic yol haritasi",
    sub: "Programlari nasil kullanacaginiz, koç ne zaman ise yarar ve kisisel planlama icin neyin hazirlandigi — tek e-postada ozet.",
    bullets: [
      "Ilk hafta icin net bir yapi",
      "Koçluk ne zaman mantikli — ne beklenir",
      "TJAI yayina ciktiginda haftaniza nasil oturacagi — sizi bogmadan"
    ],
    tjaiBadge: "Yakinda",
    tjaiSub: "TJAI kisisel planlama henuz canli degil. Ustteki yol haritasiyla haberdar olun — ayri bir AI sayfasi yok."
  },
  pricingPreview: {
    badge: "Uyelik",
    title: "Tam erisim son rutuşta",
    sub: "Seviyeler ve avantajlar netlesiyor. Erken uyeler ilk haberdar olacak — sahte fiyat yok.",
    tiers: [
      { name: "Train", teaser: "Programlar + topluluk temeli" },
      { name: "Coach+", teaser: "Daha yakin koç temasi" },
      { name: "Elite", teaser: "Oncelikli erisim ve ozel icerik" }
    ],
    footnote: "Planlar hazir oldugunda duyurulacak. Asagidaki liste ile haber alin.",
    tierStatus: "Cok yakinda"
  },
  midCta: {
    title: "Once e-posta mi?",
    sub: "Yol haritasini alin, programlari sonra inceleyin."
  },
  leadNudge: {
    title: "Gitmeden — ucretsiz harita",
    sub: "Tek e-posta, baski yok — TJFit'i kendi temponuzda kesfedin."
  },
  social: {
    title: "Momentum, gurultusuz",
    subtitle: "Daha az karar. Daha cok devamlilik.",
    stats: [
      { value: "12+", label: "Haftalik amiral programlar" },
      { value: "5", label: "Canli dil" },
      { value: "7/24", label: "Senin saatine gore" }
    ],
    testimonials: [
      {
        quote: "Takip ettigim en net antrenman sistemi. Gurultu yok — sadece uygulama.",
        author: "Maya R.",
        role: "Uye"
      },
      {
        quote: "Sonunda zamanimi ve zekami saygi duyan bir fitness urunu.",
        author: "James L.",
        role: "Uye"
      }
    ]
  },
  features: {
    title: "Ne sunuyoruz",
    subtitle: "Dort odakli katman — fazlalik yok.",
    items: [
      {
        title: "Koçluk",
        desc: "Ihtiyac duydugunda insan rehberligi — gercek hesap verebilirlikle mesajlasma."
      },
      {
        title: "Programlar",
        desc: "Her zaman bir sonraki adimi bildigin acik yapida ilerleyen planlar."
      },
      {
        title: "Topluluk",
        desc: "Threadler, meydan okumalar ve hikayeler — kaos olmadan ilham."
      },
      {
        title: "AI ve kisisellestirme",
        desc: "Hedeflere daha hizli uyum ve akilli, pratik onerilerle yolu netlestirme."
      }
    ]
  },
  programs: {
    title: "Programlar",
    subtitle: "Net haftalik yapiya sahip amiral planlar.",
    viewAll: "Tum programlar",
    from: "Baslangic"
  },
  coaches: {
    title: "Koçlar",
    subtitle: "Once kalite — zanaatle liderlik ediyorsaniz basvurun.",
    emptyTitle: "Koç kadrosu aciliyor",
    emptyDesc:
      "Dogrulanmis koçlari seciyoruz. Herkese acik koç basvurusu henuz yok — rehberi gezin veya programlara bakin.",
    cta: "Koç olarak basvur",
    applyComingSoonBadge: "Yakinda",
    browse: "Koçlari gor",
    viewProfile: "Profili gor"
  },
  finalCta: {
    title: "Hazir oldugunuzda hesap acin",
    sub: "Programlari kesfedin, ilerlemeyi kaydedin, canli koçluk akislari acildikca kullanin.",
    primary: "Ucretsiz hesap olustur",
    secondary: "Uyelik guncellemeleri",
    nudge: "E-postanizi satmiyoruz. Tek tikla cikis."
  }
};

const ar: HomeLuxuryCopy = {
  hero: {
    badge: "TJFit",
    headline: "نظام هادئ لتدريب جاد.",
    sub: "برامج منظمة ومدربون موثوقون وTJAI عندما تريد العمق — لمن يتدرب بوعي لا بفوضى.",
    ctaPrimary: "خارطة الطريق المجانية",
    ctaSecondary: "إنشاء حساب مجاني",
    ctaBrowsePrograms: "تصفح البرامج",
    trust: ["خطط واضحة", "مدربون مختارون", "٥ لغات"],
    ctaNote: "خارطة بالبريد · حساب اختياري · بلا ازدحام"
  },
  leadMagnet: {
    badge: "دليل مجاني",
    title: "خارطة بداية TJFit",
    sub: "ملخص عملي: البرامج، متى يساعد المدرب، وما المخطط للتخصيص الأعمق — برسالة واحدة.",
    bullets: [
      "هيكل الأسبوع الأول جاهز للتطبيق",
      "متى تضيف التدريب — وماذا تتوقع",
      "كيف سيتكامل TJAI عند الإطلاق — دون إرهاق"
    ],
    tjaiBadge: "قريباً",
    tjaiSub: "تخطيط TJAI الشخصي غير متاح بعد. استخدم الخارطة أعلاه للبقاء على اطلاع — لا صفحة ذكاء اصطناعي منفصلة."
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
    title: "تفضّل البريد أولاً؟",
    sub: "احصل على الخارطة، ثم استكشف البرامج براحة."
  },
  leadNudge: {
    title: "قبل المغادرة — الخارطة المجانية",
    sub: "رسالة واحدة بلا ضغط — استكشف TJFit في وقتك."
  },
  social: {
    title: "زخم بلا ضجيج",
    subtitle: "قرارات أقل. استمرارية أكثر.",
    stats: [
      { value: "+12", label: "أسابيع برامج رئيسية" },
      { value: "5", label: "لغات مفعّلة" },
      { value: "٢٤/٧", label: "تدريب في وقتك" }
    ],
    testimonials: [
      {
        quote: "أوضح نظام تدريب تبعته. بلا ضجيج — فقط تنفيذ.",
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
    title: "برامج بإحساس فاخر",
    subtitle: "ابدأ بخطط رئيسية مصممة للاستمرار وأسابيع قابلة للقياس.",
    viewAll: "كل البرامج",
    from: "من"
  },
  coaches: {
    title: "المدربون",
    subtitle: "الجودة أولاً — تقدم إذا قادتك الحرفية.",
    emptyTitle: "فتح قائمة المدربين",
    emptyDesc:
      "نختار مدربين موثوقين. طلبات الانضمام العامة غير مفتوحة بعد — تصفح الدليل أو البرامج.",
    cta: "تقديم كمدرب",
    applyComingSoonBadge: "قريباً",
    browse: "تصفح المدربين",
    viewProfile: "عرض الملف"
  },
  finalCta: {
    title: "أنشئ حسابك عندما تكون جاهزاً",
    sub: "استكشف البرامج واحفظ التقدم وفعّل مسارات التدريب مع الإطلاق.",
    primary: "إنشاء حساب مجاني",
    secondary: "تحديثات العضوية",
    nudge: "لا نبيع بريدك. إلغاء الاشتراك بنقرة."
  }
};

const es: HomeLuxuryCopy = {
  hero: {
    badge: "TJFit",
    headline: "Un sistema sobrio para entrenar en serio.",
    sub: "Programas estructurados, coaches verificados y TJAI cuando quieres profundidad — para quien entrena con intención.",
    ctaPrimary: "Guia inicial gratis",
    ctaSecondary: "Crear cuenta gratis",
    ctaBrowsePrograms: "Ver programas",
    trust: ["Planes claros", "Coaches seleccionados", "5 idiomas"],
    ctaNote: "Guia por email · Cuenta opcional · Sin ruido"
  },
  leadMagnet: {
    badge: "Guia gratis",
    title: "Hoja de ruta inicial TJFit",
    sub: "Resumen practico: programas, cuando sumar coach y que viene en personalizacion — un solo email.",
    bullets: [
      "Estructura de la primera semana lista para aplicar",
      "Cuando tiene sentido el coaching y que esperar",
      "Como encajara TJAI al lanzarse — sin saturarte"
    ],
    tjaiBadge: "Proximamente",
    tjaiSub: "El planning personalizado con TJAI aun no esta activo. Deja el email arriba para enterarte — no hay pagina de IA aparte."
  },
  pricingPreview: {
    badge: "Membresia",
    title: "El acceso total en refinamiento final",
    sub: "Estamos cerrando niveles y beneficios. Los primeros miembros sabran antes — sin precios falsos hoy.",
    tiers: [
      { name: "Train", teaser: "Programas y nucleo de comunidad" },
      { name: "Coach+", teaser: "Mas contacto con coach" },
      { name: "Elite", teaser: "Prioridad y contenido premium" }
    ],
    footnote: "Anunciaremos cuando este listo. Deja tu email abajo.",
    tierStatus: "Muy pronto"
  },
  midCta: {
    title: "¿Prefieres email primero?",
    sub: "Recibe la guia y explora programas despues."
  },
  leadNudge: {
    title: "Antes de irte — la guia gratis",
    sub: "Un email, sin presion — explora TJFit a tu ritmo."
  },
  social: {
    title: "Momentum, sin ruido",
    subtitle: "Menos decisiones. Más constancia.",
    stats: [
      { value: "12+", label: "Semanas en programas flagship" },
      { value: "5", label: "Idiomas activos" },
      { value: "24/7", label: "Entrena a tu ritmo" }
    ],
    testimonials: [
      {
        quote: "El sistema de entrenamiento mas claro que he seguido. Sin ruido — solo ejecucion.",
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
    title: "Que incluye",
    subtitle: "Cuatro capas enfocadas — sin relleno.",
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
    subtitle: "Planes flagship con estructura semanal clara.",
    viewAll: "Ver todos los programas",
    from: "Desde"
  },
  coaches: {
    title: "Coaches",
    subtitle: "Calidad primero — aplica si lideras con oficio.",
    emptyTitle: "Apertura del roster",
    emptyDesc:
      "Estamos curando coaches verificados. Las solicitudes publicas aun no estan abiertas — mira el directorio o los programas.",
    cta: "Solicitar ser coach",
    applyComingSoonBadge: "Proximamente",
    browse: "Ver coaches",
    viewProfile: "Ver perfil"
  },
  finalCta: {
    title: "Crea tu cuenta cuando quieras",
    sub: "Explora programas, guarda progreso y activa flujos de coaching al salir.",
    primary: "Crear cuenta gratis",
    secondary: "Novedades de membresia",
    nudge: "No vendemos tu email. Baja en un clic."
  }
};

const fr: HomeLuxuryCopy = {
  hero: {
    badge: "TJFit",
    headline: "Un systeme sobre pour s'entrainer serieusement.",
    sub: "Programmes structures, coachs verifies et TJAI quand vous voulez aller plus loin — pour ceux qui s'entrainent avec intention.",
    ctaPrimary: "Feuille de route gratuite",
    ctaSecondary: "Creer un compte gratuit",
    ctaBrowsePrograms: "Voir les programmes",
    trust: ["Plans clairs", "Coachs selectionnes", "5 langues"],
    ctaNote: "Roadmap par email · Compte optionnel · Sans surcharge"
  },
  leadMagnet: {
    badge: "Guide gratuit",
    title: "Feuille de route TJFit",
    sub: "Resume pratique: programmes, quand ajouter un coach, et la personnalisation prevue — un email.",
    bullets: [
      "Structure de semaine 1 prete a appliquer",
      "Quand le coaching aide — et le cadre attendu",
      "Comment TJAI s'integre au lancement — sans surcharge"
    ],
    tjaiBadge: "Bientot",
    tjaiSub: "La planification TJAI personnalisee n'est pas encore en ligne. Utilisez la feuille de route ci-dessus — pas de page IA separee."
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
    footnote: "Annonce des que c'est pret. Laissez votre email ci-dessous.",
    tierStatus: "Bientot"
  },
  midCta: {
    title: "Preferez l'email d'abord ?",
    sub: "Recevez la feuille de route, explorez les programmes ensuite."
  },
  leadNudge: {
    title: "Avant de partir — la feuille de route",
    sub: "Un email, sans pression — explorez TJFit a votre rythme."
  },
  social: {
    title: "Du momentum, sans le bruit",
    subtitle: "Moins de decisions. Plus de regularite.",
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
    title: "Ce que vous obtenez",
    subtitle: "Quatre couches ciblees — zero superflu.",
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
        title: "IA et personnalisation",
        desc: "Alignez vos objectifs plus vite et affinez votre parcours avec des suggestions intelligentes."
      }
    ]
  },
  programs: {
    title: "Programmes",
    subtitle: "Plans phares avec structure hebdomadaire claire.",
    viewAll: "Tous les programmes",
    from: "A partir de"
  },
  coaches: {
    title: "Coachs",
    subtitle: "La qualite d'abord — postulez si vous menez par le metier.",
    emptyTitle: "Ouverture du roster coachs",
    emptyDesc:
      "Nous selectionnons des coachs verifies. Les candidatures publiques ne sont pas encore ouvertes — parcourez l'annuaire ou les programmes.",
    cta: "Postuler comme coach",
    applyComingSoonBadge: "Bientot",
    browse: "Voir les coachs",
    viewProfile: "Voir le profil"
  },
  finalCta: {
    title: "Creez votre compte quand vous etes pret",
    sub: "Explorez les programmes, enregistrez la progression et activez le coaching au fil des lancements.",
    primary: "Creer un compte gratuit",
    secondary: "Infos abonnement",
    nudge: "Nous ne revendons pas vos emails. Desinscription en un clic."
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
  return copies[locale];
}
