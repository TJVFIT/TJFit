import type { Locale } from "@/lib/i18n";

const copy = {
  en: {
    emptyHeading: "You haven't started a program yet",
    emptySub: "Get your first program free — no credit card needed.",
    emptyCta: "Browse Free Programs",
    activeProgram: "Your program",
    recentActivity: "Recent activity",
    progressLink: "Open progress log",
    quietComplete: "Complete your first program to track your progress.",
    statsPrograms: "Programs",
    statsEntries: "Log entries",
    statsMilestones: "Milestones",
    loadError: "We couldn't load your dashboard. Try again.",
    retry: "Retry"
  },
  tr: {
    emptyHeading: "Henuz bir programa baslamadin",
    emptySub: "Ilk programini ucretsiz al — kredi karti gerekmez.",
    emptyCta: "Ucretsiz programlara goz at",
    activeProgram: "Programin",
    recentActivity: "Son aktivite",
    progressLink: "Ilerleme gunlugunu ac",
    quietComplete: "Ilerlemeni takip etmek icin ilk programini tamamla.",
    statsPrograms: "Programlar",
    statsEntries: "Kayitlar",
    statsMilestones: "Kilometre taslari",
    loadError: "Panel yuklenemedi. Tekrar dene.",
    retry: "Yeniden dene"
  },
  ar: {
    emptyHeading: "لم تبدأ أي برنامج بعد",
    emptySub: "احصل على أول برنامج مجانًا — دون بطاقة بنكية.",
    emptyCta: "تصفح البرامج المجانية",
    activeProgram: "برنامجك",
    recentActivity: "النشاط الأخير",
    progressLink: "فتح سجل التقدم",
    quietComplete: "أكمل أول برنامج لتتبع تقدمك.",
    statsPrograms: "البرامج",
    statsEntries: "السجلات",
    statsMilestones: "المراحل",
    loadError: "تعذر تحميل لوحة التحكم. أعد المحاولة.",
    retry: "إعادة المحاولة"
  },
  es: {
    emptyHeading: "Aun no has empezado un programa",
    emptySub: "Tu primer programa gratis — sin tarjeta.",
    emptyCta: "Ver programas gratis",
    activeProgram: "Tu programa",
    recentActivity: "Actividad reciente",
    progressLink: "Abrir registro de progreso",
    quietComplete: "Completa tu primer programa para seguir tu progreso.",
    statsPrograms: "Programas",
    statsEntries: "Registros",
    statsMilestones: "Hitos",
    loadError: "No se pudo cargar el panel. Reintenta.",
    retry: "Reintentar"
  },
  fr: {
    emptyHeading: "Vous n'avez pas encore commence de programme",
    emptySub: "Votre premier programme gratuit — sans carte bancaire.",
    emptyCta: "Parcourir les programmes gratuits",
    activeProgram: "Votre programme",
    recentActivity: "Activite recente",
    progressLink: "Ouvrir le journal de progression",
    quietComplete: "Terminez votre premier programme pour suivre vos progres.",
    statsPrograms: "Programmes",
    statsEntries: "Entrees",
    statsMilestones: "Etapes",
    loadError: "Impossible de charger le tableau de bord. Reessayez.",
    retry: "Reessayer"
  }
} as const;

export function getUserDashboardCopy(locale: Locale) {
  return copy[locale] ?? copy.en;
}
