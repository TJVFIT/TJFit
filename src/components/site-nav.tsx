"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Locale, getDictionary } from "@/lib/i18n";
import { getNavChromeCopy } from "@/lib/launch-copy";

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
  const exploreLinks = useMemo(
    () =>
      links.filter(
        (item) =>
          item.key === "home" ||
          item.key === "programs" ||
          item.key === "community" ||
          item.key === "coaches"
      ),
    [links]
  );
  const communityLinks = [
    { key: "community-threads", href: "/community?tab=threads", label: navCopy.threads },
    { key: "community-challenges", href: "/community?tab=challenges", label: dict.nav.challenges },
    { key: "community-transformations", href: "/community?tab=transformations", label: dict.nav.transformations },
    { key: "community-blogs", href: "/community?tab=blogs", label: navCopy.blogs }
  ];
  const accountLinks = links.filter(
    (item) =>
      !exploreLinks.some((entry) => entry.key === item.key) &&
      item.key !== "ai" &&
      item.key !== "membership" &&
      item.key !== "support"
  );
  const featureLinks = links.filter(
    (item) => item.key === "ai" || item.key === "membership" || item.key === "support" || item.key === "live"
  );

  const isActive = (href: string) => {
    const fullPath = `/${locale}${href}`;
    if (href.includes("?")) {
      const currentTab = new URLSearchParams(search).get("tab") ?? "threads";
      const hrefTab = new URLSearchParams(href.split("?")[1] ?? "").get("tab") ?? "threads";
      return pathname === `/${locale}/community` && currentTab === hrefTab;
    }
    if (href === "") return pathname === `/${locale}`;
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  const SidebarLinks = ({
    title,
    items
  }: {
    title: string;
    items: { key: string; href: string; label: string }[];
  }) => (
    <section>
      <p className="px-2 text-[11px] uppercase tracking-[0.22em] text-zinc-500">{title}</p>
      <div className="mt-2 space-y-1">
        {items.map((item) => (
          <Link
            key={item.key}
            href={`/${locale}${item.href}`}
            onClick={() => setSidebarOpen(false)}
            className={`block rounded-xl px-3 py-2 text-sm transition ${
              isActive(item.href)
                ? "bg-white/12 text-white"
                : "text-zinc-300 hover:bg-white/8 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );

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
            className="absolute inset-0 bg-black/60"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[86vw] max-w-sm flex-col border-r border-white/10 bg-[#0B0B0F] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg text-white">{navCopy.navigation}</p>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg border border-white/15 px-2 py-1 text-xs text-zinc-300 hover:bg-white/5"
              >
                {navCopy.close}
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pb-10 pr-1">
              <SidebarLinks title={navCopy.explore} items={exploreLinks} />
              <SidebarLinks title={navCopy.community} items={communityLinks} />
              {featureLinks.length > 0 ? <SidebarLinks title={navCopy.features} items={featureLinks} /> : null}
              {accountLinks.length > 0 ? <SidebarLinks title={navCopy.account} items={accountLinks} /> : null}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}