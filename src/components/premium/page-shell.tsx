import { cn } from "@/lib/utils";

export function PremiumPageShell({
  children,
  className,
  as = "div"
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  const Tag = as;
  return (
    <Tag className={cn("mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24", className)}>{children}</Tag>
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
