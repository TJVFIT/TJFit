import { cn } from "@/lib/utils";

export function PremiumPageShell({
  children,
  className,
  as = "div",
  ghostWord
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
  /** Large faint backdrop label (e.g. PROGRAMS) */
  ghostWord?: string;
}) {
  const Tag = as;
  return (
    <Tag className={cn("relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24", className)}>
      {ghostWord ? (
        <span className="ghost-text pointer-events-none start-1/2 top-6 z-0 -translate-x-1/2 select-none" aria-hidden>
          {ghostWord}
        </span>
      ) : null}
      <div className="relative z-[1]">{children}</div>
    </Tag>
  );
}

export function PremiumPanel({
  children,
  className,
  padding = "md"
}: {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}) {
  const pad =
    padding === "sm" ? "p-5 sm:p-6" : padding === "lg" ? "p-8 sm:p-10 lg:p-12" : "p-6 sm:p-8";
  return (
    <div className={cn("tj-surface-panel", pad, className)}>
      {children}
    </div>
  );
}

export function PremiumSectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "left"
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("mb-10 max-w-2xl sm:mb-12", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <span className="lux-badge mb-4 inline-flex">{eyebrow}</span> : null}
      <h1 className="tj-page-title sm:text-[2.25rem] lg:text-[2.5rem] lg:leading-tight">{title}</h1>
      {subtitle ? (
        <p className={cn("tj-prose-muted mt-4 max-w-xl", align === "center" && "mx-auto")}>{subtitle}</p>
      ) : null}
    </div>
  );
}
