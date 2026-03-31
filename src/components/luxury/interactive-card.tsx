"use client";

import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

type InteractiveCardProps = {
  children: React.ReactNode;
  className?: string;
  reducedMotion?: boolean | null;
};

/**
 * Hover lift + cyan-tinted glow for linked card shells.
 */
export function InteractiveCard({ children, className = "", reducedMotion }: InteractiveCardProps) {
  return (
    <motion.div
      className={className}
      whileHover={
        reducedMotion
          ? undefined
          : {
              y: -5,
              boxShadow: "0 28px 56px -20px rgba(34, 211, 238, 0.14)",
              transition: { duration: 0.38, ease: EASE }
            }
      }
      whileTap={reducedMotion ? undefined : { scale: 0.996 }}
      transition={{ duration: 0.38, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
