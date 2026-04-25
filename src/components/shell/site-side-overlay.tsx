"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Activity, ChevronRight, Command, Search, X } from "lucide-react";

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
          "flex h-24 w-[22px] items-center justify-center rounded-e-2xl",
          "border border-s-0 border-[rgba(34,211,238,0.32)] bg-[rgba(8,8,10,0.76)] backdrop-blur-xl",
          "shadow-[0_0_28px_rgba(34,211,238,0.22),inset_0_1px_0_rgba(255,255,255,0.06)]",
          "transition-[width,background-color,box-shadow,transform] duration-200 ease-out",
          "hover:w-9 hover:bg-[rgba(8,8,10,0.92)] hover:shadow-[0_0_38px_rgba(34,211,238,0.42),inset_0_1px_0_rgba(255,255,255,0.08)]",
          "focus-visible:w-9 focus-visible:outline-none",
          open && "pointer-events-none opacity-0"
        )}
      >
        <span className="absolute inset-y-3 left-1.5 w-px bg-gradient-to-b from-transparent via-accent to-transparent opacity-80 transition-opacity duration-200 group-hover:opacity-100" />
        <span className="absolute left-2 top-3 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_14px_rgba(34,211,238,0.9)]" />
        <ChevronRight className="relative h-4 w-4 text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden />
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
            "tj-side-panel absolute inset-y-0 start-0 flex w-full max-w-[860px] flex-col overflow-hidden border-e border-white/[0.08]",
            "bg-[rgba(8,8,10,0.96)] shadow-[28px_0_80px_rgba(0,0,0,0.62)] backdrop-blur-2xl",
            "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="pointer-events-none absolute inset-0 opacity-80" aria-hidden>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_44%_at_20%_0%,rgba(34,211,238,0.12),transparent_62%),radial-gradient(ellipse_52%_36%_at_92%_80%,rgba(246,243,237,0.045),transparent_64%)]" />
            <div className="absolute inset-0 tj-side-grid" />
          </div>

          <div className="relative z-[1] flex items-start justify-between px-6 pt-6 sm:px-8">
            <div>
              <Logo variant="full" size="navbar" linked={false} />
              <div className="mt-6 max-w-sm">
                <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
                  <Command className="h-3.5 w-3.5" aria-hidden />
                  Command center
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Move through TJFit without losing momentum.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label={CLOSE_LABEL[locale] ?? CLOSE_LABEL.en}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors duration-150 hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="relative z-[1] mx-6 mt-8 grid gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3 sm:mx-8 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex items-center gap-3 rounded-xl bg-black/20 px-3 py-3">
              <Search className="h-4 w-4 text-accent" aria-hidden />
              <span className="text-sm text-[var(--color-text-secondary)]">Programs, TJAI, messages, coaches</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-3 py-3 text-xs text-[var(--color-text-muted)]">
              <Activity className="h-4 w-4 text-accent" aria-hidden />
              Ready
            </div>
          </div>

          <div className="relative z-[1] grid flex-1 gap-4 overflow-y-auto px-6 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
            {filteredGroups.map((group, groupIndex) => (
              <section
                key={group.title}
                className="tj-side-group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]"
                style={{ animationDelay: `${groupIndex * 70}ms` }}
              >
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
                            "group/link inline-flex min-h-[42px] w-full items-center justify-between rounded-xl px-3 py-2 text-[15px] transition-[background-color,color,transform,box-shadow] duration-150",
                            active
                              ? "bg-accent/12 text-accent shadow-[inset_0_0_0_1px_rgba(34,211,238,0.24),0_10px_24px_rgba(34,211,238,0.08)]"
                              : "text-[var(--color-text-secondary)] hover:translate-x-1 hover:bg-[rgba(255,255,255,0.055)] hover:text-white"
                          )}
                        >
                          <span>{item.label}</span>
                          <ChevronRight className="h-3.5 w-3.5 opacity-35 transition-opacity group-hover/link:opacity-80" aria-hidden />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>

          {user ? (
            <div className="relative z-[1] border-t border-white/[0.08] px-6 py-5 sm:px-8">
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
