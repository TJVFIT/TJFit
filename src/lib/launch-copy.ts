import type { Locale } from "@/lib/i18n";

export type AuthCopy = {
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
  forgotPassword: string;
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
  chooseUsernameFirst: string;
  chooseGoalFirst: string;
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
  forgotPasswordLink: string;
  invalidCredentials: string;
  emailNotConfirmed: string;
  signupEmailRegistered: string;
  /** Use {current} and {total} placeholders. */
  signupStepProgress: string;
  signupBack: string;
  signupContinue: string;
  signupFinish: string;
  signupFreeToJoin: string;
  signupErrorStep1: string;
  signupErrorUsername: string;
  signupErrorGoal: string;
  signupChooseUsernameError: string;
  signupCheckingUsername: string;
  signupUsernameOk: string;
  signupUsernameTaken: string;
  signupUsernameInvalid: string;
  signupUsernameHint: string;
  signupFindYouHint: string;
  emailInvalid: string;
  avatarFileLabel: string;
  skipForNow: string;
  signupAvatarLater: string;
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
    people: string;
    groups: string;
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
  tagline: string;
  productTitle: string;
  companyTitle: string;
  supportTitle: string;
  startFree: string;
  findCoach: string;
  programs: string;
  diets: string;
  legalHub: string;
  faq: string;
  terms: string;
  privacy: string;
  refundPolicy: string;
  contact: string;
  becomeCoach: string;
  community: string;
  companyComingSoon: string;
  press: string;
};

type NavChromeCopy = {
  /** Skip to main content (accessibility) */
  skipToContent: string;
  menu: string;
  navigation: string;
  language: string;
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
  startFreeLabel: string;
  legalCenterLabel: string;
  /** Primary nav overflow: Community, Subscription, Legal */
  moreLabel: string;
};

/** Short blurbs (2–3 words) for sidebar rows; must stay tiny for layout. */
export type NavMenuSummaries = {
  blogs: string;
  home: string;
  coaches: string;
  programs: string;
  diets: string;
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
  startFree: string;
  legalCenter: string;
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
    loginBadge: "Sign in",
    loginTitle: "Welcome back",
    loginSubtitle: "Pick up where you left off.",
    adminLoginBadge: "Admin",
    adminLoginTitle: "Admin sign-in",
    adminLoginSubtitle: "Use your admin username and password.",
    adminUsernameRequired: "Enter your admin username.",
    loginFailed: "Couldn’t sign you in. Try again.",
    authNotConfigured: "Sign-in isn’t set up on this environment.",
    sessionCheckFailed: "We couldn’t verify your session. Check your connection and refresh.",
    emailRequired: "Add your email.",
    passwordRequired: "Add your password.",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    passwordMinPlaceholder: "Password (8+ characters)",
    usernamePlaceholder: "Username or email",
    signingIn: "Signing in…",
    loginButton: "Sign in",
    forgotPassword: "Forgot password?",
    loginAsAdminButton: "Continue as admin",
    useEmailLogin: "Use email sign-in",
    switchToAdminLogin: "Admin sign-in",
    newHere: "New here?",
    createAccount: "Create account",
    signupBadge: "Join",
    signupTitle: "Join TJFit",
    signupSubtitle: "Book coaching, buy programs, track progress, and message your coach — in one place.",
    passwordTooShort: "Use at least 8 characters.",
    passwordsDoNotMatch: "Passwords don’t match.",
    acceptTermsRequired: "Accept Terms, Privacy, and Billing to continue.",
    chooseUsernameFirst: "Choose an available username before continuing.",
    chooseGoalFirst: "Please select your fitness goal.",
    signupFailed: "We couldn’t create your account.",
    signupSuccess: "You’re in. Verify your email, then sign in.",
    confirmPasswordPlaceholder: "Confirm password",
    createAccountButton: "Create account",
    creatingAccount: "Creating account…",
    alreadyHaveAccount: "Already a member?",
    logIn: "Sign in",
    agreePrefix: "I agree to the",
    termsLink: "Terms of Service",
    privacyLink: "Privacy Policy",
    billingSuffix: "billing terms.",
    forgotPasswordLink: "Forgot password?",
    invalidCredentials: "That email or password doesn’t match our records.",
    emailNotConfirmed: "Confirm your email first — check your inbox for the verification link.",
    signupEmailRegistered: "This email is already registered. Sign in instead.",
    signupStepProgress: "Step {current} of {total}",
    signupBack: "Back",
    signupContinue: "Continue",
    signupFinish: "Finish setup",
    signupFreeToJoin: "Free to join. No credit card required.",
    signupErrorStep1: "Please complete the fields above correctly.",
    signupErrorUsername: "Please choose an available username.",
    signupErrorGoal: "Please select your fitness goal.",
    signupChooseUsernameError: "Choose an available username before continuing.",
    signupCheckingUsername: "Checking username…",
    signupUsernameOk: "Available.",
    signupUsernameTaken: "Username taken. Try another.",
    signupUsernameInvalid: "3–20 characters. Letters, numbers, and underscore only.",
    signupUsernameHint: "3–20 characters. Letters, numbers, underscore only.",
    signupFindYouHint: "This is how others find and message you.",
    emailInvalid: "Enter a valid email address.",
    avatarFileLabel: "Upload profile photo",
    skipForNow: "Skip for now",
    signupAvatarLater: "You can always add a photo later in your profile."
  },
  tr: {
    loginBadge: "Giriş",
    loginTitle: "Tekrar hoş geldin",
    loginSubtitle: "Kaldığın yerden devam et.",
    adminLoginBadge: "Yönetici",
    adminLoginTitle: "Yönetici girişi",
    adminLoginSubtitle: "Yönetici kullanıcı adı ve şifrenle gir.",
    adminUsernameRequired: "Yönetici kullanıcı adını yaz.",
    loginFailed: "Giriş olmadı. Bir daha dene.",
    authNotConfigured: "Bu ortamda giriş henüz ayarlı değil.",
    sessionCheckFailed: "Oturum doğrulanamadı. Bağlantını kontrol et, sayfayı yenile.",
    emailRequired: "E-postanı yaz.",
    passwordRequired: "Şifreni yaz.",
    emailPlaceholder: "E-posta",
    passwordPlaceholder: "Şifre",
    passwordMinPlaceholder: "Şifre (en az 8 karakter)",
    usernamePlaceholder: "Kullanıcı adı veya e-posta",
    signingIn: "Giriş yapılıyor…",
    loginButton: "Giriş yap",
    forgotPassword: "Şifreni mi unuttun?",
    loginAsAdminButton: "Yönetici olarak devam et",
    useEmailLogin: "E-posta ile giriş",
    switchToAdminLogin: "Yönetici girişi",
    newHere: "Yeni misin?",
    createAccount: "Hesap aç",
    signupBadge: "Katıl",
    signupTitle: "TJFit’e katıl",
    signupSubtitle: "Koçluk al, program satın al, ilerlemeni takip et, koçunla yazış — tek yerde.",
    passwordTooShort: "En az 8 karakter kullan.",
    passwordsDoNotMatch: "Şifreler uyuşmuyor.",
    acceptTermsRequired: "Devam etmek için Şartlar, Gizlilik ve Faturalama metinlerini onayla.",
    chooseUsernameFirst: "Devam etmek için uygun bir kullanıcı adı seç.",
    chooseGoalFirst: "Lütfen fitness hedefini seç.",
    signupFailed: "Hesap açılamadı.",
    signupSuccess: "Tamam. E-postanı doğrula, sonra giriş yap.",
    confirmPasswordPlaceholder: "Şifreyi tekrarla",
    createAccountButton: "Hesap oluştur",
    creatingAccount: "Hesap oluşturuluyor…",
    alreadyHaveAccount: "Zaten üye misin?",
    logIn: "Giriş yap",
    agreePrefix: "Şunları kabul ediyorum:",
    termsLink: "Hizmet Şartları",
    privacyLink: "Gizlilik Politikası",
    billingSuffix: "faturalama koşulları.",
    forgotPasswordLink: "Şifreni mi unuttun?",
    invalidCredentials: "E-posta veya şifre yanlış.",
    emailNotConfirmed: "Önce e-postanı doğrula — gelen kutundaki bağlantıyı kontrol et.",
    signupEmailRegistered: "Bu e-posta zaten kayıtlı. Giriş yap.",
    signupStepProgress: "Adım {current} / {total}",
    signupBack: "Geri",
    signupContinue: "Devam",
    signupFinish: "Tamamla",
    signupFreeToJoin: "Ücretsiz katıl. Kredi kartı gerekmez.",
    signupErrorStep1: "Lütfen yukarıdaki alanları doğru doldur.",
    signupErrorUsername: "Müsait bir kullanıcı adı seç.",
    signupErrorGoal: "Bir fitness hedefi seç.",
    signupChooseUsernameError: "Devam etmek için kullanılabilir bir kullanıcı adı seç.",
    signupCheckingUsername: "Kullanıcı adı kontrol ediliyor…",
    signupUsernameOk: "Uygun.",
    signupUsernameTaken: "Bu kullanıcı adı alınmış. Başka dene.",
    signupUsernameInvalid: "3–20 karakter. Sadece harf, rakam ve alt çizgi.",
    signupUsernameHint: "3–20 karakter. Harf, rakam, alt çizgi.",
    signupFindYouHint: "Böyle bulunur ve mesaj atılır.",
    emailInvalid: "Geçerli bir e-posta gir.",
    avatarFileLabel: "Profil fotoğrafı yükle",
    skipForNow: "Şimdilik geç",
    signupAvatarLater: "Fotoğrafı daha sonra profilinden ekleyebilirsin."
  },
  ar: {
    loginBadge: "دخول",
    loginTitle: "مرحباً بعودتك",
    loginSubtitle: "أكمل من حيث توقفت.",
    adminLoginBadge: "مسؤول",
    adminLoginTitle: "دخول المسؤول",
    adminLoginSubtitle: "استخدم اسم المستخدم وكلمة مرور المسؤول.",
    adminUsernameRequired: "أدخل اسم مستخدم المسؤول.",
    loginFailed: "تعذّر الدخول. حاول مرة أخرى.",
    authNotConfigured: "تسجيل الدخول غير مهيأ هنا.",
    sessionCheckFailed: "لم نستطع التحقق من جلستك. تحقق من الاتصال وحدّث الصفحة.",
    emailRequired: "أدخل بريدك.",
    passwordRequired: "أدخل كلمة المرور.",
    emailPlaceholder: "البريد الإلكتروني",
    passwordPlaceholder: "كلمة المرور",
    passwordMinPlaceholder: "كلمة المرور (٨ أحرف على الأقل)",
    usernamePlaceholder: "اسم المستخدم أو البريد",
    signingIn: "جارٍ الدخول…",
    loginButton: "تسجيل الدخول",
    forgotPassword: "هل نسيت كلمة المرور؟",
    loginAsAdminButton: "متابعة كمسؤول",
    useEmailLogin: "الدخول بالبريد",
    switchToAdminLogin: "دخول المسؤول",
    newHere: "جديد هنا؟",
    createAccount: "إنشاء حساب",
    signupBadge: "انضم",
    signupTitle: "انضم إلى TJFit",
    signupSubtitle: "احجز جلسات، اشترِ برامج، تابع تقدمك، و راسل مدربك — في مكان واحد.",
    passwordTooShort: "٨ أحرف على الأقل.",
    passwordsDoNotMatch: "كلمتا المرور غير متطابقتين.",
    acceptTermsRequired: "وافِق على الشروط والخصوصية والفوترة للمتابعة.",
    chooseUsernameFirst: "اختر اسم مستخدم متاحاً قبل المتابعة.",
    chooseGoalFirst: "يُرجى اختيار هدفك الرياضي.",
    signupFailed: "لم نتمكن من إنشاء الحساب.",
    signupSuccess: "تم. أكّد بريدك، ثم سجّل الدخول.",
    confirmPasswordPlaceholder: "تأكيد كلمة المرور",
    createAccountButton: "إنشاء حساب",
    creatingAccount: "جارٍ إنشاء الحساب…",
    alreadyHaveAccount: "لديك حساب؟",
    logIn: "تسجيل الدخول",
    agreePrefix: "أوافق على",
    termsLink: "شروط الخدمة",
    privacyLink: "سياسة الخصوصية",
    billingSuffix: "وشروط الفوترة.",
    forgotPasswordLink: "نسيت كلمة المرور؟",
    invalidCredentials: "البريد أو كلمة المرور غير صحيحة.",
    emailNotConfirmed: "أكّد بريدك أولاً — تحقق من رسالة التحقق.",
    signupEmailRegistered: "هذا البريد مسجّل مسبقاً. سجّل الدخول.",
    signupStepProgress: "الخطوة {current} من {total}",
    signupBack: "رجوع",
    signupContinue: "متابعة",
    signupFinish: "إنهاء الإعداد",
    signupFreeToJoin: "مجاني. لا حاجة لبطاقة.",
    signupErrorStep1: "أكمل الحقول أعلاه بشكل صحيح.",
    signupErrorUsername: "اختر اسماً متاحاً.",
    signupErrorGoal: "اختر هدف لياقتك.",
    signupChooseUsernameError: "اختر اسماً متاحاً قبل المتابعة.",
    signupCheckingUsername: "جارٍ التحقق من الاسم…",
    signupUsernameOk: "متاح.",
    signupUsernameTaken: "الاسم مستخدم. جرّب آخر.",
    signupUsernameInvalid: "٣–٢٠ حرفاً. أحرف وأرقام وشرطة سفلية فقط.",
    signupUsernameHint: "٣–٢٠ حرفاً. أحرف وأرقام وشرطة سفلية.",
    signupFindYouHint: "بهذا يجدك الآخرون ويراسلونك.",
    emailInvalid: "أدخل بريداً صالحاً.",
    avatarFileLabel: "رفع صورة الملف",
    skipForNow: "تخطّي الآن",
    signupAvatarLater: "يمكنك إضافة صورة لاحقاً من ملفك الشخصي."
  },
  es: {
    loginBadge: "Entrar",
    loginTitle: "Bienvenido de nuevo",
    loginSubtitle: "Sigue donde lo dejaste.",
    adminLoginBadge: "Admin",
    adminLoginTitle: "Acceso administrador",
    adminLoginSubtitle: "Usuario y contraseña de administración.",
    adminUsernameRequired: "Escribe el usuario admin.",
    loginFailed: "No pudimos entrar. Inténtalo de nuevo.",
    authNotConfigured: "El acceso no está configurado aquí.",
    sessionCheckFailed: "No pudimos validar tu sesión. Revisa la conexión y actualiza.",
    emailRequired: "Añade tu correo.",
    passwordRequired: "Añade tu contraseña.",
    emailPlaceholder: "Correo electrónico",
    passwordPlaceholder: "Contraseña",
    passwordMinPlaceholder: "Contraseña (mín. 8 caracteres)",
    usernamePlaceholder: "Usuario o correo",
    signingIn: "Entrando…",
    loginButton: "Entrar",
    forgotPassword: "¿Olvidaste tu contraseña?",
    loginAsAdminButton: "Continuar como admin",
    useEmailLogin: "Entrar con correo",
    switchToAdminLogin: "Acceso admin",
    newHere: "¿Nuevo?",
    createAccount: "Crear cuenta",
    signupBadge: "Únete",
    signupTitle: "Únete a TJFit",
    signupSubtitle: "Reserva coaching, compra programas, sigue tu progreso y escribe a tu coach — todo junto.",
    passwordTooShort: "Mínimo 8 caracteres.",
    passwordsDoNotMatch: "Las contraseñas no coinciden.",
    acceptTermsRequired: "Acepta Términos, Privacidad y Facturación para continuar.",
    chooseUsernameFirst: "Elige un nombre de usuario disponible antes de continuar.",
    chooseGoalFirst: "Por favor selecciona tu objetivo de fitness.",
    signupFailed: "No pudimos crear la cuenta.",
    signupSuccess: "Listo. Confirma tu correo y entra.",
    confirmPasswordPlaceholder: "Repite la contraseña",
    createAccountButton: "Crear cuenta",
    creatingAccount: "Creando cuenta…",
    alreadyHaveAccount: "¿Ya tienes cuenta?",
    logIn: "Entrar",
    agreePrefix: "Acepto los",
    termsLink: "Términos del servicio",
    privacyLink: "Política de privacidad",
    billingSuffix: "y términos de facturación.",
    forgotPasswordLink: "¿Olvidaste tu contraseña?",
    invalidCredentials: "El correo o la contraseña no coinciden.",
    emailNotConfirmed: "Confirma tu correo primero — revisa el enlace de verificación.",
    signupEmailRegistered: "Este correo ya está registrado. Entra.",
    signupStepProgress: "Paso {current} de {total}",
    signupBack: "Atrás",
    signupContinue: "Continuar",
    signupFinish: "Finalizar",
    signupFreeToJoin: "Gratis. Sin tarjeta.",
    signupErrorStep1: "Completa los campos correctamente.",
    signupErrorUsername: "Elige un nombre de usuario disponible.",
    signupErrorGoal: "Selecciona tu objetivo.",
    signupChooseUsernameError: "Elige un nombre disponible antes de continuar.",
    signupCheckingUsername: "Comprobando nombre…",
    signupUsernameOk: "Disponible.",
    signupUsernameTaken: "Nombre ocupado. Prueba otro.",
    signupUsernameInvalid: "3–20 caracteres. Letras, números y guión bajo.",
    signupUsernameHint: "3–20 caracteres. Letras, números y guión bajo.",
    signupFindYouHint: "Así te encontrarán y escribirán.",
    emailInvalid: "Introduce un correo válido.",
    avatarFileLabel: "Subir foto de perfil",
    skipForNow: "Omitir por ahora",
    signupAvatarLater: "Siempre puedes añadir una foto después en tu perfil."
  },
  fr: {
    loginBadge: "Connexion",
    loginTitle: "Bon retour",
    loginSubtitle: "Reprenez où vous en étiez.",
    adminLoginBadge: "Admin",
    adminLoginTitle: "Connexion administrateur",
    adminLoginSubtitle: "Identifiant et mot de passe admin.",
    adminUsernameRequired: "Saisissez l’identifiant admin.",
    loginFailed: "Connexion impossible. Réessayez.",
    authNotConfigured: "La connexion n’est pas configurée ici.",
    sessionCheckFailed: "Session introuvable. Vérifiez la connexion et actualisez.",
    emailRequired: "Ajoutez votre e-mail.",
    passwordRequired: "Ajoutez votre mot de passe.",
    emailPlaceholder: "E-mail",
    passwordPlaceholder: "Mot de passe",
    passwordMinPlaceholder: "Mot de passe (8 caractères min.)",
    usernamePlaceholder: "Pseudo ou e-mail",
    signingIn: "Connexion…",
    loginButton: "Se connecter",
    forgotPassword: "Mot de passe oublié ?",
    loginAsAdminButton: "Continuer en admin",
    useEmailLogin: "Connexion par e-mail",
    switchToAdminLogin: "Connexion admin",
    newHere: "Nouveau ?",
    createAccount: "Créer un compte",
    signupBadge: "Rejoindre",
    signupTitle: "Rejoignez TJFit",
    signupSubtitle: "Réservez du coaching, achetez des programmes, suivez vos progrès, écrivez à votre coach — au même endroit.",
    passwordTooShort: "Au moins 8 caractères.",
    passwordsDoNotMatch: "Les mots de passe ne correspondent pas.",
    acceptTermsRequired: "Acceptez Conditions, Confidentialité et Facturation pour continuer.",
    chooseUsernameFirst: "Choisissez un nom d'utilisateur disponible avant de continuer.",
    chooseGoalFirst: "Veuillez sélectionner votre objectif fitness.",
    signupFailed: "Création du compte impossible.",
    signupSuccess: "C’est bon. Vérifiez votre e-mail, puis connectez-vous.",
    confirmPasswordPlaceholder: "Confirmer le mot de passe",
    createAccountButton: "Créer un compte",
    creatingAccount: "Création du compte…",
    alreadyHaveAccount: "Déjà membre ?",
    logIn: "Se connecter",
    agreePrefix: "J’accepte les",
    termsLink: "Conditions d’utilisation",
    privacyLink: "Politique de confidentialité",
    billingSuffix: "et conditions de facturation.",
    forgotPasswordLink: "Mot de passe oublié ?",
    invalidCredentials: "E-mail ou mot de passe incorrect.",
    emailNotConfirmed: "Confirmez d’abord votre e-mail — lien de vérification dans la boîte de réception.",
    signupEmailRegistered: "Cet e-mail est déjà inscrit. Connectez-vous.",
    signupStepProgress: "Étape {current} sur {total}",
    signupBack: "Retour",
    signupContinue: "Continuer",
    signupFinish: "Terminer",
    signupFreeToJoin: "Gratuit. Sans carte bancaire.",
    signupErrorStep1: "Complétez correctement les champs ci-dessus.",
    signupErrorUsername: "Choisissez un nom d’utilisateur disponible.",
    signupErrorGoal: "Sélectionnez votre objectif.",
    signupChooseUsernameError: "Choisissez un nom disponible avant de continuer.",
    signupCheckingUsername: "Vérification du nom…",
    signupUsernameOk: "Disponible.",
    signupUsernameTaken: "Nom pris. Essayez-en un autre.",
    signupUsernameInvalid: "3–20 caractères. Lettres, chiffres et underscore.",
    signupUsernameHint: "3–20 caractères. Lettres, chiffres, underscore.",
    signupFindYouHint: "Les autres vous trouvent et vous écrivent ainsi.",
    emailInvalid: "Saisissez un e-mail valide.",
    avatarFileLabel: "Téléverser une photo de profil",
    skipForNow: "Passer pour l’instant",
    signupAvatarLater: "Vous pourrez ajouter une photo plus tard dans votre profil."
  }
};

const guestPopupCopy: Record<Locale, GuestPopupCopy> = {
  en: {
    welcome: "Welcome",
    entryTitle: "Account now, or look around first?",
    entrySubtitle: "An account unlocks programs, progress, and coach messaging. You can also browse as a guest.",
    createAccount: "Create account",
    viewWebsite: "Browse as guest",
    stayUpdated: "Stay in the loop",
    marketingTitle: "Want launch perks in your inbox?",
    marketingSubtitle: "Occasional notes on new programs, features, and member-only drops — no daily spam.",
    yesSignMeUp: "Yes, keep me posted",
    noThanks: "Not now",
    emailSignup: "Email updates",
    enterEmail: "Your email",
    emailSubtitle: "We’ll only send what’s useful: launches, perks, and product news.",
    emailPlaceholder: "you@example.com",
    submitting: "Sending…",
    subscribe: "Notify me",
    skip: "Skip",
    invalidEmail: "That doesn’t look like a valid email.",
    subscribeFailed: "Couldn’t subscribe. Try again."
  },
  tr: {
    welcome: "Hoş geldin",
    entryTitle: "Önce hesap mı, yoksa bir tur mu?",
    entrySubtitle: "Hesap; programlar, ilerleme ve koçla güvenli mesajlaşmayı açar. İstersen önce gezebilirsin.",
    createAccount: "Hesap aç",
    viewWebsite: "Misafir olarak gez",
    stayUpdated: "Haberdar ol",
    marketingTitle: "Yenilikleri kutunda görmek ister misin?",
    marketingSubtitle: "Ara sıra: yeni programlar, özellikler ve üyelere özel duyurular — günlük spam yok.",
    yesSignMeUp: "Evet, haber ver",
    noThanks: "Şimdilik hayır",
    emailSignup: "E-posta ile haber",
    enterEmail: "E-postan",
    emailSubtitle: "Sadece işine yarayan şeyler: lansmanlar, fırsatlar, ürün haberleri.",
    emailPlaceholder: "ornek@email.com",
    submitting: "Gönderiliyor…",
    subscribe: "Beni bilgilendir",
    skip: "Geç",
    invalidEmail: "Geçerli bir e-posta gir.",
    subscribeFailed: "Kayıt olmadı. Tekrar dene."
  },
  ar: {
    welcome: "مرحباً",
    entryTitle: "حساب الآن أم تصفّح أولاً؟",
    entrySubtitle: "الحساب يفتح البرامج والتقدم ومراسلة المدرب بأمان. يمكنك أيضاً التصفح كزائر.",
    createAccount: "إنشاء حساب",
    viewWebsite: "تصفح كزائر",
    stayUpdated: "ابقَ على اطلاع",
    marketingTitle: "تريد أخبار الإطلاق والمزايا؟",
    marketingSubtitle: "رسائل خفيفة عن برامج جديدة وميزات وعروض للأعضاء — بلا إزعاج يومي.",
    yesSignMeUp: "نعم، أبقني مطلعاً",
    noThanks: "ليس الآن",
    emailSignup: "تنبيهات بالبريد",
    enterEmail: "بريدك",
    emailSubtitle: "نرسل فقط ما يفيد: إطلاقات، مزايا، وأخبار المنتج.",
    emailPlaceholder: "you@example.com",
    submitting: "جارٍ الإرسال…",
    subscribe: "أعلمني",
    skip: "تخطّي",
    invalidEmail: "البريد غير صالح.",
    subscribeFailed: "تعذّر الاشتراك. حاول مجدداً."
  },
  es: {
    welcome: "Bienvenido",
    entryTitle: "¿Cuenta ya o primero un vistazo?",
    entrySubtitle: "La cuenta desbloquea programas, progreso y chat con tu coach. También puedes mirar como invitado.",
    createAccount: "Crear cuenta",
    viewWebsite: "Entrar como invitado",
    stayUpdated: "Quédate al tanto",
    marketingTitle: "¿Te avisamos de novedades y perks?",
    marketingSubtitle: "Correos puntuales: programas nuevos, funciones y drops para miembros — sin spam diario.",
    yesSignMeUp: "Sí, avísame",
    noThanks: "Ahora no",
    emailSignup: "Alertas por correo",
    enterEmail: "Tu correo",
    emailSubtitle: "Solo lo útil: lanzamientos, perks y notas de producto.",
    emailPlaceholder: "tu@email.com",
    submitting: "Enviando…",
    subscribe: "Avísame",
    skip: "Omitir",
    invalidEmail: "Ese correo no parece válido.",
    subscribeFailed: "No se pudo suscribir. Reintenta."
  },
  fr: {
    welcome: "Bienvenue",
    entryTitle: "Compte maintenant ou d’abord un tour ?",
    entrySubtitle: "Le compte débloque programmes, suivi et messagerie coach. Vous pouvez aussi parcourir en invité.",
    createAccount: "Créer un compte",
    viewWebsite: "Parcourir en invité",
    stayUpdated: "Restez informé·e",
    marketingTitle: "Des nouveautés et avantages par e-mail ?",
    marketingSubtitle: "Messages légers : nouveaux programmes, fonctionnalités et offres membres — pas de spam quotidien.",
    yesSignMeUp: "Oui, tenez-moi au courant",
    noThanks: "Pas maintenant",
    emailSignup: "Alertes e-mail",
    enterEmail: "Votre e-mail",
    emailSubtitle: "Uniquement l’utile : lancements, perks, actu produit.",
    emailPlaceholder: "vous@email.com",
    submitting: "Envoi…",
    subscribe: "Me prévenir",
    skip: "Passer",
    invalidEmail: "Cet e-mail ne semble pas valide.",
    subscribeFailed: "Inscription impossible. Réessayez."
  }
};

const communityCopy: Record<Locale, CommunityCopy> = {
  en: {
    badge: "Community",
    title: "Community",
    subtitle: "Discussions, challenges, and wins — together in one calm space.",
    tabs: { threads: "Threads", challenges: "Challenges", transformations: "Transformations", blogs: "Blogs", people: "People", groups: "Groups" },
    threadsEmpty: "Conversations are warming up. Your feed will land here.",
    challengesEmpty: "No challenges live right now.",
    transformationsEmpty: "No public stories yet — check back soon.",
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
    badge: "Topluluk",
    title: "Topluluk",
    subtitle: "Sohbetler, meydan okumalar ve başarı hikâyeleri — tek sakin merkezde.",
    tabs: { threads: "Konular", challenges: "Meydan okumalar", transformations: "Dönüşümler", blogs: "Blog", people: "Kişiler", groups: "Gruplar" },
    threadsEmpty: "Sohbetler ısınıyor. Akışın burada görünecek.",
    challengesEmpty: "Şu an canlı meydan okuma yok.",
    transformationsEmpty: "Henüz paylaşılan hikâye yok — yakında tekrar bak.",
    verified: "Dogrulandi",
    unverified: "Dogrulanmadi",
    publishTitle: "Blog yazısı yayınla",
    titlePlaceholder: "Başlık",
    contentPlaceholder: "Yazını buraya…",
    publish: "Yayınla",
    publishing: "Yayınlanıyor…",
    loadingBlogs: "Bloglar yükleniyor…",
    noBlogs: "Henüz yazı yok.",
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
    tabs: { threads: "المناقشات", challenges: "التحديات", transformations: "التحولات", blogs: "المدونات", people: "الأشخاص", groups: "المجموعات" },
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
    tabs: { threads: "Hilos", challenges: "Retos", transformations: "Transformaciones", blogs: "Blogs", people: "Personas", groups: "Grupos" },
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
    tabs: { threads: "Discussions", challenges: "Defis", transformations: "Transformations", blogs: "Blogs", people: "Personnes", groups: "Groupes" },
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
    description: "Train smarter. Eat better. Transform faster.",
    tagline: "Train smarter. Eat better. Transform faster.",
    productTitle: "Product",
    companyTitle: "Company",
    supportTitle: "Support",
    startFree: "Start Free",
    findCoach: "Find a Coach",
    programs: "Programs Marketplace",
    diets: "Diets",
    legalHub: "About & Legal",
    faq: "FAQ",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    refundPolicy: "Refund Policy",
    contact: "Contact Support",
    becomeCoach: "Become a Coach",
    community: "Community",
    companyComingSoon: "(Coming Soon)",
    press: "Press & media"
  },
  tr: {
    description: "Daha akilli antrenman. Daha iyi beslenme. Daha hizli donusum.",
    tagline: "Daha akilli antrenman. Daha iyi beslenme. Daha hizli donusum.",
    productTitle: "Urun",
    companyTitle: "Sirket",
    supportTitle: "Destek",
    startFree: "Ucretsiz Basla",
    findCoach: "Koc Bul",
    programs: "Programlar",
    diets: "Diyetler",
    legalHub: "Hakkimizda ve Yasal",
    faq: "SSS",
    terms: "Kullanim sartlari",
    privacy: "Gizlilik",
    refundPolicy: "İade Politikası",
    contact: "Destek iletisim",
    becomeCoach: "Koc Ol",
    community: "Topluluk",
    companyComingSoon: "(Cok yakinda)",
    press: "Basın"
  },
  ar: {
    description: "تدرّب بذكاء. كُل أفضل. تحوّل أسرع.",
    tagline: "تدرّب بذكاء. كُل أفضل. تحوّل أسرع.",
    productTitle: "المنتج",
    companyTitle: "الشركة",
    supportTitle: "الدعم",
    startFree: "ابدأ مجاناً",
    findCoach: "ابحث عن مدرب",
    programs: "البرامج",
    diets: "الأنظمة الغذائية",
    legalHub: "حول المنصة والقانوني",
    faq: "الاسئلة الشائعة",
    terms: "شروط الخدمة",
    privacy: "سياسة الخصوصية",
    refundPolicy: "سياسة الاسترداد",
    contact: "تواصل مع الدعم",
    becomeCoach: "كن مدرباً",
    community: "المجتمع",
    companyComingSoon: "(قريباً)",
    press: "الصحافة والإعلام"
  },
  es: {
    description: "Entrena mas inteligente. Come mejor. Transforma mas rapido.",
    tagline: "Entrena mas inteligente. Come mejor. Transforma mas rapido.",
    productTitle: "Producto",
    companyTitle: "Compania",
    supportTitle: "Soporte",
    startFree: "Empieza Gratis",
    findCoach: "Encuentra Coach",
    programs: "Programas",
    diets: "Dietas",
    legalHub: "Acerca de y Legal",
    faq: "FAQ",
    terms: "Terminos del Servicio",
    privacy: "Politica de Privacidad",
    refundPolicy: "Politica de Reembolso",
    contact: "Contactar Soporte",
    becomeCoach: "Conviertete en Coach",
    community: "Comunidad",
    companyComingSoon: "(Proximamente)",
    press: "Prensa"
  },
  fr: {
    description: "Entrainez-vous plus intelligemment. Mangez mieux. Transformez-vous plus vite.",
    tagline: "Entrainez-vous plus intelligemment. Mangez mieux. Transformez-vous plus vite.",
    productTitle: "Produit",
    companyTitle: "Entreprise",
    supportTitle: "Support",
    startFree: "Commencer Gratuitement",
    findCoach: "Trouver un Coach",
    programs: "Programmes",
    diets: "Regimes",
    legalHub: "A propos et legal",
    faq: "FAQ",
    terms: "Conditions d'utilisation",
    privacy: "Politique de confidentialite",
    refundPolicy: "Politique de remboursement",
    contact: "Contacter le support",
    becomeCoach: "Devenir Coach",
    community: "Communaute",
    companyComingSoon: "(Bientot)",
    press: "Presse"
  }
};

const navMenuSummaries: Record<Locale, NavMenuSummaries> = {
  en: {
    blogs: "Coach articles",
    home: "Start here",
    coaches: "Find coaches",
    programs: "Plans & training",
    diets: "Meal systems",
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
    peopleSearch: "Member search",
    startFree: "No card required",
    legalCenter: "FAQ & policies"
  },
  tr: {
    blogs: "Koç yazıları",
    home: "Başlangıç",
    coaches: "Koçlar",
    programs: "Programlar",
    diets: "Beslenme planları",
    community: "Topluluk",
    threads: "Tartışmalar",
    challenges: "Meydan okuma",
    transformations: "Başarı hikayeleri",
    ai: "Akıllı rehber",
    membership: "Üyelik",
    support: "Yardım",
    live: "Canlı",
    progress: "İlerleme",
    messages: "Gelen kutusu",
    profile: "Profil",
    dashboard: "Koç alanı",
    admin: "Yönetim",
    chat: "Koç sohbeti",
    peopleSearch: "Üyeler",
    startFree: "Kart gerekmez",
    legalCenter: "SSS ve kurallar"
  },
  ar: {
    blogs: "مقالات",
    home: "البداية",
    coaches: "المدربون",
    programs: "البرامج",
    diets: "أنظمة وجبات",
    community: "المجتمع",
    threads: "نقاشات",
    challenges: "تحديات",
    transformations: "قصص نجاح",
    ai: "دليل ذكي",
    membership: "العضوية",
    support: "مساعدة",
    live: "مباشر",
    progress: "التقدم",
    messages: "الرسائل",
    profile: "الملف",
    dashboard: "مساحة المدرب",
    admin: "الإدارة",
    chat: "محادثة",
    peopleSearch: "بحث",
    startFree: "بدون بطاقة",
    legalCenter: "الأسئلة والسياسات"
  },
  es: {
    blogs: "Artículos coach",
    home: "Empieza aquí",
    coaches: "Encuentra coach",
    programs: "Planes y training",
    diets: "Planes de comida",
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
    peopleSearch: "Buscar miembros",
    startFree: "Sin tarjeta",
    legalCenter: "FAQ y politicas"
  },
  fr: {
    blogs: "Articles coach",
    home: "Par ici",
    coaches: "Trouver coach",
    programs: "Plans training",
    diets: "Plans repas",
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
    peopleSearch: "Chercher membres",
    startFree: "Sans carte",
    legalCenter: "FAQ et regles"
  }
};

const homePageSectionCopy: Record<Locale, HomePageSectionCopy> = {
  en: {
    blogsTitle: "Latest from the blog",
    blogsSubtitle: "Coach-written posts—read more in Community.",
    blogsViewAll: "View all blogs"
  },
  tr: {
    blogsTitle: "Blogdan son notlar",
    blogsSubtitle: "Koçların yazdıkları — devamı Topluluk’ta.",
    blogsViewAll: "Tüm yazılar"
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
    skipToContent: "Skip to main content",
    menu: "Menu",
    navigation: "Menu",
    language: "Language",
    close: "Close",
    closeSidebarOverlay: "Close menu",
    explore: "Explore",
    community: "Community",
    features: "Features",
    account: "Account",
    threads: "Threads",
    blogs: "Blogs",
    loginLabel: "Sign in",
    joinLabel: "Join",
    aiLabel: "TJFIT AI",
    startFreeLabel: "Start free",
    legalCenterLabel: "Legal & FAQ",
    moreLabel: "More"
  },
  tr: {
    skipToContent: "Ana içeriğe geç",
    menu: "Menü",
    navigation: "Gezinme",
    language: "Dil",
    close: "Kapat",
    closeSidebarOverlay: "Menüyü kapat",
    explore: "Keşfet",
    community: "Topluluk",
    features: "Özellikler",
    account: "Hesap",
    threads: "Konular",
    blogs: "Blog",
    loginLabel: "Giriş yap",
    joinLabel: "Katıl",
    aiLabel: "TJFIT AI",
    startFreeLabel: "Ucretsiz basla",
    legalCenterLabel: "Yasal ve SSS",
    moreLabel: "Daha fazla"
  },
  ar: {
    skipToContent: "تخطي إلى المحتوى الرئيسي",
    menu: "القائمة",
    navigation: "التنقل",
    language: "اللغة",
    close: "إغلاق",
    closeSidebarOverlay: "إغلاق القائمة",
    explore: "استكشاف",
    community: "المجتمع",
    features: "الميزات",
    account: "الحساب",
    threads: "نقاشات",
    blogs: "مدونة",
    loginLabel: "دخول",
    joinLabel: "انضم",
    aiLabel: "TJFIT AI",
    startFreeLabel: "ابدأ مجاناً",
    legalCenterLabel: "قانوني وأسئلة",
    moreLabel: "المزيد"
  },
  es: {
    skipToContent: "Ir al contenido principal",
    menu: "Menu",
    navigation: "Navegacion",
    language: "Idioma",
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
    aiLabel: "TJFIT AI",
    startFreeLabel: "Empezar gratis",
    legalCenterLabel: "Legal y FAQ",
    moreLabel: "Mas"
  },
  fr: {
    skipToContent: "Aller au contenu principal",
    menu: "Menu",
    navigation: "Navigation",
    language: "Langue",
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
    aiLabel: "TJFIT AI",
    startFreeLabel: "Commencer gratuit",
    legalCenterLabel: "Infos legales",
    moreLabel: "Plus"
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
