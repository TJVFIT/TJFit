import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type EmptyStateProps = {
  /** Optional lucide icon rendered above the heading. Omit for the leaner text-only variant. */
  icon?: LucideIcon;
  /** Overrides the default icon sizing/color classes. */
  iconClassName?: string;
  /** Overrides the default icon stroke width (1.5). */
  iconStrokeWidth?: number;
  /** Optional heading. Omit for the leaner text-only variant (e.g. inline error fallbacks). */
  title?: ReactNode;
  /** Heading element — `h3` when the empty state is nested under an existing `h2`/section title. */
  titleAs?: "h2" | "h3";
  /** Required body copy — rendered with the canonical `.tj-empty-state__text` treatment. */
  subtext: ReactNode;
  /** Extra classes merged onto the subtext `<p>` (e.g. a max-width clamp). */
  subtextClassName?: string;
  /** Optional call-to-action (button/link). Caller owns its own spacing/variant classes. */
  cta?: ReactNode;
  /** Extra classes merged onto the outer `.tj-empty-state` container. */
  className?: string;
};

/**
 * Thin typed wrapper around the existing `.tj-empty-state` / `.tj-empty-state__text`
 * classes defined in globals.css. Renders the canonical icon + heading + subtext
 * (+ optional CTA) shape used across the app — typography-first, no illustrations,
 * obsidian/violet tokens only. Icon and title are optional so the same primitive
 * covers the leaner "message + retry" empty/error states too.
 */
export function EmptyState({
  icon: Icon,
  iconClassName = "mx-auto h-8 w-8 text-[var(--color-text-muted)]",
  iconStrokeWidth = 1.5,
  title,
  titleAs = "h2",
  subtext,
  subtextClassName,
  cta,
  className
}: EmptyStateProps) {
  const Heading = titleAs;
  const hasLeadIn = Boolean(Icon || title);

  return (
    <div className={cn("tj-empty-state", className)}>
      {Icon ? <Icon className={iconClassName} strokeWidth={iconStrokeWidth} aria-hidden /> : null}
      {title ? (
        <Heading className="mt-4 text-lg font-semibold text-[var(--color-text-secondary)]">{title}</Heading>
      ) : null}
      <p
        className={cn(
          "tj-empty-state__text text-sm text-[var(--color-text-muted)]",
          hasLeadIn && "mt-2",
          subtextClassName
        )}
      >
        {subtext}
      </p>
      {cta}
    </div>
  );
}
