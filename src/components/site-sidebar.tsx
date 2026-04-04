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
  Rocket,
  Scale,
  Shield,
  User,
  UtensilsCrossed,
  Users,
  X,
  Dumbbell
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Logo } from "@/components/ui/Logo";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Locale, getDictionary, getDirection, locales } from "@/lib/i18n";
import { getNavChromeCopy } from "@/lib/launch-copy";
import { cn } from "@/lib/utils";

const SOON_MSG = "Coming soon — stay tuned.";

type ItemDef = {
  key: string;
  href: string;
  label: string;
  Icon: typeof Home;
  adminOnly?: boolean;
  comingSoon?: boolean;
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
  const langRef = useRef<HTMLDivElement>(null);

  const isAdmin = role === "admin";

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

  const items: ItemDef[] = useMemo(
    () => [
      { key: "home", href: "/", label: dict.nav.home, Icon: Home },
      { key: "programs", href: "/programs", label: dict.nav.programs, Icon: Dumbbell },
      { key: "diets", href: "/diets", label: dict.nav.diets, Icon: UtensilsCrossed },
      { key: "start", href: "/start", label: nav.startFreeLabel, Icon: Rocket },
      { key: "coaches", href: "/coaches", label: dict.nav.coaches, Icon: Users },
      { key: "community", href: "/community", label: dict.nav.community, Icon: MessageCircle, comingSoon: true },
      { key: "membership", href: "/membership", label: dict.nav.membership, Icon: CreditCard, comingSoon: true },
      { key: "legal", href: "/legal", label: nav.legalCenterLabel, Icon: Scale },
      { key: "messages", href: "/messages", label: dict.nav.messages, Icon: Inbox },
      { key: "profile", href: "/profile/edit", label: dict.nav.profile, Icon: User },
      { key: "admin", href: "/admin", label: dict.nav.admin, Icon: Shield, adminOnly: true }
    ],
    [dict.nav, nav.startFreeLabel, nav.legalCenterLabel]
  );

  const visibleItems = useMemo(
    () => items.filter((it) => !it.adminOnly || isAdmin),
    [items, isAdmin]
  );

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
      router.push(`/${locale}`);
      router.refresh();
    }
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
      "ms-3 min-w-0 max-w-0 flex-1 translate-x-[-8px] truncate text-start text-sm font-medium opacity-0 transition-[max-width,opacity,transform] duration-200 ease-out",
      "group-hover/sidebar:max-w-[200px] group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100 group-hover/sidebar:delay-[180ms]",
      active ? "text-white" : "text-[#A1A1AA] group-hover/row:text-white"
    );

    const soonBadge = (
      <span className="ms-1 hidden shrink-0 rounded border border-[rgba(167,139,250,0.2)] bg-[rgba(167,139,250,0.12)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#A78BFA] group-hover/sidebar:inline-flex">
        SOON
      </span>
    );

    const inner = (
      <>
        <span className="relative flex w-16 shrink-0 justify-center">
          <Icon className={iconClass} strokeWidth={1.75} aria-hidden />
          {it.comingSoon ? (
            <span className="absolute -end-0.5 -top-1 rounded border border-[rgba(167,139,250,0.2)] bg-[rgba(167,139,250,0.12)] px-1 py-px text-[7px] font-bold text-[#A78BFA] group-hover/sidebar:hidden">
              S
            </span>
          ) : null}
        </span>
        <span className={labelClass}>{it.label}</span>
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
            className={cn(rowClass, "w-full px-0 text-start")}
            onClick={() => {
              setSoonTip(SOON_MSG);
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
        <Link href={href} className={cn(rowClass, "px-0")} title={it.label}>
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
        className={cn(
          "tj-sidebar-rail group/sidebar fixed left-0 top-0 z-50 hidden h-[100dvh] flex-col border-r border-[rgba(255,255,255,0.04)] will-change-[width] lg:flex",
          "w-16 overflow-hidden transition-[width,transform,background-color,backdrop-filter] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "hover:w-[260px]",
          scrolled ? "bg-[rgba(9,9,11,0.85)] backdrop-blur-[20px]" : "bg-transparent",
          reduce ? "translate-x-0" : entered ? "translate-x-0" : "-translate-x-full",
          reduce ? "" : "duration-[600ms] ease-[cubic-bezier(0,0,0.2,1)]"
        )}
        style={reduce ? undefined : { transitionDelay: entered ? undefined : "100ms" }}
      >
        <div className="flex h-[72px] shrink-0 items-center border-b border-transparent ps-4 pt-[env(safe-area-inset-top,0px)]">
          <Logo variant="full" size="sidebar" href={`/${locale}`} suppressMinTouchTarget />
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden px-0 py-3 [scrollbar-width:thin]">
          {visibleItems.map((it, i) => renderNavRow(it, i))}
        </nav>

        <div className="mt-auto shrink-0 border-t border-[#1E2028] px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          <div ref={langRef} className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              className="group/lang flex h-11 w-full items-center rounded-lg text-[#52525B] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-[#A1A1AA]"
            >
              <span className="flex w-16 shrink-0 justify-center">
                <Globe className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="ms-3 max-w-0 translate-x-[-8px] overflow-hidden text-sm font-medium opacity-0 transition-[max-width,opacity,transform] duration-200 group-hover/sidebar:max-w-[120px] group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100 group-hover/sidebar:delay-[180ms]">
                {locale.toUpperCase()}
                <ChevronDown className="ms-1 inline h-4 w-4 opacity-60" aria-hidden />
              </span>
            </button>
            <div
              className={cn(
                "absolute bottom-[calc(100%+6px)] left-0 z-[130] min-w-[140px] rounded-[10px] border border-[#1E2028] bg-[#111215] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-[opacity,transform] duration-150 ease-out",
                langOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
              )}
            >
              {locales.map((code) => (
                <Link
                  key={code}
                  href={`/${code}${normalizedPath}${search}`}
                  onClick={() => setLangOpen(false)}
                  className={cn(
                    "block rounded-md px-3 py-2 text-[13px] text-[#A1A1AA] transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-white",
                    code === locale && "font-semibold text-white"
                  )}
                >
                  {code.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>

          {!loading && !user ? (
            <Link
              href={`/${locale}/login`}
              className="mt-2 flex h-11 w-full items-center rounded-lg text-[#52525B] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
            >
              <span className="flex w-16 shrink-0 justify-center">
                <User className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="ms-3 max-w-0 translate-x-[-8px] overflow-hidden text-sm font-medium opacity-0 transition-[max-width,opacity,transform] duration-200 group-hover/sidebar:max-w-[140px] group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100 group-hover/sidebar:delay-[180ms]">
                {dict.nav.login}
              </span>
            </Link>
          ) : null}

          {!loading && user ? (
            <div className="mt-3 flex w-full items-start gap-1">
              <div className="flex w-16 shrink-0 justify-center pt-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1E2028] bg-[#111215] text-xs font-semibold text-[#A1A1AA]">
                  {(displayName || user.email || "?").slice(0, 1).toUpperCase()}
                </div>
              </div>
              <div className="min-w-0 max-w-0 flex-1 overflow-hidden pt-0.5 opacity-0 transition-[max-width,opacity] duration-200 group-hover/sidebar:max-w-[200px] group-hover/sidebar:opacity-100 group-hover/sidebar:delay-[180ms]">
                <p className="truncate text-sm font-medium text-white">{displayName || user.email}</p>
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
        items={visibleItems}
        dict={dict}
        nav={nav}
        user={user}
        loading={loading}
        onSoon={() => {
          setSoonTip(SOON_MSG);
          window.setTimeout(() => setSoonTip(null), 3200);
        }}
      />
    </>
  );
}

function MobileNav({
  locale,
  items,
  dict,
  nav,
  user,
  loading,
  onSoon
}: {
  locale: Locale;
  items: ItemDef[];
  dict: ReturnType<typeof getDictionary>;
  nav: ReturnType<typeof getNavChromeCopy>;
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

  const normalizedPath = pathname.replace(/^\/(en|tr|ar|es|fr)/, "") || "";

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
      router.push(`/${locale}`);
      router.refresh();
    }
    setOpen(false);
  };

  if (!mounted) {
    return (
      <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-[rgba(9,9,11,0.92)] px-4 pt-[env(safe-area-inset-top,0px)] backdrop-blur-[20px] lg:hidden">
        <Logo variant="full" size="mobile" href={`/${locale}`} />
        <div className="h-10 w-10" aria-hidden />
      </header>
    );
  }

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-[rgba(9,9,11,0.92)] px-4 pt-[env(safe-area-inset-top,0px)] backdrop-blur-[20px] lg:hidden">
        <Logo variant="full" size="mobile" href={`/${locale}`} />
        <button
          type="button"
          aria-label={nav.menu}
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#1E2028] text-[#A1A1AA] transition-colors hover:text-white"
        >
          <Menu className="h-6 w-6" strokeWidth={1.75} />
        </button>
      </header>

      {open ? (
        <div
          className={cn(
            "tj-mobile-overlay fixed inset-0 z-[220] flex flex-col bg-[#09090B] lg:hidden",
            reduce && "tj-mobile-overlay--reduce"
          )}
        >
          <button
            type="button"
            aria-label={nav.close}
            onClick={() => setOpen(false)}
            className="absolute end-4 top-[max(1rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-lg border border-[#1E2028] text-[#A1A1AA] hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-20">
            <Logo variant="full" size="footer" href={`/${locale}`} onNavigate={() => setOpen(false)} />
            <nav className="mt-12 flex w-full max-w-sm flex-col gap-1" aria-label={nav.navigation}>
              {items.map((it, i) => {
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
                        "flex w-full items-center justify-center gap-2 py-3 text-2xl font-semibold text-[#52525B] transition-[opacity,transform] duration-[350ms] ease-out",
                        overlayReady || reduce ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                      )}
                      onClick={onSoon}
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
                      "flex w-full items-center justify-center gap-3 py-3 text-2xl font-semibold transition-[opacity,transform,color] duration-[350ms] ease-out",
                      active ? "text-white" : "text-[#A1A1AA] hover:text-white",
                      overlayReady || reduce ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                    )}
                  >
                    <Icon className="h-6 w-6 shrink-0" strokeWidth={1.5} />
                    {it.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {locales.map((code) => (
                <Link
                  key={code}
                  href={`/${code}${normalizedPath}${search}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-lg border border-[#1E2028] px-3 py-2 text-sm text-[#A1A1AA] hover:text-white",
                    code === locale && "border-[rgba(255,255,255,0.15)] font-semibold text-white"
                  )}
                >
                  {code.toUpperCase()}
                </Link>
              ))}
            </div>
            {!loading && user ? (
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="mt-8 text-sm text-[#52525B] hover:text-white"
              >
                {dict.nav.logout}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
