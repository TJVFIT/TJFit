"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { UserRound } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Logo } from "@/components/ui/Logo";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Tab = { key: "main" | "tjai" | "tjaichat"; label: string; href: string };

const TAB_LABELS: Record<Locale, Record<Tab["key"], string>> = {
  en: { main: "Main", tjai: "TJAI", tjaichat: "TJAIchat" },
  tr: { main: "Ana", tjai: "TJAI", tjaichat: "TJAIchat" },
  ar: { main: "الرئيسية", tjai: "TJAI", tjaichat: "محادثة TJAI" },
  es: { main: "Principal", tjai: "TJAI", tjaichat: "TJAIchat" },
  fr: { main: "Accueil", tjai: "TJAI", tjaichat: "TJAIchat" }
};

const SIGN_IN_LABEL: Record<Locale, string> = {
  en: "Sign in",
  tr: "Giriş",
  ar: "دخول",
  es: "Entrar",
  fr: "Connexion"
};

function getTabs(locale: Locale): Tab[] {
  const labels = TAB_LABELS[locale] ?? TAB_LABELS.en;
  return [
    { key: "main", label: labels.main, href: `/${locale}` },
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
        else if (dy > 6) setHidden(true);
        else if (dy < -6) setHidden(false);
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
        "fixed inset-x-0 top-0 z-40 transition-transform duration-300 ease-out",
        hidden ? "-translate-y-full" : "translate-y-0"
      )}
      style={{
        background: "rgba(8,8,10,0.72)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid var(--color-border)"
      }}
      aria-label="Primary"
    >
      <div className="relative mx-auto flex h-14 w-full max-w-7xl items-center px-4 sm:h-16 sm:px-6">
        <Link
          href={`/${locale}`}
          aria-label="TJFit"
          className="relative z-10 inline-flex shrink-0 items-center"
        >
          <Logo variant="full" size="navbar" linked={false} />
        </Link>

        <nav
          aria-label="Primary sections"
          className="pointer-events-none absolute inset-x-0 top-0 flex h-full items-center justify-center"
        >
          <ul className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[rgba(17,18,21,0.6)] p-1 text-sm font-medium">
            {tabs.map((tab) => {
              const active = isTabActive(pathname, tab, locale);
              return (
                <li key={tab.key}>
                  <Link
                    href={tab.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex min-h-[36px] items-center rounded-full px-3 py-1.5 text-[13px] transition-colors duration-150 sm:px-4 sm:text-sm",
                      active
                        ? "bg-accent/10 text-accent shadow-[inset_0_0_0_1px_rgba(34,211,238,0.35)]"
                        : "text-[var(--color-text-secondary)] hover:text-white"
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
              "inline-flex min-h-[36px] items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[13px] font-medium transition-colors duration-150",
              "hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.04)]",
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
