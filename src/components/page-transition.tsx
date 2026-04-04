"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Route change: opacity fade (150ms out, 300ms in). Content swaps on navigation; brief dim masks swap.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const first = useRef(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setVisible(false);
    const t = window.setTimeout(() => setVisible(true), 150);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <div
      className={
        visible
          ? "transition-opacity duration-300 ease-out opacity-100"
          : "transition-opacity duration-150 ease-out opacity-0"
      }
    >
      {children}
    </div>
  );
}
