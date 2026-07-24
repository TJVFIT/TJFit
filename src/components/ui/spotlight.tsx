"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, type SpringOptions } from "framer-motion";

import { cn } from "@/lib/utils";

type SpotlightProps = {
  className?: string;
  size?: number;
  springOptions?: SpringOptions;
};

export function Spotlight({
  className,
  size = 240,
  springOptions = { bounce: 0, stiffness: 160, damping: 28 }
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);
  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);
  const spotlightLeft = useTransform(mouseX, (x) => `${x - size / 2}px`);
  const spotlightTop = useTransform(mouseY, (y) => `${y - size / 2}px`);

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;
    parent.style.position = "relative";
    parent.style.overflow = "hidden";
    setParentElement(parent);
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!parentElement) return;
      const { left, top } = parentElement.getBoundingClientRect();
      mouseX.set(event.clientX - left);
      mouseY.set(event.clientY - top);
    },
    [mouseX, mouseY, parentElement]
  );

  useEffect(() => {
    if (!parentElement) return;
    const enter = () => setIsHovered(true);
    const leave = () => setIsHovered(false);

    parentElement.addEventListener("mousemove", handleMouseMove, { passive: true });
    parentElement.addEventListener("mouseenter", enter);
    parentElement.addEventListener("mouseleave", leave);

    return () => {
      parentElement.removeEventListener("mousemove", handleMouseMove);
      parentElement.removeEventListener("mouseenter", enter);
      parentElement.removeEventListener("mouseleave", leave);
    };
  }, [parentElement, handleMouseMove]);

  return (
    <motion.div
      ref={containerRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute rounded-full bg-accent/25 blur-3xl transition-opacity duration-300",
        isHovered ? "opacity-100" : "opacity-0",
        className
      )}
      style={{ width: size, height: size, left: spotlightLeft, top: spotlightTop }}
    />
  );
}
