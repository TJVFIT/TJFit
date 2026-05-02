"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChevronRight, Menu, Search, X } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Logo } from "@/components/ui/Logo";
import type { Locale } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; adminOnly?: boolean; coachOnly?: boolean; authOnly?: boolean };
type NavGroup = { title: string; items: NavItem[] };

const GROUP_TITLES: Record<Locale, string[]> = {
  en: ["Train", "You", "Community", "Support"],
  tr: ["Antrenman", "Sen", "Topluluk", "Destek"],
  ar: ["تدريب", "أنت", "المجتمع", "الدعم"],
  es: ["Entrenar", "Tú", "Comunidad", "Soporte"],
  fr: ["Entraînement", "Toi", "Communauté", "Support"]
};

const OPEN_LABEL: Record<Locale, string> = {
  en: "Open menu",
  tr: "Menüyü aç",
  ar: "فتح القائمة",
  es: "Abrir menú",
  fr: "Ouvrir le menu"
};

const CLOSE_LABEL: Record<Locale, string> = {
  en: "Close menu",
  tr: "Menüyü kapat",
  ar: "إغلاق القائمة",
  es: "Cerrar menú",
  fr: "Fermer le menu"
};

const SIGN_OUT_LABEL: Record<Locale, string> = {
  en: "Sign out",
  tr: "Çıkış",
  ar: "خروج",
  es: "Salir",
  fr: "Déconnexion"
};

const SEARCH_LABEL: Record<Locale, string> = {
  en: "Programs, TJAI, messages, coaches",
  tr: "Programlar, TJAI, mesajlar, koclar",
  ar: "البرامج، TJAI، الرسائل، المدربون",
  es: "Programas, TJAI, mensajes, coaches",
  fr: "Programmes, TJAI, messages, coachs"
};

const NAV_LABELS: Record<Locale, Record<string, string>> = {
  en: {},
  tr: {
    Programs: "Programlar",
    Diets: "Diyetler",
    Coaches: "Koclar",
    Calculator: "Hesaplayici",
    Equipment: "Ekipman",
    "Upload program": "Program yukle",
    Dashboard: "Panel",
    Progress: "Progress",
    Messages: "Mesajlar",
    Profile: "Profil",
    Settings: "Ayarlar",
    Coins: "Coinler",
    Community: "Topluluk",
    Challenges: "Meydan okumalar",
    Leaderboard: "Liderlik tablosu",
    Live: "Canli",
    Feed: "Akis",
    Blog: "Blog",
    Transformations: "Donusumler",
    Support: "Destek",
    Feedback: "Geri bildirim",
    Press: "Basin",
    Legal: "Yasal",
    Admin: "Admin",
    "Coach dashboard": "Koc paneli"
  },
  ar: {
    Programs: "البرامج",
    Diets: "الأنظمة الغذائية",
    Coaches: "المدربون",
    Calculator: "الحاسبة",
    Equipment: "المعدات",
    "Upload program": "رفع برنامج",
    Dashboard: "لوحة التحكم",
    Progress: "التقدم",
    Messages: "الرسائل",
    Profile: "الملف الشخصي",
    Settings: "الإعدادات",
    Coins: "النقاط",
    Community: "المجتمع",
    Challenges: "التحديات",
    Leaderboard: "لوحة الصدارة",
    Live: "مباشر",
    Feed: "الخلاصة",
    Blog: "المدونة",
    Transformations: "التحولات",
    Support: "الدعم",
    Feedback: "الملاحظات",
    Press: "الصحافة",
    Legal: "القانوني",
    Admin: "المشرف",
    "Coach dashboard": "لوحة المدرب"
  },
  es: {
    Programs: "Programas",
    Diets: "Dietas",
    Coaches: "Coaches",
    Calculator: "Calculadora",
    Equipment: "Equipo",
    "Upload program": "Subir programa",
    Dashboard: "Panel",
    Progress: "Progreso",
    Messages: "Mensajes",
    Profile: "Perfil",
    Settings: "Ajustes",
    Coins: "Monedas",
    Community: "Comunidad",
    Challenges: "Retos",
    Leaderboard: "Clasificacion",
    Live: "Directo",
    Feed: "Feed",
    Blog: "Blog",
    Transformations: "Transformaciones",
    Support: "Soporte",
    Feedback: "Feedback",
    Press: "Prensa",
    Legal: "Legal",
    Admin: "Admin",
    "Coach dashboard": "Panel de coach"
  },
  fr: {
    Programs: "Programmes",
    Diets: "Diets",
    Coaches: "Coachs",
    Calculator: "Calculateur",
    Equipment: "Equipement",
    "Upload program": "Uploader un programme",
    Dashboard: "Tableau de bord",
    Progress: "Progression",
    Messages: "Messages",
    Profile: "Profil",
    Settings: "Reglages",
    Coins: "Coins",
    Community: "Communaute",
    Challenges: "Challenges",
    Leaderboard: "Classement",
    Live: "Live",
    Feed: "Fil",
    Blog: "Blog",
    Transformations: "Transformations",
    Support: "Support",
    Feedback: "Feedback",
    Press: "Presse",
    Legal: "Legal",
    Admin: "Admin",
    "Coach dashboard": "Tableau coach"
  }
};

function navLabel(locale: Locale, label: string) {
  return NAV_LABELS[locale]?.[label] ?? label;
}

function buildGroups(locale: Locale): NavGroup[] {
  const titles = GROUP_TITLES[locale] ?? GROUP_TITLES.en;
  const base = `/${locale}`;
  return [
    {
      title: titles[0],
      items: [
        { label: "Programs", href: `${base}/programs` },
        { label: "Diets", href: `${base}/diets` },
        { label: "Coaches", href: `${base}/coaches` },
        { label: "Calculator", href: `${base}/calculator` },
        { label: "Equipment", href: `${base}/store` },
        { label: "Upload program", href: `${base}/programs/upload`, coachOnly: true }
      ]
    },
    {
      title: titles[1],
      items: [
        { label: "Dashboard", href: `${base}/dashboard`, authOnly: true },
        { label: "Progress", href: `${base}/progress`, authOnly: true },
        { label: "Messages", href: `${base}/messages`, authOnly: true },
        { label: "Profile", href: `${base}/profile/edit`, authOnly: true },
        { label: "Settings", href: `${base}/settings`, authOnly: true },
        { label: "Coins", href: `${base}/coins`, authOnly: true }
      ]
    },
    {
      title: titles[2],
      items: [
        { label: "Community", href: `${base}/community` },
        { label: "Challenges", href: `${base}/challenges` },
        { label: "Leaderboard", href: `${base}/leaderboard` },
        { label: "Live", href: `${base}/live` },
        { label: "Feed", href: `${base}/feed` },
        { label: "Blog", href: `${base}/blog` },
        { label: "Transformations", href: `${base}/transformations` }
      ]
    },
    {
      title: titles[3],
      items: [
        { label: "Support", href: `${base}/support` },
        { label: "Feedback", href: `${base}/feedback` },
        { label: "Press", href: `${base}/press` },
        { label: "Legal", href: `${base}/legal` },
        { label: "Admin", href: `${base}/admin`, adminOnly: true },
        { label: "Coach dashboard", href: `${base}/coach-dashboard`, coachOnly: true }
      ]
    }
  ];
}

export function SiteSideOverlay({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const { user, role } = useAuth();
  const pathname = usePathname() ?? "";
  const router = useRouter();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    setOpen(false);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    close();
    router.replace(`/${locale}`);
    router.refresh();
  };

  const groups = buildGroups(locale);
  const filteredGroups = groups.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (item.adminOnly && role !== "admin") return false;
      if (item.coachOnly && role !== "coach" && role !== "admin") return false;
      if (item.authOnly && !user) return false;
      return true;
    })
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <button
        type="button"
        aria-label={OPEN_LABEL[locale] ?? OPEN_LABEL.en}
        aria-expanded={open}
        aria-controls="site-side-overlay"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed start-3 top-3 z-40 inline-flex h-10 w-10 items-center justify-center rounded-md",
          "border border-white/[0.09] bg-[rgba(15,15,18,0.7)] text-white/85 backdrop-blur",
          "transition-colors duration-150 hover:border-white/20 hover:bg-[rgba(20,20,24,0.85)] hover:text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
          "sm:start-4 sm:top-3.5",
          open && "pointer-events-none opacity-0"
        )}
      >
        <Menu className="h-[18px] w-[18px]" aria-hidden />
      </button>

      <div
        id="site-side-overlay"
        className={cn(
          "fixed inset-0 z-[60] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label={CLOSE_LABEL[locale] ?? CLOSE_LABEL.en}
          onClick={close}
          className="absolute inset-0 cursor-default bg-[rgba(8,8,10,0.6)] backdrop-blur-md"
          tabIndex={open ? 0 : -1}
        />
        <div
          className={cn(
            "tj-side-panel absolute inset-y-0 start-0 flex w-full max-w-[820px] flex-col overflow-hidden border-e border-white/[0.06]",
            "bg-[#0B0B0E] shadow-[24px_0_60px_rgba(0,0,0,0.55)]",
            "transition-transform duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="relative z-[1] flex items-center justify-between border-b border-white/[0.06] px-6 py-5 sm:px-8">
            <Logo variant="full" size="navbar" linked={false} />
            <button
              type="button"
              onClick={close}
              aria-label={CLOSE_LABEL[locale] ?? CLOSE_LABEL.en}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.08] text-white/70 transition-colors duration-150 hover:border-white/20 hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="relative z-[1] mx-6 mt-6 flex items-center gap-3 rounded-md border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5 sm:mx-8">
            <Search className="h-4 w-4 text-white/40" aria-hidden />
            <span className="text-sm text-white/55">{SEARCH_LABEL[locale] ?? SEARCH_LABEL.en}</span>
          </div>

          <div className="relative z-[1] grid flex-1 gap-x-10 gap-y-7 overflow-y-auto px-6 py-7 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
            {filteredGroups.map((group) => (
              <section key={group.title}>
                <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">
                  {group.title}
                </h2>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={close}
                          className={cn(
                            "group/link flex min-h-[44px] items-center justify-between rounded-md px-2 py-1.5 text-[14px] transition-colors duration-150",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0E]",
                            active
                              ? "bg-white/[0.06] text-white"
                              : "text-white/65 hover:bg-white/[0.04] hover:text-white"
                          )}
                        >
                          <span>{navLabel(locale, item.label)}</span>
                          <ChevronRight
                            className={cn(
                              "h-3.5 w-3.5 transition-opacity duration-150",
                              active ? "text-accent opacity-100" : "opacity-0 group-hover/link:opacity-50"
                            )}
                            aria-hidden
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>

          {user ? (
            <div className="relative z-[1] flex items-center justify-between border-t border-white/[0.06] px-6 py-4 sm:px-8">
              <span className="truncate text-xs text-white/45">{user.email}</span>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-2 rounded-md border border-white/[0.09] px-3 py-1.5 text-xs text-white/70 transition-colors duration-150 hover:border-[rgba(239,68,68,0.45)] hover:text-white"
              >
                {SIGN_OUT_LABEL[locale] ?? SIGN_OUT_LABEL.en}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
