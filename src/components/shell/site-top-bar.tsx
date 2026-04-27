"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { UserRound } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Logo } from "@/components/ui/Logo";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Tab = { key: "main" | "programs" | "coaches" | "tjai" | "tjaichat"; label: string; href: string };

const TAB_LABELS: Record<Locale, Record<Tab["key"], string>> = {
  en: { main: "Home", programs: "Programs", coaches: "Coaches", tjai: "TJAI", tjaichat: "TJAI Chat" },
  tr: { main: "Ana", programs: "Programlar", coaches: "Koclar", tjai: "TJAI", tjaichat: "TJAI Chat" },
  ar: { main: "Home", programs: "Programs", coaches: "Coaches", tjai: "TJAI", tjaichat: "TJAI Chat" },
  es: { main: "Inicio", programs: "Programas", coaches: "Coaches", tjai: "TJAI", tjaichat: "TJAI Chat" },
  fr: { main: "Accueil", programs: "Programmes", coaches: "Coachs", tjai: "TJAI", tjaichat: "TJAI Chat" }
};

const SIGN_IN_LABEL: Record<Locale, string> = {
  en: "Sign in",
  tr: "Giris",
  ar: "Sign in",
  es: "Entrar",
  fr: "Connexion"
};

function getTabs(locale: Locale): Tab[] {
  const labels = TAB_LABELS[locale] ?? TAB_LABELS.en;
  return [
    { key: "main", label: labels.main, href: `/${locale}` },
    { key: "programs", label: labels.programs, href: `/${locale}/programs` },
    { key: "coaches", label: labels.coaches, href: `/${locale}/coaches` },
    { key: "tjai", label: labels.tjai, href: `/${locale}/tjai` },
    { key: "tjaichat", label: labels.tjaichat, href: `/${locale}/ai` }
  ];
}

function isTabActive(pathname: string, tab: Tab, locale: Locale): boolean {
  if (tab.key === "main") return pathname === `/${locale}` || pathname === `/${locale}/`;
  return pathname === tab.href || pathname.startsWith(`${tab.href}/`);
}

export function SiteTopBar({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? "";
  const { user } = useAuth();
  const tabs = getTabs(locale);
  const [hidden, setHidden] = useState(false);
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
        const dy = y - lastYRef.current;
        if (y <= 8) setHidden(false);
        else if (dy > 8) setHidden(true);
        else if (dy < -8) setHidden(false);
        lastYRef.current = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const accountHref = user ? `/${locale}/profile/edit` : `/${locale}/login?redirect=${encodeURIComponent(pathname || `/${locale}`)}`;

  return (
    <header
      className={cn(
        "tj-topbar fixed inset-x-0 top-0 z-40 transition-transform duration-300 ease-out",
        hidden ? "-translate-y-full" : "translate-y-0"
      )}
      style={{
        background: "linear-gradient(180deg, rgba(10,10,12,0.94), rgba(10,10,12,0.78))",
        backdropFilter: "blur(20px) saturate(1.05)",
        WebkitBackdropFilter: "blur(20px) saturate(1.05)",
        borderBottom: "1px solid rgba(255,255,255,0.06)"
      }}
      aria-label="Primary"
    >
      <div className="relative mx-auto flex h-14 w-full max-w-7xl items-center px-4 sm:h-16 sm:px-6">
        <Link href={`/${locale}`} aria-label="TJFit" className="relative z-10 inline-flex shrink-0 items-center">
          <Logo variant="full" size="navbar" linked={false} />
        </Link>

        <nav
          aria-label="Primary sections"
          className="pointer-events-none absolute inset-x-0 top-0 hidden h-full items-center justify-center md:flex"
        >
          <ul className="pointer-events-auto inline-flex items-center gap-1 text-sm font-medium">
            {tabs.map((tab) => {
              const active = isTabActive(pathname, tab, locale);
              return (
                <li key={tab.key}>
                  <Link
                    href={tab.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex min-h-[36px] items-center px-3.5 text-[13px] tracking-tight transition-colors duration-150 sm:px-4",
                      active
                        ? "text-white"
                        : "text-[rgba(235,235,240,0.62)] hover:text-white"
                    )}
                  >
                    <span>{tab.label}</span>
                    {active ? (
                      <span
                        aria-hidden
                        className="absolute -bottom-[15px] left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_12px_rgba(34,211,238,0.35)] sm:-bottom-[17px]"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="relative z-10 ms-auto inline-flex items-center">
          <Link
            href={accountHref}
            aria-label={user ? "Account" : SIGN_IN_LABEL[locale]}
            className={cn(
              "inline-flex min-h-[36px] items-center gap-2 rounded-md border border-white/[0.09] bg-white/[0.02] px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-150",
              "hover:border-[rgba(255,255,255,0.18)] hover:bg-[rgba(255,255,255,0.045)]",
              user ? "text-white" : "text-white"
            )}
          >
            <UserRound className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{user ? user.email?.split("@")[0] ?? "Account" : SIGN_IN_LABEL[locale]}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
