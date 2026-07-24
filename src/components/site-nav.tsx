"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Dumbbell,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  X
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const routes = [
  { key: "programs", href: "/programs" },
  { key: "ai", href: "/ai" },
  { key: "community", href: "/community" },
  { key: "coaches", href: "/coaches" },
  { key: "membership", href: "/membership" }
] as const;

export function SiteNav({ locale }: { locale: Locale }) {
  const { user, role } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const dict = getDictionary(locale);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const labelFor = (key: (typeof routes)[number]["key"]) => {
    if (key === "ai") return "TJAI";
    return dict.nav[key];
  };

  const isActive = (href: string) =>
    pathname === `/${locale}${href}` || pathname.startsWith(`/${locale}${href}/`);

  const logout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signOut();
    router.push(`/${locale}`);
    router.refresh();
  };

  return (
    <>
      <nav className="page-shell flex h-[4.75rem] items-center justify-between gap-4" aria-label="Primary">
        <Link href={`/${locale}`} className="group flex items-center gap-3" aria-label="TJFit home">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-accent-soft/20 bg-accent/10 shadow-inset transition group-hover:border-accent-soft/40 group-hover:bg-accent/15">
            <Dumbbell className="h-[1.05rem] w-[1.05rem] text-accent-soft" aria-hidden />
          </span>
          <span className="font-display text-lg font-semibold tracking-[-0.04em] text-white">TJFit</span>
        </Link>

        <div className="hidden items-center gap-1 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-1 shadow-inset backdrop-blur-xl lg:flex">
          {routes.map((route) => (
            <Link
              key={route.key}
              href={`/${locale}${route.href}`}
              className={cn(
                "rounded-xl px-3.5 py-2 text-xs font-medium transition duration-300",
                isActive(route.href)
                  ? "bg-white/[0.09] text-white"
                  : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
              )}
            >
              {labelFor(route.key)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          {user ? (
            <Link
              href={`/${locale}/${role === "admin" ? "admin" : "dashboard"}`}
              className="hidden h-10 items-center gap-2 rounded-xl border border-white/10 px-3.5 text-xs font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.05] sm:flex"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-accent-soft" aria-hidden />
              {role === "admin" ? dict.nav.admin : dict.nav.dashboard}
            </Link>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="hidden h-10 items-center gap-2 rounded-xl border border-white/10 px-3.5 text-xs font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.05] sm:flex"
            >
              <LogIn className="h-3.5 w-3.5 text-accent-soft" aria-hidden />
              {dict.nav.login}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-white transition hover:border-white/20 hover:bg-white/[0.07]"
            aria-label="Open navigation"
            aria-expanded={menuOpen}
          >
            <Menu className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div className="fixed inset-0 z-[65] bg-[#050a16]/96 backdrop-blur-2xl">
          <div className="page-shell flex h-[4.75rem] items-center justify-between">
            <span className="font-display text-lg font-semibold tracking-[-0.04em] text-white">TJFit / Menu</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white transition hover:bg-white/5"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="page-shell grid min-h-[calc(100dvh-4.75rem)] items-center gap-10 pb-14 pt-6 lg:grid-cols-[1.5fr_0.8fr]">
            <div className="space-y-1">
              <Link
                href={`/${locale}`}
                className="group flex items-center justify-between border-b border-white/[0.08] py-4 font-display text-[clamp(2rem,6vw,5.2rem)] font-semibold leading-none tracking-[-0.06em] text-white transition hover:pl-3"
              >
                {dict.nav.home}
                <ArrowUpRight className="h-7 w-7 text-accent-soft opacity-0 transition group-hover:opacity-100 sm:h-10 sm:w-10" />
              </Link>
              {routes.map((route) => (
                <Link
                  key={route.key}
                  href={`/${locale}${route.href}`}
                  className="group flex items-center justify-between border-b border-white/[0.08] py-4 font-display text-[clamp(2rem,6vw,5.2rem)] font-semibold leading-none tracking-[-0.06em] text-zinc-500 transition hover:pl-3 hover:text-white"
                >
                  {labelFor(route.key)}
                  <ArrowUpRight className="h-7 w-7 text-accent-soft opacity-0 transition group-hover:opacity-100 sm:h-10 sm:w-10" />
                </Link>
              ))}
            </div>

            <aside className="border-l border-white/10 pl-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Account</p>
              <div className="mt-4 space-y-3">
                {user ? (
                  <>
                    <Link
                      href={`/${locale}/${role === "admin" ? "admin" : "dashboard"}`}
                      className="flex items-center justify-between rounded-2xl border border-white/10 p-4 text-sm text-white transition hover:bg-white/5"
                    >
                      {role === "admin" ? dict.nav.admin : dict.nav.dashboard}
                      <LayoutDashboard className="h-4 w-4 text-accent-soft" />
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/10 p-4 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
                    >
                      {dict.nav.logout}
                      <LogOut className="h-4 w-4 text-accent-soft" />
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/${locale}/login`}
                      className="gradient-button flex items-center justify-between rounded-2xl p-4 text-sm font-semibold"
                    >
                      {dict.nav.login}
                      <LogIn className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/${locale}/signup`}
                      className="flex items-center justify-between rounded-2xl border border-white/10 p-4 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
                    >
                      Create account
                      <ArrowUpRight className="h-4 w-4 text-accent-soft" />
                    </Link>
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      ) : null}
    </>
  );
}
