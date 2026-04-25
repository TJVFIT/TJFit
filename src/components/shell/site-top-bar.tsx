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
  en: { main: "Home", programs: "Programs", coaches: "Coaches", tjai: "TJAI", tjaichat: "Chat" },
  tr: { main: "Ana", programs: "Programlar", coaches: "Koclar", tjai: "TJAI", tjaichat: "Chat" },
  ar: { main: "Home", programs: "Programs", coaches: "Coaches", tjai: "TJAI", tjaichat: "Chat" },
  es: { main: "Inicio", programs: "Programas", coaches: "Coaches", tjai: "TJAI", tjaichat: "Chat" },
  fr: { main: "Accueil", programs: "Programmes", coaches: "Coachs", tjai: "TJAI", tjaichat: "Chat" }
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

  const accountHref = user ? `/${locale}/profile` : `/${locale}/login?redirect=${encodeURIComponent(pathname || `/${locale}`)}`;

  return (
    <header
      className={cn(
        "tj-topbar fixed inset-x-0 top-0 z-40 transition-transform duration-300 ease-out",
        hidden ? "-translate-y-full" : "translate-y-0"
      )}
      style={{
        background: "linear-gradient(180deg, rgba(8,8,10,0.9), rgba(8,8,10,0.66))",
        backdropFilter: "blur(18px) saturate(1.08)",
        WebkitBackdropFilter: "blur(18px) saturate(1.08)",
        borderBottom: "1px solid rgba(255,255,255,0.07)"
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
          <ul className="pointer-events-auto inline-flex items-center gap-0.5 rounded-[14px] border border-white/[0.08] bg-[rgba(17,18,21,0.58)] p-1 text-sm font-medium shadow-[0_12px_36px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.055)]">
            {tabs.map((tab) => {
              const active = isTabActive(pathname, tab, locale);
              return (
                <li key={tab.key}>
                  <Link
                    href={tab.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex min-h-[36px] items-center rounded-[10px] px-3 py-1.5 text-[13px] transition-[background-color,color,box-shadow,transform] duration-150 sm:px-3.5",
                      active
                        ? "bg-white/[0.075] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.18)]"
                        : "text-[var(--color-text-secondary)] hover:-translate-y-0.5 hover:bg-white/[0.045] hover:text-white"
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
            aria-label={user ? "Account" : SIGN_IN_LABEL[locale]}
            className={cn(
              "inline-flex min-h-[36px] items-center gap-2 rounded-[12px] border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[13px] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[border-color,background-color,transform] duration-150",
              "hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.05)]",
              user ? "text-white" : "text-accent"
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
