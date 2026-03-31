"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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

export function SiteNav({ locale }: { locale: Locale }) {
  const { user, role, hasActiveCoachChat, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

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
    setSearch(window.location.search);
  }, [pathname]);

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

  const links = isAdmin ? adminLinks : isCoach ? coachLinks : user ? userLinks : publicLinks;
  const linkKeys = useMemo(() => new Set(links.map((l) => l.key)), [links]);

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

  return (
    <>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
            aria-label={navCopy.menu}
          >
            {navCopy.menu}
          </button>
          <Link
            href={`/${locale}`}
            className="shrink-0 font-display text-xl font-semibold tracking-tight text-white transition hover:text-zinc-200"
          >
            TJFit
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-3">
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
            <Link
              href={`/${locale}/login`}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/20 hover:bg-white/5"
            >
              {navCopy.loginLabel}
            </Link>
          )}
        </div>
      </div>

      {!loading && sidebarOpen && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label={navCopy.closeSidebarOverlay}
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
          />
          <aside className="absolute inset-y-0 left-0 flex h-full w-[min(100vw,max(50vw,17.5rem))] flex-col border-r border-white/10 bg-[#07070c] shadow-2xl sm:w-1/2 sm:max-w-[50vw]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
              <p className="font-display text-xl text-white sm:text-2xl">{navCopy.navigation}</p>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-xl border border-white/15 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5"
              >
                {navCopy.close}
              </button>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-8" aria-label={navCopy.navigation}>
              <div className="space-y-1">
                {menuRows.map((item) => (
                  <Link
                    key={`${item.key}-${item.href}`}
                    href={`/${locale}${item.href}`}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex w-full items-start justify-between gap-6 rounded-2xl border border-transparent px-4 py-4 text-start transition sm:px-5 sm:py-5 ${
                      isActive(item.href)
                        ? "border-white/15 bg-white/10 text-white"
                        : "text-zinc-100 hover:border-white/10 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="text-base font-semibold leading-snug sm:text-lg">{item.label}</span>
                    <span className="max-w-[45%] shrink-0 text-end text-[11px] leading-snug text-zinc-500 sm:text-xs">
                      {item.summary}
                    </span>
                  </Link>
                ))}
              </div>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
