"use client";

import * as React from "react";

interface LoaderProps {
  size?: number;
  text?: string;
  overlay?: boolean;
}

export const Component: React.FC<LoaderProps> = ({
  size = 180,
  text = "Generating",
  overlay = true
}) => {
  const letters = text.split("");

  return (
    <div
      className={
        overlay
          ? "fixed inset-0 z-[70] flex items-center justify-center bg-[radial-gradient(circle_at_50%_30%,#122758_0%,#071126_45%,#050a16_100%)]"
          : "flex min-h-64 items-center justify-center"
      }
      role="status"
      aria-label={text}
    >
      <div
        className="relative flex select-none items-center justify-center font-mono text-[11px] font-bold uppercase tracking-[0.18em]"
        style={{ width: size, height: size }}
      >
        <span className="sr-only">{text}</span>
        <span aria-hidden className="flex text-white">
          {letters.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="inline-block animate-loaderLetter opacity-40"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {letter}
            </span>
          ))}
        </span>
        <div
          aria-hidden
          className="absolute inset-0 animate-loaderCircle rounded-full border border-white/5"
        />
      </div>
    </div>
  );
};
