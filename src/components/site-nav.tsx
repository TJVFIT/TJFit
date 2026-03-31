"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Locale, getDictionary } from "@/lib/i18n";
import { getNavChromeCopy, getNavMenuSummaries } from "@/lib/launch-copy";

const routeMap = {
  home: "",
  coaches: "/coaches",
  ai: "/ai",
  programs: "/programs",
  community: "/community",
  live: "/live",
  membership: "/membership",
  dashboard: "/dashboard",
  admin: "/admin",
  support: "/support"
} as const;

type MenuRow = { key: string; href: string; label: string; summary: string };

const desktopNavItems = (dict: ReturnType<typeof getDictionary>) => [
  { key: "programs", href: routeMap.programs, label: dict.nav.programs },
  { key: "coaches", href: routeMap.coaches, label: dict.nav.coaches },
  { key: "community", href: routeMap.community, label: dict.nav.community },
  { key: "membership", href: routeMap.membership, label: dict.nav.membership }
];

export function SiteNav({ locale, elevated = false }: { locale: Locale; elevated?: boolean }) {
  const { user, role, hasActiveCoachChat, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
      router.push(`/${locale}`);
      router.refresh();
    }
  };
  const dict = getDictionary(locale);
  const navCopy = getNavChromeCopy(locale);
  const summaries = getNavMenuSummaries(locale);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSearch(window.location.search);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [sidebarOpen]);

  const isAdmin = role === "admin";
  const isCoach = role === "coach";

  const publicLinks: { key: string; href: string; label: string }[] = [
    { key: "home", href: routeMap.home, label: dict.nav.home },
    { key: "coaches", href: routeMap.coaches, label: dict.nav.coaches },
    { key: "programs", href: routeMap.programs, label: dict.nav.programs },
    { key: "community", href: routeMap.community, label: dict.nav.community },
    { key: "ai", href: routeMap.ai, label: navCopy.aiLabel },
    { key: "membership", href: routeMap.membership, label: dict.nav.membership },
    { key: "support", href: routeMap.support, label: dict.nav.feedback }
  ];

  const loggedInSharedLinks = [
    ...publicLinks,
    { key: "progress", href: "/progress", label: dict.nav.progress }
  ];

  const chatLabel =
    locale === "tr" ? "Sohbet" : locale === "ar" ? "الدردشة" : locale === "es" ? "Chat" : locale === "fr" ? "Chat" : "Chat";

  const userLinks = hasActiveCoachChat
    ? [...loggedInSharedLinks, { key: "chat", href: "/messages", label: chatLabel }]
    : loggedInSharedLinks;

  const coachLinks = [
    ...loggedInSharedLinks,
    { key: "messages", href: "/messages", label: dict.nav.messages },
    { key: "dashboard", href: routeMap.dashboard, label: dict.nav.dashboard }
  ];

  const adminLinks = [
    ...publicLinks,
    { key: "progress", href: "/progress", label: dict.nav.progress },
    { key: "messages", href: "/messages", label: dict.nav.messages },
    { key: "dashboard", href: routeMap.dashboard, label: dict.nav.dashboard },
    { key: "admin", href: routeMap.admin, label: dict.nav.admin }
  ];

  const linksForMenu = loading
    ? publicLinks
    : isAdmin
      ? adminLinks
      : isCoach
        ? coachLinks
        : user
          ? userLinks
          : publicLinks;

  const linkKeys = useMemo(() => new Set(linksForMenu.map((l) => l.key)), [linksForMenu]);

  const menuRows: MenuRow[] = useMemo(() => {
    const row = (key: keyof typeof summaries, href: string, label: string): MenuRow => ({
      key,
      href,
      label,
      summary: summaries[key]
    });

    const core: MenuRow[] = [
      row("blogs", "/community?tab=blogs", navCopy.blogs),
      row("home", routeMap.home, dict.nav.home),
      row("programs", routeMap.programs, dict.nav.programs),
      row("community", routeMap.community, dict.nav.community),
      row("coaches", routeMap.coaches, dict.nav.coaches),
      row("threads", "/community?tab=threads", navCopy.threads),
      row("challenges", "/community?tab=challenges", dict.nav.challenges),
      row("transformations", "/community?tab=transformations", dict.nav.transformations)
    ];

    const featureOrder: { key: keyof typeof summaries; href: string; label: string }[] = [
      { key: "ai", href: routeMap.ai, label: navCopy.aiLabel },
      { key: "membership", href: routeMap.membership, label: dict.nav.membership },
      { key: "live", href: routeMap.live, label: dict.nav.live },
      { key: "support", href: routeMap.support, label: dict.nav.feedback }
    ];

    const features: MenuRow[] = featureOrder
      .filter((f) => linkKeys.has(f.key))
      .map((f) => row(f.key, f.href, f.label));

    const accountOrder: { key: string; href: string; label: string; summaryKey: keyof typeof summaries }[] = [
      { key: "progress", href: "/progress", label: dict.nav.progress, summaryKey: "progress" },
      { key: "chat", href: "/messages", label: chatLabel, summaryKey: "chat" },
      { key: "messages", href: "/messages", label: dict.nav.messages, summaryKey: "messages" },
      { key: "dashboard", href: routeMap.dashboard, label: dict.nav.dashboard, summaryKey: "dashboard" },
      { key: "admin", href: routeMap.admin, label: dict.nav.admin, summaryKey: "admin" }
    ];

    const accounts: MenuRow[] = [];
    const seen = new Set<string>();
    for (const a of accountOrder) {
      if (!linkKeys.has(a.key) || seen.has(a.href)) continue;
      seen.add(a.href);
      accounts.push({
        key: a.key,
        href: a.href,
        label: a.label,
        summary: summaries[a.summaryKey]
      });
    }

    return [...core, ...features, ...accounts];
  }, [summaries, dict, navCopy, linkKeys, chatLabel]);

  const isActive = (href: string) => {
    const fullPath = `/${locale}${href}`;
    if (href.includes("?")) {
      const currentTab = new URLSearchParams(search).get("tab") ?? "blogs";
      const hrefTab = new URLSearchParams(href.split("?")[1] ?? "").get("tab") ?? "";
      if (!hrefTab) return false;
      return pathname === `/${locale}/community` && currentTab === hrefTab;
    }
    if (href === "") return pathname === `/${locale}`;
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  const desktopNav = desktopNavItems(dict);

  const drawer =
    mounted && sidebarOpen ? (
      <div className="fixed inset-0 z-[200]" style={{ isolation: "isolate" }}>
        <button
          type="button"
          aria-label={navCopy.closeSidebarOverlay}
          onClick={() => setSidebarOpen(false)}
          className="absolute inset-0 bg-[#0A0A0B]/55 backdrop-blur-md"
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={navCopy.navigation}
          className="nav-drawer-panel absolute inset-y-0 left-0 flex h-[100dvh] w-[min(100vw,max(50vw,18rem))] max-w-[720px] flex-col border-r border-white/[0.08] bg-gradient-to-b from-[#111215] via-[#0A0A0B] to-[#050506] shadow-[0_0_80px_-20px_rgba(34,211,238,0.28),inset_-1px_0_0_rgba(255,255,255,0.04)] sm:w-1/2"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/45 to-transparent" />
          <div className="relative flex items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-7">
            <div>
              <p className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {navCopy.navigation}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-zinc-500">TJFit</p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-zinc-200 transition hover:border-cyan-400/35 hover:bg-white/10 hover:text-white"
              aria-label={navCopy.close}
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>

          <nav className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-10 pt-2 sm:px-8" aria-label={navCopy.navigation}>
            <div className="space-y-1.5">
              {menuRows.map((item) => (
                <div key={`${item.key}-${item.href}`}>
                  <Link
                    href={`/${locale}${item.href}`}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex w-full items-start justify-between gap-5 rounded-2xl border px-4 py-4 text-start transition sm:rounded-3xl sm:px-5 sm:py-5 ${
                      isActive(item.href)
                        ? "border-cyan-400/35 bg-gradient-to-r from-cyan-500/12 to-transparent text-white shadow-[0_0_28px_-8px_rgba(34,211,238,0.35)]"
                        : "border-transparent text-zinc-100 hover:border-white/10 hover:bg-white/[0.05]"
                    }`}
                  >
                    <span className="text-base font-semibold leading-snug sm:text-lg">{item.label}</span>
                    <span className="max-w-[46%] shrink-0 text-end text-[11px] leading-snug text-zinc-500 transition group-hover:text-zinc-400 sm:text-xs">
                      {item.summary}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </nav>
        </aside>
      </div>
    ) : null;

  return (
    <>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3.5 sm:px-6 lg:gap-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className={`flex items-center gap-2 rounded-xl border bg-white/[0.06] px-3 py-2 text-sm text-zinc-200 shadow-sm transition hover:bg-white/10 hover:text-white ${
              elevated
                ? "border-white/[0.12] hover:border-cyan-400/35 hover:shadow-[0_0_24px_-10px_rgba(34,211,238,0.22)]"
                : "border-white/15 hover:border-cyan-400/30 hover:shadow-[0_0_24px_-10px_rgba(34,211,238,0.25)]"
            }`}
            aria-label={navCopy.menu}
            aria-expanded={sidebarOpen}
          >
            <Menu className="h-4 w-4 text-cyan-300/90" strokeWidth={2} />
            <span className="hidden sm:inline">{navCopy.menu}</span>
          </button>
          <Link
            href={`/${locale}`}
            className={`shrink-0 bg-gradient-to-r from-white to-zinc-300 bg-clip-text font-display text-xl font-semibold tracking-tight text-transparent transition hover:from-cyan-100 hover:to-zinc-200 ${
              elevated ? "drop-shadow-[0_0_20px_rgba(34,211,238,0.12)]" : ""
            }`}
          >
            TJFit
          </Link>
        </div>

        <nav
          className="hidden min-w-0 flex-1 justify-center lg:flex"
          aria-label={navCopy.navigation}
        >
          <ul className="flex flex-wrap items-center justify-center gap-0.5">
            {desktopNav.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.key}>
                  <Link
                    href={`/${locale}${item.href}`}
                    className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                      active
                        ? "text-white shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)]"
                        : "text-zinc-500 hover:text-zinc-200"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher locale={locale} />
          {user ? (
            <>
              <Link
                href={`/${locale}/dashboard`}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/20 hover:bg-white/5"
              >
                {isAdmin ? dict.nav.admin : isCoach ? dict.nav.dashboard : dict.nav.progress}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:border-white/20 hover:bg-white/5 hover:text-zinc-200"
              >
                {dict.nav.logout}
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/${locale}/signup`}
                className="hidden rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 text-sm font-semibold text-[#05080a] shadow-[0_0_24px_-8px_rgba(34,211,238,0.35)] transition hover:opacity-95 sm:inline-flex"
              >
                {navCopy.joinLabel}
              </Link>
              <Link
                href={`/${locale}/login`}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/20 hover:bg-white/5"
              >
                {navCopy.loginLabel}
              </Link>
            </>
          )}
        </div>
      </div>

      {drawer ? createPortal(drawer, document.body) : null}
    </>
  );
}
