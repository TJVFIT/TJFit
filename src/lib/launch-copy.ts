import type { Locale } from "@/lib/i18n";

const navByLocale: Record<Locale, {
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
  aiLabel: string;
  loginLabel: string;
}> = {
  en: {
    menu: "Menu",
    navigation: "Navigation",
    close: "Close",
    closeSidebarOverlay: "Close navigation",
    explore: "Explore",
    community: "Community",
    features: "Features",
    account: "Account",
    threads: "Threads",
    blogs: "Coach notes",
    aiLabel: "TJAI",
    loginLabel: "Log in"
  },
  tr: {
    menu: "Menü",
    navigation: "Navigasyon",
    close: "Kapat",
    closeSidebarOverlay: "Navigasyonu kapat",
    explore: "Keşfet",
    community: "Topluluk",
    features: "Özellikler",
    account: "Hesap",
    threads: "Gönderiler",
    blogs: "Koç notları",
    aiLabel: "TJAI",
    loginLabel: "Giriş"
  },
  ar: {
    menu: "القائمة",
    navigation: "التنقل",
    close: "إغلاق",
    closeSidebarOverlay: "إغلاق التنقل",
    explore: "استكشف",
    community: "المجتمع",
    features: "الميزات",
    account: "الحساب",
    threads: "المناقشات",
    blogs: "ملاحظات المدرب",
    aiLabel: "TJAI",
    loginLabel: "تسجيل الدخول"
  },
  es: {
    menu: "Menú",
    navigation: "Navegación",
    close: "Cerrar",
    closeSidebarOverlay: "Cerrar navegación",
    explore: "Explorar",
    community: "Comunidad",
    features: "Funciones",
    account: "Cuenta",
    threads: "Hilos",
    blogs: "Notas del coach",
    aiLabel: "TJAI",
    loginLabel: "Entrar"
  },
  fr: {
    menu: "Menu",
    navigation: "Navigation",
    close: "Fermer",
    closeSidebarOverlay: "Fermer la navigation",
    explore: "Explorer",
    community: "Communauté",
    features: "Fonctions",
    account: "Compte",
    threads: "Discussions",
    blogs: "Notes des coachs",
    aiLabel: "TJAI",
    loginLabel: "Connexion"
  }
};

export function getNavChromeCopy(locale: Locale) {
  return navByLocale[locale];
}

const footer = {
  description: "Training systems, practical nutrition and focused coaching built around measurable progress.",
  platformTitle: "Platform",
  operationsTitle: "TJFit",
  coaches: "Coaches",
  programs: "Programs",
  ai: "TJAI",
  membership: "Membership",
  terms: "Terms",
  privacy: "Privacy",
  refund: "Refund policy",
  support: "Support",
  coachDashboard: "Coach dashboard",
  adminPanel: "Admin panel",
  checkout: "Checkout"
};

export function getFooterCopy(locale: Locale) {
  void locale;
  return footer;
}

const guestPopup = {
  welcome: "Welcome to TJFit",
  entryTitle: "Build a plan you can keep.",
  entrySubtitle: "Create an account for personalized training, or explore the platform first.",
  createAccount: "Create account",
  viewWebsite: "Explore first",
  stayUpdated: "Stay in the loop",
  marketingTitle: "Get useful training updates.",
  marketingSubtitle: "Product releases, new programs and practical coaching notes. No noise.",
  yesSignMeUp: "Keep me updated",
  noThanks: "Not now",
  emailSignup: "Newsletter",
  enterEmail: "Where should we send updates?",
  emailSubtitle: "You can unsubscribe at any time.",
  emailPlaceholder: "you@example.com",
  invalidEmail: "Enter a valid email address.",
  subscribeFailed: "Subscription could not be saved. Try again.",
  submitting: "Saving...",
  subscribe: "Subscribe",
  skip: "Skip",
  emailSignupTitle: "Email signup"
};

export function getGuestPopupCopy(locale: Locale) {
  void locale;
  return guestPopup;
}

const community = {
  badge: "TJFit community",
  title: "Progress is easier to keep when it is shared.",
  subtitle: "Follow coach notes, join challenges and learn from real training updates.",
  tabs: {
    threads: "Threads",
    challenges: "Challenges",
    transformations: "Transformations",
    blogs: "Coach notes"
  },
  threadsEmpty: "No community threads yet.",
  challengesEmpty: "No active challenges right now.",
  transformationsEmpty: "No verified transformations have been published.",
  verified: "Verified transformation",
  unverified: "Verification pending",
  blogLoadFailed: "Coach notes could not be loaded.",
  publishTitle: "Publish a coach note",
  titlePlaceholder: "Title",
  contentPlaceholder: "Write a useful training note...",
  publish: "Publish",
  publishing: "Publishing...",
  publishFailed: "The note could not be published.",
  publishSuccess: "Coach note published.",
  delete: "Delete",
  deleteFailed: "The note could not be deleted.",
  deleteSuccess: "Coach note deleted.",
  pin: "Pin",
  unpin: "Unpin",
  pinned: "Pinned",
  pinFailed: "The pin state could not be changed.",
  pinSuccess: "Coach note pinned.",
  unpinSuccess: "Coach note unpinned.",
  noBlogs: "No coach notes have been published.",
  loadingBlogs: "Loading coach notes...",
  translate: "Translate",
  translating: "Translating...",
  translationFailed: "Translation could not be completed.",
  showOriginal: "Show original",
  turkish: "Turkish",
  arabic: "Arabic",
  spanish: "Spanish",
  french: "French",
  working: "Working..."
};

export function getCommunityCopy(locale: Locale) {
  void locale;
  return community;
}

const auth = {
  authNotConfigured: "Authentication is not configured in this environment.",
  emailPlaceholder: "Email address",
  passwordPlaceholder: "Password",
  passwordMinPlaceholder: "Password (at least 8 characters)",
  confirmPasswordPlaceholder: "Confirm password",
  loginBadge: "Member access",
  loginTitle: "Welcome back.",
  loginSubtitle: "Continue your program, coaching and progress.",
  loginButton: "Log in",
  signingIn: "Signing in...",
  loginFailed: "Login failed. Check your details.",
  emailRequired: "Enter your email address.",
  passwordRequired: "Enter your password.",
  newHere: "New to TJFit?",
  createAccount: "Create account",
  switchToAdminLogin: "Admin access",
  useEmailLogin: "Use member login",
  adminLoginBadge: "Secure operations",
  adminLoginTitle: "Admin access",
  adminLoginSubtitle: "Authorized TJFit operators only.",
  adminUsernameRequired: "Enter the admin username.",
  usernamePlaceholder: "Admin username",
  loginAsAdminButton: "Log in as admin",
  signupBadge: "Start with a plan",
  signupTitle: "Create your TJFit account.",
  signupSubtitle: "Save programs, earn TJFit coins and build measurable progress.",
  createAccountButton: "Create account",
  creatingAccount: "Creating account...",
  signupFailed: "Your account could not be created.",
  signupSuccess: "Account created. Check your email to confirm access.",
  passwordTooShort: "Use at least 8 characters.",
  passwordsDoNotMatch: "Passwords do not match.",
  acceptTermsRequired: "Accept the terms and privacy policy to continue.",
  agreePrefix: "I agree to the",
  termsLink: "terms",
  privacyLink: "privacy policy",
  billingSuffix: "and understand that PayTR processes payments.",
  alreadyHaveAccount: "Already have an account?",
  logIn: "Log in"
};

export function getAuthCopy(locale: Locale) {
  void locale;
  return auth;
}
