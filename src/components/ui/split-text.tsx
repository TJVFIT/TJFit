"use client";

import { CSSProperties, useMemo, useRef } from "react";

import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

export function SplitText({
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
  const chars = useMemo(() => text.split(""), [text]);

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {chars.map((ch, index) => {
        const evenFromBelow = index % 2 === 0;
        const fromX = index % 7 === 0 ? 30 : index % 5 === 0 ? -30 : 0;
        const fromY = evenFromBelow ? 30 : -30;
        const fromR = evenFromBelow ? 10 : -10;

        const style = {
          opacity: inView ? 1 : 0,
          transform: inView ? "translate3d(0,0,0) rotate(0deg)" : `translate3d(${fromX}px, ${fromY}px, 0) rotate(${fromR}deg)`,
          transition: "opacity 500ms cubic-bezier(0.34,1.56,0.64,1), transform 500ms cubic-bezier(0.34,1.56,0.64,1)",
          transitionDelay: `${delay + index * 30}ms`
        } as CSSProperties;

        return (
          <span key={`${ch}-${index}`} className="inline-block will-change-transform" style={style}>
            {ch === " " ? "\u00A0" : ch}
          </span>
        );
      })}
    </span>
  );
}

