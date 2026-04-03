"use client";

import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import type { Locale } from "@/lib/i18n";

export function ShellHeader({ locale }: { locale: Locale }) {
  const [elevated, setElevated] = useState(false);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 pt-[env(safe-area-inset-top,0px)] transition-[background-color,backdrop-filter,border-color] duration-300 ease-out ${
        elevated
          ? "border-b border-[rgba(255,255,255,0.06)] bg-[rgba(9,9,11,0.92)] backdrop-blur-[20px] backdrop-saturate-[180%]"
          : "border-b border-transparent bg-[rgba(9,9,11,0)] backdrop-blur-none"
      }`}
    >
      <SiteNav locale={locale} />
    </header>
  );
}
