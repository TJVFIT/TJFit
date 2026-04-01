import type { Locale } from "@/lib/i18n";

export type CoachesListingCopy = {
  badge: string;
  title: string;
  body: string;
  ctaPrograms: string;
  ctaSignup: string;
  ctaBecomeCoach: string;
  comingSoonLabel: string;
  standardsTitle: string;
  standards: string[];
};

export type MembershipCopy = {
  badge: string;
  title: string;
  body: string;
  ctaExplore: string;
  ctaAccount: string;
  pricingTitle: string;
  pricingSub: string;
  tierStatus: string;
  tiers: { name: string; teaser: string }[];
  waitlistTitle: string;
  waitlistSub: string;
  pricingFootnote: string;
};

export type CoachProfileGateCopy = {
  badge: string;
  title: string;
  body: string;
  proofTitle: string;
  proofItems: string[];
  notifyTitle: string;
  notifySub: string;
  ctaBack: string;
};

export type CheckoutCopy = {
  badge: string;
  title: string;
  lead: string;
  selectProgram: string;
  orderSummary: string;
  price: string;
  coinsOnPurchase: string;
  discountLabel: string;
  noDiscount: string;
  ctaPay: string;
  ctaWorking: string;
  walletTitle: string;
  walletLifetime: string;
  discountStore: string;
  redeem: string;
  footnote: string;
  pendingTitle: string;
  pendingBody: string;
  amountDue: string;
  gatewayPlaceholderCta: string;
  errorPrefix: string;
  successPurchase: string;
};

const coaches: Record<Locale, CoachesListingCopy> = {
  en: {
    badge: "Coaches",
    title: "Coaches held to a luxury standard",
    body: "We onboard slowly on purpose. Every coach is reviewed for craft, clarity, and how they show up for members — not follower count.",
    ctaPrograms: "Browse programs",
    ctaSignup: "Create account",
    ctaBecomeCoach: "Apply as a coach",
    comingSoonLabel: "Coming soon",
    standardsTitle: "What “verified” means here",
    standards: [
      "Credential and experience review before a public profile",
      "Defined scope, messaging etiquette, and accountability",
      "Quality signals from real member outcomes — not vanity metrics"
    ]
  },
  tr: {
    badge: "Koçlar",
    title: "Luks standartta koçlar",
    body: "Kasitli olarak yavas dahil ediyoruz. Her koç; ustalik, netlik ve uyelere yaklasim acisindan incelenir — takipçi sayisi degil.",
    ctaPrograms: "Programlari incele",
    ctaSignup: "Hesap olustur",
    ctaBecomeCoach: "Koç basvurusu",
    comingSoonLabel: "Yakinda",
    standardsTitle: "Dogrulanmis ne demek",
    standards: [
      "Herkese acik profil oncesi yetkinlik ve deneyim kontrolu",
      "Net kapsam, mesajlasma ve hesap verebilirlik",
      "Gercek uyelerden kalite sinyalleri — gösteris metrikleri degil"
    ]
  },
  ar: {
    badge: "المدربون",
    title: "مدربون بمعيار راقٍ",
    body: "نضم المدربين بهدوء وبقصد. يُراجع كل مدرب على الخبرة والوضوح وتجربة العضو — لا على عدد المتابعين.",
    ctaPrograms: "تصفح البرامج",
    ctaSignup: "إنشاء حساب",
    ctaBecomeCoach: "التقديم كمدرب",
    comingSoonLabel: "قريباً",
    standardsTitle: "ماذا تعني “الموثوقية” هنا",
    standards: [
      "مراجعة المؤهلات والخبرة قبل أي ملف عام",
      "نطاق واضح وآداب تواصل ومساءلة",
      "إشارات جودة من نتائج حقيقية — لا أرقام فارغة"
    ]
  },
  es: {
    badge: "Coaches",
    title: "Coachs con estandar premium",
    body: "Incorporamos despacio a proposito. Cada coach se revisa por oficio, claridad y como acompana — no por seguidores.",
    ctaPrograms: "Ver programas",
    ctaSignup: "Crear cuenta",
    ctaBecomeCoach: "Solicitar ser coach",
    comingSoonLabel: "Proximamente",
    standardsTitle: "Que significa verificado aqui",
    standards: [
      "Revision de credenciales y experiencia antes del perfil publico",
      "Alcance definido, mensajeria y responsabilidad",
      "Senales de calidad con resultados reales — no vanidad"
    ]
  },
  fr: {
    badge: "Coachs",
    title: "Des coachs au niveau luxe",
    body: "Nous integrons lentement et volontairement. Chaque coach est evalue sur le metier, la clarte et l'accompagnement — pas les abonnes.",
    ctaPrograms: "Voir les programmes",
    ctaSignup: "Creer un compte",
    ctaBecomeCoach: "Postuler comme coach",
    comingSoonLabel: "Bientot",
    standardsTitle: "Ce que verifie signifie ici",
    standards: [
      "Revue des competences et de l'experience avant profil public",
      "Perimetre clair, messagerie et responsabilisation",
      "Signaux de qualite sur des resultats reels — pas la vanite"
    ]
  }
};

const membership: Record<Locale, MembershipCopy> = {
  en: {
    badge: "Membership",
    title: "All-access membership is almost here",
    body: "A single tier with premium programs, coach touchpoints, and community depth. Start with individual programs today — your account will carry over.",
    ctaExplore: "View programs",
    ctaAccount: "Sign in",
    pricingTitle: "Tiers in design",
    pricingSub: "Three levels are being finalized. There are no public prices yet — early subscribers will get clear terms before anything renews.",
    tierStatus: "Coming soon",
    tiers: [
      { name: "Train", teaser: "Programs + community core" },
      { name: "Coach+", teaser: "Deeper coach touchpoints" },
      { name: "Elite", teaser: "Priority access & premium drops" }
    ],
    waitlistTitle: "Notify me",
    waitlistSub: "One email when membership details are ready. Unsubscribe anytime.",
    pricingFootnote: "Founding offers may apply to early waitlist subscribers — disclosed in writing before you pay."
  },
  tr: {
    badge: "Uyelik",
    title: "Tam erisim uyeligi cok yakinda",
    body: "Premium programlar, koç temasi ve topluluk derinligi tek pakette. Bugun tekil programlarla baslayin — hesabiniz devreder.",
    ctaExplore: "Programlari gor",
    ctaAccount: "Giris yap",
    pricingTitle: "Seviyeler tasarimda",
    pricingSub: "Uc seviye netlesiyor. Acik fiyat yok — erken aboneler odeme oncesi sartlari yazili gorecek.",
    tierStatus: "Cok yakinda",
    tiers: [
      { name: "Train", teaser: "Programlar + topluluk temeli" },
      { name: "Coach+", teaser: "Daha yakin koç temasi" },
      { name: "Elite", teaser: "Oncelikli erisim" }
    ],
    waitlistTitle: "Haber ver",
    waitlistSub: "Uyelik netlestiginde tek e-posta. Istediginiz zaman cikis.",
    pricingFootnote: "Erken liste icin kurucu teklifler olabilir — odeme oncesi yazili aciklama."
  },
  ar: {
    badge: "العضوية",
    title: "عضوية الوصول الكامل قريباً",
    body: "مستوى واحد يجمع البرامج المميزة والتواصل مع المدربين والمجتمع. ابدأ ببرامج فردية اليوم — يبقى حسابك.",
    ctaExplore: "عرض البرامج",
    ctaAccount: "تسجيل الدخول",
    pricingTitle: "المستويات قيد التصميم",
    pricingSub: "ثلاثة مستويات تُحدَّد. لا أسعار علنية بعد — المشتركون الأوائل يتلقون الشروط كتابةً قبل أي دفع.",
    tierStatus: "قريباً",
    tiers: [
      { name: "Train", teaser: "البرامج والمجتمع الأساسي" },
      { name: "Coach+", teaser: "تواصل أعمق مع المدرب" },
      { name: "Elite", teaser: "أولوية ووصول مميز" }
    ],
    waitlistTitle: "أعلمني",
    waitlistSub: "رسالة واحدة عند جاهزية التفاصيل. إلغاء في أي وقت.",
    pricingFootnote: "قد تتوفر عروض للمبكرين — تُعلن كتابةً قبل الدفع."
  },
  es: {
    badge: "Membresia",
    title: "La membresia todo en uno llega pronto",
    body: "Un nivel con programas premium, contacto con coaches y comunidad. Empieza con programas sueltos hoy — tu cuenta se mantiene.",
    ctaExplore: "Ver programas",
    ctaAccount: "Iniciar sesion",
    pricingTitle: "Niveles en diseno",
    pricingSub: "Tres niveles en definicion. Sin precios publicos aun — los primeros veran terminos por escrito antes de pagar.",
    tierStatus: "Muy pronto",
    tiers: [
      { name: "Train", teaser: "Programas y nucleo comunidad" },
      { name: "Coach+", teaser: "Mas contacto con coach" },
      { name: "Elite", teaser: "Prioridad y acceso premium" }
    ],
    waitlistTitle: "Avísame",
    waitlistSub: "Un email cuando este listo. Cancela cuando quieras.",
    pricingFootnote: "Pueden existir ofertas fundadoras — siempre por escrito antes de cobrar."
  },
  fr: {
    badge: "Abonnement",
    title: "L'abonnement tout-acces arrive",
    body: "Un niveau avec programmes premium, coachs et communaute. Commencez avec des programmes a l'unite aujourd'hui — votre compte est conserve.",
    ctaExplore: "Voir les programmes",
    ctaAccount: "Se connecter",
    pricingTitle: "Niveaux en cours de definition",
    pricingSub: "Trois niveaux en finalisation. Pas de prix publics pour l'instant — les premiers inscrits recevront les conditions par ecrit avant paiement.",
    tierStatus: "Bientot",
    tiers: [
      { name: "Train", teaser: "Programmes et socle communaute" },
      { name: "Coach+", teaser: "Plus de lien coach" },
      { name: "Elite", teaser: "Priorite et acces premium" }
    ],
    waitlistTitle: "Me prevenir",
    waitlistSub: "Un email quand c'est pret. Desinscription facile.",
    pricingFootnote: "Offres fondateurs possibles — toujours par ecrit avant tout paiement."
  }
};

const coachProfileGate: Record<Locale, CoachProfileGateCopy> = {
  en: {
    badge: "Coach profile",
    title: "Profiles are opening in phases",
    body: "We are finishing agreements and media standards so every coach page feels as premium as the training itself.",
    proofTitle: "What you will see here",
    proofItems: [
      "Specialty tags and focus areas — strength, rehab, performance, and more",
      "Short authority bio and proof of experience",
      "Clear next step: message, program match, or waitlist"
    ],
    notifyTitle: "Get notified",
    notifySub: "We will email you when this coach’s profile and booking go live.",
    ctaBack: "All coaches"
  },
  tr: {
    badge: "Koç profili",
    title: "Profiller asamali aciliyor",
    body: "Anlasmalar ve medya standartlarini tamamlıyoruz; her sayfa antrenman kadar premium hissettirsin.",
    proofTitle: "Burada ne goreceksiniz",
    proofItems: [
      "Uzmanlik etiketleri ve odak alanlari",
      "Kisa otorite ozeti ve deneyim kaniti",
      "Net sonraki adim: mesaj, program veya bekleme listesi"
    ],
    notifyTitle: "Haber ver",
    notifySub: "Bu koçun profili ve rezervasyonu acildiginda e-posta gondeririz.",
    ctaBack: "Tum koçlar"
  },
  ar: {
    badge: "ملف المدرب",
    title: "الملفات تُفتح على مراحل",
    body: "نُنهي الاتفاقيات ومعايير المحتوى لتبدو كل صفحة بمستوى التدريب نفسه.",
    proofTitle: "ما ستراه هنا",
    proofItems: [
      "وسوم التخصص والمجالات — قوة، تأهيل، أداء",
      "نبذة مختصرة وخبرة موثقة",
      "خطوة واضحة: رسالة أو برنامج أو قائمة انتظار"
    ],
    notifyTitle: "أعلمني",
    notifySub: "نرسل بريداً عند تفعيل الملف والحجز.",
    ctaBack: "كل المدربين"
  },
  es: {
    badge: "Perfil coach",
    title: "Los perfiles abren por fases",
    body: "Cerramos acuerdos y estandares visuales para que cada pagina iguale la calidad del entrenamiento.",
    proofTitle: "Que veras aqui",
    proofItems: [
      "Etiquetas de especialidad y foco",
      "Bio corta y prueba de experiencia",
      "Siguiente paso claro: mensaje, programa o lista"
    ],
    notifyTitle: "Avísame",
    notifySub: "Te avisamos cuando el perfil y la reserva esten activos.",
    ctaBack: "Todos los coaches"
  },
  fr: {
    badge: "Profil coach",
    title: "Ouverture par phases",
    body: "Nous finalisons accords et standards media pour des pages au niveau du produit.",
    proofTitle: "Ce que vous verrez",
    proofItems: [
      "Tags de specialite et axes force, reeducation, performance",
      "Bio courte et preuve d'experience",
      "Prochaine etape claire: message, programme ou liste"
    ],
    notifyTitle: "Me prevenir",
    notifySub: "Email quand le profil et la reservation seront actifs.",
    ctaBack: "Tous les coachs"
  }
};

const checkout: Record<Locale, CheckoutCopy> = {
  en: {
    badge: "Checkout",
    title: "Complete your purchase",
    lead: "Every program purchase earns TJFITcoin. Apply member discount codes from your wallet when available.",
    selectProgram: "Program",
    orderSummary: "Order summary",
    price: "Price",
    coinsOnPurchase: "Coins earned",
    discountLabel: "Discount code",
    noDiscount: "None",
    ctaPay: "Continue to payment",
    ctaWorking: "Processing…",
    walletTitle: "Wallet",
    walletLifetime: "Lifetime earned / spent",
    discountStore: "Redeem offers",
    redeem: "Redeem",
    footnote:
      "When a payment provider is connected, you will finish on a secure hosted step. Test mode completes instantly for development.",
    pendingTitle: "Order secured",
    pendingBody:
      "Your order is saved. Secure payment handoff will appear here once the payment integration is enabled — no charge has been taken yet.",
    amountDue: "Amount due",
    gatewayPlaceholderCta: "Pay with card (adapter not connected)",
    errorPrefix: "Something went wrong.",
    successPurchase: "Purchase completed."
  },
  tr: {
    badge: "Odeme",
    title: "Satin almayi tamamlayin",
    lead: "Her program satin alimi TJFITcoin kazandirir. Cuzdandan indirim kodu varsa uygulayin.",
    selectProgram: "Program",
    orderSummary: "Siparis ozeti",
    price: "Fiyat",
    coinsOnPurchase: "Kazanilan coin",
    discountLabel: "Indirim kodu",
    noDiscount: "Yok",
    ctaPay: "Odemeye devam",
    ctaWorking: "Isleniyor…",
    walletTitle: "Cuzdan",
    walletLifetime: "Toplam kazanilan / harcanan",
    discountStore: "Teklifleri kullan",
    redeem: "Kullan",
    footnote:
      "Odeme saglayicisi baglandiginda guvenli bir adimda tamamlanir. Test modu gelistirme icin aninda tamamlar.",
    pendingTitle: "Siparis kaydedildi",
    pendingBody:
      "Siparisiniz saklandi. Entegrasyon acildiginda guvenli odeme adimi burada gorunecek — henuz tahsilat yok.",
    amountDue: "Odenecek tutar",
    gatewayPlaceholderCta: "Kart ile odeme (adapter bagli degil)",
    errorPrefix: "Bir sorun olustu.",
    successPurchase: "Satin alma tamamlandi."
  },
  ar: {
    badge: "الدفع",
    title: "أكمل عملية الشراء",
    lead: "كل شراء برنامج يمنحك TJFITcoin. استخدم رموز الخصم من محفظتك عند توفرها.",
    selectProgram: "البرنامج",
    orderSummary: "ملخص الطلب",
    price: "السعر",
    coinsOnPurchase: "العملات المكتسبة",
    discountLabel: "رمز الخصم",
    noDiscount: "لا يوجد",
    ctaPay: "متابعة الدفع",
    ctaWorking: "جاري المعالجة…",
    walletTitle: "المحفظة",
    walletLifetime: "الإجمالي المكتسب / المصروف",
    discountStore: "استبدال العروض",
    redeem: "استبدال",
    footnote:
      "عند ربط مزود الدفع، ستكمل في خطوة مستضافة آمنة. وضع الاختبار يكمل فوراً للتطوير.",
    pendingTitle: "تم حفظ الطلب",
    pendingBody:
      "طلبك محفوظ. ستظهر خطوة الدفع الآمنة هنا عند تفعيل التكامل — لم يتم خصم أي مبلغ بعد.",
    amountDue: "المبلغ المستحق",
    gatewayPlaceholderCta: "الدفع بالبطاقة (لم يتم ربط المحول)",
    errorPrefix: "حدث خطأ.",
    successPurchase: "اكتملت عملية الشراء."
  },
  es: {
    badge: "Pago",
    title: "Completa tu compra",
    lead: "Cada programa suma TJFITcoin. Aplica codigos de descuento de tu cartera si los tienes.",
    selectProgram: "Programa",
    orderSummary: "Resumen",
    price: "Precio",
    coinsOnPurchase: "Monedas ganadas",
    discountLabel: "Codigo de descuento",
    noDiscount: "Ninguno",
    ctaPay: "Continuar al pago",
    ctaWorking: "Procesando…",
    walletTitle: "Cartera",
    walletLifetime: "Total ganado / gastado",
    discountStore: "Canjear ofertas",
    redeem: "Canjear",
    footnote:
      "Con un proveedor de pago conectado, terminaras en un paso alojado seguro. El modo test completa al instante.",
    pendingTitle: "Pedido guardado",
    pendingBody:
      "Tu pedido esta guardado. El paso de pago seguro aparecera cuando la integracion este activa — aun no se cobra.",
    amountDue: "Importe a pagar",
    gatewayPlaceholderCta: "Pagar con tarjeta (adaptador no conectado)",
    errorPrefix: "Algo salio mal.",
    successPurchase: "Compra completada."
  },
  fr: {
    badge: "Paiement",
    title: "Finaliser votre achat",
    lead: "Chaque programme rapporte des TJFITcoin. Appliquez les codes de reduction de votre portefeuille.",
    selectProgram: "Programme",
    orderSummary: "Recapitulatif",
    price: "Prix",
    coinsOnPurchase: "Pieces gagnees",
    discountLabel: "Code de reduction",
    noDiscount: "Aucun",
    ctaPay: "Continuer vers le paiement",
    ctaWorking: "Traitement…",
    walletTitle: "Portefeuille",
    walletLifetime: "Total gagne / depense",
    discountStore: "Echanger des offres",
    redeem: "Echanger",
    footnote:
      "Avec un prestataire connecte, vous finaliserez sur une etape hebergee securisee. Le mode test termine instantanement.",
    pendingTitle: "Commande enregistree",
    pendingBody:
      "Votre commande est sauvegardee. L'etape de paiement apparaitra quand l'integration sera active — aucun debit pour l'instant.",
    amountDue: "Montant du",
    gatewayPlaceholderCta: "Payer par carte (adaptateur non connecte)",
    errorPrefix: "Une erreur s'est produite.",
    successPurchase: "Achat termine."
  }
};

export function getCoachesListingCopy(locale: Locale): CoachesListingCopy {
  return coaches[locale];
}

export function getMembershipCopy(locale: Locale): MembershipCopy {
  return membership[locale];
}

export function getCoachProfileGateCopy(locale: Locale): CoachProfileGateCopy {
  return coachProfileGate[locale];
}

export function getCheckoutCopy(locale: Locale): CheckoutCopy {
  return checkout[locale];
}
