"use client";

import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, UserRound } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Logo } from "@/components/ui/Logo";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// v3.9 round 2 — top-nav with Radix hover-reveal submenus.
//
// Two trigger labels: Train and TJAI. Each opens a 220 ms fade +
// 8 px slide submenu (Geist Sans, surface-2 background, cyan hover
// tint). Radix handles keyboard nav (Tab / Arrows / Escape) and
// focus management automatically. RTL is via the parent layout
// `dir="rtl"` so submenu sides flip naturally.

type SubItem = { label: string; href: string; meta?: string };

const TOP_LABELS: Record<Locale, { home: string; train: string; tjai: string }> = {
  en: { home: "Home", train: "Train", tjai: "TJAI" },
  tr: { home: "Ana", train: "Antrenman", tjai: "TJAI" },
  ar: { home: "الرئيسية", train: "تدريب", tjai: "TJAI" },
  es: { home: "Inicio", train: "Entrenar", tjai: "TJAI" },
  fr: { home: "Accueil", train: "Entraînement", tjai: "TJAI" }
};

const TRAIN_LABELS: Record<Locale, Record<string, string>> = {
  en: { programs: "Programs", diets: "Diets", coaches: "Coaches", equipment: "Equipment guide" },
  tr: { programs: "Programlar", diets: "Diyetler", coaches: "Koclar", equipment: "Ekipman" },
  ar: { programs: "البرامج", diets: "الأنظمة", coaches: "المدربون", equipment: "المعدات" },
  es: { programs: "Programas", diets: "Dietas", coaches: "Coaches", equipment: "Equipo" },
  fr: { programs: "Programmes", diets: "Régimes", coaches: "Coachs", equipment: "Équipement" }
};

const TJAI_LABELS: Record<Locale, Record<string, string>> = {
  en: { generate: "Generate plan", chat: "TJAI Chat", credits: "Credit packs" },
  tr: { generate: "Plan üret", chat: "TJAI Chat", credits: "Kredi paketleri" },
  ar: { generate: "أنشئ خطة", chat: "محادثة TJAI", credits: "حزم الرصيد" },
  es: { generate: "Generar plan", chat: "TJAI Chat", credits: "Paquetes de créditos" },
  fr: { generate: "Générer un plan", chat: "TJAI Chat", credits: "Packs de crédits" }
};

const TJAI_META: Record<Locale, Record<string, string>> = {
  en: { generate: "$8 / pack", chat: "Pro / Apex" },
  tr: { generate: "$8 / paket", chat: "Pro / Apex" },
  ar: { generate: "$8 / حزمة", chat: "Pro / Apex" },
  es: { generate: "$8 / pack", chat: "Pro / Apex" },
  fr: { generate: "$8 / pack", chat: "Pro / Apex" }
};

const SIGN_IN_LABEL: Record<Locale, string> = {
  en: "Sign in",
  tr: "Giris",
  ar: "Sign in",
  es: "Entrar",
  fr: "Connexion"
};

function trainItems(locale: Locale): SubItem[] {
  const l = TRAIN_LABELS[locale] ?? TRAIN_LABELS.en;
  const base = `/${locale}`;
  return [
    { label: l.programs, href: `${base}/programs` },
    { label: l.diets, href: `${base}/diets` },
    { label: l.coaches, href: `${base}/coaches` },
    { label: l.equipment, href: `${base}/store` }
  ];
}

function tjaiItems(locale: Locale): SubItem[] {
  const l = TJAI_LABELS[locale] ?? TJAI_LABELS.en;
  const m = TJAI_META[locale] ?? TJAI_META.en;
  const base = `/${locale}`;
  return [
    { label: l.generate, href: `${base}/tjai`, meta: m.generate },
    { label: l.chat, href: `${base}/ai`, meta: m.chat },
    { label: l.credits, href: `${base}/coins` }
  ];
}

export function SiteTopBar({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? "";
  const { user } = useAuth();
  const [hidden, setHidden] = useState(false);
  const lastYRef = useRef(0);
  const labels = TOP_LABELS[locale] ?? TOP_LABELS.en;

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

  const accountHref = user
    ? `/${locale}/profile/edit`
    : `/${locale}/login?redirect=${encodeURIComponent(pathname || `/${locale}`)}`;

  const homeActive = pathname === `/${locale}` || pathname === `/${locale}/`;
  const trainActive =
    pathname.startsWith(`/${locale}/programs`) ||
    pathname.startsWith(`/${locale}/diets`) ||
    pathname.startsWith(`/${locale}/coaches`) ||
    pathname.startsWith(`/${locale}/store`);
  const tjaiActive =
    pathname.startsWith(`/${locale}/tjai`) ||
    pathname.startsWith(`/${locale}/ai`) ||
    pathname.startsWith(`/${locale}/coins`);

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
        <Link
          href={`/${locale}`}
          aria-label="TJFit"
          className="relative z-10 inline-flex shrink-0 items-center"
        >
          <Logo variant="full" size="navbar" linked={false} />
        </Link>

        <NavigationMenu.Root
          className="pointer-events-none absolute inset-x-0 top-0 hidden h-full items-center justify-center md:flex"
          aria-label="Primary sections"
        >
          <NavigationMenu.List className="pointer-events-auto inline-flex items-center gap-1 text-sm font-medium">
            <NavigationMenu.Item>
              <NavigationMenu.Link asChild active={homeActive}>
                <Link
                  href={`/${locale}`}
                  className={cn(
                    "tj-topnav-link relative inline-flex min-h-[44px] items-center px-3.5 text-[13px] tracking-tight transition-colors duration-150 sm:px-4",
                    homeActive ? "text-white" : "text-[rgba(235,235,240,0.62)] hover:text-white"
                  )}
                >
                  <span>{labels.home}</span>
                  {homeActive ? <span aria-hidden className="tj-topnav-active-bar" /> : null}
                </Link>
              </NavigationMenu.Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <NavigationMenu.Trigger
                className={cn(
                  "tj-topnav-link group relative inline-flex min-h-[44px] items-center gap-1 px-3.5 text-[13px] tracking-tight transition-colors duration-150 outline-none sm:px-4",
                  trainActive ? "text-white" : "text-[rgba(235,235,240,0.62)] hover:text-white"
                )}
              >
                {labels.train}
                <ChevronDown
                  className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden
                />
                {trainActive ? <span aria-hidden className="tj-topnav-active-bar" /> : null}
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="tj-topnav-content">
                <ul className="flex w-[260px] flex-col gap-0.5 p-2">
                  {trainItems(locale).map((item) => (
                    <li key={item.href}>
                      <NavigationMenu.Link asChild>
                        <Link
                          href={item.href}
                          className="tj-topnav-sub flex items-center justify-between rounded-md px-3 py-2 text-[13px] text-white/80 transition-colors duration-150 hover:bg-cyan-300/10 hover:text-white"
                        >
                          <span>{item.label}</span>
                          {item.meta ? (
                            <span className="text-[11px] text-faint">{item.meta}</span>
                          ) : null}
                        </Link>
                      </NavigationMenu.Link>
                    </li>
                  ))}
                </ul>
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <NavigationMenu.Trigger
                className={cn(
                  "tj-topnav-link group relative inline-flex min-h-[44px] items-center gap-1 px-3.5 text-[13px] tracking-tight transition-colors duration-150 outline-none sm:px-4",
                  tjaiActive ? "text-white" : "text-[rgba(235,235,240,0.62)] hover:text-white"
                )}
              >
                {labels.tjai}
                <ChevronDown
                  className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden
                />
                {tjaiActive ? <span aria-hidden className="tj-topnav-active-bar" /> : null}
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="tj-topnav-content">
                <ul className="flex w-[260px] flex-col gap-0.5 p-2">
                  {tjaiItems(locale).map((item) => (
                    <li key={item.href}>
                      <NavigationMenu.Link asChild>
                        <Link
                          href={item.href}
                          className="tj-topnav-sub flex items-center justify-between rounded-md px-3 py-2 text-[13px] text-white/80 transition-colors duration-150 hover:bg-cyan-300/10 hover:text-white"
                        >
                          <span>{item.label}</span>
                          {item.meta ? (
                            <span className="text-[11px] text-faint">{item.meta}</span>
                          ) : null}
                        </Link>
                      </NavigationMenu.Link>
                    </li>
                  ))}
                </ul>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>

          <div className="absolute left-0 right-0 top-full flex justify-center">
            <NavigationMenu.Viewport className="tj-topnav-viewport pointer-events-auto" />
          </div>
        </NavigationMenu.Root>

        <div className="relative z-10 ms-auto inline-flex items-center">
          <Link
            href={accountHref}
            aria-label={user ? "Account" : SIGN_IN_LABEL[locale]}
            className={cn(
              "inline-flex min-h-[44px] items-center gap-2 rounded-md border border-white/[0.09] bg-white/[0.02] px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-150",
              "hover:border-[rgba(255,255,255,0.18)] hover:bg-[rgba(255,255,255,0.045)]",
              user ? "text-white" : "text-white"
            )}
          >
            <UserRound className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">
              {user ? user.email?.split("@")[0] ?? "Account" : SIGN_IN_LABEL[locale]}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
