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
    <Tag className={cn("mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20", className)}>{children}</Tag>
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
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.045] to-white/[0.015] shadow-[0_24px_64px_-32px_rgba(0,0,0,0.75)]",
        pad,
        className
      )}
    >
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
      <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-4 text-sm leading-relaxed text-zinc-500 sm:text-base">{subtitle}</p>
      ) : null}
    </div>
  );
}
