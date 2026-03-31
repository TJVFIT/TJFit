"use client";

import { useEffect, useState } from "react";

/**
 * Very subtle cursor-follow glow (desktop). pointer-events-none.
 */
export function CursorGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const onMove = (e: PointerEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[2] hidden mix-blend-screen lg:block"
      style={{
        background: `radial-gradient(520px circle at ${pos.x}px ${pos.y}px, rgba(34,211,238,0.055), transparent 45%)`
      }}
    />
  );
}
