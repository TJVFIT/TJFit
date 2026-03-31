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
      className={`sticky top-0 z-50 border-b transition-[background-color,box-shadow] duration-300 ease-out ${
        elevated
          ? "border-white/[0.08] bg-[#0A0A0B]/94 shadow-[0_12px_48px_-20px_rgba(0,0,0,0.65)] backdrop-blur-xl backdrop-saturate-150"
          : "border-white/[0.05] bg-[#0A0A0B]/65 backdrop-blur-lg backdrop-saturate-150"
      }`}
    >
      <SiteNav locale={locale} elevated={elevated} />
    </header>
  );
}
