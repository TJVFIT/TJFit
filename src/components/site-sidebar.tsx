"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  CreditCard,
  Globe,
  Home,
  Inbox,
  LogOut,
  Menu,
  MessageCircle,
  Scale,
  Sparkles,
  Shield,
  User,
  UtensilsCrossed,
  Users,
  Trophy,
  Coins,
  X,
  Dumbbell,
  Lightbulb,
  ShoppingBag
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { GlobalSearch } from "@/components/global-search";
import { Logo } from "@/components/ui/Logo";
import { AnimatedAvatar } from "@/components/animated-avatar";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Locale, getDictionary, getDirection, locales } from "@/lib/i18n";
import { getNavChromeCopy } from "@/lib/launch-copy";
import { cn } from "@/lib/utils";

const SOON_MSG_BY_LOCALE: Record<Locale, string> = {
  en: "Coming soon — stay tuned.",
  tr: "Cok yakinda — takipte kal.",
  ar: "قريباً — ترقبوا الإطلاق.",
  es: "Muy pronto — mantente atento.",
  fr: "Bientot disponible — restez a l'ecoute."
};

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  tr: "Türkçe",
  ar: "العربية",
  es: "Español",
  fr: "Français"
};

const SIDEBAR_COPY: Record<
  Locale,
  { tjaiTooltip: string; calculator: string; feed: string; coinsShop: string; leaderboard: string; aiTools: string }
> = {
  en: { tjaiTooltip: "TJAI — Your AI Coach", calculator: "Calculator", feed: "Feed", coinsShop: "TJCOIN Shop", leaderboard: "Leaderboard", aiTools: "AI & Tools" },
  tr: { tjaiTooltip: "TJAI — Yapay Zeka Kocun", calculator: "Hesaplayici", feed: "Akis", coinsShop: "TJCOIN Magazasi", leaderboard: "Liderlik Tablosu", aiTools: "Yapay Zeka ve Araclar" },
  ar: { tjaiTooltip: "TJAI — مدربك الذكي", calculator: "الحاسبة", feed: "الخلاصة", coinsShop: "متجر TJCOIN", leaderboard: "لوحة الصدارة", aiTools: "الذكاء والأدوات" },
  es: { tjaiTooltip: "TJAI — Tu entrenador IA", calculator: "Calculadora", feed: "Feed", coinsShop: "Tienda TJCOIN", leaderboard: "Clasificacion", aiTools: "IA y Herramientas" },
  fr: { tjaiTooltip: "TJAI — Votre coach IA", calculator: "Calculateur", feed: "Flux", coinsShop: "Boutique TJCOIN", leaderboard: "Classement", aiTools: "IA et Outils" }
};

const PRIMARY_CTA_COPY: Record<Locale, { start: string; dashboard: string }> = {
  en: { start: "Start Free", dashboard: "Dashboard" },
  tr: { start: "Ücretsiz Başla", dashboard: "Panel" },
  ar: { start: "ابدأ التدريب", dashboard: "لوحة التحكم" },
  es: { start: "Empezar a entrenar", dashboard: "Panel" },
  fr: { start: "Commencer l'entrainement", dashboard: "Tableau de bord" }
};

type ItemDef = {
  key: string;
  href: string;
  label: string;
  Icon: typeof Home;
  adminOnly?: boolean;
  comingSoon?: boolean;
  badgeText?: string;
  collapsedTooltip?: string;
};

function usePrefersReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const a = () => setR(mq.matches);
    a();
    mq.addEventListener("change", a);
    return () => mq.removeEventListener("change", a);
  }, []);
  return r;
}

function isActivePath(pathname: string, locale: string, href: string) {
  const full = `/${locale}${href === "/" ? "" : href}`;
  if (href === "/") return pathname === `/${locale}` || pathname === `/${locale}/`;
  return pathname === full || pathname.startsWith(`${full}/`);
}

export function SiteSidebar({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const dict = getDictionary(locale);
  const nav = getNavChromeCopy(locale);
  const direction = getDirection(locale);
  const reduce = usePrefersReducedMotion();

  const [scrolled, setScrolled] = useState(false);
  const [entered, setEntered] = useState(reduce);
  const [langOpen, setLangOpen] = useState(false);
  const [soonTip, setSoonTip] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [collapsedTipKey, setCollapsedTipKey] = useState<string | null>(null);
  const [coinBalance, setCoinBalance] = useState(0);
  const [coinDisplayed, setCoinDisplayed] = useState(0);
  const expandTimerRef = useRef<number | null>(null);
  const collapsedTipTimerRef = useRef<number | null>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const isAdmin = role === "admin";
  const soonMessage = SOON_MSG_BY_LOCALE[locale] ?? SOON_MSG_BY_LOCALE.en;
  const side = SIDEBAR_COPY[locale] ?? SIDEBAR_COPY.en;
  const primaryCtaCopy = PRIMARY_CTA_COPY[locale] ?? PRIMARY_CTA_COPY.en;
  const primaryCtaHref = user ? `/${locale}/dashboard` : `/${locale}/start`;
  const primaryCtaLabel = user ? primaryCtaCopy.dashboard : primaryCtaCopy.start;

  useEffect(() => {
    if (reduce) {
      setEntered(true);
      return;
    }
    const t = window.setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, [reduce]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!langOpen) return;
    const close = (e: MouseEvent) => {
      if (!langRef.current?.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [langOpen]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("/api/coins/wallet", { credentials: "include" });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) {
          const balance = Number(json?.wallet?.balance ?? 0);
          setCoinBalance(balance);
          // ME4 — animate coin count from 0
          const start = performance.now();
          const dur = 800;
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 3);
            setCoinDisplayed(Math.round(eased * balance));
            if (t < 1) requestAnimationFrame(tick);
            else setCoinDisplayed(balance);
          };
          requestAnimationFrame(tick);
        }
      } catch {
        // noop
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const items: ItemDef[] = useMemo(
    () => [
      { key: "home", href: "/", label: dict.nav.home, Icon: Home, collapsedTooltip: dict.nav.home },
      { key: "tjai", href: "/ai", label: "TJAI", Icon: Sparkles, badgeText: "AI", collapsedTooltip: side.tjaiTooltip },
      { key: "calculator", href: "/calculator", label: side.calculator, Icon: Scale, collapsedTooltip: side.calculator },
      { key: "programs", href: "/programs", label: dict.nav.programs, Icon: Dumbbell, collapsedTooltip: dict.nav.programs },
      { key: "diets", href: "/diets", label: dict.nav.diets, Icon: UtensilsCrossed, collapsedTooltip: dict.nav.diets },
      { key: "coaches", href: "/coaches", label: dict.nav.coaches, Icon: Users, collapsedTooltip: dict.nav.coaches },
      { key: "feed", href: "/feed", label: side.feed, Icon: Users, collapsedTooltip: side.feed },
      { key: "community", href: "/community", label: dict.nav.community, Icon: MessageCircle, collapsedTooltip: dict.nav.community },
      { key: "membership", href: "/membership", label: "Membership", Icon: CreditCard, collapsedTooltip: "Membership" },
      { key: "coins", href: "/coins", label: side.coinsShop, Icon: Coins, collapsedTooltip: side.coinsShop },
      { key: "leaderboard", href: "/leaderboard", label: side.leaderboard, Icon: Trophy, collapsedTooltip: side.leaderboard },
      { key: "suggestions", href: "/suggestions", label: "Suggestions", Icon: Lightbulb, collapsedTooltip: "Suggestions" },
      { key: "equipment", href: "/equipment", label: "Equipment", Icon: ShoppingBag, collapsedTooltip: "Equipment" },
      { key: "legal", href: "/legal", label: nav.legalCenterLabel, Icon: Scale, collapsedTooltip: nav.legalCenterLabel },
      { key: "messages", href: "/messages", label: dict.nav.messages, Icon: Inbox, collapsedTooltip: dict.nav.messages },
      { key: "profile", href: "/profile/edit", label: dict.nav.profile, Icon: User, collapsedTooltip: dict.nav.profile },
      { key: "admin", href: "/admin", label: dict.nav.admin, Icon: Shield, adminOnly: true, collapsedTooltip: dict.nav.admin }
    ],
    [dict.nav, nav.legalCenterLabel, side]
  );

  const visibleItems = useMemo(
    () => items.filter((it) => !it.adminOnly || isAdmin),
    [items, isAdmin]
  );
  const aiToolsItems = useMemo(() => visibleItems.filter((it) => it.key === "tjai" || it.key === "calculator"), [visibleItems]);
  const primaryItems = useMemo(() => visibleItems.filter((it) => !aiToolsItems.some((x) => x.key === it.key)), [aiToolsItems, visibleItems]);

  const handleLogout = async () => {
    if (!window.confirm("Sign out of TJFit?")) return;
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
      router.push(`/${locale}`);
      router.refresh();
    }
  };

  const clearCollapsedTip = () => {
    if (collapsedTipTimerRef.current) {
      window.clearTimeout(collapsedTipTimerRef.current);
      collapsedTipTimerRef.current = null;
    }
    setCollapsedTipKey(null);
  };

  const scheduleCollapsedTip = (key: string) => {
    if (sidebarExpanded) return;
    clearCollapsedTip();
    const delay = reduce ? 0 : 300;
    collapsedTipTimerRef.current = window.setTimeout(() => setCollapsedTipKey(key), delay);
  };

  const onSidebarEnter = () => {
    if (expandTimerRef.current) window.clearTimeout(expandTimerRef.current);
    if (reduce) {
      setSidebarExpanded(true);
      return;
    }
    expandTimerRef.current = window.setTimeout(() => setSidebarExpanded(true), 380);
  };

  const onSidebarLeave = () => {
    if (expandTimerRef.current) {
      window.clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }
    setSidebarExpanded(false);
    clearCollapsedTip();
  };

  const normalizedPath = pathname.replace(/^\/(en|tr|ar|es|fr)/, "") || "";
  const [search, setSearch] = useState("");
  useEffect(() => {
    setSearch(typeof window !== "undefined" ? window.location.search : "");
  }, [pathname]);

  const displayName =
    (user?.user_metadata?.full_name as string | undefined)?.trim() ||
    user?.email?.split("@")[0] ||
    "";

  const renderNavRow = (it: ItemDef, idx: number) => {
    const active = !it.comingSoon && isActivePath(pathname, locale, it.href);
    const Icon = it.Icon;
    const delay = reduce ? 0 : 100 + idx * 60;

    const rowClass = cn(
      "group/row relative flex h-[52px] w-full shrink-0 items-center rounded-e-lg transition-colors duration-150 ease-out",
      active
        ? "bg-[rgba(34,211,238,0.08)] before:absolute before:start-0 before:top-1/2 before:h-[60%] before:w-[3px] before:-translate-y-1/2 before:rounded-e-sm before:bg-[#22D3EE]"
        : "hover:bg-[rgba(255,255,255,0.04)]",
      it.comingSoon && "cursor-default"
    );

    const iconClass = cn(
      "h-5 w-5 shrink-0 transition-colors duration-150",
      active ? "text-[#22D3EE]" : "text-[#52525B] group-hover/row:text-[#A1A1AA]",
      it.comingSoon && "text-[#52525B]"
    );

    const labelClass = cn(
      "ms-3 min-w-0 flex-1 truncate text-start text-sm font-medium transition-[max-width,opacity,transform] duration-200 ease-out",
      sidebarExpanded ? "max-w-[200px] translate-x-0 opacity-100" : "max-w-0 -translate-x-2 opacity-0",
      active ? "text-white" : "text-[#A1A1AA] group-hover/row:text-white"
    );

    const soonBadge = (
      <span
        className={cn(
          "ms-1 shrink-0 rounded border border-[rgba(167,139,250,0.2)] bg-[rgba(167,139,250,0.12)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#A78BFA]",
          sidebarExpanded ? "inline-flex" : "hidden"
        )}
      >
        SOON
      </span>
    );

    const showCollapsedTooltip = !sidebarExpanded && collapsedTipKey === it.key;

    const inner = (
      <>
        <span className="relative flex w-16 shrink-0 justify-center">
          <Icon className={iconClass} strokeWidth={1.75} aria-hidden />
          {it.comingSoon ? (
            <span
              className={cn(
                "absolute -end-0.5 -top-1 rounded border border-[rgba(167,139,250,0.2)] bg-[rgba(167,139,250,0.12)] px-1 py-px text-[7px] font-bold text-[#A78BFA]",
                sidebarExpanded ? "hidden" : "inline-flex"
              )}
            >
              S
            </span>
          ) : null}
          {showCollapsedTooltip ? (
            <span
              className="tj-collapsed-sidebar-tip pointer-events-none absolute start-[calc(100%+12px)] top-1/2 z-[100] rounded-lg border border-[#1E2028] bg-[#111215] px-3 py-1.5 text-[13px] font-medium text-white shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
              role="tooltip"
            >
              <span className="block whitespace-nowrap">{it.collapsedTooltip ?? it.label}</span>
              {it.comingSoon ? (
                <span className="mt-0.5 block whitespace-nowrap text-[11px] font-normal italic text-[#52525B]">
                  {soonMessage}
                </span>
              ) : null}
            </span>
          ) : null}
        </span>
        <span className={labelClass}>{it.label}</span>
        {it.badgeText && sidebarExpanded ? (
          <span className="ms-1 rounded-full border border-[rgba(34,211,238,0.35)] bg-[rgba(34,211,238,0.15)] px-1.5 py-0.5 text-[10px] font-bold text-[#22D3EE] tjai-pulse-badge">
            {it.badgeText}
          </span>
        ) : null}
        {it.comingSoon ? soonBadge : null}
      </>
    );

    const style = reduce
      ? undefined
      : {
          opacity: entered ? 1 : 0,
          transform: entered ? "translateX(0)" : "translateX(-12px)",
          transition: `opacity 400ms ease, transform 400ms ease`,
          transitionDelay: `${delay}ms`
        };

    if (it.comingSoon) {
      return (
        <div key={it.key} className="px-0" style={style}>
          <button
            type="button"
            className={cn(rowClass, "relative w-full px-0 text-start")}
            onMouseEnter={() => scheduleCollapsedTip(it.key)}
            onMouseLeave={clearCollapsedTip}
            onClick={() => {
              setSoonTip(soonMessage);
              window.setTimeout(() => setSoonTip(null), 3200);
            }}
            aria-label={it.label}
          >
            {inner}
          </button>
        </div>
      );
    }

    let href = `/${locale}${it.href === "/" ? "" : it.href}`;
    if ((it.key === "messages" || it.key === "profile") && !user) {
      href = `/${locale}/login?redirect=${encodeURIComponent(it.href)}`;
    }

    return (
      <div key={it.key} className="px-0" style={style}>
        <Link
          href={href}
          className={cn(rowClass, "relative px-0")}
          title={sidebarExpanded ? undefined : it.label}
          onMouseEnter={() => scheduleCollapsedTip(it.key)}
          onMouseLeave={clearCollapsedTip}
        >
          {inner}
        </Link>
      </div>
    );
  };

  return (
    <>
      {soonTip ? (
        <div
          className="fixed bottom-6 left-1/2 z-[300] max-w-sm -translate-x-1/2 rounded-lg border border-[#1E2028] bg-[#111215] px-4 py-3 text-center text-sm text-[#A1A1AA] shadow-lg lg:left-[130px]"
          role="status"
        >
          {soonTip}
        </div>
      ) : null}

      <aside
        dir={direction}
        onMouseEnter={onSidebarEnter}
        onMouseLeave={onSidebarLeave}
        className={cn(
          "site-sidebar tj-sidebar-rail fixed top-0 z-50 hidden h-[100dvh] flex-col overflow-x-visible overflow-y-hidden border-[rgba(255,255,255,0.04)] will-change-[width] lg:flex",
          "transition-[width,transform,background-color,backdrop-filter] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          direction === "rtl" ? "right-0 border-l" : "left-0 border-r",
          sidebarExpanded ? "w-[260px]" : "w-16",
          scrolled ? "bg-[rgba(9,9,11,0.85)] backdrop-blur-[20px]" : "bg-transparent",
          reduce ? "translate-x-0" : entered ? "translate-x-0" : "-translate-x-full",
          reduce ? "" : "duration-[600ms] ease-[cubic-bezier(0,0,0.2,1)]"
        )}
        style={reduce ? undefined : { transitionDelay: entered ? undefined : "100ms" }}
      >
        <div className={cn("flex h-[72px] shrink-0 items-center border-b border-transparent ps-2 pt-[env(safe-area-inset-top,0px)]", !sidebarExpanded && "logo-breathe")}>
          <Logo variant="full" size={sidebarExpanded ? "navFull" : "sidebar"} href={`/${locale}`} suppressMinTouchTarget />
        </div>

        <div className="px-3 pb-2 pt-3">
          <Link
            href={primaryCtaHref}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#22D3EE] px-4 text-sm font-bold text-[#09090B] transition-opacity hover:opacity-90"
          >
            {primaryCtaLabel}
          </Link>
        </div>

        <nav className="tj-scrollbar flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-visible px-0 py-3">
          <GlobalSearch locale={locale} collapsed={!sidebarExpanded} onExpand={() => setSidebarExpanded(true)} />
          {primaryItems.map((it, i) => renderNavRow(it, i))}
          <div className={cn("my-2 px-3", sidebarExpanded ? "opacity-100" : "opacity-0")}>
            <div className="h-px w-full bg-[#1E2028]" />
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#52525B]">{side.aiTools}</p>
          </div>
          {aiToolsItems.map((it, i) => renderNavRow(it, i + primaryItems.length))}
        </nav>

        <div className="mt-auto shrink-0 border-t border-[#1E2028] px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          <div ref={langRef} className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              onMouseEnter={() => scheduleCollapsedTip("__lang")}
              onMouseLeave={clearCollapsedTip}
              className="group/lang relative flex h-11 w-full items-center rounded-lg text-[#52525B] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-[#A1A1AA]"
            >
              <span className="relative flex w-16 shrink-0 justify-center">
                <Globe className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                {!sidebarExpanded && collapsedTipKey === "__lang" ? (
                  <span
                    className="tj-collapsed-sidebar-tip pointer-events-none absolute start-[calc(100%+12px)] top-1/2 z-[100] rounded-lg border border-[#1E2028] bg-[#111215] px-3 py-1.5 text-[13px] font-medium text-white shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
                    role="tooltip"
                  >
                    {nav.language}
                  </span>
                ) : null}
              </span>
              <span
                className={cn(
                  "ms-3 overflow-hidden text-sm font-medium transition-[max-width,opacity,transform] duration-200",
                  sidebarExpanded ? "max-w-[120px] translate-x-0 opacity-100" : "max-w-0 -translate-x-2 opacity-0"
                )}
              >
                {locale.toUpperCase()}
                <ChevronDown className="ms-1 inline h-4 w-4 opacity-60" aria-hidden />
              </span>
            </button>
            <div
              className={cn(
                "absolute bottom-[calc(100%+6px)] start-0 z-[130] min-w-[140px] rounded-[10px] border border-[#1E2028] bg-[#111215] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-[opacity,transform] duration-150 ease-out",
                langOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
              )}
            >
              {locales.map((code) => (
                <Link
                  key={code}
                  href={`/${code}${normalizedPath}${search}`}
                  onClick={() => setLangOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2 text-[13px] text-[#A1A1AA] transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-white",
                    code === locale && "font-semibold text-white"
                  )}
                >
                  <span>{LOCALE_LABELS[code]}</span>
                  {code === locale ? <span className="text-[#22D3EE]">✓</span> : null}
                </Link>
              ))}
            </div>
          </div>

          {!loading && !user ? (
            <Link
              href={`/${locale}/login`}
              onMouseEnter={() => scheduleCollapsedTip("__login")}
              onMouseLeave={clearCollapsedTip}
              className="relative mt-2 flex h-11 w-full items-center rounded-lg text-[#52525B] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
            >
              <span className="relative flex w-16 shrink-0 justify-center">
                <User className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                {!sidebarExpanded && collapsedTipKey === "__login" ? (
                  <span
                    className="tj-collapsed-sidebar-tip pointer-events-none absolute start-[calc(100%+12px)] top-1/2 z-[100] rounded-lg border border-[#1E2028] bg-[#111215] px-3 py-1.5 text-[13px] font-medium text-white shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
                    role="tooltip"
                  >
                    {dict.nav.login}
                  </span>
                ) : null}
              </span>
              <span
                className={cn(
                  "ms-3 overflow-hidden text-sm font-medium transition-[max-width,opacity,transform] duration-200",
                  sidebarExpanded ? "max-w-[140px] translate-x-0 opacity-100" : "max-w-0 -translate-x-2 opacity-0"
                )}
              >
                {dict.nav.login}
              </span>
            </Link>
          ) : null}

          {!loading && user ? (
            <div className="mt-3 flex w-full items-start gap-1">
              <div className="flex w-16 shrink-0 justify-center pt-1">
                <AnimatedAvatar
                  url={(user?.user_metadata?.avatar_url as string | undefined) ?? null}
                  name={displayName || user.email}
                  size={32}
                />
              </div>
              <div
                className={cn(
                  "min-w-0 flex-1 overflow-hidden pt-0.5 transition-[max-width,opacity] duration-200",
                  sidebarExpanded ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
                )}
              >
                <p className="truncate text-sm font-medium text-white">{displayName || user.email}</p>
                <Link href={`/${locale}/coins`} className="mt-1 inline-flex items-center gap-1 text-xs text-[#22D3EE] hover:opacity-80">
                  ⚡ {coinDisplayed.toLocaleString()}
                </Link>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="mt-1 flex items-center gap-1 text-xs text-[#52525B] transition-colors hover:text-white"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden />
                  {dict.nav.logout}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      <MobileNav
        locale={locale}
        primaryItems={primaryItems}
        aiToolsItems={aiToolsItems}
        dict={dict}
        nav={nav}
        side={side}
        user={user}
        loading={loading}
        onSoon={() => {
          setSoonTip(soonMessage);
          window.setTimeout(() => setSoonTip(null), 3200);
        }}
      />
    </>
  );
}

function MobileNav({
  locale,
  primaryItems,
  aiToolsItems,
  dict,
  nav,
  side,
  user,
  loading,
  onSoon
}: {
  locale: Locale;
  primaryItems: ItemDef[];
  aiToolsItems: ItemDef[];
  dict: ReturnType<typeof getDictionary>;
  nav: ReturnType<typeof getNavChromeCopy>;
  side: (typeof SIDEBAR_COPY)[Locale];
  user: ReturnType<typeof useAuth>["user"];
  loading: boolean;
  onSoon: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [overlayReady, setOverlayReady] = useState(false);
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const reduce = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [soonInline, setSoonInline] = useState<string | null>(null);
  const soonMessage = SOON_MSG_BY_LOCALE[locale] ?? SOON_MSG_BY_LOCALE.en;
  const primaryCtaCopy = PRIMARY_CTA_COPY[locale] ?? PRIMARY_CTA_COPY.en;
  const primaryCtaHref = user ? `/${locale}/dashboard` : `/${locale}/start`;
  const primaryCtaLabel = user ? primaryCtaCopy.dashboard : primaryCtaCopy.start;

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setSearch(typeof window !== "undefined" ? window.location.search : "");
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      setOverlayReady(false);
      return;
    }
    if (reduce) {
      setOverlayReady(true);
      return;
    }
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setOverlayReady(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [open, reduce]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const normalizedPath = pathname.replace(/^\/(en|tr|ar|es|fr)/, "") || "";

  const handleLogout = async () => {
    if (!window.confirm("Sign out of TJFit?")) return;
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
      router.push(`/${locale}`);
      router.refresh();
    }
    setOpen(false);
  };

  const localeChipClass = (code: Locale) =>
    cn(
      "flex h-11 min-w-[44px] shrink-0 items-center justify-center rounded-lg border px-2 text-[11px] font-bold uppercase tracking-wider transition-colors",
      code === locale
        ? "border-[rgba(34,211,238,0.4)] text-[#22D3EE]"
        : "border-[#1E2028] text-[#A1A1AA] active:bg-white/5"
    );

  if (!mounted) {
    return (
      <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center gap-2 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(9,9,11,0.92)] px-3 pt-[env(safe-area-inset-top,0px)] backdrop-blur-[20px] sm:px-4 lg:hidden">
        <div className="shrink-0">
          <Logo variant="full" size="mobile" href={`/${locale}`} />
        </div>
        <div className="min-h-11 min-w-0 flex-1" aria-hidden />
        <div className="h-11 w-11 shrink-0" aria-hidden />
      </header>
    );
  }

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center gap-2 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(9,9,11,0.92)] px-3 pt-[env(safe-area-inset-top,0px)] backdrop-blur-[20px] sm:px-4 lg:hidden">
        <div className="shrink-0">
          <Logo variant="full" size="mobile" href={`/${locale}`} />
        </div>
        <nav
          aria-label={nav.language}
          className="tj-nav-scroll flex min-h-11 min-w-0 max-w-[min(48vw,12.5rem)] flex-1 items-center justify-end gap-1 overflow-x-auto overscroll-x-contain py-0.5 sm:max-w-[min(52vw,14rem)]"
        >
          {locale !== "en" ? (
            <Link href={`/en${normalizedPath}${search}`} className="flex h-11 min-w-[56px] shrink-0 items-center justify-center rounded-lg border border-[rgba(34,211,238,0.4)] bg-[rgba(34,211,238,0.08)] px-2 text-[11px] font-bold uppercase tracking-wider text-[#22D3EE]">
              EN
            </Link>
          ) : null}
          {locales.map((code) => (
            <Link key={code} href={`/${code}${normalizedPath}${search}`} className={localeChipClass(code)}>
              {code.toUpperCase()}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          aria-label={nav.menu}
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#1E2028] text-[#A1A1AA] transition-colors hover:text-white"
        >
          <Menu className="h-[22px] w-[22px]" strokeWidth={1.75} />
        </button>
      </header>

      {open ? (
        <div
          className={cn(
            "tj-mobile-overlay fixed inset-0 z-[220] flex min-h-0 flex-col bg-[#09090B] lg:hidden",
            reduce && "tj-mobile-overlay--reduce"
          )}
        >
          <button
            type="button"
            aria-label={nav.close}
            onClick={() => setOpen(false)}
            className="absolute end-4 top-[max(1rem,env(safe-area-inset-top))] z-10 flex h-11 w-11 items-center justify-center rounded-lg border border-[#1E2028] text-[#A1A1AA] hover:text-white"
          >
            <X className="h-[22px] w-[22px]" />
          </button>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-[max(2rem,env(safe-area-inset-top))]">
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-6 pb-4">
              <div className="mx-auto flex w-full max-w-sm flex-col items-center">
                <Logo variant="full" size="hero" href={`/${locale}`} onNavigate={() => setOpen(false)} />
                <Link
                  href={primaryCtaHref}
                  onClick={() => setOpen(false)}
                  className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#22D3EE] px-5 py-2 text-sm font-bold text-[#09090B]"
                >
                  {primaryCtaLabel}
                </Link>
                <nav className="mt-10 flex w-full flex-col gap-1" aria-label={nav.navigation}>
                  {primaryItems.map((it, i) => {
                    const active = !it.comingSoon && isActivePath(pathname, locale, it.href);
                    const Icon = it.Icon;
                    const delay = reduce ? 0 : i * 40;
                    if (it.comingSoon) {
                      return (
                        <button
                          key={it.key}
                          type="button"
                          style={{ transitionDelay: `${delay}ms` }}
                          className={cn(
                            "flex min-h-[52px] w-full items-center justify-center gap-2 py-3 text-lg font-medium text-[#52525B] transition-[opacity,transform] duration-[350ms] ease-out",
                            overlayReady || reduce ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                          )}
                          onClick={() => {
                            setSoonInline(soonMessage);
                            onSoon();
                          }}
                        >
                          <Icon className="h-6 w-6 shrink-0" strokeWidth={1.5} />
                          {it.label}
                          <span className="rounded border border-[rgba(167,139,250,0.2)] bg-[rgba(167,139,250,0.12)] px-2 py-0.5 text-[10px] font-bold uppercase text-[#A78BFA]">
                            SOON
                          </span>
                        </button>
                      );
                    }
                    let href = `/${locale}${it.href === "/" ? "" : it.href}`;
                    if ((it.key === "messages" || it.key === "profile") && !user) {
                      href = `/${locale}/login?redirect=${encodeURIComponent(it.href)}`;
                    }
                    return (
                      <Link
                        key={it.key}
                        href={href}
                        onClick={() => setOpen(false)}
                        style={{ transitionDelay: `${delay}ms` }}
                        className={cn(
                          "flex min-h-[52px] w-full items-center justify-center gap-3 py-3 text-lg font-medium transition-[opacity,transform,color] duration-[350ms] ease-out",
                          active ? "text-white" : "text-[#A1A1AA] hover:text-white",
                          overlayReady || reduce ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                        )}
                      >
                        <Icon className="h-6 w-6 shrink-0" strokeWidth={1.5} />
                        {it.label}
                        {it.badgeText ? (
                          <span className="rounded-full border border-[rgba(34,211,238,0.35)] bg-[rgba(34,211,238,0.15)] px-1.5 py-0.5 text-[10px] font-bold text-[#22D3EE]">
                            {it.badgeText}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                  <div className="my-2 border-t border-[#1E2028] pt-3 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-[#52525B]">
                    {side.aiTools}
                  </div>
                  {aiToolsItems.map((it, i) => {
                    const active = !it.comingSoon && isActivePath(pathname, locale, it.href);
                    const Icon = it.Icon;
                    const delay = reduce ? 0 : (primaryItems.length + i) * 40;
                    let href = `/${locale}${it.href === "/" ? "" : it.href}`;
                    if ((it.key === "messages" || it.key === "profile") && !user) {
                      href = `/${locale}/login?redirect=${encodeURIComponent(it.href)}`;
                    }
                    return (
                      <Link
                        key={it.key}
                        href={href}
                        onClick={() => setOpen(false)}
                        style={{ transitionDelay: `${delay}ms` }}
                        className={cn(
                          "flex min-h-[52px] w-full items-center justify-center gap-3 py-3 text-lg font-medium transition-[opacity,transform,color] duration-[350ms] ease-out",
                          active ? "text-white" : "text-[#A1A1AA] hover:text-white",
                          overlayReady || reduce ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                        )}
                      >
                        <Icon className="h-6 w-6 shrink-0" strokeWidth={1.5} />
                        {it.label}
                        {it.badgeText ? (
                          <span className="rounded-full border border-[rgba(34,211,238,0.35)] bg-[rgba(34,211,238,0.15)] px-1.5 py-0.5 text-[10px] font-bold text-[#22D3EE]">
                            {it.badgeText}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </nav>
                {soonInline ? <p className="mt-4 text-sm text-[#A1A1AA]">{soonInline}</p> : null}
                {!loading && user ? (
                  <p className="mt-7 max-w-[20rem] truncate text-center text-sm text-[#A1A1AA]">
                    {(user.user_metadata?.full_name as string | undefined)?.trim() || user.email}
                  </p>
                ) : null}
                {!loading && user ? (
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="mt-3 min-h-[44px] text-sm text-[#52525B] hover:text-white"
                  >
                    {dict.nav.logout}
                  </button>
                ) : null}
                {!loading && !user ? (
                  <Link
                    href={`/${locale}/login`}
                    onClick={() => setOpen(false)}
                    className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#1E2028] px-5 py-2 text-sm font-medium text-[#A1A1AA] hover:text-white"
                  >
                    {dict.nav.login}
                  </Link>
                ) : null}
              </div>
            </div>
            <div
              role="region"
              aria-labelledby="tj-mobile-drawer-lang"
              className="shrink-0 border-t border-[#1E2028] bg-[#09090B] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4"
            >
              <p
                id="tj-mobile-drawer-lang"
                className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#52525B]"
              >
                {nav.language}
              </p>
              <div className="tj-nav-scroll flex justify-center gap-2 overflow-x-auto pb-1">
                {locales.map((code) => (
                  <Link
                    key={code}
                    href={`/${code}${normalizedPath}${search}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex h-12 min-w-[96px] shrink-0 items-center justify-between gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors",
                      code === locale
                        ? "border-[rgba(34,211,238,0.4)] text-white"
                        : "border-[#1E2028] text-[#A1A1AA] active:bg-white/5"
                    )}
                  >
                    <span className="truncate">{LOCALE_LABELS[code]}</span>
                    {code === locale ? <span className="text-[#22D3EE]">✓</span> : null}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
