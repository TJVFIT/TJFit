import type { Locale } from "@/lib/i18n";

type AuthCopy = {
  loginBadge: string;
  loginTitle: string;
  loginSubtitle: string;
  adminLoginBadge: string;
  adminLoginTitle: string;
  adminLoginSubtitle: string;
  adminUsernameRequired: string;
  loginFailed: string;
  authNotConfigured: string;
  /** Shown when /api/auth/me cannot be reached (network / 5xx). */
  sessionCheckFailed: string;
  emailRequired: string;
  passwordRequired: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  passwordMinPlaceholder: string;
  usernamePlaceholder: string;
  signingIn: string;
  loginButton: string;
  loginAsAdminButton: string;
  useEmailLogin: string;
  switchToAdminLogin: string;
  newHere: string;
  createAccount: string;
  signupBadge: string;
  signupTitle: string;
  signupSubtitle: string;
  passwordTooShort: string;
  passwordsDoNotMatch: string;
  acceptTermsRequired: string;
  signupFailed: string;
  signupSuccess: string;
  confirmPasswordPlaceholder: string;
  createAccountButton: string;
  creatingAccount: string;
  alreadyHaveAccount: string;
  logIn: string;
  agreePrefix: string;
  termsLink: string;
  privacyLink: string;
  billingSuffix: string;
};

type GuestPopupCopy = {
  welcome: string;
  entryTitle: string;
  entrySubtitle: string;
  createAccount: string;
  viewWebsite: string;
  stayUpdated: string;
  marketingTitle: string;
  marketingSubtitle: string;
  yesSignMeUp: string;
  noThanks: string;
  emailSignup: string;
  enterEmail: string;
  emailSubtitle: string;
  emailPlaceholder: string;
  submitting: string;
  subscribe: string;
  skip: string;
  invalidEmail: string;
  subscribeFailed: string;
};

type CommunityCopy = {
  badge: string;
  title: string;
  subtitle: string;
  tabs: {
    threads: string;
    challenges: string;
    transformations: string;
    blogs: string;
  };
  threadsEmpty: string;
  challengesEmpty: string;
  transformationsEmpty: string;
  verified: string;
  unverified: string;
  publishTitle: string;
  titlePlaceholder: string;
  contentPlaceholder: string;
  publish: string;
  publishing: string;
  loadingBlogs: string;
  noBlogs: string;
  blogLoadFailed: string;
  publishFailed: string;
  publishSuccess: string;
  deleteFailed: string;
  deleteSuccess: string;
  pinFailed: string;
  pinSuccess: string;
  unpinSuccess: string;
  translationFailed: string;
  translate: string;
  translating: string;
  showOriginal: string;
  delete: string;
  working: string;
  pin: string;
  unpin: string;
  pinned: string;
  turkish: string;
  arabic: string;
  spanish: string;
  french: string;
};

type FooterCopy = {
  description: string;
  platformTitle: string;
  operationsTitle: string;
  coaches: string;
  programs: string;
  community: string;
  membership: string;
  terms: string;
  privacy: string;
  refund: string;
  support: string;
  coachDashboard: string;
  adminPanel: string;
  checkout: string;
  leadColumnTitle: string;
  leadColumnSub: string;
};

type NavChromeCopy = {
  menu: string;
  navigation: string;
  close: string;
  closeSidebarOverlay: string;
  explore: string;
  community: string;
  features: string;
  account: string;
  threads: string;
  blogs: string;
  loginLabel: string;
  joinLabel: string;
  aiLabel: string;
};

/** Short blurbs (2–3 words) for sidebar rows; must stay tiny for layout. */
export type NavMenuSummaries = {
  blogs: string;
  home: string;
  coaches: string;
  programs: string;
  community: string;
  threads: string;
  challenges: string;
  transformations: string;
  ai: string;
  membership: string;
  support: string;
  live: string;
  progress: string;
  messages: string;
  profile: string;
  dashboard: string;
  admin: string;
  chat: string;
  peopleSearch: string;
};

type HomePageSectionCopy = {
  blogsTitle: string;
  blogsSubtitle: string;
  blogsViewAll: string;
};

type AdminCoachCopy = {
  title: string;
  subtitle: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  authorize: string;
  authorizing: string;
  listTitle: string;
  noCoaches: string;
  genericError: string;
};

const authCopy: Record<Locale, AuthCopy> = {
  en: {
    loginBadge: "Login",
    loginTitle: "Welcome back.",
    loginSubtitle: "Sign in to access your dashboard.",
    adminLoginBadge: "Admin Login",
    adminLoginTitle: "Log in as admin",
    adminLoginSubtitle: "Sign in with your admin username and password.",
    adminUsernameRequired: "Please enter admin username.",
    loginFailed: "Login failed.",
    authNotConfigured: "Auth not configured.",
    sessionCheckFailed: "We could not verify your session. Check your connection and refresh the page.",
    emailRequired: "Please enter email.",
    passwordRequired: "Please enter password.",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    passwordMinPlaceholder: "Password (min 8 characters)",
    usernamePlaceholder: "Username or email",
    signingIn: "Signing in...",
    loginButton: "Login",
    loginAsAdminButton: "Log in as admin",
    useEmailLogin: "Use email login instead",
    switchToAdminLogin: "Log in as admin",
    newHere: "New here?",
    createAccount: "Create account",
    signupBadge: "Create account",
    signupTitle: "Join TJFit.",
    signupSubtitle: "Sign up to book coaching sessions, buy programs, track progress, and message your coach.",
    passwordTooShort: "Password must be at least 8 characters.",
    passwordsDoNotMatch: "Passwords do not match.",
    acceptTermsRequired: "You must accept Terms, Privacy, and Billing Terms to create an account.",
    signupFailed: "Unable to create account.",
    signupSuccess: "Account created. Check your email for verification, then sign in.",
    confirmPasswordPlaceholder: "Confirm password",
    createAccountButton: "Create account",
    creatingAccount: "Creating account...",
    alreadyHaveAccount: "Already have an account?",
    logIn: "Log in",
    agreePrefix: "I agree to the",
    termsLink: "Terms of Service",
    privacyLink: "Privacy Policy",
    billingSuffix: "billing terms."
  },
  tr: {
    loginBadge: "Giris",
    loginTitle: "Tekrar hos geldin.",
    loginSubtitle: "Paneline erismek icin giris yap.",
    adminLoginBadge: "Yonetici Girisi",
    adminLoginTitle: "Yonetici olarak giris yap",
    adminLoginSubtitle: "Yonetici kullanici adi ve sifrenle giris yap.",
    adminUsernameRequired: "Lutfen yonetici kullanici adini gir.",
    loginFailed: "Giris basarisiz.",
    authNotConfigured: "Kimlik dogrulama ayarli degil.",
    sessionCheckFailed: "Oturum dogrulanamadi. Baglantini kontrol et ve sayfayi yenile.",
    emailRequired: "Lutfen e-posta gir.",
    passwordRequired: "Lutfen sifre gir.",
    emailPlaceholder: "E-posta",
    passwordPlaceholder: "Sifre",
    passwordMinPlaceholder: "Sifre (en az 8 karakter)",
    usernamePlaceholder: "Kullanici adi veya e-posta",
    signingIn: "Giris yapiliyor...",
    loginButton: "Giris yap",
    loginAsAdminButton: "Yonetici olarak giris yap",
    useEmailLogin: "Bunun yerine e-posta ile gir",
    switchToAdminLogin: "Yonetici girisi",
    newHere: "Yeni misin?",
    createAccount: "Hesap olustur",
    signupBadge: "Hesap olustur",
    signupTitle: "TJFit'e katil.",
    signupSubtitle: "Kocluk seanslari almak, program satin almak, ilerlemeni takip etmek ve koçunla mesajlasmak icin kayit ol.",
    passwordTooShort: "Sifre en az 8 karakter olmali.",
    passwordsDoNotMatch: "Sifreler eslesmiyor.",
    acceptTermsRequired: "Hesap olusturmak icin Sartlar, Gizlilik ve Faturalama kosullarini kabul etmelisin.",
    signupFailed: "Hesap olusturulamadi.",
    signupSuccess: "Hesap olusturuldu. E-postani dogrula ve sonra giris yap.",
    confirmPasswordPlaceholder: "Sifreyi onayla",
    createAccountButton: "Hesap olustur",
    creatingAccount: "Hesap olusturuluyor...",
    alreadyHaveAccount: "Zaten hesabin var mi?",
    logIn: "Giris yap",
    agreePrefix: "Sunlari kabul ediyorum:",
    termsLink: "Hizmet Sartlari",
    privacyLink: "Gizlilik Politikasi",
    billingSuffix: "faturalama kosullari."
  },
  ar: {
    loginBadge: "تسجيل الدخول",
    loginTitle: "مرحبا بعودتك.",
    loginSubtitle: "سجل الدخول للوصول إلى لوحتك.",
    adminLoginBadge: "دخول الادارة",
    adminLoginTitle: "تسجيل الدخول كادمن",
    adminLoginSubtitle: "سجل الدخول باسم المستخدم وكلمة المرور الخاصة بالادارة.",
    adminUsernameRequired: "الرجاء ادخال اسم مستخدم الادارة.",
    loginFailed: "فشل تسجيل الدخول.",
    authNotConfigured: "المصادقة غير مهيأة.",
    sessionCheckFailed: "تعذر التحقق من جلستك. تحقق من الاتصال وحدّث الصفحة.",
    emailRequired: "الرجاء ادخال البريد الالكتروني.",
    passwordRequired: "الرجاء ادخال كلمة المرور.",
    emailPlaceholder: "البريد الالكتروني",
    passwordPlaceholder: "كلمة المرور",
    passwordMinPlaceholder: "كلمة المرور (8 احرف على الاقل)",
    usernamePlaceholder: "اسم المستخدم او البريد",
    signingIn: "جار تسجيل الدخول...",
    loginButton: "تسجيل الدخول",
    loginAsAdminButton: "دخول الادارة",
    useEmailLogin: "استخدم البريد الالكتروني بدلا من ذلك",
    switchToAdminLogin: "تسجيل الدخول كادمن",
    newHere: "جديد هنا؟",
    createAccount: "انشاء حساب",
    signupBadge: "انشاء حساب",
    signupTitle: "انضم إلى TJFit.",
    signupSubtitle: "سجل للحصول على الجلسات والبرامج وتتبع التقدم ومراسلة المدرب.",
    passwordTooShort: "يجب ان تكون كلمة المرور 8 احرف على الاقل.",
    passwordsDoNotMatch: "كلمتا المرور غير متطابقتين.",
    acceptTermsRequired: "يجب قبول الشروط والخصوصية وشروط الفوترة لانشاء الحساب.",
    signupFailed: "تعذر انشاء الحساب.",
    signupSuccess: "تم انشاء الحساب. تحقق من بريدك الالكتروني ثم سجل الدخول.",
    confirmPasswordPlaceholder: "تأكيد كلمة المرور",
    createAccountButton: "انشاء حساب",
    creatingAccount: "جار انشاء الحساب...",
    alreadyHaveAccount: "لديك حساب بالفعل؟",
    logIn: "تسجيل الدخول",
    agreePrefix: "اوافق على",
    termsLink: "شروط الخدمة",
    privacyLink: "سياسة الخصوصية",
    billingSuffix: "وشروط الفوترة."
  },
  es: {
    loginBadge: "Iniciar sesion",
    loginTitle: "Bienvenido de nuevo.",
    loginSubtitle: "Inicia sesion para acceder a tu panel.",
    adminLoginBadge: "Acceso Admin",
    adminLoginTitle: "Entrar como admin",
    adminLoginSubtitle: "Inicia sesion con tu usuario y contrasena de administrador.",
    adminUsernameRequired: "Introduce el usuario de administrador.",
    loginFailed: "Inicio de sesion fallido.",
    authNotConfigured: "Autenticacion no configurada.",
    sessionCheckFailed: "No pudimos verificar tu sesion. Revisa la conexion y actualiza la pagina.",
    emailRequired: "Introduce tu correo.",
    passwordRequired: "Introduce tu contrasena.",
    emailPlaceholder: "Correo electronico",
    passwordPlaceholder: "Contrasena",
    passwordMinPlaceholder: "Contrasena (minimo 8 caracteres)",
    usernamePlaceholder: "Usuario o correo",
    signingIn: "Entrando...",
    loginButton: "Iniciar sesion",
    loginAsAdminButton: "Entrar como admin",
    useEmailLogin: "Usar acceso por correo",
    switchToAdminLogin: "Entrar como admin",
    newHere: "Eres nuevo?",
    createAccount: "Crear cuenta",
    signupBadge: "Crear cuenta",
    signupTitle: "Unete a TJFit.",
    signupSubtitle: "Registrate para reservar coaching, comprar programas, seguir tu progreso y escribir a tu coach.",
    passwordTooShort: "La contrasena debe tener al menos 8 caracteres.",
    passwordsDoNotMatch: "Las contrasenas no coinciden.",
    acceptTermsRequired: "Debes aceptar Terminos, Privacidad y Facturacion para crear una cuenta.",
    signupFailed: "No se pudo crear la cuenta.",
    signupSuccess: "Cuenta creada. Revisa tu correo para verificarla y luego inicia sesion.",
    confirmPasswordPlaceholder: "Confirmar contrasena",
    createAccountButton: "Crear cuenta",
    creatingAccount: "Creando cuenta...",
    alreadyHaveAccount: "Ya tienes cuenta?",
    logIn: "Iniciar sesion",
    agreePrefix: "Acepto los",
    termsLink: "Terminos del servicio",
    privacyLink: "Politica de privacidad",
    billingSuffix: "y terminos de facturacion."
  },
  fr: {
    loginBadge: "Connexion",
    loginTitle: "Bon retour.",
    loginSubtitle: "Connectez-vous pour acceder a votre tableau de bord.",
    adminLoginBadge: "Connexion Admin",
    adminLoginTitle: "Se connecter en admin",
    adminLoginSubtitle: "Connectez-vous avec votre identifiant et mot de passe admin.",
    adminUsernameRequired: "Veuillez entrer le nom d'utilisateur admin.",
    loginFailed: "Echec de connexion.",
    authNotConfigured: "Authentification non configuree.",
    sessionCheckFailed: "Impossible de verifier ta session. Verifie ta connexion et actualise la page.",
    emailRequired: "Veuillez entrer votre email.",
    passwordRequired: "Veuillez entrer votre mot de passe.",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Mot de passe",
    passwordMinPlaceholder: "Mot de passe (8 caracteres minimum)",
    usernamePlaceholder: "Nom d'utilisateur ou email",
    signingIn: "Connexion...",
    loginButton: "Connexion",
    loginAsAdminButton: "Se connecter en admin",
    useEmailLogin: "Utiliser la connexion email",
    switchToAdminLogin: "Se connecter en admin",
    newHere: "Nouveau ici ?",
    createAccount: "Creer un compte",
    signupBadge: "Creer un compte",
    signupTitle: "Rejoignez TJFit.",
    signupSubtitle: "Inscrivez-vous pour reserver du coaching, acheter des programmes, suivre vos progres et parler a votre coach.",
    passwordTooShort: "Le mot de passe doit contenir au moins 8 caracteres.",
    passwordsDoNotMatch: "Les mots de passe ne correspondent pas.",
    acceptTermsRequired: "Vous devez accepter les Conditions, la Confidentialite et les conditions de facturation pour creer un compte.",
    signupFailed: "Impossible de creer le compte.",
    signupSuccess: "Compte cree. Verifiez votre email puis connectez-vous.",
    confirmPasswordPlaceholder: "Confirmer le mot de passe",
    createAccountButton: "Creer un compte",
    creatingAccount: "Creation du compte...",
    alreadyHaveAccount: "Vous avez deja un compte ?",
    logIn: "Se connecter",
    agreePrefix: "J'accepte les",
    termsLink: "Conditions d'utilisation",
    privacyLink: "Politique de confidentialite",
    billingSuffix: "et conditions de facturation."
  }
};

const guestPopupCopy: Record<Locale, GuestPopupCopy> = {
  en: {
    welcome: "Welcome",
    entryTitle: "Create account or view website?",
    entrySubtitle: "Create an account for programs, progress tracking, and secure coach chat. You can also browse first.",
    createAccount: "Create account",
    viewWebsite: "View website",
    stayUpdated: "Stay Updated",
    marketingTitle: "Want discount and feature emails?",
    marketingSubtitle: "Get discount alerts and announcements when new TJFit features and programs are released.",
    yesSignMeUp: "Yes, sign me up",
    noThanks: "No thanks",
    emailSignup: "Email Signup",
    enterEmail: "Enter your email",
    emailSubtitle: "We will send discounts and updates for new TJFit features.",
    emailPlaceholder: "you@example.com",
    submitting: "Submitting...",
    subscribe: "Subscribe",
    skip: "Skip",
    invalidEmail: "Please enter a valid email.",
    subscribeFailed: "Could not subscribe."
  },
  tr: {
    welcome: "Hos geldin",
    entryTitle: "Hesap olusturmak mi yoksa siteyi gezmek mi istersin?",
    entrySubtitle: "Programlar, ilerleme takibi ve guvenli koç sohbeti icin hesap olustur. Istersen once gezebilirsin.",
    createAccount: "Hesap olustur",
    viewWebsite: "Siteyi gez",
    stayUpdated: "Guncel Kal",
    marketingTitle: "Indirim ve ozellik e-postalari ister misin?",
    marketingSubtitle: "Yeni TJFit ozellikleri ve programlari acildiginda haber verelim.",
    yesSignMeUp: "Evet, kayit ol",
    noThanks: "Hayir tesekkurler",
    emailSignup: "E-posta Kaydi",
    enterEmail: "E-postani gir",
    emailSubtitle: "Yeni ozellikler ve indirimler icin sana e-posta gonderecegiz.",
    emailPlaceholder: "ornek@email.com",
    submitting: "Gonderiliyor...",
    subscribe: "Abone ol",
    skip: "Gec",
    invalidEmail: "Lutfen gecerli bir e-posta gir.",
    subscribeFailed: "Abonelik yapilamadi."
  },
  ar: {
    welcome: "مرحبا",
    entryTitle: "هل تريد انشاء حساب ام تصفح الموقع؟",
    entrySubtitle: "انشئ حسابا للبرامج وتتبع التقدم ومحادثة المدرب بشكل آمن، او تصفح اولا.",
    createAccount: "انشاء حساب",
    viewWebsite: "عرض الموقع",
    stayUpdated: "ابق على اطلاع",
    marketingTitle: "هل تريد رسائل عن الخصومات والميزات؟",
    marketingSubtitle: "سنرسل لك اشعارات عن الخصومات والميزات والبرامج الجديدة.",
    yesSignMeUp: "نعم سجلني",
    noThanks: "لا شكرا",
    emailSignup: "تسجيل البريد",
    enterEmail: "ادخل بريدك الالكتروني",
    emailSubtitle: "سنرسل خصومات وتحديثات عن ميزات TJFit الجديدة.",
    emailPlaceholder: "you@example.com",
    submitting: "جار الارسال...",
    subscribe: "اشتراك",
    skip: "تخطي",
    invalidEmail: "الرجاء ادخال بريد الكتروني صالح.",
    subscribeFailed: "تعذر الاشتراك."
  },
  es: {
    welcome: "Bienvenido",
    entryTitle: "Quieres crear una cuenta o ver el sitio?",
    entrySubtitle: "Crea una cuenta para programas, progreso y chat seguro con coach. Tambien puedes explorar primero.",
    createAccount: "Crear cuenta",
    viewWebsite: "Ver sitio",
    stayUpdated: "Mantente al dia",
    marketingTitle: "Quieres correos con descuentos y novedades?",
    marketingSubtitle: "Recibe avisos de descuentos y lanzamientos de nuevas funciones y programas.",
    yesSignMeUp: "Si, apuntame",
    noThanks: "No gracias",
    emailSignup: "Registro por email",
    enterEmail: "Introduce tu correo",
    emailSubtitle: "Te enviaremos descuentos y novedades de TJFit.",
    emailPlaceholder: "tu@email.com",
    submitting: "Enviando...",
    subscribe: "Suscribirme",
    skip: "Omitir",
    invalidEmail: "Introduce un correo valido.",
    subscribeFailed: "No se pudo suscribir."
  },
  fr: {
    welcome: "Bienvenue",
    entryTitle: "Creer un compte ou visiter le site ?",
    entrySubtitle: "Creez un compte pour les programmes, le suivi et le chat coach securise. Vous pouvez aussi parcourir d'abord.",
    createAccount: "Creer un compte",
    viewWebsite: "Voir le site",
    stayUpdated: "Restez informe",
    marketingTitle: "Voulez-vous recevoir les emails promos et nouveautes ?",
    marketingSubtitle: "Recevez les alertes de remises et les annonces des nouvelles fonctionnalites et programmes TJFit.",
    yesSignMeUp: "Oui, je m'inscris",
    noThanks: "Non merci",
    emailSignup: "Inscription email",
    enterEmail: "Entrez votre email",
    emailSubtitle: "Nous enverrons des remises et des mises a jour sur les nouvelles fonctionnalites TJFit.",
    emailPlaceholder: "vous@email.com",
    submitting: "Envoi...",
    subscribe: "S'abonner",
    skip: "Passer",
    invalidEmail: "Veuillez entrer un email valide.",
    subscribeFailed: "Impossible de vous abonner."
  }
};

const communityCopy: Record<Locale, CommunityCopy> = {
  en: {
    badge: "Community Hub",
    title: "Community",
    subtitle: "Threads, challenges, and transformations are now organized in one place.",
    tabs: { threads: "Threads", challenges: "Challenges", transformations: "Transformations", blogs: "Blogs" },
    threadsEmpty: "Threads are being prepared. Your community feed will appear here.",
    challengesEmpty: "No active challenges yet.",
    transformationsEmpty: "No public transformations yet.",
    verified: "Verified",
    unverified: "Unverified",
    publishTitle: "Publish a blog post",
    titlePlaceholder: "Title",
    contentPlaceholder: "Write your post...",
    publish: "Publish",
    publishing: "Publishing...",
    loadingBlogs: "Loading blogs...",
    noBlogs: "No blog posts yet.",
    blogLoadFailed: "Could not load blogs.",
    publishFailed: "Failed to publish blog.",
    publishSuccess: "Blog post published.",
    deleteFailed: "Failed to delete blog.",
    deleteSuccess: "Blog deleted.",
    pinFailed: "Failed to update pin.",
    pinSuccess: "Blog pinned.",
    unpinSuccess: "Blog unpinned.",
    translationFailed: "Translation failed.",
    translate: "Translate",
    translating: "Translating...",
    showOriginal: "Show original",
    delete: "Delete",
    working: "Working...",
    pin: "Pin",
    unpin: "Unpin",
    pinned: "Pinned",
    turkish: "Turkish",
    arabic: "Arabic",
    spanish: "Spanish",
    french: "French"
  },
  tr: {
    badge: "Topluluk Merkezi",
    title: "Topluluk",
    subtitle: "Threadler, meydan okumalar ve donusumler artik tek yerde.",
    tabs: { threads: "Threadler", challenges: "Meydan Okumalar", transformations: "Donusumler", blogs: "Bloglar" },
    threadsEmpty: "Threadler hazirlaniyor. Topluluk akisin burada gorunecek.",
    challengesEmpty: "Henuz aktif meydan okuma yok.",
    transformationsEmpty: "Henuz acik donusum yok.",
    verified: "Dogrulandi",
    unverified: "Dogrulanmadi",
    publishTitle: "Blog yazisi yayinla",
    titlePlaceholder: "Baslik",
    contentPlaceholder: "Yazini yaz...",
    publish: "Yayinla",
    publishing: "Yayinlaniyor...",
    loadingBlogs: "Bloglar yukleniyor...",
    noBlogs: "Henuz blog yazisi yok.",
    blogLoadFailed: "Bloglar yuklenemedi.",
    publishFailed: "Blog yayinlanamadi.",
    publishSuccess: "Blog yazisi yayinlandi.",
    deleteFailed: "Blog silinemedi.",
    deleteSuccess: "Blog silindi.",
    pinFailed: "Sabitlenemedi.",
    pinSuccess: "Blog sabitlendi.",
    unpinSuccess: "Blog sabitten kaldirildi.",
    translationFailed: "Ceviri basarisiz.",
    translate: "Cevir",
    translating: "Cevriliyor...",
    showOriginal: "Orijinali goster",
    delete: "Sil",
    working: "Calisiyor...",
    pin: "Sabitle",
    unpin: "Kaldir",
    pinned: "Sabit",
    turkish: "Turkce",
    arabic: "Arapca",
    spanish: "Ispanyolca",
    french: "Fransizca"
  },
  ar: {
    badge: "مركز المجتمع",
    title: "المجتمع",
    subtitle: "المنشورات والتحديات والتحولات اصبحت منظمة في مكان واحد.",
    tabs: { threads: "المناقشات", challenges: "التحديات", transformations: "التحولات", blogs: "المدونات" },
    threadsEmpty: "يتم تجهيز المناقشات. سيظهر نشاط المجتمع هنا.",
    challengesEmpty: "لا توجد تحديات نشطة حاليا.",
    transformationsEmpty: "لا توجد تحولات عامة حاليا.",
    verified: "موثق",
    unverified: "غير موثق",
    publishTitle: "نشر تدوينة",
    titlePlaceholder: "العنوان",
    contentPlaceholder: "اكتب منشورك...",
    publish: "نشر",
    publishing: "جار النشر...",
    loadingBlogs: "جار تحميل المدونات...",
    noBlogs: "لا توجد مدونات بعد.",
    blogLoadFailed: "تعذر تحميل المدونات.",
    publishFailed: "فشل نشر التدوينة.",
    publishSuccess: "تم نشر التدوينة.",
    deleteFailed: "فشل حذف التدوينة.",
    deleteSuccess: "تم حذف التدوينة.",
    pinFailed: "فشل تحديث التثبيت.",
    pinSuccess: "تم تثبيت التدوينة.",
    unpinSuccess: "تم الغاء تثبيت التدوينة.",
    translationFailed: "فشلت الترجمة.",
    translate: "ترجمة",
    translating: "جار الترجمة...",
    showOriginal: "عرض الاصلي",
    delete: "حذف",
    working: "جار التنفيذ...",
    pin: "تثبيت",
    unpin: "الغاء التثبيت",
    pinned: "مثبت",
    turkish: "التركية",
    arabic: "العربية",
    spanish: "الاسبانية",
    french: "الفرنسية"
  },
  es: {
    badge: "Centro de Comunidad",
    title: "Comunidad",
    subtitle: "Hilos, retos y transformaciones ahora estan organizados en un solo lugar.",
    tabs: { threads: "Hilos", challenges: "Retos", transformations: "Transformaciones", blogs: "Blogs" },
    threadsEmpty: "Los hilos se estan preparando. Tu feed aparecera aqui.",
    challengesEmpty: "Aun no hay retos activos.",
    transformationsEmpty: "Aun no hay transformaciones publicas.",
    verified: "Verificado",
    unverified: "No verificado",
    publishTitle: "Publicar un blog",
    titlePlaceholder: "Titulo",
    contentPlaceholder: "Escribe tu publicacion...",
    publish: "Publicar",
    publishing: "Publicando...",
    loadingBlogs: "Cargando blogs...",
    noBlogs: "Aun no hay blogs.",
    blogLoadFailed: "No se pudieron cargar los blogs.",
    publishFailed: "No se pudo publicar el blog.",
    publishSuccess: "Blog publicado.",
    deleteFailed: "No se pudo eliminar el blog.",
    deleteSuccess: "Blog eliminado.",
    pinFailed: "No se pudo actualizar el pin.",
    pinSuccess: "Blog fijado.",
    unpinSuccess: "Blog desfijado.",
    translationFailed: "La traduccion fallo.",
    translate: "Traducir",
    translating: "Traduciendo...",
    showOriginal: "Ver original",
    delete: "Eliminar",
    working: "Procesando...",
    pin: "Fijar",
    unpin: "Desfijar",
    pinned: "Fijado",
    turkish: "Turco",
    arabic: "Arabe",
    spanish: "Espanol",
    french: "Frances"
  },
  fr: {
    badge: "Centre Communaute",
    title: "Communaute",
    subtitle: "Discussions, defis et transformations sont maintenant reunis au meme endroit.",
    tabs: { threads: "Discussions", challenges: "Defis", transformations: "Transformations", blogs: "Blogs" },
    threadsEmpty: "Les discussions sont en preparation. Votre flux apparaitra ici.",
    challengesEmpty: "Aucun defi actif pour le moment.",
    transformationsEmpty: "Aucune transformation publique pour le moment.",
    verified: "Verifie",
    unverified: "Non verifie",
    publishTitle: "Publier un article",
    titlePlaceholder: "Titre",
    contentPlaceholder: "Ecrivez votre publication...",
    publish: "Publier",
    publishing: "Publication...",
    loadingBlogs: "Chargement des blogs...",
    noBlogs: "Aucun blog pour le moment.",
    blogLoadFailed: "Impossible de charger les blogs.",
    publishFailed: "Impossible de publier le blog.",
    publishSuccess: "Blog publie.",
    deleteFailed: "Impossible de supprimer le blog.",
    deleteSuccess: "Blog supprime.",
    pinFailed: "Impossible de mettre a jour l'epingle.",
    pinSuccess: "Blog epingle.",
    unpinSuccess: "Blog desepingle.",
    translationFailed: "La traduction a echoue.",
    translate: "Traduire",
    translating: "Traduction...",
    showOriginal: "Voir l'original",
    delete: "Supprimer",
    working: "Traitement...",
    pin: "Epingler",
    unpin: "Retirer",
    pinned: "Epingle",
    turkish: "Turc",
    arabic: "Arabe",
    spanish: "Espagnol",
    french: "Francais"
  }
};

const footerCopy: Record<Locale, FooterCopy> = {
  en: {
    description: "Premium online coaching and digital programs platform for fitness, performance, and recovery.",
    platformTitle: "Platform",
    operationsTitle: "Operations",
    coaches: "Coaches (Coming Soon)",
    programs: "Programs Marketplace",
    community: "Community",
    membership: "Subscription (Coming Soon)",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    refund: "Refund Policy",
    support: "Support",
    coachDashboard: "Coach Dashboard",
    adminPanel: "Admin Panel",
    checkout: "Checkout",
    leadColumnTitle: "Product updates",
    leadColumnSub: "Roadmap and launch notes — no noise."
  },
  tr: {
    description: "Fitness, performans ve toparlanma icin premium online koçluk ve dijital program platformu.",
    platformTitle: "Platform",
    operationsTitle: "Islemler",
    coaches: "Koçlar (Yakinda)",
    programs: "Program Pazari",
    community: "Topluluk",
    membership: "Abonelik (Yakinda)",
    terms: "Hizmet Sartlari",
    privacy: "Gizlilik Politikasi",
    refund: "Iade Politikasi",
    support: "Destek",
    coachDashboard: "Koç Paneli",
    adminPanel: "Yonetim Paneli",
    checkout: "Odeme",
    leadColumnTitle: "Urun guncellemeleri",
    leadColumnSub: "Yol haritasi ve lansman — gereksiz e-posta yok."
  },
  ar: {
    description: "منصة تدريب اونلاين وبرامج رقمية مميزة للياقة والاداء والتعافي.",
    platformTitle: "المنصة",
    operationsTitle: "العمليات",
    coaches: "المدربون (قريبا)",
    programs: "سوق البرامج",
    community: "المجتمع",
    membership: "الاشتراك (قريبا)",
    terms: "شروط الخدمة",
    privacy: "سياسة الخصوصية",
    refund: "سياسة الاسترداد",
    support: "الدعم",
    coachDashboard: "لوحة المدرب",
    adminPanel: "لوحة الادارة",
    checkout: "الدفع",
    leadColumnTitle: "تحديثات المنتج",
    leadColumnSub: "خارطة الطريق والإطلاق — بلا إزعاج."
  },
  es: {
    description: "Plataforma premium de coaching online y programas digitales para fitness, rendimiento y recuperacion.",
    platformTitle: "Plataforma",
    operationsTitle: "Operaciones",
    coaches: "Coaches (Proximamente)",
    programs: "Marketplace de Programas",
    community: "Comunidad",
    membership: "Suscripcion (Proximamente)",
    terms: "Terminos del Servicio",
    privacy: "Politica de Privacidad",
    refund: "Politica de Reembolso",
    support: "Soporte",
    coachDashboard: "Panel del Coach",
    adminPanel: "Panel Admin",
    checkout: "Checkout",
    leadColumnTitle: "Novedades del producto",
    leadColumnSub: "Hoja de ruta y lanzamientos — sin ruido."
  },
  fr: {
    description: "Plateforme premium de coaching en ligne et de programmes digitaux pour fitness, performance et recuperation.",
    platformTitle: "Plateforme",
    operationsTitle: "Operations",
    coaches: "Coachs (Bientot)",
    programs: "Marketplace des Programmes",
    community: "Communaute",
    membership: "Abonnement (Bientot)",
    terms: "Conditions d'utilisation",
    privacy: "Politique de confidentialite",
    refund: "Politique de remboursement",
    support: "Support",
    coachDashboard: "Tableau Coach",
    adminPanel: "Panneau Admin",
    checkout: "Paiement",
    leadColumnTitle: "Mises a jour produit",
    leadColumnSub: "Feuille de route et lancements — sans bruit."
  }
};

const navMenuSummaries: Record<Locale, NavMenuSummaries> = {
  en: {
    blogs: "Coach articles",
    home: "Start here",
    coaches: "Find coaches",
    programs: "Plans & training",
    community: "Community hub",
    threads: "Open discussions",
    challenges: "Group challenges",
    transformations: "Success stories",
    ai: "Smart guidance",
    membership: "Subscriptions",
    support: "Help & answers",
    live: "Live sessions",
    progress: "Track progress",
    messages: "Inbox",
    profile: "Your profile",
    dashboard: "Coach workspace",
    admin: "Admin tools",
    chat: "Coach chat",
    peopleSearch: "Member search"
  },
  tr: {
    blogs: "Koç yazıları",
    home: "Başlangıç",
    coaches: "Koç bul",
    programs: "Plan ve antrenman",
    community: "Topluluk merkezi",
    threads: "Tartışmalar",
    challenges: "Grup meydan okuma",
    transformations: "Başarı hikayeleri",
    ai: "Akıllı rehber",
    membership: "Abonelik",
    support: "Yardım",
    live: "Canlı yayın",
    progress: "İlerleme takibi",
    messages: "Gelen kutusu",
    profile: "Profilin",
    dashboard: "Koç paneli",
    admin: "Yönetim",
    chat: "Koç sohbeti",
    peopleSearch: "Üye arama"
  },
  ar: {
    blogs: "مقالات المدرب",
    home: "ابدأ هنا",
    coaches: "ابحث عن مدرب",
    programs: "خطط وتدريب",
    community: "مركز المجتمع",
    threads: "نقاشات",
    challenges: "تحديات جماعية",
    transformations: "قصص نجاح",
    ai: "دليل ذكي",
    membership: "اشتراك",
    support: "مساعدة",
    live: "جلسات مباشرة",
    progress: "تتبع التقدم",
    messages: "صندوق الوارد",
    profile: "ملفك",
    dashboard: "لوحة المدرب",
    admin: "إدارة",
    chat: "محادثة المدرب",
    peopleSearch: "بحث الأعضاء"
  },
  es: {
    blogs: "Artículos coach",
    home: "Empieza aquí",
    coaches: "Encuentra coach",
    programs: "Planes y training",
    community: "Hub comunidad",
    threads: "Debates abiertos",
    challenges: "Retos grupales",
    transformations: "Historias éxito",
    ai: "Guía inteligente",
    membership: "Suscripción",
    support: "Ayuda",
    live: "Sesiones en vivo",
    progress: "Tu progreso",
    messages: "Bandeja",
    profile: "Tu perfil",
    dashboard: "Panel coach",
    admin: "Administración",
    chat: "Chat coach",
    peopleSearch: "Buscar miembros"
  },
  fr: {
    blogs: "Articles coach",
    home: "Par ici",
    coaches: "Trouver coach",
    programs: "Plans training",
    community: "Hub communauté",
    threads: "Discussions",
    challenges: "Défis groupe",
    transformations: "Réussites",
    ai: "Guide futé",
    membership: "Abonnement",
    support: "Aide",
    live: "Sessions live",
    progress: "Ta progression",
    messages: "Boîte réception",
    profile: "Ton profil",
    dashboard: "Espace coach",
    admin: "Administration",
    chat: "Chat coach",
    peopleSearch: "Chercher membres"
  }
};

const homePageSectionCopy: Record<Locale, HomePageSectionCopy> = {
  en: {
    blogsTitle: "Latest from the blog",
    blogsSubtitle: "Coach-written posts—read more in Community.",
    blogsViewAll: "View all blogs"
  },
  tr: {
    blogsTitle: "Blogdan son yazılar",
    blogsSubtitle: "Koç yazıları—devamı Toplulukta.",
    blogsViewAll: "Tüm bloglar"
  },
  ar: {
    blogsTitle: "أحدث التدوينات",
    blogsSubtitle: "منشورات المدرب—المزيد في المجتمع.",
    blogsViewAll: "كل المدونات"
  },
  es: {
    blogsTitle: "Últimas entradas",
    blogsSubtitle: "Posts del coach—más en Comunidad.",
    blogsViewAll: "Ver todos los blogs"
  },
  fr: {
    blogsTitle: "Derniers articles",
    blogsSubtitle: "Posts coach—suite dans Communauté.",
    blogsViewAll: "Tous les blogs"
  }
};

const navChromeCopy: Record<Locale, NavChromeCopy> = {
  en: {
    menu: "Menu",
    navigation: "Navigation",
    close: "Close",
    closeSidebarOverlay: "Close sidebar overlay",
    explore: "Explore",
    community: "Community",
    features: "Features",
    account: "Account",
    threads: "Threads",
    blogs: "Blogs",
    loginLabel: "Log in",
    joinLabel: "Join",
    aiLabel: "TJFIT AI"
  },
  tr: {
    menu: "Menu",
    navigation: "Gezinme",
    close: "Kapat",
    closeSidebarOverlay: "Yan menuyu kapat",
    explore: "Kesfet",
    community: "Topluluk",
    features: "Ozellikler",
    account: "Hesap",
    threads: "Threadler",
    blogs: "Bloglar",
    loginLabel: "Giris yap",
    joinLabel: "Katil",
    aiLabel: "TJFIT AI"
  },
  ar: {
    menu: "القائمة",
    navigation: "التنقل",
    close: "اغلاق",
    closeSidebarOverlay: "اغلاق الشريط الجانبي",
    explore: "استكشاف",
    community: "المجتمع",
    features: "الميزات",
    account: "الحساب",
    threads: "المناقشات",
    blogs: "المدونات",
    loginLabel: "تسجيل الدخول",
    joinLabel: "انضم",
    aiLabel: "TJFIT AI"
  },
  es: {
    menu: "Menu",
    navigation: "Navegacion",
    close: "Cerrar",
    closeSidebarOverlay: "Cerrar barra lateral",
    explore: "Explorar",
    community: "Comunidad",
    features: "Funciones",
    account: "Cuenta",
    threads: "Hilos",
    blogs: "Blogs",
    loginLabel: "Iniciar sesion",
    joinLabel: "Unirse",
    aiLabel: "TJFIT AI"
  },
  fr: {
    menu: "Menu",
    navigation: "Navigation",
    close: "Fermer",
    closeSidebarOverlay: "Fermer la barre laterale",
    explore: "Explorer",
    community: "Communaute",
    features: "Fonctionnalites",
    account: "Compte",
    threads: "Discussions",
    blogs: "Blogs",
    loginLabel: "Connexion",
    joinLabel: "Rejoindre",
    aiLabel: "TJFIT AI"
  }
};

const adminCoachCopy: Record<Locale, AdminCoachCopy> = {
  en: {
    title: "Coach authorization",
    subtitle: "Enter email and password to create a coach account. They can log in and access the coach dashboard.",
    emailPlaceholder: "Coach email",
    passwordPlaceholder: "Password (min 6 characters)",
    authorize: "Authorize as coach",
    authorizing: "Authorizing...",
    listTitle: "Authorized coaches",
    noCoaches: "No coaches yet.",
    genericError: "Something went wrong"
  },
  tr: {
    title: "Koç yetkilendirme",
    subtitle: "Bir koç hesabi olusturmak icin e-posta ve sifre gir. Giris yapip koç paneline erisebilirler.",
    emailPlaceholder: "Koç e-postasi",
    passwordPlaceholder: "Sifre (en az 6 karakter)",
    authorize: "Koç olarak yetkilendir",
    authorizing: "Yetkilendiriliyor...",
    listTitle: "Yetkili koçlar",
    noCoaches: "Henuz koç yok.",
    genericError: "Bir seyler ters gitti"
  },
  ar: {
    title: "تفويض المدرب",
    subtitle: "ادخل البريد وكلمة المرور لانشاء حساب مدرب. يمكنه تسجيل الدخول والوصول الى لوحة المدرب.",
    emailPlaceholder: "بريد المدرب",
    passwordPlaceholder: "كلمة المرور (6 احرف على الاقل)",
    authorize: "تفويض كمدرب",
    authorizing: "جار التفويض...",
    listTitle: "المدربون المفوضون",
    noCoaches: "لا يوجد مدربون بعد.",
    genericError: "حدث خطأ ما"
  },
  es: {
    title: "Autorizacion de coach",
    subtitle: "Introduce correo y contrasena para crear una cuenta de coach. Podra iniciar sesion y entrar al panel.",
    emailPlaceholder: "Correo del coach",
    passwordPlaceholder: "Contrasena (min 6 caracteres)",
    authorize: "Autorizar como coach",
    authorizing: "Autorizando...",
    listTitle: "Coaches autorizados",
    noCoaches: "Aun no hay coaches.",
    genericError: "Algo salio mal"
  },
  fr: {
    title: "Autorisation coach",
    subtitle: "Entrez l'email et le mot de passe pour creer un compte coach. Il pourra se connecter et acceder au tableau coach.",
    emailPlaceholder: "Email du coach",
    passwordPlaceholder: "Mot de passe (6 caracteres min)",
    authorize: "Autoriser comme coach",
    authorizing: "Autorisation...",
    listTitle: "Coachs autorises",
    noCoaches: "Aucun coach pour le moment.",
    genericError: "Un probleme est survenu"
  }
};

export function getAuthCopy(locale: Locale) {
  return authCopy[locale];
}

export function getGuestPopupCopy(locale: Locale) {
  return guestPopupCopy[locale];
}

export function getCommunityCopy(locale: Locale) {
  return communityCopy[locale];
}

export function getFooterCopy(locale: Locale) {
  return footerCopy[locale];
}

export function getNavChromeCopy(locale: Locale) {
  return navChromeCopy[locale];
}

export function getNavMenuSummaries(locale: Locale) {
  return navMenuSummaries[locale];
}

export function getHomePageSectionCopy(locale: Locale) {
  return homePageSectionCopy[locale];
}

export function getAdminCoachCopy(locale: Locale) {
  return adminCoachCopy[locale];
}
