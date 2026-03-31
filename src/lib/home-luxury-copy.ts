import type { Locale } from "@/lib/i18n";

export type HomeLuxuryCopy = {
  hero: {
    badge: string;
    headline: string;
    headlineLine2: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trust: string[];
    /** Short friction-reducer under primary CTAs */
    ctaNote: string;
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
    browse: string;
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
    headline: "Training,",
    headlineLine2: "streamlined.",
    sub: "Programs, coaching, and community in one quiet system — built so you always know what to do next.",
    ctaPrimary: "Start free",
    ctaSecondary: "Browse programs",
    trust: ["Structured plans", "Coach-ready", "5 languages"],
    ctaNote: "Free account · Under a minute · Browse before you commit"
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
      "We are curating verified coaches. Apply to join a platform where your expertise is framed like a luxury product.",
    cta: "Apply as a coach",
    browse: "Browse coaches"
  },
  finalCta: {
    title: "Start while it stays open",
    sub: "Create your account, explore programs, then upgrade when you are ready.",
    primary: "Create free account",
    secondary: "Membership",
    nudge: "We keep onboarding selective — new members get priority this month."
  }
};

const tr: HomeLuxuryCopy = {
  hero: {
    badge: "TJFit",
    headline: "Antrenman,",
    headlineLine2: "sade ve net.",
    sub: "Programlar, koçluk ve topluluk tek sakin sistemde — bir sonraki adimi her zaman bilirsiniz.",
    ctaPrimary: "Ucretsiz basla",
    ctaSecondary: "Programlara goz at",
    trust: ["Yapilandirilmis planlar", "Koça hazir", "5 dil"],
    ctaNote: "Ucretsiz hesap · Dakikalar icinde · Once gezin, sonra karar verin"
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
      "Dogrulanmis koçlari seciyoruz. Uzmanliginizin luks bir urun gibi cercevelendigi bir platforma katilin.",
    cta: "Koç olarak basvur",
    browse: "Koçlari gor"
  },
  finalCta: {
    title: "Acikken baslayin",
    sub: "Hesap acin, programlari inceleyin, hazir oldugunuzda yukseltin.",
    primary: "Ucretsiz hesap olustur",
    secondary: "Uyelik",
    nudge: "Onboarding'i secici tutuyoruz — bu ay yeni uyelere oncelik."
  }
};

const ar: HomeLuxuryCopy = {
  hero: {
    badge: "TJFit",
    headline: "تدريب",
    headlineLine2: "ببساطة ووضوح.",
    sub: "البرامج والتدريب والمجتمع في نظام هادئ — لتعرف دائماً خطوتك التالية.",
    ctaPrimary: "ابدأ مجاناً",
    ctaSecondary: "تصفح البرامج",
    trust: ["خطط منظمة", "جاهز للمدربين", "٥ لغات"],
    ctaNote: "حساب مجاني · دقائق · تصفح قبل الالتزام"
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
      "نختار مدربين موثوقين. انضم لمنصة تُقدّم خبرتك كمنتج راقٍ.",
    cta: "تقديم كمدرب",
    browse: "تصفح المدربين"
  },
  finalCta: {
    title: "ابدأ ما دام الباب مفتوحاً",
    sub: "أنشئ حسابك، استكشف البرامج، ثم ترقَ عند الجاهزية.",
    primary: "إنشاء حساب مجاني",
    secondary: "العضوية",
    nudge: "نحافظ على انضمام انتقائي — أولوية للأعضاء الجدد هذا الشهر."
  }
};

const es: HomeLuxuryCopy = {
  hero: {
    badge: "TJFit",
    headline: "Entrenamiento,",
    headlineLine2: "en orden.",
    sub: "Programas, coaching y comunidad en un solo sistema sobrio — siempre sabes el siguiente paso.",
    ctaPrimary: "Empezar gratis",
    ctaSecondary: "Ver programas",
    trust: ["Planes estructurados", "Listo para coaches", "5 idiomas"],
    ctaNote: "Cuenta gratis · En minutos · Mira antes de comprometerte"
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
      "Estamos curando coaches verificados. Unete a una plataforma que enmarca tu expertise como producto de lujo.",
    cta: "Solicitar ser coach",
    browse: "Ver coaches"
  },
  finalCta: {
    title: "Empieza mientras siga abierto",
    sub: "Crea tu cuenta, explora programas y mejora tu plan cuando quieras.",
    primary: "Crear cuenta gratis",
    secondary: "Membresia",
    nudge: "Onboarding selectivo — prioridad a nuevos miembros este mes."
  }
};

const fr: HomeLuxuryCopy = {
  hero: {
    badge: "TJFit",
    headline: "L'entrainement,",
    headlineLine2: "simplifie.",
    sub: "Programmes, coaching et communaute dans un systeme sobre — vous savez toujours quoi faire ensuite.",
    ctaPrimary: "Commencer gratuitement",
    ctaSecondary: "Voir les programmes",
    trust: ["Plans structures", "Pret pour coachs", "5 langues"],
    ctaNote: "Compte gratuit · Quelques minutes · Parcourez avant de vous engager"
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
      "Nous selectionnons des coachs verifies. Rejoignez une plateforme qui met votre expertise en valeur comme un produit de luxe.",
    cta: "Postuler comme coach",
    browse: "Voir les coachs"
  },
  finalCta: {
    title: "Commencez tant que c'est ouvert",
    sub: "Creez votre compte, explorez les programmes, puis passez au niveau superieur quand vous voulez.",
    primary: "Creer un compte gratuit",
    secondary: "Abonnement",
    nudge: "Onboarding selectif — priorite aux nouveaux membres ce mois-ci."
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
