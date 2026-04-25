"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function ListingFilterBar({
  label,
  children,
  className
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "mb-10 inline-flex max-w-full flex-col gap-2 rounded-xl border border-divider bg-surface p-1.5 transition-[opacity,transform] duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 sm:flex-row sm:flex-wrap sm:items-center",
        on ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        className
      )}
      style={{ transitionDelay: on ? "400ms" : "0ms" }}
    >
      {label ? (
        <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-dim sm:shrink-0">{label}</p>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-1">
        {children}
      </div>
    </div>
  );
}

export function FilterPill({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-[44px] rounded-lg px-5 py-2 text-[13px] font-medium transition-[color,background-color,border-color,box-shadow] duration-200 ease-out sm:min-h-0",
        active
          ? "border border-[rgba(34,211,238,0.25)] bg-[rgba(34,211,238,0.10)] font-semibold text-accent"
          : "border border-transparent bg-transparent text-dim hover:bg-[rgba(255,255,255,0.04)] hover:text-muted"
      )}
    >
      {children}
    </button>
  );
}
