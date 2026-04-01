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
              y: -2,
              transition: { duration: 0.28, ease: EASE }
            }
      }
      whileTap={reducedMotion ? undefined : { scale: 0.998 }}
      transition={{ duration: 0.28, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
