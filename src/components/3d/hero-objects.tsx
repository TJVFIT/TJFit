"use client";

import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { TJ_MATERIAL } from "./materials";
import { TJ_PALETTE } from "./palette";

export type HeroPointerRef = MutableRefObject<{ x: number; y: number }>;

type HeroProps = { pointerRef?: HeroPointerRef; speed?: number };

/**
 * Scarab-like layered centerpiece — obsidian torus-knot nested inside a champagne halo.
 * Used by the homepage hero. Scroll-driven intensity handled upstream.
 */
export function ScarabCenterpiece({ pointerRef, speed = 1 }: HeroProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    const m = pointerRef?.current ?? { x: 0, y: 0 };

    if (coreRef.current) {
      coreRef.current.rotation.x = Math.sin(t * 0.18) * 0.25 + m.y * 0.06;
      coreRef.current.rotation.y = t * 0.22 + m.x * 0.08;
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.22 + Math.sin(t * 0.9) * 0.12;
    }
    if (haloRef.current) {
      haloRef.current.rotation.x = t * 0.12;
      haloRef.current.rotation.z = t * -0.08;
    }
    if (shellRef.current) {
      shellRef.current.rotation.y = t * 0.05 + m.x * 0.04;
      shellRef.current.rotation.x = Math.sin(t * 0.14) * 0.12 + m.y * 0.03;
    }
  });

  return (
    <group>
      <mesh ref={coreRef}>
        <torusKnotGeometry args={[1.05, 0.34, 200, 28, 2, 3]} />
        <meshStandardMaterial {...TJ_MATERIAL.liquidGold} />
      </mesh>

      <mesh ref={shellRef}>
        <icosahedronGeometry args={[1.9, 1]} />
        <meshStandardMaterial {...TJ_MATERIAL.onyxGlass} wireframe transparent opacity={0.22} />
      </mesh>

      <mesh ref={haloRef} rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[2.4, 0.012, 8, 180]} />
        <meshStandardMaterial {...TJ_MATERIAL.brushedChampagne} />
      </mesh>

      <mesh rotation={[Math.PI / 4, Math.PI / 3, 0]}>
        <torusGeometry args={[2.95, 0.008, 8, 180]} />
        <meshStandardMaterial color={TJ_PALETTE.champagneHi} metalness={1} roughness={0.2} />
      </mesh>
    </group>
  );
}

/** Stylized dumbbell — used for programs/strength surfaces. */
export function DumbbellCenterpiece({ pointerRef, speed = 1 }: HeroProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    const m = pointerRef?.current ?? { x: 0, y: 0 };
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.18 + m.x * 0.12;
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.18 + m.y * 0.06;
    }
  });

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 2.6, 32]} />
        <meshStandardMaterial {...TJ_MATERIAL.brushedChampagne} />
      </mesh>
      {[-1.4, 1.4].map((y) => (
        <group key={y} position={[0, y, 0]}>
          <mesh>
            <cylinderGeometry args={[0.55, 0.55, 0.4, 48]} />
            <meshStandardMaterial {...TJ_MATERIAL.polishedObsidian} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.55, 0.04, 12, 80]} />
            <meshStandardMaterial {...TJ_MATERIAL.liquidGold} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Stylized nutrient orbit ring — used for diets / nutrition surfaces. */
export function NutrientCenterpiece({ pointerRef, speed = 1 }: HeroProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    const m = pointerRef?.current ?? { x: 0, y: 0 };
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15 + m.x * 0.08;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.35;
      coreRef.current.rotation.x = Math.sin(t * 0.3) * 0.2 + m.y * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshStandardMaterial {...TJ_MATERIAL.emberCore} />
      </mesh>

      {[2.2, 2.6, 3.1].map((r, i) => (
        <mesh key={r} rotation={[Math.PI / 2 + i * 0.3, 0, i * 0.6]}>
          <torusGeometry args={[r, 0.008, 8, 180]} />
          <meshStandardMaterial {...TJ_MATERIAL.brushedChampagne} />
        </mesh>
      ))}

      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <Float key={i} speed={1 + i * 0.2} rotationIntensity={0.4} floatIntensity={0.3}>
            <mesh position={[Math.cos(angle) * 2.4, Math.sin(angle * 1.3) * 0.4, Math.sin(angle) * 2.4]}>
              <dodecahedronGeometry args={[0.09 + (i % 3) * 0.04, 0]} />
              <meshStandardMaterial {...TJ_MATERIAL.liquidGold} />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

/** Pulsing neural orb — used for TJAI surfaces. */
export function NeuralOrbCenterpiece({ pointerRef, speed = 1 }: HeroProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    const m = pointerRef?.current ?? { x: 0, y: 0 };

    if (coreRef.current) {
      const s = 1 + Math.sin(t * 1.2) * 0.08;
      coreRef.current.scale.set(s, s, s);
      coreRef.current.rotation.y = t * 0.3 + m.x * 0.1;
      coreRef.current.rotation.x = m.y * 0.06;
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.6 + Math.sin(t * 1.5) * 0.25;
    }
    if (shellRef.current) {
      shellRef.current.rotation.y = -t * 0.08;
      shellRef.current.rotation.x = Math.sin(t * 0.14) * 0.18;
    }
  });

  return (
    <group>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.05, 2]} />
        <meshStandardMaterial {...TJ_MATERIAL.emberCore} />
      </mesh>
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[1.85, 1]} />
        <meshStandardMaterial {...TJ_MATERIAL.onyxGlass} wireframe transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.3, 0.006, 8, 200]} />
        <meshStandardMaterial {...TJ_MATERIAL.liquidGold} />
      </mesh>
    </group>
  );
}
