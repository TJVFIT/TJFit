"use client";

import { PropsWithChildren, useEffect, useRef, useState } from "react";

import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

/** Scroll reveal — opacity + translateY. No Framer Motion. */
export function FadeIn({
  children,
  delay = 0,
  className
}: PropsWithChildren<{ delay?: number; className?: string }>) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { threshold: 0.12, rootMargin: "0px 0px -40px 0px", once: true });

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transitionProperty: "opacity, transform",
        transitionDuration: "400ms",
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0, 0, 0.2, 1)"
      }}
    >
      {children}
    </div>
  );
}

/** Card lift on fine-pointer hover only — transform + shadow via parent classes. */
export function HoverLift({ children, className }: PropsWithChildren<{ className?: string }>) {
  const [fineHover, setFineHover] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    try {
      const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
      const apply = () => setFineHover(mq.matches);
      apply();
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    } catch {
      return;
    }
  }, []);

  return (
    <div
      className={cn(
        className,
        fineHover &&
          "motion-safe:transition-[transform,box-shadow] motion-safe:duration-[250ms] motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:hover:-translate-y-2 motion-safe:hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      )}
    >
      {children}
    </div>
  );
}

/** @deprecated Prefer card shell hover classes; kept for API compatibility */
export function ProgramCardMotion({
  children,
  className,
  reducedMotion
}: PropsWithChildren<{ className?: string; reducedMotion?: boolean }>) {
  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }
  return <HoverLift className={className}>{children}</HoverLift>;
}
