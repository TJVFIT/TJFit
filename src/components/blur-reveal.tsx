"use client";

import { useRef } from "react";

import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

export function BlurReveal({
  children,
  delay = 0,
  className
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.12, once: true });
  return (
    <div ref={ref} className={cn("tj-blur-reveal", inView && "tj-revealed", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

