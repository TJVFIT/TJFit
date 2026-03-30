export const locales = ["en", "tr", "ar", "es", "fr"] as const;

export type Locale = (typeof locales)[number];

export type Dictionary = {
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
    feedback: string;
    login: string;
    loginAsCoach: string;
    progress: string;
    messages: string;
    logout: string;
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
  becomeCoach: {
    badge: string;
    title: string;
    subtitle: string;
    magnetTitle: string;
    magnetSubtitle: string;
    applicationTitle: string;
    feature1: string;
    feature2: string;
    feature3: string;
    feature4: string;
    ageQuestion: string;
    fullName: string;
    specialty: string;
    specialtyPlaceholder: string;
    languages: string;
    languagesPlaceholder: string;
    country: string;
    certifications: string;
    certificationsPlaceholder: string;
    ageError: string;
    next: string;
    back: string;
    submit: string;
    success: string;
    reviewTitle: string;
  };
  admin: {
    coachApplications: string;
    coachApplicationsCount: string;
    noApplications: string;
    loadingApplications: string;
    logInToViewApplications: string;
    platformOverview: string;
    platformSubtitle: string;
    quickActions: string;
    fullAdminPanel: string;
    approveCoaches: string;
    managePayments: string;
    coachList: string;
    coachListSubtitle: string;
  };
  dashboard: {
    coach: {
      badge: string;
      title: string;
      subtitle: string;
      calendar: string;
      calendarSubtitle: string;
      texts: string;
      textsSubtitle: string;
      textsEmpty: string;
      myStudents: string;
      myStudentsSubtitle: string;
      chat: string;
      reschedule: string;
      viewPlan: string;
      zoomLink: string;
      referralTitle: string;
      referralSubtitle: string;
      wallet: string;
      walletSubtitle: string;
      rank: string;
      rankSubtitle: string;
      preparedForData: string;
    };
    admin: {
      badge: string;
      title: string;
      subtitle: string;
    };
  };
  launchingSoon: {
    badge: string;
    title: string;
    subtitle: string;
    cta: string;
  };
  comingSoon: {
    title: string;
    subtitle: string;
    storeDescription: string;
  };
  feedback: {
    title: string;
    subtitle: string;
    typeLabel: string;
    complaint: string;
    suggestion: string;
    feedback: string;
    helpRequest: string;
    refundRequest: string;
    subject: string;
    message: string;
    orderReference: string;
    email: string;
    submit: string;
    success: string;
    nav: string;
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
      membership: "Subscription",
      becomeCoach: "Become a Coach",
      dashboard: "Dashboard",
      admin: "Admin",
      feedback: "Support",
      login: "Login",
      loginAsCoach: "Log in as a coach",
      progress: "Progress",
      messages: "Messages",
      logout: "Log out"
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
    },
    launchingSoon: {
      badge: "Launching Soon",
      title: "Launching Soon",
      subtitle: "Premium online coaching for fitness, performance, nutrition, and recovery. Available in English, Turkish, Arabic, Spanish, and French.",
      cta: "Log in as a coach"
    },
    comingSoon: {
      title: "Coming Soon",
      subtitle: "Our equipment store is on its way.",
      storeDescription: "Training and recovery tools, resistance bands, dumbbells, and more. Connect with our future dropshipping store."
    },
    becomeCoach: {
      badge: "Become a Coach",
      title: "Join a premium coaching marketplace designed to grow coach earnings.",
      subtitle: "TJFit attracts coaches with high-trust profiles, multilingual positioning, ranked visibility, referrals, and a premium client experience.",
      magnetTitle: "Coach magnet system",
      magnetSubtitle: "Higher rank means better visibility, more trust, more clients, and stronger marketplace momentum.",
      applicationTitle: "Coach application",
      feature1: "Featured placement for high performers",
      feature2: "Referral codes and repeat revenue",
      feature3: "Coach dashboard with bookings and earnings",
      feature4: "Global audience with English, Turkish, and Arabic support",
      ageQuestion: "How old are you?",
      fullName: "Full name",
      specialty: "Specialty",
      specialtyPlaceholder: "e.g. fitness, nutrition, rehab",
      languages: "Languages you speak",
      languagesPlaceholder: "e.g. English, Turkish",
      country: "Country",
      certifications: "Tell us about your certifications and coaching style",
      certificationsPlaceholder: "Your certifications, experience, and coaching approach...",
      ageError: "You must be 20 or older to apply.",
      next: "Next",
      back: "Back",
      submit: "Submit application",
      success: "Application submitted. We'll be in touch.",
      reviewTitle: "Review your application"
    },
    admin: {
      coachApplications: "Coach Applications",
      coachApplicationsCount: "application",
      noApplications: "No applications yet.",
      loadingApplications: "Loading coach applications...",
      logInToViewApplications: "Log in to view applications.",
      platformOverview: "Platform Overview",
      platformSubtitle: "Platform-wide stats, coach applications, and operations in one place.",
      quickActions: "Quick actions",
      fullAdminPanel: "Full Admin Panel",
      approveCoaches: "Approve coaches",
      managePayments: "Manage payments",
      coachList: "Coach list",
      coachListSubtitle: "Active coaches on the platform."
    },
    dashboard: {
      coach: {
        badge: "Coach Dashboard",
        title: "Your coaching hub.",
        subtitle: "Calendar, messages, sessions, programs, and earnings in one place.",
        calendar: "Calendar",
        calendarSubtitle: "Upcoming sessions, Zoom links, and availability.",
        texts: "Texts / Messages",
        textsSubtitle: "Private coach–student conversations. Architecture ready for when student accounts exist.",
        textsEmpty: "No messages yet. Chat will appear here when students are assigned.",
        myStudents: "My students",
        myStudentsSubtitle: "Upcoming sessions with clients",
        chat: "Chat",
        reschedule: "Reschedule",
        viewPlan: "View plan",
        zoomLink: "Zoom link",
        referralTitle: "Referral dashboard",
        referralSubtitle: "Share your code. Earn when clients book.",
        wallet: "Wallet",
        walletSubtitle: "Earnings and payouts.",
        rank: "Rank & visibility",
        rankSubtitle: "Based on rating, session volume, and client success.",
        preparedForData: "Ready for Supabase data wiring."
      },
      admin: {
        badge: "Platform Overview",
        title: "General website and coach metrics.",
        subtitle: "Platform-wide stats, coach applications, and operations in one place."
      }
    },
    feedback: {
      title: "Feedback & Support",
      subtitle: "Complain, suggest, or ask for help. We read everything.",
      typeLabel: "What is this about?",
      complaint: "Complaint",
      suggestion: "Suggestion",
      feedback: "General feedback",
      helpRequest: "Help request",
      refundRequest: "Refund request",
      subject: "Subject (optional)",
      message: "Message",
      orderReference: "Order / program reference (for refunds)",
      email: "Email (optional, for follow-up)",
      submit: "Submit",
      success: "Thank you. We'll get back to you soon.",
      nav: "Feedback & Support"
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
      membership: "Abonelik",
      becomeCoach: "Koç Ol",
      dashboard: "Panel",
      admin: "Yonetim",
      feedback: "Destek",
      login: "Giris",
      loginAsCoach: "Koç olarak giris yap",
      progress: "Ilerleme",
      messages: "Mesajlar",
      logout: "Cikis yap"
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
    },
    launchingSoon: {
      badge: "Yakinda",
      title: "Yakinda Aciliyor",
      subtitle: "Fitness, performans, beslenme ve rehabilitasyon icin premium online kocluk. Ingilizce, Turkce, Arapca, Ispanyolca ve Fransizca destegi.",
      cta: "Koç olarak giris yap"
    },
    comingSoon: {
      title: "Yakinda",
      subtitle: "Ekipman magazamiz yolda.",
      storeDescription: "Antrenman ve toparlanma araclari, direnc bantlari, dumbellar ve daha fazlasi. Gelecekteki dropshipping magazamizla baglanti."
    },
    becomeCoach: {
      badge: "Koç Ol",
      title: "Koç kazancini artirmak icin tasarlanmis premium kocluk pazarina katilin.",
      subtitle: "TJFit, yuksek guven profilleri, cok dilli konumlandirma, sirali gorunurluk, tavsiyeler ve premium musteri deneyimi ile koçlari cezbeder.",
      magnetTitle: "Koç mıknatıs sistemi",
      magnetSubtitle: "Daha yuksek sıra, daha iyi gorunurluk, daha fazla guven, daha fazla musteri ve daha guclu pazar momentumu anlamina gelir.",
      applicationTitle: "Koç basvurusu",
      feature1: "Yuksek performans gosterenler icin one cikan yerlesim",
      feature2: "Tavsiye kodlari ve tekrarlayan gelir",
      feature3: "Rezervasyonlar ve kazanclar icin koç paneli",
      feature4: "Ingilizce, Turkce ve Arapca destegi ile kuresel kitle",
      ageQuestion: "Kac yasindasiniz?",
      fullName: "Ad Soyad",
      specialty: "Uzmanlik",
      specialtyPlaceholder: "ornegin fitness, beslenme, rehabilitasyon",
      languages: "Konustugunuz diller",
      languagesPlaceholder: "ornegin Ingilizce, Turkce",
      country: "Ulke",
      certifications: "Sertifikalar ve kocluk tarziniz hakkinda bilgi verin",
      certificationsPlaceholder: "Sertifikalar, deneyim ve kocluk yaklasiminiz...",
      ageError: "Basvuru icin 20 yas veya uzeri olmalisiniz.",
      next: "Ileri",
      back: "Geri",
      submit: "Basvuruyu gonder",
      success: "Basvurunuz alindi. Sizinle iletisime gecicegiz.",
      reviewTitle: "Basvurunuzu kontrol edin"
    },
    admin: {
      coachApplications: "Koç Basvurulari",
      coachApplicationsCount: "basvuru",
      noApplications: "Henuz basvuru yok.",
      loadingApplications: "Koç basvurulari yukleniyor...",
      logInToViewApplications: "Basvurulari gormek icin giris yapin.",
      platformOverview: "Platform Genel Bakis",
      platformSubtitle: "Platform genelinde istatistikler, koç basvurulari ve islemler tek yerde.",
      quickActions: "Hizli islemler",
      fullAdminPanel: "Tam Yonetim Paneli",
      approveCoaches: "Koçlari onayla",
      managePayments: "Odemeleri yonet",
      coachList: "Koç listesi",
      coachListSubtitle: "Platformdaki aktif koçlar."
    },
    dashboard: {
      coach: {
        badge: "Koç Paneli",
        title: "Kocluk merkeziniz.",
        subtitle: "Takvim, mesajlar, seanslar, programlar ve kazanclar tek yerde.",
        calendar: "Takvim",
        calendarSubtitle: "Yaklasan seanslar, Zoom linkleri ve musaitlik.",
        texts: "Metinler / Mesajlar",
        textsSubtitle: "Ozel koç-ogrenci sohbetleri. Ogrenci hesaplari eklendiginde hazir.",
        textsEmpty: "Henuz mesaj yok. Ogrenciler atandiginda sohbet burada gorunecek.",
        myStudents: "Ogrencilerim",
        myStudentsSubtitle: "Musterilerle yaklasan seanslar",
        chat: "Sohbet",
        reschedule: "Yeniden planla",
        viewPlan: "Plani gor",
        zoomLink: "Zoom linki",
        referralTitle: "Tavsiye paneli",
        referralSubtitle: "Kodunuzu paylasin. Musteriler rezervasyon yaptiginda kazanin.",
        wallet: "Cuzdan",
        walletSubtitle: "Kazanclar ve odemeler.",
        rank: "Sıra ve gorunurluk",
        rankSubtitle: "Puan, seans hacmi ve musteri basarisina dayanir.",
        preparedForData: "Supabase verisi icin hazir."
      },
      admin: {
        badge: "Platform Genel Bakis",
        title: "Genel web sitesi ve koç metrikleri.",
        subtitle: "Platform genelinde istatistikler, koç basvurulari ve islemler tek yerde."
      }
    },
    feedback: {
      title: "Geri Bildirim ve Destek",
      subtitle: "Sikayet, oneri veya yardim talebi. Hepsinizi okuyoruz.",
      typeLabel: "Bu ne hakkinda?",
      complaint: "Sikayet",
      suggestion: "Oneri",
      feedback: "Genel geri bildirim",
      helpRequest: "Yardim talebi",
      refundRequest: "Iade talebi",
      subject: "Konu (istege bagli)",
      message: "Mesaj",
      orderReference: "Siparis / program referansi (iadeler icin)",
      email: "E-posta (istege bagli)",
      submit: "Gonder",
      success: "Tesekkurler. En kisa surede size donus yapacagiz.",
      nav: "Geri Bildirim ve Destek"
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
      membership: "الاشتراك",
      becomeCoach: "انضم كمدرب",
      dashboard: "لوحة التحكم",
      admin: "الادارة",
      feedback: "الدعم",
      login: "تسجيل الدخول",
      loginAsCoach: "تسجيل الدخول كمدرب",
      progress: "التقدم",
      messages: "الرسائل",
      logout: "تسجيل الخروج"
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
    },
    launchingSoon: {
      badge: "قريباً",
      title: "قريباً",
      subtitle: "تدريب اونلاين متميز لللياقة والاداء والتغذية والتعافي. متوفر بالانجليزية والتركية والعربية والاسبانية والفرنسية.",
      cta: "تسجيل الدخول كمدرب"
    },
    comingSoon: {
      title: "قريباً",
      subtitle: "متجر المعدات قادم.",
      storeDescription: "ادوات التدريب والتعافي، اشرطة المقاومة، الدمبلز والمزيد. متصل بمتجر dropshipping المستقبلي."
    },
    becomeCoach: {
      badge: "انضم كمدرب",
      title: "انضم الى سوق تدريب متميز مصمم لزيادة ارباح المدربين.",
      subtitle: "يجذب TJFit المدربين بملفات ثقة عالية وموضع متعدد اللغات ورؤية مصنفة وتوصيات وتجربة عميل متميزة.",
      magnetTitle: "نظام جذب المدربين",
      magnetSubtitle: "الترتيب الاعلى يعني رؤية افضل ومزيد من الثقة ومزيد من العملاء وزخم سوق اقوى.",
      applicationTitle: "طلب انضمام كمدرب",
      feature1: "مكانة مميزة للاداء العالي",
      feature2: "اكواد التوصية وايرادات التكرار",
      feature3: "لوحة مدرب مع الحجوزات والارباح",
      feature4: "جمهور عالمي بدعم الانجليزية والتركية والعربية",
      ageQuestion: "كم عمرك؟",
      fullName: "الاسم الكامل",
      specialty: "التخصص",
      specialtyPlaceholder: "مثل اللياقة، التغذية، إعادة التأهيل",
      languages: "اللغات التي تتحدثها",
      languagesPlaceholder: "مثل الانجليزية، التركية",
      country: "البلد",
      certifications: "أخبرنا عن شهاداتك وأسلوب التدريب",
      certificationsPlaceholder: "شهاداتك، خبرتك، وأسلوب التدريب...",
      ageError: "يجب أن يكون عمرك 20 عاماً أو أكثر للتقديم.",
      next: "التالي",
      back: "رجوع",
      submit: "إرسال الطلب",
      success: "تم استلام طلبك. سنتواصل معك قريباً.",
      reviewTitle: "راجع طلبك"
    },
    admin: {
      coachApplications: "طلبات المدربين",
      coachApplicationsCount: "طلب",
      noApplications: "لا توجد طلبات بعد.",
      loadingApplications: "جاري تحميل طلبات المدربين...",
      logInToViewApplications: "سجّل الدخول لعرض الطلبات.",
      platformOverview: "نظرة عامة على المنصة",
      platformSubtitle: "احصائيات المنصة وطلبات المدربين والعمليات في مكان واحد.",
      quickActions: "إجراءات سريعة",
      fullAdminPanel: "لوحة الإدارة الكاملة",
      approveCoaches: "الموافقة على المدربين",
      managePayments: "إدارة المدفوعات",
      coachList: "قائمة المدربين",
      coachListSubtitle: "المدربون النشطون على المنصة."
    },
    dashboard: {
      coach: {
        badge: "لوحة المدرب",
        title: "مركز التدريب الخاص بك.",
        subtitle: "التقويم والرسائل والجلسات والبرامج والأرباح في مكان واحد.",
        calendar: "التقويم",
        calendarSubtitle: "الجلسات القادمة وروابط زووم والتوفر.",
        texts: "النصوص / الرسائل",
        textsSubtitle: "محادثات خاصة بين المدرب والطالب. جاهز عند إضافة حسابات الطلاب.",
        textsEmpty: "لا توجد رسائل بعد. ستظهر المحادثة عند تعيين الطلاب.",
        myStudents: "طلابي",
        myStudentsSubtitle: "الجلسات القادمة مع العملاء",
        chat: "محادثة",
        reschedule: "إعادة الجدولة",
        viewPlan: "عرض الخطة",
        zoomLink: "رابط زووم",
        referralTitle: "لوحة الإحالة",
        referralSubtitle: "شارك رمزك. اربح عند حجز العملاء.",
        wallet: "المحفظة",
        walletSubtitle: "الأرباح والمدفوعات.",
        rank: "الترتيب والرؤية",
        rankSubtitle: "بناءً على التقييم وحجم الجلسات ونجاح العملاء.",
        preparedForData: "جاهز لبيانات Supabase."
      },
      admin: {
        badge: "نظرة عامة على المنصة",
        title: "مقاييس الموقع العام والمدربين.",
        subtitle: "إحصائيات المنصة وطلبات المدربين والعمليات في مكان واحد."
      }
    },
    feedback: {
      title: "الملاحظات والدعم",
      subtitle: "قدم شكوى أو اقتراحاً أو اطلب المساعدة. نقرأ كل شيء.",
      typeLabel: "ما الموضوع؟",
      complaint: "شكوى",
      suggestion: "اقتراح",
      feedback: "ملاحظات عامة",
      helpRequest: "طلب مساعدة",
      refundRequest: "طلب استرداد",
      subject: "الموضوع (اختياري)",
      message: "الرسالة",
      orderReference: "مرجع الطلب/البرنامج (للإسترداد)",
      email: "البريد الإلكتروني (اختياري)",
      submit: "إرسال",
      success: "شكراً. سنتواصل معك قريباً.",
      nav: "الملاحظات والدعم"
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
      membership: "Suscripcion",
      becomeCoach: "Ser coach",
      dashboard: "Panel",
      admin: "Admin",
      feedback: "Soporte",
      login: "Iniciar sesion",
      loginAsCoach: "Iniciar sesion como coach",
      progress: "Progreso",
      messages: "Mensajes",
      logout: "Cerrar sesion"
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
    },
    launchingSoon: {
      badge: "Proximamente",
      title: "Proximamente",
      subtitle: "Coaching online premium para fitness, rendimiento, nutricion y recuperacion. Disponible en ingles, turco, arabe, espanol y frances.",
      cta: "Iniciar sesion como coach"
    },
    comingSoon: {
      title: "Proximamente",
      subtitle: "Nuestra tienda de equipamiento esta en camino.",
      storeDescription: "Herramientas de entrenamiento y recuperacion, bandas de resistencia, mancuernas y mas. Conectado con nuestra futura tienda dropshipping."
    },
    becomeCoach: {
      badge: "Ser coach",
      title: "Unete a un mercado de coaching premium disenado para aumentar los ingresos de los coaches.",
      subtitle: "TJFit atrae a coaches con perfiles de alta confianza, posicionamiento multilingue, visibilidad clasificada, referidos y una experiencia de cliente premium.",
      magnetTitle: "Sistema iman de coaches",
      magnetSubtitle: "Mayor rango significa mejor visibilidad, mas confianza, mas clientes y mayor impulso del mercado.",
      applicationTitle: "Solicitud de coach",
      feature1: "Colocacion destacada para alto rendimiento",
      feature2: "Codigos de referidos e ingresos recurrentes",
      feature3: "Panel de coach con reservas y ganancias",
      feature4: "Audiencia global con soporte en ingles, turco y arabe",
      ageQuestion: "Cuantos anos tienes?",
      fullName: "Nombre completo",
      specialty: "Especialidad",
      specialtyPlaceholder: "ej. fitness, nutricion, rehabilitacion",
      languages: "Idiomas que hablas",
      languagesPlaceholder: "ej. Ingles, Turco",
      country: "Pais",
      certifications: "Cuentanos sobre tus certificaciones y estilo de coaching",
      certificationsPlaceholder: "Tus certificaciones, experiencia y enfoque...",
      ageError: "Debes tener 20 anos o mas para aplicar.",
      next: "Siguiente",
      back: "Atras",
      submit: "Enviar solicitud",
      success: "Solicitud enviada. Nos pondremos en contacto.",
      reviewTitle: "Revisa tu solicitud"
    },
    admin: {
      coachApplications: "Solicitudes de coaches",
      coachApplicationsCount: "solicitud",
      noApplications: "Aun no hay solicitudes.",
      loadingApplications: "Cargando solicitudes de coaches...",
      logInToViewApplications: "Inicia sesion para ver las solicitudes.",
      platformOverview: "Resumen de plataforma",
      platformSubtitle: "Estadisticas de la plataforma, solicitudes de coaches y operaciones en un solo lugar.",
      quickActions: "Acciones rapidas",
      fullAdminPanel: "Panel de administracion completo",
      approveCoaches: "Aprobar coaches",
      managePayments: "Gestionar pagos",
      coachList: "Lista de coaches",
      coachListSubtitle: "Coaches activos en la plataforma."
    },
    dashboard: {
      coach: {
        badge: "Panel de coach",
        title: "Tu centro de coaching.",
        subtitle: "Calendario, mensajes, sesiones, programas y ganancias en un solo lugar.",
        calendar: "Calendario",
        calendarSubtitle: "Sesiones proximas, enlaces Zoom y disponibilidad.",
        texts: "Textos / Mensajes",
        textsSubtitle: "Conversaciones privadas coach-estudiante. Arquitectura lista para cuando existan cuentas de estudiantes.",
        textsEmpty: "Aun no hay mensajes. El chat aparecera cuando se asignen estudiantes.",
        myStudents: "Mis estudiantes",
        myStudentsSubtitle: "Sesiones proximas con clientes",
        chat: "Chat",
        reschedule: "Reprogramar",
        viewPlan: "Ver plan",
        zoomLink: "Enlace Zoom",
        referralTitle: "Panel de referidos",
        referralSubtitle: "Comparte tu codigo. Gana cuando los clientes reserven.",
        wallet: "Billetera",
        walletSubtitle: "Ganancias y pagos.",
        rank: "Rango y visibilidad",
        rankSubtitle: "Basado en calificacion, volumen de sesiones y exito del cliente.",
        preparedForData: "Listo para datos de Supabase."
      },
      admin: {
        badge: "Resumen de plataforma",
        title: "Metricas generales del sitio web y coaches.",
        subtitle: "Estadisticas de la plataforma, solicitudes de coaches y operaciones en un solo lugar."
      }
    },
    feedback: {
      title: "Comentarios y Soporte",
      subtitle: "Queja, sugiere o pide ayuda. Leemos todo.",
      typeLabel: "De que se trata?",
      complaint: "Queja",
      suggestion: "Sugerencia",
      feedback: "Comentarios generales",
      helpRequest: "Solicitud de ayuda",
      refundRequest: "Solicitud de reembolso",
      subject: "Asunto (opcional)",
      message: "Mensaje",
      orderReference: "Referencia de pedido/programa (para reembolsos)",
      email: "Email (opcional)",
      submit: "Enviar",
      success: "Gracias. Te responderemos pronto.",
      nav: "Comentarios y Soporte"
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
      feedback: "Support",
      login: "Connexion",
      loginAsCoach: "Se connecter en tant que coach",
      progress: "Progression",
      messages: "Messages",
      logout: "Se deconnecter"
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
    },
    launchingSoon: {
      badge: "Bientot",
      title: "Bientot disponible",
      subtitle: "Coaching en ligne premium pour fitness, performance, nutrition et recuperation. Disponible en anglais, turc, arabe, espagnol et francais.",
      cta: "Se connecter en tant que coach"
    },
    comingSoon: {
      title: "Bientot",
      subtitle: "Notre boutique d'equipement arrive.",
      storeDescription: "Outils d'entrainement et de recuperation, bandes de resistance, haltères et plus. Connecte a notre future boutique dropshipping."
    },
    becomeCoach: {
      badge: "Devenir coach",
      title: "Rejoins un marche de coaching premium concu pour augmenter les revenus des coachs.",
      subtitle: "TJFit attire les coachs avec des profils de confiance, un positionnement multilingue, une visibilite classee, des parrainages et une experience client premium.",
      magnetTitle: "Systeme d'attraction des coachs",
      magnetSubtitle: "Un rang plus eleve signifie plus de visibilite, de confiance, de clients et d'elan de marche.",
      applicationTitle: "Candidature coach",
      feature1: "Mise en avant pour les hautes performances",
      feature2: "Codes de parrainage et revenus recurrents",
      feature3: "Tableau de bord coach avec reservations et gains",
      feature4: "Audience mondiale avec support anglais, turc et arabe",
      ageQuestion: "Quel age as-tu?",
      fullName: "Nom complet",
      specialty: "Specialite",
      specialtyPlaceholder: "ex. fitness, nutrition, reeducation",
      languages: "Langues que tu parles",
      languagesPlaceholder: "ex. Anglais, Turc",
      country: "Pays",
      certifications: "Parle-nous de tes certifications et style de coaching",
      certificationsPlaceholder: "Tes certifications, experience et approche...",
      ageError: "Tu dois avoir 20 ans ou plus pour postuler.",
      next: "Suivant",
      back: "Retour",
      submit: "Envoyer la candidature",
      success: "Candidature envoyee. Nous te contacterons.",
      reviewTitle: "Verifie ta candidature"
    },
    admin: {
      coachApplications: "Candidatures coachs",
      coachApplicationsCount: "candidature",
      noApplications: "Pas encore de candidatures.",
      loadingApplications: "Chargement des candidatures coachs...",
      logInToViewApplications: "Connectez-vous pour voir les candidatures.",
      platformOverview: "Apercu plateforme",
      platformSubtitle: "Statistiques, candidatures coachs et operations en un seul endroit.",
      quickActions: "Actions rapides",
      fullAdminPanel: "Panneau admin complet",
      approveCoaches: "Approuver les coachs",
      managePayments: "Gerer les paiements",
      coachList: "Liste des coachs",
      coachListSubtitle: "Coachs actifs sur la plateforme."
    },
    dashboard: {
      coach: {
        badge: "Tableau de bord coach",
        title: "Ton centre de coaching.",
        subtitle: "Calendrier, messages, seances, programmes et gains en un seul endroit.",
        calendar: "Calendrier",
        calendarSubtitle: "Seances a venir, liens Zoom et disponibilite.",
        texts: "Textes / Messages",
        textsSubtitle: "Conversations privees coach-eleve. Architecture prete pour les comptes etudiants.",
        textsEmpty: "Pas encore de messages. Le chat apparaitra quand des eleves seront assignes.",
        myStudents: "Mes eleves",
        myStudentsSubtitle: "Seances a venir avec les clients",
        chat: "Chat",
        reschedule: "Reprogrammer",
        viewPlan: "Voir le plan",
        zoomLink: "Lien Zoom",
        referralTitle: "Tableau de bord parrainage",
        referralSubtitle: "Partage ton code. Gagne quand les clients reservent.",
        wallet: "Portefeuille",
        walletSubtitle: "Gains et paiements.",
        rank: "Rang et visibilite",
        rankSubtitle: "Base sur la note, le volume de seances et le succes client.",
        preparedForData: "Pret pour les donnees Supabase."
      },
      admin: {
        badge: "Apercu plateforme",
        title: "Metriques generales du site et des coachs.",
        subtitle: "Statistiques, candidatures coachs et operations en un seul endroit."
      }
    },
    feedback: {
      title: "Commentaires et Support",
      subtitle: "Plaintes, suggestions ou aide. Nous lisons tout.",
      typeLabel: "De quoi s'agit-il?",
      complaint: "Plainte",
      suggestion: "Suggestion",
      feedback: "Commentaires generaux",
      helpRequest: "Demande d'aide",
      refundRequest: "Demande de remboursement",
      subject: "Sujet (optionnel)",
      message: "Message",
      orderReference: "Reference commande/programme (remboursements)",
      email: "Email (optionnel)",
      submit: "Envoyer",
      success: "Merci. Nous te repondrons bientot.",
      nav: "Commentaires et Support"
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
