import type { Locale } from "@/lib/i18n";

export type ShellNavItem = {
  id: string;
  href: (base: string) => string;
  adminOnly?: boolean;
  coachOnly?: boolean;
  authOnly?: boolean;
};

export type ShellNavGroupDef = { items: ShellNavItem[] };

/** Group titles index-aligned with GROUP_DEFS */
const GROUP_TITLES: Record<Locale, [string, string, string, string]> = {
  en: ["Train", "You", "Community", "Support"],
  tr: ["Antrenman", "Sen", "Topluluk", "Destek"],
  ar: ["تدريب", "أنت", "المجتمع", "الدعم"],
  es: ["Entrenar", "Tú", "Comunidad", "Soporte"],
  fr: ["Entraînement", "Toi", "Communauté", "Support"]
};

const LABELS: Record<
  Locale,
  Record<
    string,
    string
  >
> = {
  en: {
    programs: "Programs",
    diets: "Diets",
    coaches: "Coaches",
    calculator: "Calculator",
    equipment: "Equipment",
    uploadProgram: "Upload program",
    dashboard: "Dashboard",
    progress: "Progress",
    messages: "Messages",
    profile: "Profile",
    settings: "Settings",
    coins: "Coins",
    community: "Community",
    challenges: "Challenges",
    leaderboard: "Leaderboard",
    live: "Live",
    feed: "Feed",
    blog: "Blog",
    transformations: "Transformations",
    support: "Support",
    feedback: "Feedback",
    press: "Press & media",
    legal: "Legal",
    admin: "Admin",
    coachDashboard: "Coach dashboard",
    commandKicker: "Command center",
    commandTitle: "Move through TJFit without losing momentum.",
    searchHint: "Programs, TJAI, messages, coaches",
    ready: "Ready"
  },
  tr: {
    programs: "Programlar",
    diets: "Diyetler",
    coaches: "Koçlar",
    calculator: "Hesaplayıcı",
    equipment: "Ekipman",
    uploadProgram: "Program yükle",
    dashboard: "Panel",
    progress: "İlerleme",
    messages: "Mesajlar",
    profile: "Profil",
    settings: "Ayarlar",
    coins: "Coinler",
    community: "Topluluk",
    challenges: "Meydan okumalar",
    leaderboard: "Sıralama",
    live: "Canlı",
    feed: "Akış",
    blog: "Blog",
    transformations: "Dönüşümler",
    support: "Destek",
    feedback: "Geri bildirim",
    press: "Basın",
    legal: "Yasal",
    admin: "Yönetici",
    coachDashboard: "Koç paneli",
    commandKicker: "Komuta merkezi",
    commandTitle: "Momentum kaybetmeden TJFit’te ilerle.",
    searchHint: "Programlar, TJAI, mesajlar, koçlar",
    ready: "Hazır"
  },
  ar: {
    programs: "البرامج",
    diets: "الأنظمة الغذائية",
    coaches: "المدربون",
    calculator: "الحاسبة",
    equipment: "المعدات",
    uploadProgram: "رفع برنامج",
    dashboard: "لوحة التحكم",
    progress: "التقدم",
    messages: "الرسائل",
    profile: "الملف",
    settings: "الإعدادات",
    coins: "العملات",
    community: "المجتمع",
    challenges: "التحديات",
    leaderboard: "المتصدرون",
    live: "مباشر",
    feed: "الخلاصة",
    blog: "المدونة",
    transformations: "التحولات",
    support: "الدعم",
    feedback: "ملاحظات",
    press: "الصحافة",
    legal: "قانوني",
    admin: "مسؤول",
    coachDashboard: "لوحة المدرب",
    commandKicker: "مركز القيادة",
    commandTitle: "تنقّل في TJFit دون فقدان الزخم.",
    searchHint: "برامج، TJAI، رسائل، مدربون",
    ready: "جاهز"
  },
  es: {
    programs: "Programas",
    diets: "Dietas",
    coaches: "Coaches",
    calculator: "Calculadora",
    equipment: "Equipamiento",
    uploadProgram: "Subir programa",
    dashboard: "Panel",
    progress: "Progreso",
    messages: "Mensajes",
    profile: "Perfil",
    settings: "Ajustes",
    coins: "Monedas",
    community: "Comunidad",
    challenges: "Retos",
    leaderboard: "Clasificación",
    live: "En vivo",
    feed: "Feed",
    blog: "Blog",
    transformations: "Transformaciones",
    support: "Soporte",
    feedback: "Feedback",
    press: "Prensa",
    legal: "Legal",
    admin: "Admin",
    coachDashboard: "Panel coach",
    commandKicker: "Centro de comando",
    commandTitle: "Muévete por TJFit sin perder el ritmo.",
    searchHint: "Programas, TJAI, mensajes, coaches",
    ready: "Listo"
  },
  fr: {
    programs: "Programmes",
    diets: "Régimes",
    coaches: "Coachs",
    calculator: "Calculateur",
    equipment: "Équipement",
    uploadProgram: "Importer un programme",
    dashboard: "Tableau de bord",
    progress: "Progrès",
    messages: "Messages",
    profile: "Profil",
    settings: "Réglages",
    coins: "Jetons",
    community: "Communauté",
    challenges: "Défis",
    leaderboard: "Classement",
    live: "Direct",
    feed: "Fil",
    blog: "Blog",
    transformations: "Transformations",
    support: "Support",
    feedback: "Retours",
    press: "Presse",
    legal: "Juridique",
    admin: "Admin",
    coachDashboard: "Espace coach",
    commandKicker: "Centre de commande",
    commandTitle: "Parcourez TJFit sans perdre le rythme.",
    searchHint: "Programmes, TJAI, messages, coachs",
    ready: "Prêt"
  }
};

const G: ShellNavGroupDef[] = [
  {
    items: [
      { id: "programs", href: (b) => `${b}/programs` },
      { id: "diets", href: (b) => `${b}/diets` },
      { id: "coaches", href: (b) => `${b}/coaches` },
      { id: "calculator", href: (b) => `${b}/calculator` },
      { id: "equipment", href: (b) => `${b}/store` },
      { id: "uploadProgram", href: (b) => `${b}/programs/upload`, coachOnly: true }
    ]
  },
  {
    items: [
      { id: "dashboard", href: (b) => `${b}/dashboard`, authOnly: true },
      { id: "progress", href: (b) => `${b}/progress`, authOnly: true },
      { id: "messages", href: (b) => `${b}/messages`, authOnly: true },
      { id: "profile", href: (b) => `${b}/profile/edit`, authOnly: true },
      { id: "settings", href: (b) => `${b}/settings`, authOnly: true },
      { id: "coins", href: (b) => `${b}/coins`, authOnly: true }
    ]
  },
  {
    items: [
      { id: "community", href: (b) => `${b}/community` },
      { id: "challenges", href: (b) => `${b}/challenges` },
      { id: "leaderboard", href: (b) => `${b}/leaderboard` },
      { id: "live", href: (b) => `${b}/live` },
      { id: "feed", href: (b) => `${b}/feed` },
      { id: "blog", href: (b) => `${b}/blog` },
      { id: "transformations", href: (b) => `${b}/transformations` }
    ]
  },
  {
    items: [
      { id: "support", href: (b) => `${b}/support` },
      { id: "feedback", href: (b) => `${b}/feedback` },
      { id: "press", href: (b) => `${b}/press` },
      { id: "legal", href: (b) => `${b}/legal` },
      { id: "admin", href: (b) => `${b}/admin`, adminOnly: true },
      { id: "coachDashboard", href: (b) => `${b}/coach-dashboard`, coachOnly: true }
    ]
  }
];

export type BuiltNavGroup = { title: string; items: { label: string; href: string; adminOnly?: boolean; coachOnly?: boolean; authOnly?: boolean }[] };

/**
 * @param labelLocale locale used for translated labels (matches copy dictionary)
 * @param hrefLocale first URL segment for links (routing locale)
 */
export function buildShellOverlayNav(labelLocale: Locale, hrefLocale: string): { groups: BuiltNavGroup[]; command: { kicker: string; title: string; hint: string; ready: string } } {
  const base = `/${hrefLocale}`;
  const L = LABELS[labelLocale] ?? LABELS.en;
  const titles = GROUP_TITLES[labelLocale] ?? GROUP_TITLES.en;

  const groups: BuiltNavGroup[] = G.map((def, i) => ({
    title: titles[i] ?? titles[0],
    items: def.items.map((item) => ({
      label: L[item.id] ?? item.id,
      href: item.href(base),
      adminOnly: item.adminOnly,
      coachOnly: item.coachOnly,
      authOnly: item.authOnly
    }))
  }));

  return {
    groups,
    command: {
      kicker: L.commandKicker,
      title: L.commandTitle,
      hint: L.searchHint,
      ready: L.ready
    }
  };
}
