import Link from "next/link";
import { ReactNode } from "react";

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

export function SiteShell({
  locale,
  children
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href={`/${locale}`} className="font-display text-xl font-semibold tracking-tight">
              TJFit
            </Link>
            <nav className="hidden items-center gap-5 text-sm text-zinc-300 lg:flex">
              <Link href={`/${locale}${routeMap.home}`}>{dict.nav.home}</Link>
              <Link href={`/${locale}${routeMap.coaches}`}>{dict.nav.coaches}</Link>
              <Link href={`/${locale}${routeMap.programs}`}>{dict.nav.programs}</Link>
              <Link href={`/${locale}${routeMap.store}`}>{dict.nav.store}</Link>
              <Link href={`/${locale}${routeMap.transformations}`}>{dict.nav.transformations}</Link>
              <Link href={`/${locale}${routeMap.community}`}>{dict.nav.community}</Link>
              <Link href={`/${locale}${routeMap.challenges}`}>{dict.nav.challenges}</Link>
              <Link href={`/${locale}${routeMap.live}`}>{dict.nav.live}</Link>
              <Link href={`/${locale}${routeMap.membership}`}>{dict.nav.membership}</Link>
              <Link href={`/${locale}${routeMap.becomeCoach}`}>{dict.nav.becomeCoach}</Link>
              <Link href={`/${locale}${routeMap.dashboard}`}>{dict.nav.dashboard}</Link>
              <Link href={`/${locale}${routeMap.admin}`}>{dict.nav.admin}</Link>
              <Link href={`/${locale}${routeMap.feedback}`}>{dict.nav.feedback}</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={locale} />
            <Link
              href={`/${locale}/login`}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/20 hover:bg-white/5"
            >
              {dict.nav.loginAsCoach}
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto border-t border-white/5 lg:hidden">
          <div className="mx-auto flex max-w-7xl gap-3 px-4 py-3 text-sm text-zinc-300 sm:px-6">
            <Link href={`/${locale}/coaches`} className="rounded-full border border-white/10 px-3 py-1.5">
              {dict.nav.coaches}
            </Link>
            <Link href={`/${locale}/transformations`} className="rounded-full border border-white/10 px-3 py-1.5">
              {dict.nav.transformations}
            </Link>
            <Link href={`/${locale}/community`} className="rounded-full border border-white/10 px-3 py-1.5">
              {dict.nav.community}
            </Link>
            <Link href={`/${locale}/challenges`} className="rounded-full border border-white/10 px-3 py-1.5">
              {dict.nav.challenges}
            </Link>
            <Link href={`/${locale}/live`} className="rounded-full border border-white/10 px-3 py-1.5">
              {dict.nav.live}
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/10 bg-black/40">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-zinc-400 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <p className="font-display text-lg font-semibold text-white">TJFit</p>
            <p className="mt-3 max-w-sm">
              Premium online coaching platform for fitness, performance, recovery, and multilingual support.
            </p>
          </div>
          <div>
            <p className="font-medium text-white">Platform</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link href={`/${locale}/coaches`}>Find a Coach</Link>
              <Link href={`/${locale}/programs`}>Programs Marketplace</Link>
              <Link href={`/${locale}/store`}>Equipment Store</Link>
              <Link href={`/${locale}/transformations`}>Transformations</Link>
            </div>
          </div>
          <div>
            <p className="font-medium text-white">Operations</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link href={`/${locale}/community`}>Community Feed</Link>
              <Link href={`/${locale}/challenges`}>Challenges</Link>
              <Link href={`/${locale}/live`}>Live Sessions</Link>
              <Link href={`/${locale}/feedback`}>Feedback & Support</Link>
              <Link href={`/${locale}/coach-dashboard`}>Coach Dashboard</Link>
              <Link href={`/${locale}/admin`}>Admin Panel</Link>
              <Link href={`/${locale}/checkout`}>PayTR Checkout</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
