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
      className="pointer-events-none fixed left-0 top-0 z-[100] h-0.5 w-full lg:left-16 lg:w-[calc(100%-4rem)]"
      aria-hidden
    >
      <div
        ref={barRef}
        className="tj-scroll-progress-inner h-full w-full origin-left scale-x-0 bg-[#22D3EE]"
        style={{ willChange: "transform" }}
      />
    </div>
  );
}
