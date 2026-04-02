"use client";

import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import type { Locale } from "@/lib/i18n";

export function ShellHeader({ locale }: { locale: Locale }) {
  const [elevated, setElevated] = useState(false);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b pt-[env(safe-area-inset-top,0px)] transition-[background-color,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        elevated
          ? "border-white/[0.06] bg-[#0A0A0B]/82 shadow-[0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-xl"
          : "border-transparent bg-[#0A0A0B]/60 backdrop-blur-lg"
      }`}
    >
      <SiteNav locale={locale} />
    </header>
  );
}
