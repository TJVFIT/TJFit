"use client";

import { lazy, Suspense } from "react";

import { Component as AiLoader } from "@/components/ui/ai-loader";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineSceneProps {
  scene: string;
  className?: string;
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense fallback={<AiLoader overlay={false} size={120} text="3D" />}>
      <Spline scene={scene} className={className} />
    </Suspense>
  );
}
