"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Crown,
  Dumbbell,
  Globe2,
  Home,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  MessageSquare,
  Search,
  Shield,
  Sparkles,
  Trophy,
  TrendingUp,
  UtensilsCrossed,
  User,
  Users,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Locale, getDictionary, getDirection } from "@/lib/i18n";
import { getNavChromeCopy, getNavMenuSummaries } from "@/lib/launch-copy";
import { getSocialCopy } from "@/lib/social-copy";
import { cn } from "@/lib/utils";

const routeMap = {
  home: "",
  coaches: "/coaches",
  programs: "/programs",
  diets: "/diets",
  community: "/community",
  membership: "/membership",
  dashboard: "/dashboard",
  admin: "/admin",
  support: "/support"
} as const;

type NavDrawerItem = {
  key: string;
  href: string;
  label: string;
  summary: string;
  Icon: LucideIcon;
};

type NavDrawerSection = { id: string; title: string; items: NavDrawerItem[] };

const DRAWER_ICONS: Record<string, LucideIcon> = {
  home: Home,
  start: Sparkles,
  startFree: Sparkles,
  legal: LifeBuoy,
  legalCenter: LifeBuoy,
  programs: Dumbbell,
  diets: UtensilsCrossed,
  coaches: Users,
  community: Globe2,
  blogs: BookOpen,
  threads: MessageSquare,
  challenges: Trophy,
  transformations: Sparkles,
  peopleSearch: Search,
  membership: Crown,
  support: LifeBuoy,
  progress: TrendingUp,
  messages: Inbox,
  profile: User,
  dashboard: LayoutDashboard,
  admin: Shield
};

function drawerIcon(mapKey: string): LucideIcon {
  return DRAWER_ICONS[mapKey] ?? Globe2;
}

const desktopNavItems = (dict: ReturnType<typeof getDictionary>, nav: ReturnType<typeof getNavChromeCopy>) => [
  { key: "start", href: "/start", label: nav.startFreeLabel },
  { key: "programs", href: routeMap.programs, label: dict.nav.programs },
  { key: "diets", href: routeMap.diets, label: dict.nav.diets },
  { key: "coaches", href: routeMap.coaches, label: dict.nav.coaches },
  { key: "community", href: routeMap.community, label: dict.nav.community },
  { key: "membership", href: routeMap.membership, label: dict.nav.membership },
  { key: "legal", href: "/legal", label: nav.legalCenterLabel }
];

export function SiteNav({ locale }: { locale: Locale }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const reduceDrawerMotion = useReducedMotion();
  const direction = getDirection(locale);
  const isRtl = direction === "rtl";

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
    { key: "start", href: "/start", label: navCopy.startFreeLabel },
    { key: "home", href: routeMap.home, label: dict.nav.home },
    { key: "programs", href: routeMap.programs, label: dict.nav.programs },
    { key: "diets", href: routeMap.diets, label: dict.nav.diets },
    { key: "coaches", href: routeMap.coaches, label: dict.nav.coaches },
    { key: "community", href: routeMap.community, label: dict.nav.community },
    { key: "membership", href: routeMap.membership, label: dict.nav.membership },
    { key: "legal", href: "/legal", label: navCopy.legalCenterLabel },
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

  const navSections: NavDrawerSection[] = useMemo(() => {
    const item = (id: string, summaryKey: keyof typeof summaries, href: string, label: string): NavDrawerItem => ({
      key: id,
      href,
      label,
      summary: summaries[summaryKey],
      Icon: drawerIcon(String(summaryKey))
    });

    const explore: NavDrawerItem[] = [];
    if (linkKeys.has("home")) explore.push(item("home", "home", routeMap.home, dict.nav.home));
    if (linkKeys.has("start")) explore.push(item("start", "startFree", "/start", navCopy.startFreeLabel));
    if (linkKeys.has("programs")) explore.push(item("programs", "programs", routeMap.programs, dict.nav.programs));
    if (linkKeys.has("diets")) explore.push(item("diets", "diets", routeMap.diets, dict.nav.diets));
    if (linkKeys.has("coaches")) explore.push(item("coaches", "coaches", routeMap.coaches, dict.nav.coaches));
    if (linkKeys.has("membership")) explore.push(item("membership", "membership", routeMap.membership, dict.nav.membership));
    if (linkKeys.has("support")) explore.push(item("support", "support", routeMap.support, dict.nav.feedback));
    if (linkKeys.has("legal")) explore.push(item("legal", "legalCenter", "/legal", navCopy.legalCenterLabel));

    const communityItems: NavDrawerItem[] = [
      item("blogs", "blogs", "/community?tab=blogs", navCopy.blogs),
      item("community-hub", "community", routeMap.community, dict.nav.community),
      item("threads", "threads", "/community?tab=threads", navCopy.threads),
      item("challenges", "challenges", "/community?tab=challenges", dict.nav.challenges),
      item("transformations", "transformations", "/community?tab=transformations", dict.nav.transformations),
      item("peopleSearch", "peopleSearch", "/profile/search", social.peopleSearchTitle)
    ];

    const accountOrder: { id: string; linkKey: string; summaryKey: keyof typeof summaries; href: string; label: string }[] = [
      { id: "progress", linkKey: "progress", summaryKey: "progress", href: "/progress", label: dict.nav.progress },
      { id: "messages", linkKey: "messages", summaryKey: "messages", href: "/messages", label: dict.nav.messages },
      { id: "profile", linkKey: "profile", summaryKey: "profile", href: "/profile/edit", label: dict.nav.profile },
      { id: "dashboard", linkKey: "dashboard", summaryKey: "dashboard", href: routeMap.dashboard, label: dict.nav.dashboard },
      { id: "admin", linkKey: "admin", summaryKey: "admin", href: routeMap.admin, label: dict.nav.admin }
    ];

    const account: NavDrawerItem[] = [];
    const seenHref = new Set<string>();
    for (const a of accountOrder) {
      if (!linkKeys.has(a.linkKey) || seenHref.has(a.href)) continue;
      seenHref.add(a.href);
      account.push(item(a.id, a.summaryKey, a.href, a.label));
    }

    const sections: NavDrawerSection[] = [
      { id: "explore", title: navCopy.explore, items: explore },
      { id: "community", title: navCopy.community, items: communityItems },
      { id: "account", title: navCopy.account, items: account }
    ];

    return sections.filter((s) => s.items.length > 0);
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

  const desktopNav = desktopNavItems(dict, navCopy);

  const drawerTransition = reduceDrawerMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: [0.32, 0.72, 0, 1] as const };

  const drawer =
    mounted ? (
      <AnimatePresence>
        {sidebarOpen ? (
          <motion.button
            type="button"
            key="site-nav-drawer-overlay"
            aria-label={navCopy.closeSidebarOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceDrawerMotion ? { duration: 0 } : { duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-[200] bg-[#030304]/72 backdrop-blur-md backdrop-saturate-150"
            style={{ isolation: "isolate" }}
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}
        {sidebarOpen ? (
            <motion.aside
              key="site-nav-drawer-panel"
              role="dialog"
              aria-modal="true"
              aria-label={navCopy.navigation}
              dir={direction}
              initial={{ x: isRtl ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "100%" : "-100%" }}
              transition={drawerTransition}
              className={cn(
                "nav-drawer-panel fixed inset-y-0 z-[201] flex h-[100dvh] w-[min(100%,23.5rem)] max-w-[min(100vw,26rem)] flex-col overflow-hidden shadow-[16px_0_64px_-20px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:w-[min(100%,27rem)] lg:max-w-[min(100vw,28rem)]",
                "bg-gradient-to-b from-[#141518] via-[#0c0c0e] to-[#080809] backdrop-blur-2xl backdrop-saturate-150",
                isRtl
                  ? "end-0 border-s border-white/[0.09] ps-[max(0.75rem,env(safe-area-inset-left,0px))] pe-[env(safe-area-inset-right,0px)]"
                  : "start-0 border-e border-white/[0.09] ps-[env(safe-area-inset-left,0px)] pe-[max(0.75rem,env(safe-area-inset-right,0px))]"
              )}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_0%_-10%,rgba(34,211,238,0.09),transparent_55%)] opacity-90" aria-hidden />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" aria-hidden />

              <div className="relative border-b border-white/[0.07] px-5 pb-6 pt-6 sm:px-6 sm:pb-7">
                <motion.button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  whileTap={reduceDrawerMotion ? undefined : { scale: 0.94 }}
                  className="absolute end-4 top-6 z-10 flex h-12 w-12 touch-manipulation items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06] text-zinc-300 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_10px_36px_-14px_rgba(0,0,0,0.65)] transition-colors hover:border-cyan-400/30 hover:bg-white/[0.1] hover:text-white sm:end-5 sm:top-6"
                  aria-label={navCopy.close}
                >
                  <X className="h-[22px] w-[22px]" strokeWidth={1.75} />
                </motion.button>
                <div className="flex justify-center pe-14">
                  <Logo
                    variant="icon"
                    size="mobile"
                    href={`/${locale}`}
                    alt="TJFit"
                    onNavigate={() => setSidebarOpen(false)}
                  />
                </div>
                <p className="mt-3 text-center font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                  {navCopy.navigation}
                </p>
              </div>

              <nav
                className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pb-4 pt-2 sm:px-5"
                aria-label={navCopy.navigation}
              >
                {navSections.map((section, sIdx) => (
                  <div key={section.id} className={cn(sIdx > 0 && "mt-10 border-t border-white/[0.05] pt-10")}>
                    <h2 className="mb-3 px-1 font-display text-[10px] font-semibold uppercase tracking-[0.26em] text-zinc-600">
                      {section.title}
                    </h2>
                    <ul className="space-y-1.5" role="list">
                      {section.items.map((item, iIdx) => {
                        const globalIdx =
                          navSections.slice(0, sIdx).reduce((acc, s) => acc + s.items.length, 0) + iIdx;
                        const active = isActive(item.href);
                        const Icon = item.Icon;
                        return (
                          <motion.li
                            key={`${item.key}-${item.href}`}
                            initial={reduceDrawerMotion ? false : { opacity: 0, x: isRtl ? 14 : -14 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              ...drawerTransition,
                              delay: reduceDrawerMotion ? 0 : Math.min(globalIdx * 0.028, 0.32)
                            }}
                          >
                            <Link
                              href={`/${locale}${item.href}`}
                              onClick={() => setSidebarOpen(false)}
                              className={cn(
                                "group relative flex min-h-[3.75rem] w-full items-center gap-3.5 rounded-2xl px-3 py-3 text-start transition duration-200",
                                "hover:bg-white/[0.05]",
                                active &&
                                  "bg-gradient-to-r from-cyan-500/[0.14] via-cyan-500/[0.06] to-transparent shadow-[inset_0_0_0_1px_rgba(34,211,238,0.18)]"
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition duration-200",
                                  active
                                    ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-200"
                                    : "border-white/[0.08] bg-white/[0.04] text-zinc-500 group-hover:border-white/[0.14] group-hover:bg-white/[0.06] group-hover:text-zinc-300"
                                )}
                              >
                                <Icon className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center justify-between gap-2">
                                  <span
                                    className={cn(
                                      "font-display text-[15px] font-semibold leading-snug tracking-tight sm:text-[15px]",
                                      active ? "text-white" : "text-zinc-100 group-hover:text-white"
                                    )}
                                  >
                                    {item.label}
                                  </span>
                                  <ChevronRight
                                    className={cn(
                                      "h-4 w-4 shrink-0 text-zinc-600 transition duration-200 rtl:rotate-180",
                                      active ? "text-cyan-300/90 opacity-100" : "opacity-0 group-hover:opacity-100 group-hover:text-zinc-400"
                                    )}
                                    aria-hidden
                                  />
                                </span>
                                <span className="mt-0.5 block text-[12px] leading-snug text-zinc-500 transition group-hover:text-zinc-400">
                                  {item.summary}
                                </span>
                              </span>
                            </Link>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </nav>

              <div className="relative shrink-0 border-t border-white/[0.07] bg-black/25 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] backdrop-blur-sm lg:hidden">
                <p className="mb-3 font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">
                  {navCopy.language}
                </p>
                <LanguageSwitcher locale={locale} className="max-w-full" />
              </div>

              {!loading && user ? (
                <div className="shrink-0 border-t border-white/[0.06] bg-black/20 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] lg:hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setSidebarOpen(false);
                      void handleLogout();
                    }}
                    className="touch-manipulation w-full rounded-2xl border border-white/[0.1] py-3.5 text-sm font-medium text-zinc-400 transition hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-zinc-200"
                  >
                    {dict.nav.logout}
                  </button>
                </div>
              ) : null}
            </motion.aside>
        ) : null}
      </AnimatePresence>
    ) : null;

  return (
    <>
      <div className="mx-auto flex h-14 max-w-7xl min-w-0 items-center px-4 sm:h-16 sm:px-6">
        <Logo variant="icon" size="navbar" href={`/${locale}`} priority />
        <nav
          className="ml-8 hidden min-w-0 flex-1 justify-center lg:flex"
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

        <button
          type="button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="ml-3 flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-300 transition hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white lg:ml-4 lg:h-10 lg:w-auto lg:gap-2 lg:rounded-lg lg:px-3 lg:py-2"
          aria-label={navCopy.menu}
          aria-expanded={sidebarOpen}
        >
          <Menu className="h-[22px] w-[22px] text-cyan-300/90" strokeWidth={2} />
          <span className="hidden text-sm lg:inline">{navCopy.menu}</span>
        </button>

        <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-x-1.5 gap-y-2 sm:flex-nowrap sm:gap-2 lg:gap-3">
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
                className="touch-manipulation max-w-full min-w-0 rounded-lg border border-white/[0.1] px-2.5 py-2.5 text-center text-xs leading-tight text-zinc-300 transition hover:border-white/[0.15] hover:bg-white/[0.04] sm:px-4 sm:text-sm sm:leading-normal"
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
