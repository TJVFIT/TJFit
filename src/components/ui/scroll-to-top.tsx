"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import type { Locale } from "@/lib/i18n";

const SCROLL_LABEL: Record<Locale, string> = {
  en: "Scroll to top",
  tr: "Başa dön",
  ar: "العودة إلى أعلى الصفحة",
  es: "Volver arriba",
  fr: "Revenir en haut"
};

export function ScrollToTop({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label={SCROLL_LABEL[locale]}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      onClick={() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          window.scrollTo({ top: 0, behavior: "instant" });
        } else if (window.__lenis) {
          window.__lenis.scrollTo(0);
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
      className="group/totop fixed bottom-20 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-purple-300/20 bg-surface text-purple-200 backdrop-blur-md transition-[border-color,background-color,color,box-shadow,transform] duration-300 hover:border-purple-300/50 hover:bg-purple-300/[0.06] hover:text-purple-50 hover:shadow-[0_0_24px_rgba(168,85,247,0.22)] motion-safe:hover:scale-105 sm:bottom-6"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      <ChevronUp className="h-5 w-5 transition-transform duration-300 motion-safe:group-hover/totop:-translate-y-0.5" />
    </button>
  );
}
