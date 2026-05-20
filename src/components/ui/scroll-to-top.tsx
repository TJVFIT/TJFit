"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export function ScrollToTop() {
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
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="group/totop fixed bottom-20 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/20 bg-surface text-cyan-200 backdrop-blur-md transition-[border-color,background-color,color,box-shadow,transform] duration-300 hover:border-cyan-300/50 hover:bg-cyan-300/[0.06] hover:text-cyan-50 hover:shadow-[0_0_24px_rgba(34,211,238,0.22)] motion-safe:hover:scale-105 sm:bottom-6"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      <ChevronUp className="h-5 w-5 transition-transform duration-300 motion-safe:group-hover/totop:-translate-y-0.5" />
    </button>
  );
}
