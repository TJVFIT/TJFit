"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChevronRight, X } from "lucide-react";

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
        { label: "Profile", href: `${base}/profile`, authOnly: true },
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
          "group fixed start-0 top-1/2 z-40 -translate-y-1/2",
          "flex h-20 w-[18px] items-center justify-center rounded-e-full",
          "border border-s-0 border-[rgba(34,211,238,0.35)] bg-[rgba(8,8,10,0.65)] backdrop-blur",
          "shadow-[0_0_18px_rgba(34,211,238,0.25)]",
          "transition-[width,background-color,box-shadow] duration-200 ease-out",
          "hover:w-6 hover:bg-[rgba(8,8,10,0.85)] hover:shadow-[0_0_26px_rgba(34,211,238,0.45)]",
          "focus-visible:w-6 focus-visible:outline-none",
          open && "pointer-events-none opacity-0"
        )}
      >
        <span className="absolute inset-y-3 left-1.5 w-px bg-gradient-to-b from-transparent via-accent to-transparent opacity-80 transition-opacity duration-200 group-hover:opacity-100" />
        <ChevronRight className="relative h-3.5 w-3.5 text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden />
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
            "absolute inset-y-0 start-0 flex w-full max-w-[720px] flex-col overflow-hidden border-e border-[var(--color-border)]",
            "bg-[rgba(10,10,11,0.96)] shadow-[24px_0_60px_rgba(0,0,0,0.55)]",
            "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between px-6 pt-6">
            <Logo variant="full" size="navbar" linked={false} />
            <button
              type="button"
              onClick={close}
              aria-label={CLOSE_LABEL[locale] ?? CLOSE_LABEL.en}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors duration-150 hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="grid flex-1 gap-10 overflow-y-auto px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {filteredGroups.map((group) => (
              <section key={group.title}>
                <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                  {group.title}
                </h2>
                <ul className="space-y-2">
                  {group.items.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={close}
                          className={cn(
                            "inline-flex w-full items-center justify-between rounded-lg px-3 py-2 text-[15px] transition-colors duration-150",
                            active
                              ? "bg-accent/10 text-accent shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)]"
                              : "text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
                          )}
                        >
                          <span>{item.label}</span>
                          <ChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>

          {user ? (
            <div className="border-t border-[var(--color-border)] px-6 py-5">
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-secondary)] transition-colors duration-150 hover:border-[rgba(239,68,68,0.4)] hover:text-white"
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
