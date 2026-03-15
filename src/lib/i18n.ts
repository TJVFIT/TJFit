export const locales = ["en", "tr", "ar", "es", "fr"] as const;

export type Locale = (typeof locales)[number];

type Dictionary = {
  nav: {
    home: string;
    coaches: string;
    programs: string;
    store: string;
    transformations: string;
    community: string;
    challenges: string;
    live: string;
    membership: string;
    becomeCoach: string;
    dashboard: string;
    admin: string;
    login: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  steps: string[];
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
  common: {
    featuredCoaches: string;
    marketplace: string;
    equipment: string;
    testimonials: string;
    socialProof: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    nav: {
      home: "Home",
      coaches: "Find a Coach",
      programs: "Programs",
      store: "Store",
      transformations: "Transformations",
      community: "Community",
      challenges: "Challenges",
      live: "Live",
      membership: "Membership",
      becomeCoach: "Become a Coach",
      dashboard: "Dashboard",
      admin: "Admin",
      login: "Login"
    },
    hero: {
      badge: "Global Online Coaching Platform",
      title: "World-Class Coaching. From Home.",
      subtitle:
        "Find certified coaches for fitness, performance, nutrition, physiotherapy, and rehabilitation in English, Turkish, and Arabic.",
      primaryCta: "Find a Coach",
      secondaryCta: "Become a Coach"
    },
    steps: ["Choose a coach", "Start online training", "Improve from home"],
    cta: {
      title: "Start Training Today.",
      subtitle:
        "Launch faster with premium coaching experiences, trusted experts, and simple booking flows.",
      button: "Book Your First Session"
    },
    common: {
      featuredCoaches: "Featured Coaches",
      marketplace: "Programs Marketplace",
      equipment: "Equipment Store",
      testimonials: "Testimonials",
      socialProof: "Live Activity"
    }
  },
  tr: {
    nav: {
      home: "Ana Sayfa",
      coaches: "Koç Bul",
      programs: "Programlar",
      store: "Magaza",
      transformations: "Donusumler",
      community: "Topluluk",
      challenges: "Meydan Okumalar",
      live: "Canli",
      membership: "Uyelik",
      becomeCoach: "Koç Ol",
      dashboard: "Panel",
      admin: "Yonetim",
      login: "Giris"
    },
    hero: {
      badge: "Global Online Kocluk Platformu",
      title: "Dunya Seviyesinde Kocluk. Evinden.",
      subtitle:
        "Fitness, performans, beslenme, fizyoterapi ve rehabilitasyon alanlarinda sertifikali koçlari Ingilizce, Turkce ve Arapca olarak bulun.",
      primaryCta: "Koç Bul",
      secondaryCta: "Koç Ol"
    },
    steps: ["Koçunu sec", "Online antrenmana basla", "Evden gelisim sagla"],
    cta: {
      title: "Bugun Basla.",
      subtitle:
        "Premium kocluk deneyimi, guvenilir uzmanlar ve hizli rezervasyon akisiyla daha hizli buyu.",
      button: "Ilk Seansini Rezerve Et"
    },
    common: {
      featuredCoaches: "One Cikan Koçlar",
      marketplace: "Program Pazari",
      equipment: "Ekipman Magazasi",
      testimonials: "Yorumlar",
      socialProof: "Canli Hareketler"
    }
  },
  ar: {
    nav: {
      home: "الرئيسية",
      coaches: "ابحث عن مدرب",
      programs: "البرامج",
      store: "المتجر",
      transformations: "التحولات",
      community: "المجتمع",
      challenges: "التحديات",
      live: "مباشر",
      membership: "العضوية",
      becomeCoach: "انضم كمدرب",
      dashboard: "لوحة التحكم",
      admin: "الادارة",
      login: "تسجيل الدخول"
    },
    hero: {
      badge: "منصة تدريب عالمية عبر الانترنت",
      title: "تدريب عالمي المستوى. من المنزل.",
      subtitle:
        "اعثر على مدربين معتمدين في اللياقة والاداء والتغذية والعلاج الطبيعي واعادة التأهيل بالانجليزية والتركية والعربية.",
      primaryCta: "ابحث عن مدرب",
      secondaryCta: "انضم كمدرب"
    },
    steps: ["اختر المدرب", "ابدأ التدريب عبر الانترنت", "تطور من المنزل"],
    cta: {
      title: "ابدأ التدريب اليوم.",
      subtitle:
        "انطلق بسرعة مع تجربة تدريب فاخرة وخبراء موثوقين وحجز بسيط وسريع.",
      button: "احجز جلستك الاولى"
    },
    common: {
      featuredCoaches: "المدربون المميزون",
      marketplace: "سوق البرامج",
      equipment: "متجر المعدات",
      testimonials: "آراء العملاء",
      socialProof: "نشاط مباشر"
    }
  },
  es: {
    nav: {
      home: "Inicio",
      coaches: "Buscar coach",
      programs: "Programas",
      store: "Tienda",
      transformations: "Transformaciones",
      community: "Comunidad",
      challenges: "Retos",
      live: "En vivo",
      membership: "Membresia",
      becomeCoach: "Ser coach",
      dashboard: "Panel",
      admin: "Admin",
      login: "Iniciar sesion"
    },
    hero: {
      badge: "Plataforma global de coaching online",
      title: "Coaching de clase mundial. Desde casa.",
      subtitle:
        "Encuentra coaches certificados para fitness, rendimiento, nutricion, fisioterapia y rehabilitacion en ingles, turco, arabe, espanol y frances.",
      primaryCta: "Buscar coach",
      secondaryCta: "Ser coach"
    },
    steps: ["Elige un coach", "Empieza a entrenar online", "Mejora desde casa"],
    cta: {
      title: "Empieza hoy.",
      subtitle:
        "Crece mas rapido con experiencias premium, expertos confiables y reservas simples.",
      button: "Reserva tu primera sesion"
    },
    common: {
      featuredCoaches: "Coaches destacados",
      marketplace: "Marketplace de programas",
      equipment: "Tienda de equipamiento",
      testimonials: "Testimonios",
      socialProof: "Actividad en vivo"
    }
  },
  fr: {
    nav: {
      home: "Accueil",
      coaches: "Trouver un coach",
      programs: "Programmes",
      store: "Boutique",
      transformations: "Transformations",
      community: "Communaute",
      challenges: "Defis",
      live: "Live",
      membership: "Abonnement",
      becomeCoach: "Devenir coach",
      dashboard: "Tableau de bord",
      admin: "Admin",
      login: "Connexion"
    },
    hero: {
      badge: "Plateforme mondiale de coaching en ligne",
      title: "Coaching de niveau mondial. Depuis chez vous.",
      subtitle:
        "Trouvez des coachs certifies en fitness, performance, nutrition, physiotherapie et rehabilitation en anglais, turc, arabe, espagnol et francais.",
      primaryCta: "Trouver un coach",
      secondaryCta: "Devenir coach"
    },
    steps: ["Choisissez un coach", "Commencez le coaching en ligne", "Progressez depuis chez vous"],
    cta: {
      title: "Commencez aujourd'hui.",
      subtitle:
        "Avancez plus vite avec une experience premium, des experts fiables et une reservation simple.",
      button: "Reserver votre premiere session"
    },
    common: {
      featuredCoaches: "Coachs en vedette",
      marketplace: "Marketplace de programmes",
      equipment: "Boutique d'equipement",
      testimonials: "Temoignages",
      socialProof: "Activite en direct"
    }
  }
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export function getDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}
