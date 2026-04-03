"use client";

import { useState } from "react";

import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type AsyncButtonProps = {
  onClick: () => void | Promise<void>;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  loadingText?: string;
  type?: "button" | "submit";
  /** When set, loading UI is controlled by the parent (e.g. shared with form onSubmit). */
  loading?: boolean;
  "aria-label"?: string;
};

export function AsyncButton({
  onClick,
  children,
  variant = "primary",
  size = "md",
  fullWidth,
  disabled,
  className,
  loadingText,
  type = "button",
  loading: controlledLoading,
  "aria-label": ariaLabel
}: AsyncButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const controlled = controlledLoading !== undefined;
  const isLoading = controlled ? Boolean(controlledLoading) : internalLoading;

  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-label={ariaLabel}
      className={cn(
        fullWidth && "w-full justify-center",
        isLoading && "cursor-not-allowed opacity-60",
        className
      )}
      onClick={async (e) => {
        if (type === "button") {
          e.preventDefault();
        }
        if (isLoading || disabled) return;
        if (!controlled) {
          setInternalLoading(true);
        }
        try {
          await onClick();
        } finally {
          if (!controlled) {
            setInternalLoading(false);
          }
        }
      }}
    >
      {isLoading ? (
        <span className="inline-flex min-h-[16px] items-center justify-center gap-2">
          <span className="tj-inline-spinner" aria-hidden />
          {loadingText ? <span>{loadingText}</span> : null}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
