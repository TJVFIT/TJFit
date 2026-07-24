"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import { cn } from "@/lib/utils";

interface LayeredTextProps {
  lines?: Array<{ top: string; bottom: string }>;
  className?: string;
}

export function LayeredText({
  lines = [
    { top: "\u00A0", bottom: "START" },
    { top: "START", bottom: "TRAIN" },
    { top: "TRAIN", bottom: "ADAPT" },
    { top: "ADAPT", bottom: "PROGRESS" },
    { top: "PROGRESS", bottom: "REPEAT" },
    { top: "REPEAT", bottom: "\u00A0" }
  ],
  className
}: LayeredTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const context = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-layered-row]");
      const timeline = gsap.timeline({ paused: true }).to(rows, {
        yPercent: -50,
        duration: 0.82,
        ease: "power3.inOut",
        stagger: 0.055
      });

      const container = containerRef.current;
      const play = () => timeline.play();
      const reverse = () => timeline.reverse();

      container?.addEventListener("pointerenter", play);
      container?.addEventListener("pointerleave", reverse);

      return () => {
        container?.removeEventListener("pointerenter", play);
        container?.removeEventListener("pointerleave", reverse);
      };
    }, containerRef);

    return () => context.revert();
  }, [lines]);

  const centerIndex = Math.floor(lines.length / 2);

  return (
    <div
      ref={containerRef}
      className={cn(
        "select-none py-10 font-display text-[clamp(2.5rem,7vw,6rem)] font-black uppercase leading-[0.72] tracking-[-0.075em] text-white",
        className
      )}
    >
      <ul className="m-0 flex list-none flex-col items-center p-0" aria-label="Start, train, adapt, progress, repeat">
        {lines.map((line, index) => {
          const offset = (index - centerIndex) * 0.48;
          const even = index % 2 === 0;
          return (
            <li
              key={`${line.top}-${line.bottom}-${index}`}
              className="relative h-[0.73em] overflow-hidden"
              style={{
                transform: `translateX(${offset}em) skew(${even ? "52deg, -24deg" : "0deg, -24deg"}) scaleY(${even ? 0.72 : 1.28})`
              }}
            >
              <div data-layered-row className="will-change-transform">
                <p className="h-[0.73em] whitespace-nowrap px-[0.15em]">{line.top}</p>
                <p className="h-[0.73em] whitespace-nowrap px-[0.15em] text-accent-soft">{line.bottom}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
