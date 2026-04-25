/** Design-system motion tokens — CSS-only animations */

export const DURATION = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 400,
  verySlow: 800
} as const;

export const EASING = {
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  enter: "cubic-bezier(0, 0, 0.2, 1)",
  exit: "cubic-bezier(0.4, 0, 1, 1)",
  spring: "cubic-bezier(0.16, 1, 0.3, 1)"
} as const;
