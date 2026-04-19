"use client";

import { cn } from "@/lib/utils";

/** SVG node mesh — cyan lines + pulse nodes; static when reduced motion */
export function HeroNetwork({ reduce }: { reduce: boolean }) {
  const nodes: [number, number][] = [
    [60, 25],
    [72, 18],
    [65, 38],
    [78, 30],
    [55, 50],
    [80, 45],
    [68, 55],
    [85, 60],
    [70, 32],
    [62, 42],
    [76, 52],
  ];

  const edges: [number, number][] = [
    [0, 1],
    [1, 3],
    [0, 2],
    [2, 4],
    [3, 5],
    [4, 6],
    [5, 7],
    [2, 8],
    [8, 9],
    [9, 6],
    [1, 10],
    [10, 5],
  ];

  return (
    <svg
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-[#22D3EE]",
        reduce ? "opacity-[0.22]" : "opacity-[0.38] motion-safe:animate-none"
      )}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="hero-net-line" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(34,211,238,0.08)" />
          <stop offset="50%" stopColor="rgba(34,211,238,0.2)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0.08)" />
        </linearGradient>
      </defs>
      {edges.map(([a, b], i) => {
        const [x1, y1] = nodes[a]!;
        const [x2, y2] = nodes[b]!;
        return (
          <line
            key={`${a}-${b}-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="url(#hero-net-line)"
            strokeWidth={0.35}
            strokeDasharray={reduce ? "0" : "1.2 1.8"}
            className={reduce ? "" : "tj-hero-net-dash"}
          />
        );
      })}
      {nodes.map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={0.9} fill="currentColor" opacity={0.55} />
          {!reduce && (
            <circle cx={cx} cy={cy} r={0.9} fill="none" stroke="currentColor" strokeWidth={0.15} opacity={0.35}>
              <animate attributeName="r" values="0.9;4.5;0.9" dur={`${2.8 + (i % 4) * 0.4}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0;0.35" dur={`${2.8 + (i % 4) * 0.4}s`} repeatCount="indefinite" />
            </circle>
          )}
        </g>
      ))}
    </svg>
  );
}
