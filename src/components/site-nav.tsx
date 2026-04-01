"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { BrandLogo } from "@/components/brand-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Locale, getDictionary } from "@/lib/i18n";
import { getNavChromeCopy, getNavMenuSummaries } from "@/lib/launch-copy";
import { getSocialCopy } from "@/lib/social-copy";

const routeMap = {
  home: "",
  coaches: "/coaches",
  programs: "/programs",
  community: "/community",
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

export function SiteNav({ locale }: { locale: Locale }) {
  const { user, role, loading } = useAuth();
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
  const social = getSocialCopy(locale);

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
    { key: "membership", href: routeMap.membership, label: dict.nav.membership },
    { key: "support", href: routeMap.support, label: dict.nav.feedback }
  ];

  const loggedInSharedLinks = [
    ...publicLinks,
    { key: "progress", href: "/progress", label: dict.nav.progress }
  ];

  const userLinks = [
    ...loggedInSharedLinks,
    { key: "messages", href: "/messages", label: dict.nav.messages },
    { key: "profile", href: "/profile/edit", label: dict.nav.profile }
  ];

  const coachLinks = [
    ...loggedInSharedLinks,
    { key: "messages", href: "/messages", label: dict.nav.messages },
    { key: "profile", href: "/profile/edit", label: dict.nav.profile },
    { key: "dashboard", href: routeMap.dashboard, label: dict.nav.dashboard }
  ];

  const adminLinks = [
    ...publicLinks,
    { key: "progress", href: "/progress", label: dict.nav.progress },
    { key: "messages", href: "/messages", label: dict.nav.messages },
    { key: "profile", href: "/profile/edit", label: dict.nav.profile },
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
      row("peopleSearch", "/profile/search", social.peopleSearchTitle),
      row("threads", "/community?tab=threads", navCopy.threads),
      row("challenges", "/community?tab=challenges", dict.nav.challenges),
      row("transformations", "/community?tab=transformations", dict.nav.transformations)
    ];

    const featureOrder: { key: keyof typeof summaries; href: string; label: string }[] = [
      { key: "membership", href: routeMap.membership, label: dict.nav.membership },
      { key: "support", href: routeMap.support, label: dict.nav.feedback }
    ];

    const features: MenuRow[] = featureOrder
      .filter((f) => linkKeys.has(f.key))
      .map((f) => row(f.key, f.href, f.label));

    const accountOrder: { key: string; href: string; label: string; summaryKey: keyof typeof summaries }[] = [
      { key: "progress", href: "/progress", label: dict.nav.progress, summaryKey: "progress" },
      { key: "messages", href: "/messages", label: dict.nav.messages, summaryKey: "messages" },
      { key: "profile", href: "/profile/edit", label: dict.nav.profile, summaryKey: "profile" },
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
  }, [summaries, dict, navCopy, linkKeys, social]);

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
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={navCopy.navigation}
          className="nav-drawer-panel absolute inset-y-0 left-0 flex h-[100dvh] w-[min(100%,20rem)] max-w-[min(100vw,22rem)] flex-col border-r border-white/[0.06] bg-[#0A0A0B] sm:w-[min(100%,24rem)] lg:max-w-[720px] lg:w-1/2"
        >
          <div className="relative flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3.5 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <BrandLogo variant="mark" align="center" className="h-8 w-8 shrink-0" alt="" />
              <p className="font-display text-lg font-medium tracking-tight text-white">{navCopy.navigation}</p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-lg border border-white/[0.1] text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
              aria-label={navCopy.close}
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>

          <nav className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-2 pb-4 pt-2 sm:px-5 sm:pb-8 sm:pt-3" aria-label={navCopy.navigation}>
            <div className="space-y-0.5">
              {menuRows.map((item) => (
                <div key={`${item.key}-${item.href}`}>
                  <Link
                    href={`/${locale}${item.href}`}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex w-full min-w-0 flex-col gap-1 rounded-xl px-3 py-3.5 text-start transition sm:flex-row sm:items-start sm:justify-between sm:gap-4 ${
                      isActive(item.href)
                        ? "bg-white/[0.06] text-white"
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                    }`}
                  >
                    <span className="text-[15px] font-medium leading-snug">{item.label}</span>
                    <span className="text-[11px] leading-snug text-zinc-600 sm:max-w-[42%] sm:shrink-0 sm:text-end sm:text-[11px]">
                      {item.summary}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </nav>

          <div className="shrink-0 border-t border-white/[0.06] px-4 py-4 lg:hidden">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-600">{navCopy.language}</p>
            <LanguageSwitcher locale={locale} />
          </div>

          {!loading && user ? (
            <div className="shrink-0 border-t border-white/[0.06] px-4 py-3 lg:hidden">
              <button
                type="button"
                onClick={() => {
                  setSidebarOpen(false);
                  void handleLogout();
                }}
                className="touch-manipulation w-full rounded-xl border border-white/[0.08] py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
              >
                {dict.nav.logout}
              </button>
            </div>
          ) : null}
        </aside>
      </div>
    ) : null;

  return (
    <>
      <div className="mx-auto flex max-w-7xl min-w-0 items-center gap-2 px-3 py-3 sm:gap-3 sm:px-6 sm:py-4 lg:gap-5 lg:px-8">
        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-300 transition hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white lg:h-10 lg:w-auto lg:gap-2 lg:rounded-lg lg:px-3 lg:py-2"
            aria-label={navCopy.menu}
            aria-expanded={sidebarOpen}
          >
            <Menu className="h-[22px] w-[22px] text-cyan-300/90" strokeWidth={2} />
            <span className="hidden text-sm lg:inline">{navCopy.menu}</span>
          </button>
          <Link
            href={`/${locale}`}
            className="flex min-w-0 shrink-0 items-center gap-2.5 overflow-visible py-0.5 transition hover:opacity-95 lg:gap-0"
            aria-label="TJFit"
          >
            <BrandLogo variant="mark" className="h-8 w-8 shrink-0 lg:hidden" priority alt="" />
            <span className="font-display text-lg font-semibold tracking-tight text-white lg:hidden" aria-hidden>
              TJFit
            </span>
            <BrandLogo
              variant="full"
              className="hidden h-10 w-auto max-h-11 lg:block"
              priority
            />
          </Link>
        </div>

        <nav
          className="hidden min-w-0 flex-1 justify-center lg:flex"
          aria-label={navCopy.navigation}
        >
          <ul className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
            {desktopNav.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.key}>
                  <Link
                    href={`/${locale}${item.href}`}
                    className={`px-3 py-2 text-sm transition duration-200 ${
                      active ? "font-medium text-white" : "text-zinc-500 hover:text-zinc-200"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex min-w-0 shrink-0 items-center justify-end gap-1.5 sm:gap-2 lg:gap-3">
          <div className="hidden min-w-0 lg:block">
            <LanguageSwitcher locale={locale} />
          </div>
          {loading ? (
            <div
              className="hidden h-9 min-w-[10rem] shrink-0 animate-pulse rounded-full bg-white/10 sm:block"
              aria-hidden
            />
          ) : user ? (
            <>
              <Link
                href={`/${locale}/messages`}
                className="hidden rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-200 transition hover:border-cyan-400/25 hover:bg-white/[0.05] sm:inline-flex"
              >
                {dict.nav.messages}
              </Link>
              <Link
                href={`/${locale}/profile/edit`}
                className="hidden rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:text-white sm:inline-flex"
              >
                {dict.nav.profile}
              </Link>
              <Link
                href={`/${locale}/dashboard`}
                className="touch-manipulation rounded-lg border border-white/[0.1] px-3 py-2.5 text-sm text-zinc-300 transition hover:border-white/[0.14] hover:bg-white/[0.04] sm:px-4 sm:py-2"
              >
                {isAdmin ? dict.nav.admin : isCoach ? dict.nav.dashboard : dict.nav.progress}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden touch-manipulation rounded-lg px-4 py-2 text-sm text-zinc-500 transition hover:text-zinc-300 lg:inline-flex"
              >
                {dict.nav.logout}
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/${locale}/profile/search`}
                className="hidden rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:text-white sm:inline-flex"
              >
                {social.peopleSearchTitle}
              </Link>
              <Link
                href={`/${locale}/signup`}
                className="hidden rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-medium text-[#05080a] transition hover:bg-cyan-300 sm:inline-flex"
              >
                {navCopy.joinLabel}
              </Link>
              <Link
                href={`/${locale}/login`}
                className="touch-manipulation rounded-lg border border-white/[0.1] px-3 py-2.5 text-sm text-zinc-300 transition hover:border-white/[0.15] hover:bg-white/[0.04] sm:px-4"
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
