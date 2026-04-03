"use client";

import { RefObject, useEffect, useState } from "react";

const DEFAULT = {
  threshold: 0.12,
  rootMargin: "0px 0px -40px 0px",
  once: true
};

/**
 * IntersectionObserver-based visibility. Default: animate once on first entry.
 */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  options?: Partial<{ threshold: number; rootMargin: string; once: boolean }>
): boolean {
  const threshold = options?.threshold ?? DEFAULT.threshold;
  const rootMargin = options?.rootMargin ?? DEFAULT.rootMargin;
  const once = options?.once ?? DEFAULT.once;
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    let done = false;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e?.isIntersecting || done) return;
        setInView(true);
        if (once) {
          done = true;
          io.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold, rootMargin, once, inView]);

  return inView;
}
