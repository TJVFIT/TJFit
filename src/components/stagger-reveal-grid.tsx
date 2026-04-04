"use client";

import { Children, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type StaggerRevealGridProps = {
  children: React.ReactNode;
  className?: string;
  childClassName?: string;
  /** Max stagger delay in ms (cap index * 80) */
  staggerMs?: number;
  threshold?: number;
};

export function StaggerRevealGrid({
  children,
  className,
  childClassName,
  staggerMs = 80,
  threshold = 0.06
}: StaggerRevealGridProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -5% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <div ref={rootRef} className={className}>
      {Children.map(children, (child, i) => {
        const delay = Math.min(i * staggerMs, 640);
        return (
          <div
            key={i}
            className={cn(
              "transition-[opacity,transform] duration-500 ease-[cubic-bezier(0,0,0.2,1)] motion-reduce:transition-none",
              active ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
              childClassName
            )}
            style={
              active
                ? { transitionDelay: `${delay}ms` }
                : { transitionDelay: "0ms" }
            }
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
