"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: string;
  className?: string;
  /** Per-word stagger in ms */
  stagger?: number;
  /** Delay before first word (ms) */
  delay?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
};

export function TextReveal({ children, className, stagger = 55, delay = 0, as: Tag = "span" }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = children.split(/(\s+)/);

  return (
    <Tag ref={ref as never} className={`${className ?? ""} ${visible ? "tj-reveal-in" : ""}`}>
      {words.map((w, i) =>
        /^\s+$/.test(w) ? (
          <span key={i}>{w}</span>
        ) : (
          <span
            key={i}
            className="tj-reveal-word"
            style={{ transitionDelay: `${delay + (i / 2) * stagger}ms` }}
          >
            {w}
          </span>
        )
      )}
    </Tag>
  );
}
