import type { Locale } from "@/lib/i18n";

export type CoachesListingCopy = {
  badge: string;
  title: string;
  body: string;
  ctaPrograms: string;
  ctaSignup: string;
  ctaBecomeCoach: string;
};

export type MembershipCopy = {
  badge: string;
  title: string;
  body: string;
  ctaExplore: string;
  ctaAccount: string;
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
    title: "Verified coaches are onboarding now",
    body: "We are curating a small roster of elite coaches. Browse programs today — coach profiles and booking will unlock here first.",
    ctaPrograms: "Browse programs",
    ctaSignup: "Create account",
    ctaBecomeCoach: "Apply as a coach"
  },
  tr: {
    badge: "Koçlar",
    title: "Dogrulanmis koçlar su an dahil ediliyor",
    body: "Secici bir elit koç kadrosu olusturuyoruz. Bugun programlara goz atin — koç profilleri ve rezervasyon once burada acilacak.",
    ctaPrograms: "Programlari incele",
    ctaSignup: "Hesap olustur",
    ctaBecomeCoach: "Koç basvurusu"
  },
  ar: {
    badge: "المدربون",
    title: "جاري ضم مدربين موثوقين الآن",
    body: "نبني قائمة صغيرة من المدربين المتميزين. تصفح البرامج اليوم — ستظهر الملفات والحجز هنا أولاً.",
    ctaPrograms: "تصفح البرامج",
    ctaSignup: "إنشاء حساب",
    ctaBecomeCoach: "التقديم كمدرب"
  },
  es: {
    badge: "Coaches",
    title: "Coachs verificados en incorporacion",
    body: "Estamos curando un roster pequeno de coaches elite. Explora programas hoy — perfiles y reservas llegaran aqui primero.",
    ctaPrograms: "Ver programas",
    ctaSignup: "Crear cuenta",
    ctaBecomeCoach: "Solicitar ser coach"
  },
  fr: {
    badge: "Coachs",
    title: "Des coachs verifies arrivent",
    body: "Nous constituons un petit roster de coachs elite. Parcourez les programmes aujourd'hui — profils et reservation ouvriront ici en premier.",
    ctaPrograms: "Voir les programmes",
    ctaSignup: "Creer un compte",
    ctaBecomeCoach: "Postuler comme coach"
  }
};

const membership: Record<Locale, MembershipCopy> = {
  en: {
    badge: "Membership",
    title: "All-access membership is almost here",
    body: "A single tier with premium programs, coach touchpoints, and community depth. Start with individual programs today — your account will carry over.",
    ctaExplore: "View programs",
    ctaAccount: "Sign in"
  },
  tr: {
    badge: "Uyelik",
    title: "Tam erisim uyeligi cok yakinda",
    body: "Premium programlar, koç temasi ve topluluk derinligi tek pakette. Bugun tekil programlarla baslayin — hesabiniz devreder.",
    ctaExplore: "Programlari gor",
    ctaAccount: "Giris yap"
  },
  ar: {
    badge: "العضوية",
    title: "عضوية الوصول الكامل قريباً",
    body: "مستوى واحد يجمع البرامج المميزة والتواصل مع المدربين والمجتمع. ابدأ ببرامج فردية اليوم — يبقى حسابك.",
    ctaExplore: "عرض البرامج",
    ctaAccount: "تسجيل الدخول"
  },
  es: {
    badge: "Membresia",
    title: "La membresia todo en uno llega pronto",
    body: "Un nivel con programas premium, contacto con coaches y comunidad. Empieza con programas sueltos hoy — tu cuenta se mantiene.",
    ctaExplore: "Ver programas",
    ctaAccount: "Iniciar sesion"
  },
  fr: {
    badge: "Abonnement",
    title: "L'abonnement tout-acces arrive",
    body: "Un niveau avec programmes premium, coachs et communaute. Commencez avec des programmes a l'unite aujourd'hui — votre compte est conserve.",
    ctaExplore: "Voir les programmes",
    ctaAccount: "Se connecter"
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

export function getCheckoutCopy(locale: Locale): CheckoutCopy {
  return checkout[locale];
}
