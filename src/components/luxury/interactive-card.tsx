"use client";

import { useRef, useState } from "react";

type InteractiveCardProps = {
  children: React.ReactNode;
  className?: string;
  reducedMotion?: boolean | null;
};

/**
 * 3D perspective tilt + inner cursor spotlight on hover.
 * Falls back to CSS-only lift on reduced motion / touch devices.
 */
export function InteractiveCard({ children, className = "", reducedMotion }: InteractiveCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, visible: false });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -7, y: dx * 7 });
    const pctX = ((e.clientX - rect.left) / rect.width) * 100;
    const pctY = ((e.clientY - rect.top) / rect.height) * 100;
    setSpotlight({ x: pctX, y: pctY, visible: true });
  };

  const onLeave = () => {
    setTilt({ x: 0, y: 0 });
    setSpotlight((s) => ({ ...s, visible: false }));
  };

  const motionCls = reducedMotion
    ? ""
    : "motion-safe:transition-[transform] motion-safe:duration-200 lg:motion-safe:hover:-translate-y-0.5 lg:motion-safe:active:scale-[0.998]";

  return (
    <div
      ref={ref}
      className={`${className} ${motionCls} relative overflow-hidden`.trim()}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        reducedMotion
          ? undefined
          : {
              transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: "transform 200ms cubic-bezier(0.25,0.1,0.25,1)"
            }
      }
    >
      {!reducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            opacity: spotlight.visible ? 1 : 0,
            background: `radial-gradient(180px circle at ${spotlight.x}% ${spotlight.y}%, rgba(34,211,238,0.08), transparent 70%)`
          }}
          aria-hidden
        />
      )}
      {children}
    </div>
  );
}
