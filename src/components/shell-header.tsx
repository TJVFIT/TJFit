"use client";

import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import type { Locale } from "@/lib/i18n";

export function ShellHeader({ locale }: { locale: Locale }) {
  const [elevated, setElevated] = useState(false);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-[var(--color-border-2)] pt-[env(safe-area-inset-top,0px)] backdrop-blur-[20px] backdrop-saturate-[180%] transition-[background-color,box-shadow,border-color] duration-300 ease-out ${
        elevated
          ? "border-[rgba(255,255,255,0.08)] bg-[rgba(9,9,11,0.95)] shadow-[0_1px_0_0_rgba(255,255,255,0.06)]"
          : "border-transparent bg-[rgba(9,9,11,0.85)]"
      }`}
    >
      <SiteNav locale={locale} />
    </header>
  );
}
