"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Logo } from "@/components/ui/Logo";
import type { Locale } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { buildShellOverlayNav } from "@/lib/shell-overlay-nav";
import { PUBLIC_COPY } from "@/lib/public-offers-copy";

const COPY: Record<Locale, { open: string; close: string; signOut: string; error: string }> = {
  en: { open: "Open menu", close: "Close menu", signOut: "Sign out", error: "Could not sign out. Please try again." },
  tr: { open: "Menüyü aç", close: "Menüyü kapat", signOut: "Çıkış yap", error: "Çıkış yapılamadı. Lütfen tekrar dene." },
  ar: { open: "فتح القائمة", close: "إغلاق القائمة", signOut: "تسجيل الخروج", error: "تعذر تسجيل الخروج. حاول مجدداً." },
  es: { open: "Abrir menú", close: "Cerrar menú", signOut: "Cerrar sesión", error: "No se pudo cerrar la sesión. Inténtalo de nuevo." },
  fr: { open: "Ouvrir le menu", close: "Fermer le menu", signOut: "Se déconnecter", error: "Déconnexion impossible. Réessaie." }
};

export function SiteSideOverlay({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { user, role } = useAuth();
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const c = COPY[locale];
  const nav = buildShellOverlayNav(locale, locale);
  const groups = nav.groups.map((group, i) => ({
    ...group, title: i === 0 ? PUBLIC_COPY[locale].navigation : group.title,
    items: group.items.filter((item) => (!item.adminOnly || role === "admin") && (!item.coachOnly || role === "coach" || role === "admin") && (!item.authOnly || user))
  })).filter((group) => group.items.length);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]') ?? []);
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); previousFocus?.focus(); };
  }, [open]);

  async function signOut() {
    setSigningOut(true); setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("unavailable");
      const result = await supabase.auth.signOut();
      if (result.error) throw result.error;
      setOpen(false); router.replace(`/${locale}`); router.refresh();
    } catch { setError(c.error); }
    finally { setSigningOut(false); }
  }

  return <>
    <button type="button" aria-label={c.open} aria-expanded={open} aria-controls="site-side-overlay" onClick={() => setOpen(true)} className="fixed start-3 top-3 z-40 inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-[#151218] text-white transition-colors hover:border-violet-300/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 sm:start-5"><Menu className="h-4 w-4" aria-hidden /></button>
    {open ? <div id="site-side-overlay" role="dialog" aria-modal="true" aria-label={PUBLIC_COPY[locale].navigation} className="fixed inset-0 z-[60]">
      <button type="button" tabIndex={-1} aria-label={c.close} onClick={() => setOpen(false)} className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
      <div ref={panelRef} className="absolute inset-y-0 start-0 flex w-full max-w-xl flex-col border-e border-white/10 bg-[#101014] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5"><Logo variant="full" size="navbar" linked={false} /><button type="button" aria-label={c.close} onClick={() => setOpen(false)} className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/15 text-white hover:border-violet-300/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"><X className="h-4 w-4" aria-hidden /></button></div>
        <nav className="grid flex-1 gap-8 overflow-y-auto px-6 py-7 sm:grid-cols-2" aria-label={PUBLIC_COPY[locale].navigation}>{groups.map((group) => <section key={group.title}><h2 className="mb-3 text-xs font-medium text-violet-300">{group.title}</h2><ul>{group.items.map((item) => <li key={item.href}><Link href={item.href} onClick={() => setOpen(false)} aria-current={pathname === item.href ? "page" : undefined} className="flex min-h-11 items-center rounded-md py-2 text-sm text-[#c9c1d3] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300">{item.label}</Link></li>)}</ul></section>)}</nav>
        {user ? <div className="border-t border-white/10 px-6 py-4"><div className="flex items-center justify-between gap-4"><span className="truncate text-xs text-[#b7b0c0]">{user.email}</span><button type="button" disabled={signingOut} onClick={signOut} className="min-h-11 shrink-0 rounded-md px-3 text-sm text-violet-200 hover:bg-white/5 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300">{c.signOut}</button></div>{error ? <p role="alert" className="mt-2 text-sm text-red-300">{error}</p> : null}</div> : null}
      </div>
    </div> : null}
  </>;
}
