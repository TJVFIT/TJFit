"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TJ_LIGHTS } from "./palette";

/**
 * SCARABUSE-style three-point cinematic lighting:
 *   - warm champagne key from upper-right
 *   - cool moonlight fill from lower-left
 *   - soft gold rim behind for silhouette edge
 * Intensity breathes subtly.
 */
export function TJStageLights({ intensity = 1 }: { intensity?: number }) {
  const keyRef = useRef<THREE.PointLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);
  const rimRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (keyRef.current) keyRef.current.intensity = (2.4 + Math.sin(t * 0.35) * 0.3) * intensity;
    if (fillRef.current) fillRef.current.intensity = (0.9 + Math.cos(t * 0.28) * 0.18) * intensity;
    if (rimRef.current) rimRef.current.intensity = (1.6 + Math.sin(t * 0.22 + 1.5) * 0.25) * intensity;
  });

  return (
    <>
      <ambientLight intensity={0.05 * intensity} color={TJ_LIGHTS.ambient} />
      <pointLight
        ref={keyRef}
        position={[4.5, 3.2, 4]}
        intensity={2.4 * intensity}
        color={TJ_LIGHTS.keyChampagne}
        distance={22}
        decay={1.6}
      />
      <pointLight
        ref={fillRef}
        position={[-4, -2, 3]}
        intensity={0.9 * intensity}
        color={TJ_LIGHTS.fillMoonlight}
        distance={18}
        decay={1.8}
      />
      <pointLight
        ref={rimRef}
        position={[0, 1.8, -5]}
        intensity={1.6 * intensity}
        color={TJ_LIGHTS.rimGold}
        distance={14}
        decay={1.4}
      />
    </>
  );
}
