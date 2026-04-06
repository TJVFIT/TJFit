"use client";

import { CSSProperties, useMemo, useRef } from "react";

import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

export function WordReveal({
  text,
  delay = 0,
  className
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { threshold: 0.3, once: true });
  const words = useMemo(() => text.split(" "), [text]);

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {words.map((word, i) => {
        const style = {
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 500ms ease, transform 500ms ease",
          transitionDelay: `${delay + i * 80}ms`
        } as CSSProperties;
        return (
          <span key={`${word}-${i}`} style={style} className={cn("inline-block", inView && "word-visible")}>
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        );
      })}
    </span>
  );
}

