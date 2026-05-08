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
    /** Short gradient line under the main headline (brand punch) */
    heroGradientTagline: string;
    liveTrainingSuffix: string;
    fallbackBadge: string;
    commandToday: string;
    commandPlan: string;
    commandLive: string;
    commandConsistency: string;
    commandRows: { title: string; value: string; meta: string }[];
    signals: { model: string; modelValue: string; cycle: string; cycleValue: string; output: string; outputValue: string };
    metrics: { value: string; label: string; hint: string }[];
    scroll: string;
  };
  immersive: {
    tjaiOverview: {
      eyebrow: string;
      title: string;
      body: string;
      cta: string;
    };
    editorialRail: string[];
    platform: {
      eyebrow: string;
      title: string;
      titleMuted: string;
      body: string;
      features: { title: string; desc: string }[];
    };
    stats: {
      programs: string;
      diets: string;
      weeks: string;
      languages: string;
    };
    programs: {
      ghost: string;
      eyebrow: string;
      titleSuffix: string;
      titleAccent: string;
      viewAll: string;
    };
    tjai: {
      ghost: string;
      eyebrow: string;
      title: string;
      body: string;
      bullets: { title: string; desc: string }[];
      primary: string;
      secondary: string;
      pricing: string;
    };
    diets: {
      ghost: string;
      eyebrow: string;
      titleSuffix: string;
      titleAccent: string;
      viewAll: string;
    };
    final: {
      eyebrow: string;
      titlePrefix: string;
      titleAccent: string;
      freeSuffix: string;
      browsePrograms: string;
    };
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
    headline: "World-class coaching.",
    headlineLine2: "Built for a body you keep.",
    headlineLine2Accent: "Transform",
    headlineLine2Rest: ".",
    sub: "Elite 12-week programs, realistic nutrition systems, and TJAI that anchors to your real data — a transformation you can sustain.",
    ctaPrimary: "Start your transformation",
    ctaSecondary: "View Programs",
    ctaBrowsePrograms: "Browse programs",
    trust: ["Clear plans", "Vetted coaches", "5 languages"],
    trustLine: "Free to start · No card · 20+ flagship programs",
    ctaNote: "",
    heroGradientTagline: "AI precision · Human intent · Measurable weeks",
    liveTrainingSuffix: "training now",
    fallbackBadge: "Fitness operating system",
    commandToday: "Today",
    commandPlan: "Adaptive plan",
    commandLive: "Live",
    commandConsistency: "Consistency",
    commandRows: [
      { title: "Training block", value: "Upper strength", meta: "Week 04 / Day 02" },
      { title: "Macro target", value: "2,420 kcal", meta: "Protein 186g" },
      { title: "Recovery", value: "Load -8%", meta: "Auto adjusted" }
    ],
    signals: {
      model: "model",
      modelValue: "Adaptive split",
      cycle: "cycle",
      cycleValue: "12 weeks",
      output: "output",
      outputValue: "Plan + macros"
    },
    metrics: [
      { value: "12", label: "weeks", hint: "Structured blocks with progression and checkpoints." },
      { value: "25", label: "signals", hint: "TJAI intake reads goals, schedule, equipment, and constraints." },
      { value: "10", label: "languages", hint: "Training and nutrition in the language you actually use." }
    ],
    scroll: "Scroll"
  },
  immersive: {
    tjaiOverview: {
      eyebrow: "TJAI",
      title: "Your AI coach, built for your body.",
      body: "Answer 25 questions. TJAI generates a full 12-week training plan, diet, and supplement stack tuned to your goals, equipment, and time. Preview it free; unlock the full plan when you are ready.",
      cta: "Try TJAI"
    },
    editorialRail: ["12-week periodization", "Macro-aware meals", "TJAI · GPT-4o", "Coach marketplace", "10 languages"],
    platform: {
      eyebrow: "The stack",
      title: "Built like training software,",
      titleMuted: "not a toy app.",
      body: "Structured plans, real nutrition systems, AI that respects constraints, and human coaches when you want them — one surface, one visual language.",
      features: [
        { title: "TJAI — Your AI Coach", desc: "Adaptive intake, progress-aware memory, and AI-built 12-week transformation plans. Diet, training, and supplements." },
        { title: "20+ Expert Programs", desc: "12-week structured plans for home or gym. Fat loss, muscle gain, all levels." },
        { title: "Full Diet Systems", desc: "Daily meal plans with macros, recipes, and grocery lists. Halal, vegan, and budget options covered." },
        { title: "Coach Marketplace", desc: "Book certified coaches for 1-on-1 guidance and personalized feedback." },
        { title: "Leaderboards", desc: "Earn TJCOIN, compete on weekly boards, and unlock rewards for consistency." },
        { title: "10 Languages", desc: "Training and nutrition flows support 10 locales from the first visit." }
      ]
    },
    stats: {
      programs: "Expert Programs",
      diets: "Diet Systems",
      weeks: "Weeks Per Plan",
      languages: "Languages"
    },
    programs: {
      ghost: "PROGRAMS",
      eyebrow: "Transformation systems",
      titleSuffix: "complete",
      titleAccent: "programs",
      viewAll: "View all programs"
    },
    tjai: {
      ghost: "INTELLIGENCE",
      eyebrow: "AI transformation engine",
      title: "Meet TJAI.",
      body: "Complete an adaptive intake and get a complete 12-week plan in minutes — training blocks, meals, macros, and progression tuned to your metabolism, schedule, and feedback.",
      bullets: [
        { title: "Science-based calculations", desc: "Metabolism, load, and recovery modeled like a performance lab — not generic templates." },
        { title: "Complete 12-week structure", desc: "Periodized weeks, deloads, and checkpoints you can execute without guesswork." },
        { title: "Daily meal plans + macros", desc: "Meals, grocery logic, and macro targets aligned to your training phase." },
        { title: "Adjustable + regeneratable", desc: "Life changes. Regenerate blocks while preserving your history and intent." }
      ],
      primary: "Build my plan — free preview",
      secondary: "See a sample plan",
      pricing: "Core (Free) · TJAI unlock $10 · Pro $6/mo · Apex $10/mo"
    },
    diets: {
      ghost: "NUTRITION",
      eyebrow: "Nutrition",
      titleSuffix: "diet",
      titleAccent: "systems",
      viewAll: "View all diets"
    },
    final: {
      eyebrow: "Access",
      titlePrefix: "Start your next",
      titleAccent: "12 weeks",
      freeSuffix: "It's Free",
      browsePrograms: "Browse Programs"
    }
  },
  leadMagnet: {
    badge: "Free guide",
    title: "The TJFit starter roadmap",
    sub: "A short, practical outline: how to use programs, when a coach helps, and what's planned for deeper personalization — sent once by email.",
    bullets: [
      "Week-one structure you can follow immediately",
      "When to add coaching — and what to expect",
      "How TJAI fits your week once you unlock a full plan"
    ],
    tjaiBadge: "TJAI",
    tjaiSub:
      "TJAI drafts your personalized 12-week training and nutrition plan from a focused quiz. Unlock it from your dashboard when you are ready to go all in."
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
      { value: "10", label: "Languages live" },
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
    headline: "Dünya standartında koçluk.",
    headlineLine2: "Sürdürülebilir dönüşüm için.",
    sub: "Elit 12 haftalık programlar, gerçekçi beslenme sistemleri ve verine oturan TJAI — uzun vadeli sonuç.",
    ctaPrimary: "Dönüşüme başla",
    ctaSecondary: "Hesap oluştur",
    ctaBrowsePrograms: "Programları keşfet",
    trust: ["Net planlar", "Seçilmiş koçlar", "10 dil"],
    ctaNote: "Yol haritası e-postada · Hesap isteğe bağlı · Karmaşa yok",
    heroGradientTagline: "Yapay zekâ keskinliği · İnsan seviyesinde koçluk · Ölçülebilir haftalar",
    liveTrainingSuffix: "şu anda antrenmanda",
    fallbackBadge: "Fitness işletim sistemi",
    commandToday: "Bugün",
    commandPlan: "Uyarlanabilir plan",
    commandLive: "Canlı",
    commandConsistency: "Süreklilik",
    commandRows: [
      { title: "Antrenman bloğu", value: "Üst vücut güç", meta: "Hafta 04 / Gün 02" },
      { title: "Macro hedefi", value: "2.420 kcal", meta: "Protein 186g" },
      { title: "Toparlanma", value: "Yük -8%", meta: "Otomatik ayarlandı" }
    ],
    signals: {
      model: "model",
      modelValue: "Uyarlanabilir split",
      cycle: "döngü",
      cycleValue: "12 hafta",
      output: "çıktı",
      outputValue: "Plan + macros"
    },
    metrics: [
      { value: "12", label: "hafta", hint: "İlerleme ve kontrol noktaları olan yapılandırılmış bloklar." },
      { value: "25", label: "sinyal", hint: "TJAI hedefleri, programı, ekipmanı ve sınırları okur." },
      { value: "10", label: "dil", hint: "Antrenman ve beslenme gerçekten kullandığınız dilde." }
    ],
    scroll: "Kaydır"
  },
  immersive: {
    tjaiOverview: {
      eyebrow: "TJAI",
      title: "Vücudunuz için tasarlanmış AI koçunuz.",
      body: "25 soruyu yanıtlayın. TJAI hedeflerinize, ekipmanınıza ve zamanınıza göre 12 haftalık antrenman planı, diyet ve supplement akışı oluşturur. Ücretsiz önizleyin; hazır olduğunuzda tam planı açın.",
      cta: "TJAI'yi deneyin"
    },
    editorialRail: ["12 haftalık periodizasyon", "Macro duyarlı öğünler", "TJAI · GPT-4o", "Koç pazarı", "10 dil"],
    platform: {
      eyebrow: "Sistem",
      title: "Oyuncak uygulama değil,",
      titleMuted: "antrenman yazılımı gibi inşa edildi.",
      body: "Yapılandırılmış planlar, gerçek beslenme sistemleri, sınırlarınıza saygı duyan AI ve istediğinizde insan koçlar — tek yüzey, tek görsel dil.",
      features: [
        { title: "TJAI — AI Koçunuz", desc: "Uyarlanabilir intake, ilerlemeyi bilen hafıza ve AI ile oluşturulan 12 haftalık dönüşüm planları. Diyet, antrenman ve supplement." },
        { title: "20+ Uzman Program", desc: "Ev veya salon için 12 haftalık yapılandırılmış planlar. Yağ kaybı, kas kazanımı, tüm seviyeler." },
        { title: "Tam Diyet Sistemleri", desc: "Macro, tarif ve alışveriş listeleriyle günlük öğün planları. Helal, vegan ve bütçe seçenekleri dahil." },
        { title: "Koç Pazarı", desc: "Bire bir rehberlik ve kişisel geri bildirim için sertifikalı koçlarla çalışın." },
        { title: "Liderlik Tabloları", desc: "TJCOIN kazanın, haftalık tablolarda yarışın ve süreklilik ödüllerini açın." },
        { title: "10 Dil", desc: "Antrenman ve beslenme akışları ilk ziyaretten itibaren 10 locale destekler." }
      ]
    },
    stats: { programs: "Uzman Program", diets: "Diyet Sistemi", weeks: "Plan Başına Hafta", languages: "Dil" },
    programs: { ghost: "PROGRAMLAR", eyebrow: "Dönüşüm sistemleri", titleSuffix: "tam", titleAccent: "program", viewAll: "Tüm programları görüntüle" },
    tjai: {
      ghost: "ZEKÂ",
      eyebrow: "AI dönüşüm motoru",
      title: "TJAI ile tanışın.",
      body: "Uyarlanabilir intake'i tamamlayın; metabolizmanıza, programınıza ve geri bildiriminize göre antrenman blokları, öğünler, macros ve ilerleme içeren 12 haftalık tam planı dakikalar içinde alın.",
      bullets: [
        { title: "Bilime dayalı hesaplamalar", desc: "Metabolizma, yük ve toparlanma jenerik şablon gibi değil, performans laboratuvarı gibi modellenir." },
        { title: "Tam 12 haftalık yapı", desc: "Tahmin gerektirmeyen periodize haftalar, deload'lar ve kontrol noktaları." },
        { title: "Günlük öğün planları + macros", desc: "Antrenman fazınızla uyumlu öğünler, alışveriş mantığı ve macro hedefleri." },
        { title: "Ayarlanabilir + yeniden üretilebilir", desc: "Hayat değişir. Geçmişinizi ve niyetinizi koruyarak blokları yeniden oluşturun." }
      ],
      primary: "Planımı oluştur — ücretsiz önizleme",
      secondary: "Örnek planı görün",
      pricing: "Core (Ücretsiz) · TJAI açılımı $10 · Pro $6/ay · Apex $10/ay"
    },
    diets: { ghost: "BESLENME", eyebrow: "Beslenme", titleSuffix: "diyet", titleAccent: "sistemi", viewAll: "Tüm diyetleri görüntüle" },
    final: { eyebrow: "Erişim", titlePrefix: "Sıradaki", titleAccent: "12 haftanıza", freeSuffix: "Ücretsiz", browsePrograms: "Programları keşfet" }
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
    tjaiBadge: "TJAI",
    tjaiSub:
      "TJAI, odaklı bir quizden kişiselleştirilmiş 12 haftalık antrenman ve beslenme planını hazırlar. Hazır olduğunda kontrol panelinden aç."
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
      { value: "10", label: "Canlı dil" },
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
    headline: "تدريب بمستوى عالمي.",
    headlineLine2: "لجسم تحافظ عليه.",
    sub: "برامج ١٢ أسبوعاً نخبوية، أنظمة تغذية واقعية، وTJAI يرتبط ببياناتك — تحول يمكن الإبقاء عليه.",
    ctaPrimary: "ابدأ تحولك",
    ctaSecondary: "ابدأ مجاناً",
    ctaBrowsePrograms: "البرامج",
    trust: ["خطط واضحة", "مدربون مختارون", "5 languages"],
    ctaNote: "خارطة بالبريد · الحساب اختياري · بلا فوضى",
    heroGradientTagline: "دقة الذكاء الاصطناعي · نية بشرية · أسابيع قابلة للقياس",
    liveTrainingSuffix: "يتدربون الآن",
    fallbackBadge: "نظام تشغيل للياقة",
    commandToday: "اليوم",
    commandPlan: "خطة قابلة للتكيف",
    commandLive: "مباشر",
    commandConsistency: "الاستمرارية",
    commandRows: [
      { title: "كتلة التدريب", value: "قوة الجزء العلوي", meta: "الأسبوع 04 / اليوم 02" },
      { title: "هدف macros", value: "2,420 kcal", meta: "Protein 186g" },
      { title: "التعافي", value: "الحمل -8%", meta: "تم التعديل تلقائياً" }
    ],
    signals: {
      model: "النموذج",
      modelValue: "تقسيم قابل للتكيف",
      cycle: "الدورة",
      cycleValue: "12 أسبوعاً",
      output: "المخرجات",
      outputValue: "خطة + macros"
    },
    metrics: [
      { value: "12", label: "أسبوعاً", hint: "كتل منظمة مع تقدم ونقاط متابعة." },
      { value: "25", label: "إشارة", hint: "TJAI يقرأ الأهداف والجدول والمعدات والقيود." },
      { value: "10", label: "لغات", hint: "التدريب والتغذية باللغة التي تستخدمها فعلاً." }
    ],
    scroll: "مرر"
  },
  immersive: {
    tjaiOverview: {
      eyebrow: "TJAI",
      title: "مدربك بالذكاء الاصطناعي، مصمم لجسمك.",
      body: "أجب عن 25 سؤالاً. ينشئ TJAI خطة تدريب كاملة لمدة 12 أسبوعاً ونظاماً غذائياً ومسار supplement مضبوطاً على أهدافك ومعداتك ووقتك. عاينها مجاناً وافتح الخطة الكاملة عندما تكون جاهزاً.",
      cta: "جرّب TJAI"
    },
    editorialRail: ["Periodization لمدة 12 أسبوعاً", "وجبات واعية بالـ macros", "TJAI · GPT-4o", "سوق المدربين", "10 لغات"],
    platform: {
      eyebrow: "النظام",
      title: "مصمم كبرنامج تدريب،",
      titleMuted: "وليس كتطبيق عابر.",
      body: "خطط منظمة، أنظمة تغذية حقيقية، AI يحترم القيود، ومدربون بشر عند الحاجة — سطح واحد ولغة بصرية واحدة.",
      features: [
        { title: "TJAI — مدربك بالذكاء الاصطناعي", desc: "Intake قابل للتكيف وذاكرة واعية بالتقدم وخطط تحول لمدة 12 أسبوعاً مبنية بالـ AI. غذاء وتدريب وsupplements." },
        { title: "أكثر من 20 برنامجاً خبيراً", desc: "خطط منظمة لمدة 12 أسبوعاً للمنزل أو النادي. خسارة دهون، بناء عضل، وكل المستويات." },
        { title: "أنظمة غذائية كاملة", desc: "خطط وجبات يومية مع macros ووصفات وقوائم تسوق. خيارات حلال ونباتية وموفرة." },
        { title: "سوق المدربين", desc: "احجز مدربين معتمدين لإرشاد فردي وملاحظات شخصية." },
        { title: "لوحات الترتيب", desc: "اكسب TJCOIN وتنافس أسبوعياً وافتح مكافآت الاستمرارية." },
        { title: "10 لغات", desc: "مسارات التدريب والتغذية تدعم 10 locales منذ الزيارة الأولى." }
      ]
    },
    stats: { programs: "برامج خبيرة", diets: "أنظمة غذائية", weeks: "أسابيع لكل خطة", languages: "لغات" },
    programs: { ghost: "البرامج", eyebrow: "أنظمة التحول", titleSuffix: "برنامجاً", titleAccent: "كاملاً", viewAll: "عرض كل البرامج" },
    tjai: {
      ghost: "الذكاء",
      eyebrow: "محرك التحول بالـ AI",
      title: "تعرّف على TJAI.",
      body: "أكمل intake قابل للتكيف واحصل خلال دقائق على خطة كاملة لمدة 12 أسبوعاً — كتل تدريب، وجبات، macros، وتقدم مضبوط على الأيض والجدول والملاحظات.",
      bullets: [
        { title: "حسابات مبنية على العلم", desc: "الأيض والحمل والتعافي تُنمذج كمختبر أداء، لا كقوالب عامة." },
        { title: "هيكل كامل لمدة 12 أسبوعاً", desc: "أسابيع periodized وdeloads ونقاط متابعة قابلة للتنفيذ دون تخمين." },
        { title: "خطط وجبات يومية + macros", desc: "وجبات ومنطق تسوق وأهداف macros متوافقة مع مرحلة التدريب." },
        { title: "قابل للتعديل وإعادة الإنشاء", desc: "الحياة تتغير. أعد إنشاء الكتل مع الحفاظ على تاريخك وهدفك." }
      ],
      primary: "ابنِ خطتي — معاينة مجانية",
      secondary: "شاهد خطة نموذجية",
      pricing: "Core (مجاني) · فتح TJAI بسعر $10 · Pro $6/شهر · Apex $10/شهر"
    },
    diets: { ghost: "التغذية", eyebrow: "التغذية", titleSuffix: "نظاماً", titleAccent: "غذائياً", viewAll: "عرض كل الأنظمة الغذائية" },
    final: { eyebrow: "الوصول", titlePrefix: "ابدأ", titleAccent: "أسابيعك الـ 12 القادمة", freeSuffix: "مجاني", browsePrograms: "تصفح البرامج" }
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
    tjaiBadge: "TJAI",
    tjaiSub:
      "يُنشئ TJAI خطة تدريب وتغذية لمدة ١٢ أسبوعاً من استبيان مركّز. فعّلها من لوحة التحكم عندما تكون جاهزاً للالتزام الكامل."
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
      { value: "10", label: "لغات مفعّلة" },
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
    headline: "Coaching de clase mundial.",
    headlineLine2: "Hecho para un cuerpo que mantienes.",
    sub: "Programas flagship de 12 semanas, nutrición realista y TJAI anclada a tus datos — un cambio sostenible.",
    ctaPrimary: "Empieza tu transformación",
    ctaSecondary: "Crear cuenta gratis",
    ctaBrowsePrograms: "Explorar programas",
    trust: ["Planes claros", "Coaches seleccionados", "10 idiomas"],
    ctaNote: "Guía por email · Cuenta opcional · Sin ruido",
    heroGradientTagline: "Precisión de IA · Intención humana · Semanas medibles",
    liveTrainingSuffix: "entrenando ahora",
    fallbackBadge: "Sistema operativo fitness",
    commandToday: "Hoy",
    commandPlan: "Plan adaptativo",
    commandLive: "En vivo",
    commandConsistency: "Constancia",
    commandRows: [
      { title: "Bloque de entrenamiento", value: "Fuerza superior", meta: "Semana 04 / Día 02" },
      { title: "Objetivo de macros", value: "2,420 kcal", meta: "Protein 186g" },
      { title: "Recuperación", value: "Carga -8%", meta: "Ajuste automático" }
    ],
    signals: {
      model: "modelo",
      modelValue: "Split adaptativo",
      cycle: "ciclo",
      cycleValue: "12 semanas",
      output: "salida",
      outputValue: "Plan + macros"
    },
    metrics: [
      { value: "12", label: "semanas", hint: "Bloques estructurados con progresión y puntos de control." },
      { value: "25", label: "señales", hint: "TJAI lee objetivos, agenda, equipo y restricciones." },
      { value: "10", label: "idiomas", hint: "Entrenamiento y nutrición en el idioma que realmente usas." }
    ],
    scroll: "Desplazar"
  },
  immersive: {
    tjaiOverview: {
      eyebrow: "TJAI",
      title: "Tu coach con IA, creado para tu cuerpo.",
      body: "Responde 25 preguntas. TJAI genera un plan completo de 12 semanas, dieta y stack de suplementos ajustado a tus objetivos, equipo y tiempo. Previsualízalo gratis; desbloquea el plan completo cuando estés listo.",
      cta: "Probar TJAI"
    },
    editorialRail: ["Periodización de 12 semanas", "Comidas con macros", "TJAI · GPT-4o", "Marketplace de coaches", "10 idiomas"],
    platform: {
      eyebrow: "El sistema",
      title: "Construido como software de entrenamiento,",
      titleMuted: "no como una app de juguete.",
      body: "Planes estructurados, nutrición real, IA que respeta restricciones y coaches humanos cuando los quieres: una superficie, un lenguaje visual.",
      features: [
        { title: "TJAI — Tu Coach con IA", desc: "Intake adaptativo, memoria de progreso y planes de transformación de 12 semanas creados con IA. Dieta, training y suplementos." },
        { title: "20+ Programas Expertos", desc: "Planes estructurados de 12 semanas para casa o gym. Pérdida de grasa, ganancia muscular y todos los niveles." },
        { title: "Sistemas de Dieta Completos", desc: "Planes diarios con macros, recetas y listas de compras. Opciones halal, veganas y económicas." },
        { title: "Marketplace de Coaches", desc: "Reserva coaches certificados para guía 1 a 1 y feedback personalizado." },
        { title: "Rankings", desc: "Gana TJCOIN, compite en tablas semanales y desbloquea recompensas por constancia." },
        { title: "10 Idiomas", desc: "Los flujos de entrenamiento y nutrición soportan 10 locales desde la primera visita." }
      ]
    },
    stats: { programs: "Programas Expertos", diets: "Sistemas de Dieta", weeks: "Semanas por Plan", languages: "Idiomas" },
    programs: { ghost: "PROGRAMAS", eyebrow: "Sistemas de transformación", titleSuffix: "programas", titleAccent: "completos", viewAll: "Ver todos los programas" },
    tjai: {
      ghost: "INTELIGENCIA",
      eyebrow: "Motor de transformación con IA",
      title: "Conoce TJAI.",
      body: "Completa un intake adaptativo y recibe en minutos un plan completo de 12 semanas: bloques de training, comidas, macros y progresión ajustados a tu metabolismo, agenda y feedback.",
      bullets: [
        { title: "Cálculos basados en ciencia", desc: "Metabolismo, carga y recuperación modelados como un laboratorio de rendimiento, no plantillas genéricas." },
        { title: "Estructura completa de 12 semanas", desc: "Semanas periodizadas, deloads y puntos de control ejecutables sin adivinar." },
        { title: "Comidas diarias + macros", desc: "Comidas, lógica de compras y objetivos de macros alineados con tu fase de training." },
        { title: "Ajustable + regenerable", desc: "La vida cambia. Regenera bloques conservando tu historial e intención." }
      ],
      primary: "Crear mi plan — vista previa gratis",
      secondary: "Ver un plan de muestra",
      pricing: "Core (Gratis) · desbloqueo TJAI $10 · Pro $6/mes · Apex $10/mes"
    },
    diets: { ghost: "NUTRICIÓN", eyebrow: "Nutrición", titleSuffix: "sistemas", titleAccent: "de dieta", viewAll: "Ver todas las dietas" },
    final: { eyebrow: "Acceso", titlePrefix: "Empieza tus próximas", titleAccent: "12 semanas", freeSuffix: "Es gratis", browsePrograms: "Explorar programas" }
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
    tjaiBadge: "TJAI",
    tjaiSub:
      "TJAI genera tu plan de entrenamiento y nutrición de 12 semanas a partir de un cuestionario enfocado. Desbloquéalo desde tu panel cuando estés listo."
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
      { value: "10", label: "Idiomas activos" },
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
    headline: "Coaching niveau monde.",
    headlineLine2: "Pensé pour un corps durable.",
    sub: "Programmes phares 12 semaines, nutrition réaliste et TJAI calée sur vos données — une transformation tenable.",
    ctaPrimary: "Lancer ma transformation",
    ctaSecondary: "Créer un compte gratuit",
    ctaBrowsePrograms: "Parcourir les programmes",
    trust: ["Plans clairs", "Coachs sélectionnés", "10 langues"],
    ctaNote: "Feuille de route par e-mail · Compte optionnel · Sans surcharge",
    heroGradientTagline: "Précision IA · Intention humaine · Semaines mesurables",
    liveTrainingSuffix: "s'entraînent maintenant",
    fallbackBadge: "Système d'exploitation fitness",
    commandToday: "Aujourd'hui",
    commandPlan: "Plan adaptatif",
    commandLive: "Live",
    commandConsistency: "Régularité",
    commandRows: [
      { title: "Bloc training", value: "Force haut du corps", meta: "Semaine 04 / Jour 02" },
      { title: "Objectif macros", value: "2,420 kcal", meta: "Protein 186g" },
      { title: "Récupération", value: "Charge -8%", meta: "Ajusté automatiquement" }
    ],
    signals: {
      model: "modèle",
      modelValue: "Split adaptatif",
      cycle: "cycle",
      cycleValue: "12 semaines",
      output: "sortie",
      outputValue: "Plan + macros"
    },
    metrics: [
      { value: "12", label: "semaines", hint: "Blocs structurés avec progression et points de contrôle." },
      { value: "25", label: "signaux", hint: "TJAI lit objectifs, planning, équipement et contraintes." },
      { value: "10", label: "langues", hint: "Training et nutrition dans la langue que vous utilisez vraiment." }
    ],
    scroll: "Défiler"
  },
  immersive: {
    tjaiOverview: {
      eyebrow: "TJAI",
      title: "Votre coach IA, pensé pour votre corps.",
      body: "Répondez à 25 questions. TJAI génère un plan training complet de 12 semaines, une diète et une stack supplements adaptés à vos objectifs, équipement et temps. Prévisualisez gratuitement, débloquez le plan complet quand vous êtes prêt.",
      cta: "Essayer TJAI"
    },
    editorialRail: ["Périodisation 12 semaines", "Repas avec macros", "TJAI · GPT-4o", "Marketplace coach", "10 langues"],
    platform: {
      eyebrow: "Le système",
      title: "Construit comme un logiciel training,",
      titleMuted: "pas comme une app gadget.",
      body: "Plans structurés, nutrition réelle, IA qui respecte les contraintes et coachs humains quand vous les voulez : une surface, un langage visuel.",
      features: [
        { title: "TJAI — Votre Coach IA", desc: "Intake adaptatif, mémoire de progression et plans de transformation 12 semaines générés par IA. Diète, training et supplements." },
        { title: "20+ Programmes Experts", desc: "Plans structurés 12 semaines pour maison ou salle. Perte de gras, prise de muscle, tous niveaux." },
        { title: "Systèmes Diète Complets", desc: "Plans repas quotidiens avec macros, recettes et listes de courses. Options halal, vegan et budget." },
        { title: "Marketplace Coach", desc: "Réservez des coachs certifiés pour un accompagnement 1:1 et des retours personnalisés." },
        { title: "Classements", desc: "Gagnez des TJCOIN, concourez chaque semaine et débloquez des récompenses de régularité." },
        { title: "10 Langues", desc: "Les flux training et nutrition prennent en charge 10 locales dès la première visite." }
      ]
    },
    stats: { programs: "Programmes Experts", diets: "Systèmes Diète", weeks: "Semaines par Plan", languages: "Langues" },
    programs: { ghost: "PROGRAMMES", eyebrow: "Systèmes de transformation", titleSuffix: "programmes", titleAccent: "complets", viewAll: "Voir tous les programmes" },
    tjai: {
      ghost: "INTELLIGENCE",
      eyebrow: "Moteur de transformation IA",
      title: "Découvrez TJAI.",
      body: "Complétez un intake adaptatif et recevez en quelques minutes un plan complet de 12 semaines : blocs training, repas, macros et progression adaptés à votre métabolisme, planning et feedback.",
      bullets: [
        { title: "Calculs fondés sur la science", desc: "Métabolisme, charge et récupération modélisés comme un labo de performance, pas comme des modèles génériques." },
        { title: "Structure complète 12 semaines", desc: "Semaines périodisées, deloads et points de contrôle exécutables sans deviner." },
        { title: "Plans repas quotidiens + macros", desc: "Repas, logique de courses et objectifs macros alignés avec votre phase training." },
        { title: "Ajustable + régénérable", desc: "La vie change. Régénérez des blocs tout en gardant votre historique et votre intention." }
      ],
      primary: "Créer mon plan — aperçu gratuit",
      secondary: "Voir un plan exemple",
      pricing: "Core (Gratuit) · déblocage TJAI $10 · Pro $6/mois · Apex $10/mois"
    },
    diets: { ghost: "NUTRITION", eyebrow: "Nutrition", titleSuffix: "systèmes", titleAccent: "diète", viewAll: "Voir toutes les diètes" },
    final: { eyebrow: "Accès", titlePrefix: "Commencez vos prochaines", titleAccent: "12 semaines", freeSuffix: "C'est gratuit", browsePrograms: "Parcourir les programmes" }
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
    tjaiBadge: "TJAI",
    tjaiSub:
      "TJAI génère votre plan d’entraînement et de nutrition sur 12 semaines à partir d’un questionnaire ciblé. Débloquez-le depuis votre tableau de bord quand vous êtes prêt à vous engager."
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
      { value: "10", label: "Langues actives" },
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
