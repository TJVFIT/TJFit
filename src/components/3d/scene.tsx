"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";
import { TJStageLights } from "./lights";

type Props = {
  children: ReactNode;
  intensity?: number;
  cameraZ?: number;
  fov?: number;
  className?: string;
};

/**
 * Shared Canvas wrapper for TJFit v2 3D scenes.
 * Provides cinematic lighting, obsidian fog, and performant defaults.
 */
export function TJScene({ children, intensity = 1, cameraZ = 6.4, fov = 42, className }: Props) {
  return (
    <Canvas
      className={className ?? "h-full w-full"}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true
      }}
      camera={{ position: [0, 0, cameraZ], fov, near: 0.1, far: 60 }}
      dpr={[1, 1.6]}
      performance={{ min: 0.5 }}
      frameloop="always"
    >
      <fog attach="fog" args={["#08080a", 9, 32]} />
      <Suspense fallback={null}>
        <TJStageLights intensity={intensity} />
        {children}
      </Suspense>
    </Canvas>
  );
}
