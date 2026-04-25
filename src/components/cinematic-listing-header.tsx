"use client";

import { useEffect, useRef, useState } from "react";

import { WordReveal } from "@/components/ui/word-reveal";
import { cn } from "@/lib/utils";

type CinematicListingHeaderProps = {
  eyebrow: string;
  headlineBefore: string;
  headlineGradient: string;
  sub: string;
  className?: string;
  children?: React.ReactNode;
};

export function CinematicListingHeader({
  eyebrow,
  headlineBefore,
  headlineGradient,
  sub,
  className,
  children
}: CinematicListingHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <header
      ref={ref}
      className={cn(
        "relative flex min-h-[220px] flex-col justify-center overflow-hidden border-b border-transparent px-4 py-10 sm:px-6 md:min-h-[280px] md:py-12",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-background"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[500px] max-w-[100vw] -translate-x-1/2 bg-[radial-gradient(circle,rgba(34,211,238,0.07)_0%,transparent_55%)]"
        aria-hidden
      />
      <div className="relative z-[1] mx-auto w-full min-w-0 max-w-[1200px]">
        <p
          className={cn(
            "text-[11px] font-medium uppercase tracking-[0.15em] text-accent transition-opacity duration-500 ease-out motion-reduce:opacity-100",
            inView ? "opacity-100" : "opacity-0"
          )}
          style={{ transitionDelay: inView ? "100ms" : "0ms" }}
        >
          {eyebrow}
        </p>
        <h1
          className={cn(
            "mt-3 break-words font-display text-[36px] font-extrabold leading-[1.08] tracking-[-0.025em] text-white transition-[opacity,transform] duration-[600ms] ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 [hyphens:auto] md:text-[56px]",
            inView ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          )}
          style={{ transitionDelay: inView ? "200ms" : "0ms" }}
        >
          <WordReveal text={headlineBefore} />
          <span className="bg-gradient-to-r from-[#22D3EE] to-[#A78BFA] bg-clip-text text-transparent">
            <WordReveal text={headlineGradient} delay={120} />
          </span>
        </h1>
        <p
          className={cn(
            "mt-4 max-w-[480px] break-words text-base leading-[1.7] text-muted transition-opacity duration-500 ease-out motion-reduce:opacity-100 [hyphens:auto]",
            inView ? "opacity-100" : "opacity-0"
          )}
          style={{ transitionDelay: inView ? "350ms" : "0ms" }}
        >
          {sub}
        </p>
        {children ? <div className="mt-8 flex flex-wrap items-center gap-4">{children}</div> : null}
      </div>
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.4),transparent)]"
        aria-hidden
      />
    </header>
  );
}
