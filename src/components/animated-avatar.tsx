"use client";

import Image from "next/image";

type AnimatedAvatarProps = {
  url?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
};

/**
 * ME14 — Shows profile image if available, otherwise a gradient avatar
 * with the user's initial letter on a cyan→violet gradient background.
 */
export function AnimatedAvatar({ url, name, size = 40, className = "" }: AnimatedAvatarProps) {
  const initial = (name?.trim()?.[0] ?? "?").toUpperCase();

  if (url) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={url}
          alt={name ?? "User avatar"}
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white ${className}`}
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #22D3EE 0%, #A78BFA 100%)",
        fontSize: Math.round(size * 0.38),
        userSelect: "none"
      }}
      aria-label={name ?? "User"}
    >
      {initial}
    </div>
  );
}
