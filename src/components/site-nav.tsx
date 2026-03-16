"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Locale, getDictionary } from "@/lib/i18n";

const routeMap = {
  home: "",
  coaches: "/coaches",
  programs: "/programs",
  store: "/store",
  transformations: "/transformations",
  community: "/community",
  challenges: "/challenges",
  live: "/live",
  membership: "/membership",
  becomeCoach: "/become-a-coach",
  dashboard: "/dashboard",
  admin: "/admin",
  feedback: "/feedback"
} as const;

export function SiteNav({ locale }: { locale: Locale }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
      router.push(`/${locale}`);
      router.refresh();
    }
  };
  const dict = getDictionary(locale);

  const isAdmin = role === "admin";
  const isCoach = role === "coach";

  const publicLinks = [
    { key: "home", href: routeMap.home, label: dict.nav.home },
    { key: "store", href: routeMap.store, label: dict.nav.store }
  ];

  const coachLinks = [...publicLinks, { key: "dashboard", href: routeMap.dashboard, label: dict.nav.dashboard }];

  const adminLinks = [
    { key: "home", href: routeMap.home, label: dict.nav.home },
    { key: "coaches", href: routeMap.coaches, label: dict.nav.coaches },
    { key: "programs", href: routeMap.programs, label: dict.nav.programs },
    { key: "store", href: routeMap.store, label: dict.nav.store },
    { key: "transformations", href: routeMap.transformations, label: dict.nav.transformations },
    { key: "community", href: routeMap.community, label: dict.nav.community },
    { key: "challenges", href: routeMap.challenges, label: dict.nav.challenges },
    { key: "live", href: routeMap.live, label: dict.nav.live },
    { key: "membership", href: routeMap.membership, label: dict.nav.membership },
    { key: "becomeCoach", href: routeMap.becomeCoach, label: dict.nav.becomeCoach },
    { key: "dashboard", href: routeMap.dashboard, label: dict.nav.dashboard },
    { key: "admin", href: routeMap.admin, label: dict.nav.admin },
    { key: "feedback", href: routeMap.feedback, label: dict.nav.feedback }
  ];

  const links = isAdmin ? adminLinks : isCoach ? coachLinks : publicLinks;

  return (
    <>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-8">
          <Link
            href={`/${locale}`}
            className="shrink-0 font-display text-xl font-semibold tracking-tight text-white transition hover:text-zinc-200"
          >
            TJFit
          </Link>
          {!loading && (
            <nav className="hidden items-center gap-5 text-sm text-zinc-300 lg:flex">
              {links.map(({ key, href, label }) => (
                <Link
                  key={key}
                  href={`/${locale}${href}`}
                  className="whitespace-nowrap transition hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <LanguageSwitcher locale={locale} />
          {user ? (
            <>
              <Link
                href={`/${locale}/dashboard`}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/20 hover:bg-white/5"
              >
                {isAdmin ? dict.nav.admin : dict.nav.dashboard}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:border-white/20 hover:bg-white/5 hover:text-zinc-200"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/20 hover:bg-white/5"
            >
              {dict.nav.loginAsCoach}
            </Link>
          )}
        </div>
      </div>
      {!loading && links.length > 0 && (
        <div className="overflow-x-auto border-t border-white/5 lg:hidden">
          <div className="mx-auto flex max-w-7xl gap-3 px-4 py-3 text-sm text-zinc-300 sm:px-6">
            {links.map(({ key, href, label }) => (
              <Link
                key={key}
                href={`/${locale}${href}`}
                className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 transition hover:bg-white/5"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}