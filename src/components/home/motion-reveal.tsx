"use client";

import { useRef, type ReactNode, type RefObject } from "react";

import { useInView } from "@/hooks/useInView";

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger offset in ms */
  delayMs?: number;
  reducedMotion?: boolean;
};

/**
 * Scroll reveal using design tokens (--tj-motion-slow, --tj-ease-premium, --tj-reveal-distance).
 */
export function MotionReveal({ children, className, delayMs = 0, reducedMotion }: MotionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as RefObject<HTMLElement>, { threshold: 0.1, once: true });
  const reduce = Boolean(reducedMotion);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(var(--tj-reveal-distance, 20px))",
        transition: reduce
          ? "none"
          : `opacity var(--tj-motion-slow, 880ms) var(--tj-ease-premium, cubic-bezier(0.22,1,0.36,1)) ${delayMs}ms, transform var(--tj-motion-slow, 880ms) var(--tj-ease-premium, cubic-bezier(0.22,1,0.36,1)) ${delayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}
