"use client";

import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TJScene } from "./scene";
import {
  CurlAthleteCenterpiece,
  DumbbellCenterpiece,
  NeuralOrbCenterpiece,
  NutrientCenterpiece,
  ScarabCenterpiece,
  type HeroPointerRef
} from "./hero-objects";
import { TJ_PALETTE } from "./palette";
import type { HeroStageVariant } from "./hero-stage";

type Props = {
  variant: HeroStageVariant;
  intensity: number;
  speed: number;
  pointerRef: HeroPointerRef;
};

function ParallaxCamera({ pointerRef }: { pointerRef: HeroPointerRef }) {
  useFrame((state, delta) => {
    const m = pointerRef.current;
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, m.x * 0.5, delta * 0.9);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, m.y * -0.35 + 0.1, delta * 0.9);
    cam.lookAt(0, 0, 0);
  });
  return null;
}

function Centerpiece({ variant, pointerRef, speed }: Props) {
  switch (variant) {
    case "curl-athlete":
      return <CurlAthleteCenterpiece pointerRef={pointerRef} speed={speed} />;
    case "dumbbell":
      return <DumbbellCenterpiece pointerRef={pointerRef} speed={speed} />;
    case "nutrient":
      return <NutrientCenterpiece pointerRef={pointerRef} speed={speed} />;
    case "neural":
      return <NeuralOrbCenterpiece pointerRef={pointerRef} speed={speed} />;
    case "scarab":
    default:
      return <ScarabCenterpiece pointerRef={pointerRef} speed={speed} />;
  }
}

export function HeroStageImpl({ variant, intensity, speed, pointerRef }: Props) {
  return (
    <TJScene intensity={intensity}>
      <ParallaxCamera pointerRef={pointerRef} />
      <Sparkles count={70} scale={14} size={1} speed={0.18} color={TJ_PALETTE.accentHi} opacity={0.35} />
      <Sparkles count={30} scale={18} size={0.7} speed={0.1} color={TJ_PALETTE.moonlight} opacity={0.16} />
      <Centerpiece variant={variant} intensity={intensity} speed={speed} pointerRef={pointerRef} />
    </TJScene>
  );
}
