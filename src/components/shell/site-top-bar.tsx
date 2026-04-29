"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, UserRound } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Logo } from "@/components/ui/Logo";
import { getNavChromeCopy } from "@/lib/launch-copy";
import type { Locale, SupportedLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Tab = { key: "main" | "programs" | "coaches" | "tjai" | "tjaichat"; label: string; href: string };

const TAB_LABELS: Record<Locale, Record<Tab["key"], string>> = {
  en: { main: "Home", programs: "Programs", coaches: "Coaches", tjai: "TJAI", tjaichat: "Chat" },
  tr: { main: "Ana", programs: "Programlar", coaches: "Koclar", tjai: "TJAI", tjaichat: "Chat" },
  ar: { main: "الرئيسية", programs: "البرامج", coaches: "المدربون", tjai: "TJAI", tjaichat: "محادثة" },
  es: { main: "Inicio", programs: "Programas", coaches: "Coaches", tjai: "TJAI", tjaichat: "Chat" },
  fr: { main: "Accueil", programs: "Programmes", coaches: "Coachs", tjai: "TJAI", tjaichat: "Chat" }
};

function getTabs(locale: Locale, routingLocale: string): Tab[] {
  const labels = TAB_LABELS[locale] ?? TAB_LABELS.en;
  const base = `/${routingLocale}`;
  return [
    { key: "main", label: labels.main, href: base },
    { key: "programs", label: labels.programs, href: `${base}/programs` },
    { key: "coaches", label: labels.coaches, href: `${base}/coaches` },
    { key: "tjai", label: labels.tjai, href: `${base}/tjai` },
    { key: "tjaichat", label: labels.tjaichat, href: `${base}/ai` }
  ];
}

function isTabActive(pathname: string, tab: Tab, routingLocale: string): boolean {
  if (tab.key === "main") return pathname === `/${routingLocale}` || pathname === `/${routingLocale}/`;
  return pathname === tab.href || pathname.startsWith(`${tab.href}/`);
}

export function SiteTopBar({
  locale,
  routingLocale,
  sideNavOpen,
  onOpenSideNav
}: {
  locale: Locale;
  routingLocale: SupportedLocale;
  sideNavOpen: boolean;
  onOpenSideNav: () => void;
}) {
  const pathname = usePathname() ?? "";
  const { user } = useAuth();
  const navChrome = getNavChromeCopy(locale);
  const tabs = getTabs(locale, routingLocale);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastYRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    lastYRef.current = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 12);
        const dy = y - lastYRef.current;
        if (y <= 8) setHidden(false);
        else if (dy > 8) setHidden(true);
        else if (dy < -8) setHidden(false);
        lastYRef.current = y;
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const accountHref = user
    ? `/${routingLocale}/profile/edit`
    : `/${routingLocale}/login?redirect=${encodeURIComponent(pathname || `/${routingLocale}`)}`;

  return (
    <header
      className={cn(
        "tj-topbar fixed inset-x-0 top-0 z-40 transition-transform duration-300 ease-out",
        hidden ? "-translate-y-full" : "translate-y-0"
      )}
      style={{
        background: scrolled
          ? "linear-gradient(180deg, rgba(8,8,10,0.94), rgba(8,8,10,0.82))"
          : "transparent",
        backdropFilter: scrolled ? "blur(22px) saturate(1.1)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(22px) saturate(1.1)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        transitionProperty: "background, backdrop-filter, -webkit-backdrop-filter, border-color",
        transitionDuration: "220ms",
        transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)"
      }}
    >
      <div className="relative mx-auto flex h-14 w-full max-w-7xl items-center gap-2 px-4 sm:h-16 sm:px-6">
        <button
          type="button"
          onClick={onOpenSideNav}
          className={cn(
            "relative z-10 inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[12px] border border-white/[0.1] bg-white/[0.04] text-[var(--color-text-secondary)] transition-[background-color,border-color,transform] duration-150",
            "hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a]",
            "md:hidden"
          )}
          aria-label={navChrome.menu}
          aria-expanded={sideNavOpen}
          aria-controls="site-side-overlay"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>

        <Link
          href={`/${routingLocale}`}
          aria-label="TJFit home"
          className="relative z-10 inline-flex min-h-[44px] shrink-0 items-center"
        >
          <Logo variant="full" size="navbar" linked={false} />
        </Link>

        <nav
          aria-label={navChrome.navigation}
          className="pointer-events-none absolute inset-x-0 top-0 hidden h-full items-center justify-center md:flex"
        >
          <ul className="pointer-events-auto inline-flex items-center gap-0.5 rounded-[14px] border border-white/[0.08] bg-[rgba(17,18,21,0.58)] p-1 text-sm font-medium shadow-[0_12px_36px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.055)]">
            {tabs.map((tab) => {
              const active = isTabActive(pathname, tab, routingLocale);
              return (
                <li key={tab.key}>
                  <Link
                    href={tab.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex min-h-[44px] items-center rounded-[10px] px-3 py-1.5 text-[13px] transition-[background-color,color,box-shadow,transform] duration-150 motion-reduce:hover:translate-y-0 sm:px-3.5",
                      active
                        ? "bg-white/[0.075] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.18)]"
                        : "text-[var(--color-text-secondary)] hover:-translate-y-0.5 hover:bg-white/[0.045] hover:text-white",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a]"
                    )}
                  >
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="relative z-10 ms-auto inline-flex items-center">
          <Link
            href={accountHref}
            aria-label={user ? navChrome.account : navChrome.loginLabel}
            className={cn(
              "inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-[12px] border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[13px] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[border-color,background-color,transform] duration-150",
              "hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.05)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a]",
              user ? "text-white" : "text-accent"
            )}
          >
            <UserRound className="h-4 w-4 shrink-0" aria-hidden />
            <span className="hidden min-w-0 max-w-[8rem] truncate sm:inline">
              {user ? user.email?.split("@")[0] ?? navChrome.account : navChrome.loginLabel}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
