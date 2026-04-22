"use client";

import { useEffect, useRef, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import type { Locale } from "@/lib/i18n";

export function ShellHeader({ locale }: { locale: Locale }) {
  const [elevated, setElevated] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const compute = () => {
      const y = window.scrollY;
      setElevated(y > 40);
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      setProgress(Math.min(1, Math.max(0, y / max)));
      rafRef.current = null;
    };
    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 pt-[env(safe-area-inset-top,0px)] transition-[background-color,backdrop-filter,border-color,box-shadow] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        elevated
          ? "border-b border-[rgba(255,255,255,0.07)] bg-[rgba(9,9,11,0.88)] shadow-[0_12px_32px_-20px_rgba(0,0,0,0.9)] backdrop-blur-[22px] backdrop-saturate-[180%]"
          : "border-b border-transparent bg-[rgba(9,9,11,0)] backdrop-blur-none"
      }`}
    >
      <SiteNav locale={locale} />
      <div
        className="tj-scroll-progress"
        data-visible={elevated ? "true" : "false"}
        style={{
          transform: `scaleX(${progress})`,
          transition:
            "transform 120ms cubic-bezier(0.22,1,0.36,1), opacity 240ms cubic-bezier(0.22,1,0.36,1)"
        }}
        aria-hidden
      />
    </header>
  );
}
