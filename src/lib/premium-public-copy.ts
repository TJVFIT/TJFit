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
  /** Optional text field for site-wide promo codes (e.g. JOSEPH1407) */
  promoCodeLabel: string;
  promoCodePlaceholder: string;
  promoApplyCta: string;
  promoAppliedPrefix: string;
  ctaPay: string;
  ctaWorking: string;
  footnote: string;
  pendingTitle: string;
  pendingBody: string;
  amountDue: string;
  gatewayPayCta: string;
  paddleOpening: string;
  paddleInitError: string;
  paddleWebhookWait: string;
  errorPrefix: string;
  successPurchase: string;
  /** Trust line near payment actions */
  securePaymentTrust: string;
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
    lead: "Apply a promo code if you have one, then continue to secure payment.",
    selectProgram: "Program",
    orderSummary: "Order summary",
    price: "Price",
    promoCodeLabel: "Promo code",
    promoCodePlaceholder: "e.g. JOSEPH1407",
    promoApplyCta: "Apply",
    promoAppliedPrefix: "Code applied:",
    ctaPay: "Continue to payment",
    ctaWorking: "Processing…",
    footnote:
      "Checkout uses Gumroad for cards, PayPal, and other methods you enable in your Gumroad dashboard. Test mode completes instantly for development.",
    pendingTitle: "Order secured",
    pendingBody:
      "Your order is saved. Open Gumroad checkout below to pay — you are not charged until you complete the payment step.",
    amountDue: "Amount due",
    gatewayPayCta: "Open secure checkout",
    paddleOpening: "Opening checkout…",
    paddleInitError: "Add GUMROAD_DEFAULT_PRODUCT_URL to your site environment (Gumroad seller dashboard → Developer tools).",
    paddleWebhookWait: "Payment is processing. You can refresh this page in a few seconds.",
    errorPrefix: "Something went wrong.",
    successPurchase: "Purchase completed.",
    securePaymentTrust: "Secure payment via Gumroad. Instant access after payment."
  },
  tr: {
    badge: "Odeme",
    title: "Satin almayi tamamlayin",
    lead: "Varsa promosyon kodunuzu uygulayin, sonra guvenli odemeye gecin.",
    selectProgram: "Program",
    orderSummary: "Siparis ozeti",
    price: "Fiyat",
    promoCodeLabel: "Promosyon kodu",
    promoCodePlaceholder: "ornek: JOSEPH1407",
    promoApplyCta: "Uygula",
    promoAppliedPrefix: "Kod uygulandi:",
    ctaPay: "Odemeye devam",
    ctaWorking: "Isleniyor…",
    footnote:
      "Odeme Gumroad uzerinden yapilir; Gumroad panelinde actiginiz yontemler gorunur. Test modu gelistirme icin aninda tamamlar.",
    pendingTitle: "Siparis kaydedildi",
    pendingBody:
      "Siparisiniz saklandi. Asagidaki guvenli odeme adimini acin — odeme tamamlanana kadar tahsilat yapilmaz.",
    amountDue: "Odenecek tutar",
    gatewayPayCta: "Guvenli odemeyi ac",
    paddleOpening: "Odeme aciliyor…",
    paddleInitError: "GUMROAD_DEFAULT_PRODUCT_URL ortam degiskenini ekleyin (Gumroad gelistirici araclari).",
    paddleWebhookWait: "Odeme isleniyor. Sayfayi birkac saniye sonra yenileyebilirsiniz.",
    errorPrefix: "Bir sorun olustu.",
    successPurchase: "Satin alma tamamlandi.",
    securePaymentTrust: "Guvenli odeme Gumroad ile. Odeme sonrasi aninda erisim."
  },
  ar: {
    badge: "الدفع",
    title: "أكمل عملية الشراء",
    lead: "أدخل رمزاً ترويجياً إن وُجد، ثم تابع إلى الدفع الآمن.",
    selectProgram: "البرنامج",
    orderSummary: "ملخص الطلب",
    price: "السعر",
    promoCodeLabel: "رمز ترويجي",
    promoCodePlaceholder: "مثال: JOSEPH1407",
    promoApplyCta: "تطبيق",
    promoAppliedPrefix: "تم تطبيق الرمز:",
    ctaPay: "متابعة الدفع",
    ctaWorking: "جاري المعالجة…",
    footnote:
      "الدفع عبر Gumroad؛ تظهر الطرق التي تفعّلها في لوحة Gumroad. وضع الاختبار يكمل فوراً للتطوير.",
    pendingTitle: "تم حفظ الطلب",
    pendingBody:
      "طلبك محفوظ. افتح نافذة الدفع الآمنة أدناه — لا يُخصم المبلغ حتى تكمل الدفع.",
    amountDue: "المبلغ المستحق",
    gatewayPayCta: "افتح الدفع الآمن",
    paddleOpening: "جاري فتح الدفع…",
    paddleInitError: "أضف GUMROAD_DEFAULT_PRODUCT_URL إلى إعدادات الموقع (أدوات المطوّر في Gumroad).",
    paddleWebhookWait: "جاري معالجة الدفع. يمكنك تحديث الصفحة بعد لحظات.",
    errorPrefix: "حدث خطأ.",
    successPurchase: "اكتملت عملية الشراء.",
    securePaymentTrust: "دفع آمن عبر Gumroad. وصول فوري بعد الدفع."
  },
  es: {
    badge: "Pago",
    title: "Completa tu compra",
    lead: "Aplica un codigo promocional si tienes uno, luego continua al pago seguro.",
    selectProgram: "Programa",
    orderSummary: "Resumen",
    price: "Precio",
    promoCodeLabel: "Codigo promocional",
    promoCodePlaceholder: "ej. JOSEPH1407",
    promoApplyCta: "Aplicar",
    promoAppliedPrefix: "Codigo aplicado:",
    ctaPay: "Continuar al pago",
    ctaWorking: "Procesando…",
    footnote:
      "El pago es con Gumroad; veras los metodos que actives en el panel de Gumroad. El modo test completa al instante.",
    pendingTitle: "Pedido guardado",
    pendingBody:
      "Tu pedido esta guardado. Abre el checkout seguro abajo — no se cobra hasta que completes el pago.",
    amountDue: "Importe a pagar",
    gatewayPayCta: "Abrir pago seguro",
    paddleOpening: "Abriendo checkout…",
    paddleInitError: "Anade GUMROAD_DEFAULT_PRODUCT_URL al entorno del sitio (herramientas para desarrolladores de Gumroad).",
    paddleWebhookWait: "Procesando el pago. Puedes actualizar la pagina en unos segundos.",
    errorPrefix: "Algo salio mal.",
    successPurchase: "Compra completada.",
    securePaymentTrust: "Pago seguro con Gumroad. Acceso instantaneo tras pagar."
  },
  fr: {
    badge: "Paiement",
    title: "Finaliser votre achat",
    lead: "Appliquez un code promo si vous en avez un, puis continuez vers le paiement securise.",
    selectProgram: "Programme",
    orderSummary: "Recapitulatif",
    price: "Prix",
    promoCodeLabel: "Code promo",
    promoCodePlaceholder: "ex. JOSEPH1407",
    promoApplyCta: "Appliquer",
    promoAppliedPrefix: "Code applique :",
    ctaPay: "Continuer vers le paiement",
    ctaWorking: "Traitement…",
    footnote:
      "Paiement via Gumroad ; les methodes affichees correspondent a votre tableau de bord Gumroad. Le mode test termine instantanement.",
    pendingTitle: "Commande enregistree",
    pendingBody:
      "Votre commande est sauvegardee. Ouvrez le paiement securise ci-dessous — rien n'est debite tant que vous n'avez pas termine.",
    amountDue: "Montant du",
    gatewayPayCta: "Ouvrir le paiement securise",
    paddleOpening: "Ouverture du paiement…",
    paddleInitError:
      "Ajoutez GUMROAD_DEFAULT_PRODUCT_URL a l'environnement du site (outils developpeur Gumroad).",
    paddleWebhookWait:
      "Paiement en cours. Vous pouvez actualiser la page dans quelques secondes.",
    errorPrefix: "Une erreur s'est produite.",
    successPurchase: "Achat termine.",
    securePaymentTrust: "Paiement securise via Gumroad. Acces immediat apres paiement."
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
