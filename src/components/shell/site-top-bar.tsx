"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/ui/Logo";
import type { Locale } from "@/lib/i18n";
import { PUBLIC_COPY, publicPrimaryLinks } from "@/lib/public-offers-copy";
import { cn } from "@/lib/utils";

export function SiteTopBar({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? `/${locale}`;
  const { user } = useAuth();
  const c = PUBLIC_COPY[locale];
  const links = publicPrimaryLinks(locale);
  const accountHref = user ? `/${locale}/dashboard` : `/${locale}/login?redirect=${encodeURIComponent(pathname)}`;
  function renderLinks() {
    return links.map((item) => {
      const active = pathname === item.href || pathname.startsWith(`${item.href}/`) || (item.key === "tjai" && pathname.startsWith(`/${locale}/ai`));
      return <Link key={item.key} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center justify-center border-b-2 px-3 text-center text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300", active ? "border-violet-300 text-violet-100" : "border-transparent text-[#c4bccd] hover:border-white/20 hover:text-white")}>{item.label}</Link>;
    });
  }
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#0c0b0f]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 pe-4 ps-16 sm:pe-6 sm:ps-20">
        <Link href={`/${locale}`} aria-label={`TJFit · ${c.home}`} className="shrink-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"><Logo variant="full" size="mobile" linked={false} /></Link>
        <nav aria-label={c.navigation} className="mx-auto hidden items-center gap-3 lg:flex">{renderLinks()}</nav>
        <div className="ms-auto flex items-center gap-2 lg:ms-0">
          <LanguageSwitcher locale={locale} />
          <Link href={accountHref} aria-label={user ? c.account : c.signIn} className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-white/15 px-3 text-sm text-[#e8e1ee] transition-colors hover:border-violet-300/50 hover:bg-violet-300/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"><UserRound className="h-4 w-4" aria-hidden /><span className="hidden xl:inline">{user ? c.account : c.signIn}</span></Link>
        </div>
      </div>
      <nav aria-label={c.navigation} className="grid h-12 grid-cols-3 border-t border-white/[0.06] px-3 lg:hidden">{renderLinks()}</nav>
    </header>
  );
}
