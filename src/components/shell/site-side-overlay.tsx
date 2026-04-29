"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { Activity, ChevronRight, Command, Search, X } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Logo } from "@/components/ui/Logo";
import { getNavChromeCopy } from "@/lib/launch-copy";
import { buildShellOverlayNav } from "@/lib/shell-overlay-nav";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Locale, SupportedLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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

const SHEET_MS = 240;
const PREMIUM = "cubic-bezier(0.2, 0.8, 0.2, 1)";

/** Focus containment for sheet (no deps). Returns cleanup. */
function trapFocus(panel: HTMLElement) {
  const focusableSelectors =
    'a[href]:not([tabindex="-1"]), button:not([disabled]), [tabindex="0"]:not([aria-hidden="true"])';
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const focusables = [...panel.querySelectorAll<HTMLElement>(focusableSelectors)].filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first || !panel.contains(document.activeElement)) {
        e.preventDefault();
        last.focus();
      }
      return;
    }
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  panel.addEventListener("keydown", onKeyDown);
  const first = panel.querySelector<HTMLElement>(focusableSelectors);
  requestAnimationFrame(() => first?.focus());
  return () => {
    panel.removeEventListener("keydown", onKeyDown);
    if (previous && document.body.contains(previous)) {
      try {
        previous.focus({ preventScroll: true });
      } catch {
        /* ignore */
      }
    }
  };
}

export function SiteSideOverlay({
  locale,
  routingLocale,
  open,
  onOpenChange
}: {
  locale: Locale;
  routingLocale: SupportedLocale;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const { user, role } = useAuth();
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const { groups: built, command } = buildShellOverlayNav(locale, routingLocale);
  const filteredGroups = built
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.adminOnly && role !== "admin") return false;
        if (item.coachOnly && role !== "coach" && role !== "admin") return false;
        if (item.authOnly && !user) return false;
        return true;
      })
    }))
    .filter((group) => group.items.length > 0);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    return trapFocus(panel);
  }, [open]);

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
    close();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    close();
    router.replace(`/${routingLocale}`);
    router.refresh();
  };

  const closeLabel = CLOSE_LABEL[locale] ?? CLOSE_LABEL.en;
  const navChrome = getNavChromeCopy(locale);

  return (
    <div
      id="site-side-overlay"
      className={cn(
        "fixed inset-0 z-[60] transition-opacity motion-reduce:transition-none",
        open ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      style={{ transitionDuration: `${SHEET_MS}ms`, transitionTimingFunction: PREMIUM }}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-label={navChrome.navigation}
    >
      <button
        type="button"
        aria-label={closeLabel}
        onClick={close}
        className={cn(
          "absolute inset-0 cursor-default transition-[backdrop-filter,background-color]",
          open ? "bg-[rgba(8,8,10,0.58)] backdrop-blur-[12px]" : "backdrop-blur-0 bg-transparent"
        )}
        tabIndex={-1}
        style={{
          transitionDuration: `${SHEET_MS}ms`,
          transitionTimingFunction: PREMIUM
        }}
      />
      <div
        ref={panelRef}
        className={cn(
          "tj-side-panel absolute inset-y-0 start-0 flex w-full max-w-[860px] flex-col overflow-hidden border-e border-white/[0.08]",
          "bg-[rgba(8,8,10,0.96)] shadow-[28px_0_80px_rgba(0,0,0,0.62)] backdrop-blur-2xl",
          "motion-reduce:transition-none",
          "[transition-property:transform,scale]",
          open ? "pointer-events-auto translate-x-0 scale-100" : "-translate-x-full scale-[0.98]"
        )}
        style={{
          transitionDuration: `${SHEET_MS}ms`,
          transitionTimingFunction: PREMIUM
        }}
        onTouchEnd={(ev) => {
          if (!open || !touchStart.current) return;
          const dx = ev.changedTouches[0].clientX - touchStart.current.x;
          const dy = Math.abs(ev.changedTouches[0].clientY - touchStart.current.y);
          touchStart.current = null;
          if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) return;
          if (dx < -88 && Math.abs(dx) > dy) close();
        }}
        onTouchStart={(ev) => {
          touchStart.current = { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-80" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_44%_at_20%_0%,rgba(34,211,238,0.12),transparent_62%),radial-gradient(ellipse_52%_36%_at_92%_80%,rgba(14,165,233,0.05),transparent_64%)]" />
          <div className="absolute inset-0 tj-side-grid" />
        </div>

        <div className="relative z-[1] flex items-start justify-between px-6 pt-6 sm:px-8">
          <div>
            <Link
              href={`/${routingLocale}`}
              onClick={close}
              className="inline-block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Logo variant="full" size="navbar" linked={false} />
            </Link>
            <div className="mt-6 max-w-sm text-start">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
                <Command className="h-3.5 w-3.5" aria-hidden />
                {command.kicker}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{command.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={closeLabel}
            className="inline-flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors duration-150 hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.04)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="relative z-[1] mx-6 mt-8 grid gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3 sm:mx-8 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex items-center gap-3 rounded-xl bg-black/20 px-3 py-3" aria-hidden>
            <Search className="h-4 w-4 text-accent" aria-hidden />
            <span className="text-sm text-[var(--color-text-secondary)]">{command.hint}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-3 py-3 text-xs text-[var(--color-text-muted)]" aria-hidden>
            <Activity className="h-4 w-4 text-accent" />
            {command.ready}
          </div>
        </div>

        <div className="relative z-[1] grid flex-1 gap-4 overflow-y-auto px-6 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {filteredGroups.map((group, groupIndex) => (
            <section
              key={group.title}
              className="tj-side-group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]"
              style={{
                animationDelay: open ? `${groupIndex * 45}ms` : "0ms"
              }}
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
                          "group/link inline-flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 py-2 text-[15px] transition-[background-color,color,transform,box-shadow] duration-150 motion-reduce:transform-none",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset",
                          active
                            ? "bg-accent/12 text-accent shadow-[inset_0_0_0_1px_rgba(34,211,238,0.24),0_10px_24px_rgba(34,211,238,0.08)]"
                            : "text-[var(--color-text-secondary)] hover:translate-x-1 hover:bg-[rgba(255,255,255,0.055)] hover:text-white"
                        )}
                      >
                        <span>{item.label}</span>
                        <ChevronRight
                          className="h-3.5 w-3.5 opacity-35 transition-opacity group-hover/link:opacity-80"
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
          <div className="relative z-[1] border-t border-white/[0.08] px-6 py-5 sm:px-8">
            <button
              type="button"
              onClick={signOut}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-secondary)] transition-colors duration-150 hover:border-[rgba(239,68,68,0.4)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {SIGN_OUT_LABEL[locale] ?? SIGN_OUT_LABEL.en}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
