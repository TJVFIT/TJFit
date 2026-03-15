"use client";

import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

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
