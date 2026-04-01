"use client";

type InteractiveCardProps = {
  children: React.ReactNode;
  className?: string;
  reducedMotion?: boolean | null;
};

/**
 * Hover lift for linked card shells (CSS only — avoids Framer Motion production edge cases).
 */
export function InteractiveCard({ children, className = "", reducedMotion }: InteractiveCardProps) {
  const motionCls =
    reducedMotion === true
      ? ""
      : "motion-safe:transition-[transform] motion-safe:duration-200 lg:motion-safe:hover:-translate-y-0.5 lg:motion-safe:active:scale-[0.998]";
  return <div className={`${className} ${motionCls}`.trim()}>{children}</div>;
}
