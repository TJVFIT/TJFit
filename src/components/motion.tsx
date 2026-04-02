"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PropsWithChildren, useEffect, useState } from "react";

export function FadeIn({
  children,
  delay = 0,
  className
}: PropsWithChildren<{ delay?: number; className?: string }>) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

export function HoverLift({
  children,
  className
}: PropsWithChildren<{ className?: string }>) {
  return (
    <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.25 }} className={className}>
      {children}
    </motion.div>
  );
}

const programCardEase = [0.16, 1, 0.3, 1] as const;

/**
 * Premium program card hover: subtle lift + scale. Respects reduced motion (system or `reducedMotion` prop).
 */
export function ProgramCardMotion({
  children,
  className,
  reducedMotion
}: PropsWithChildren<{ className?: string; reducedMotion?: boolean }>) {
  const systemReduce = useReducedMotion();
  const [fineHover, setFineHover] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      setFineHover(false);
      return;
    }
    try {
      const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
      const apply = () => setFineHover(mq.matches);
      apply();
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    } catch {
      setFineHover(false);
    }
  }, []);

  const reduce = Boolean(reducedMotion) || systemReduce || !fineHover;
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={false}
      whileHover={{
        y: -6,
        scale: 1.012,
        transition: { duration: 0.22, ease: programCardEase }
      }}
      whileTap={{ scale: 0.994, transition: { duration: 0.12 } }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}
