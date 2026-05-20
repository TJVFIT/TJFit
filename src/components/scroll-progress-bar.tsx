"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed top progress bar — transform scaleX only, rAF-throttled scroll.
 */
export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? el.scrollTop / max : 0;
      const bar = barRef.current;
      if (bar) {
        bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[100] h-[2px] w-full lg:left-16 lg:w-[calc(100%-4rem)]"
      aria-hidden
    >
      <div
        ref={barRef}
        className="tj-scroll-progress-inner h-full w-full origin-left scale-x-0"
        style={{
          willChange: "transform",
          background:
            "linear-gradient(90deg, rgba(34,211,238,0) 0%, rgba(34,211,238,0.8) 30%, rgba(165,243,252,0.95) 60%, rgba(14,165,233,0.7) 100%)",
          boxShadow:
            "0 0 14px rgba(34,211,238,0.55), 0 0 36px rgba(34,211,238,0.28)"
        }}
      />
    </div>
  );
}
