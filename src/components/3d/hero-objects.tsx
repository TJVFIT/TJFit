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
 * Scarab-like layered centerpiece — obsidian torus-knot nested inside a accent halo.
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
        <meshStandardMaterial {...TJ_MATERIAL.liquidCyan} />
      </mesh>

      <mesh ref={shellRef}>
        <icosahedronGeometry args={[1.9, 1]} />
        <meshStandardMaterial {...TJ_MATERIAL.onyxGlass} wireframe transparent opacity={0.22} />
      </mesh>

      <mesh ref={haloRef} rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[2.4, 0.012, 8, 180]} />
        <meshStandardMaterial {...TJ_MATERIAL.brushedAccent} />
      </mesh>

      <mesh rotation={[Math.PI / 4, Math.PI / 3, 0]}>
        <torusGeometry args={[2.95, 0.008, 8, 180]} />
        <meshStandardMaterial color={TJ_PALETTE.accentHi} metalness={1} roughness={0.2} />
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
        <meshStandardMaterial {...TJ_MATERIAL.brushedAccent} />
      </mesh>
      {[-1.4, 1.4].map((y) => (
        <group key={y} position={[0, y, 0]}>
          <mesh>
            <cylinderGeometry args={[0.55, 0.55, 0.4, 48]} />
            <meshStandardMaterial {...TJ_MATERIAL.polishedObsidian} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.55, 0.04, 12, 80]} />
            <meshStandardMaterial {...TJ_MATERIAL.liquidCyan} />
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
        <meshStandardMaterial {...TJ_MATERIAL.coreAccent} />
      </mesh>

      {[2.2, 2.6, 3.1].map((r, i) => (
        <mesh key={r} rotation={[Math.PI / 2 + i * 0.3, 0, i * 0.6]}>
          <torusGeometry args={[r, 0.008, 8, 180]} />
          <meshStandardMaterial {...TJ_MATERIAL.brushedAccent} />
        </mesh>
      ))}

      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <Float key={i} speed={1 + i * 0.2} rotationIntensity={0.4} floatIntensity={0.3}>
            <mesh position={[Math.cos(angle) * 2.4, Math.sin(angle * 1.3) * 0.4, Math.sin(angle) * 2.4]}>
              <dodecahedronGeometry args={[0.09 + (i % 3) * 0.04, 0]} />
              <meshStandardMaterial {...TJ_MATERIAL.liquidCyan} />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

/** Alternating dumbbell curl athlete — homepage hero centerpiece. */
export function CurlAthleteCenterpiece({ pointerRef, speed = 1 }: HeroProps) {
  const rootRef = useRef<THREE.Group>(null);
  const haloARef = useRef<THREE.Mesh>(null);
  const haloBRef = useRef<THREE.Mesh>(null);
  const scanRef = useRef<THREE.Mesh>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);
  const leftBicepRef = useRef<THREE.Mesh>(null);
  const rightBicepRef = useRef<THREE.Mesh>(null);
  const torsoWireRef = useRef<THREE.Mesh>(null);

  const REST = 0.16;
  const PEAK = 2.35;
  const PERIOD = 3.8;

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    const m = pointerRef?.current ?? { x: 0, y: 0 };
    const phase = ((Math.PI * 2) / PERIOD) * t;

    // 0.5 - 0.5·cos eases to zero velocity at both extremes — no bounce.
    const leftAmt = 0.5 - 0.5 * Math.cos(phase);
    const rightAmt = 0.5 - 0.5 * Math.cos(phase + Math.PI);
    const leftAngle = REST + (PEAK - REST) * leftAmt;
    const rightAngle = REST + (PEAK - REST) * rightAmt;

    if (leftForearmRef.current) leftForearmRef.current.rotation.x = -leftAngle;
    if (rightForearmRef.current) rightForearmRef.current.rotation.x = -rightAngle;

    if (leftBicepRef.current) {
      const mat = leftBicepRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.55 + leftAmt * 0.7;
      const s = 1 + leftAmt * 0.08;
      leftBicepRef.current.scale.set(s, 1, s);
    }
    if (rightBicepRef.current) {
      const mat = rightBicepRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.55 + rightAmt * 0.7;
      const s = 1 + rightAmt * 0.08;
      rightBicepRef.current.scale.set(s, 1, s);
    }

    if (rootRef.current) {
      const breath = Math.sin(t * 0.9) * 0.018;
      rootRef.current.position.y = -0.15 + breath;
      rootRef.current.rotation.z = (leftAmt - rightAmt) * 0.04;
      rootRef.current.rotation.y = 0.34 + m.x * 0.08;
      rootRef.current.rotation.x = 0.06 + m.y * 0.03;
    }

    if (torsoWireRef.current) {
      torsoWireRef.current.rotation.y = t * 0.08;
    }
    if (haloARef.current) {
      haloARef.current.rotation.z = t * 0.18;
      haloARef.current.rotation.x = Math.PI / 2.25 + Math.sin(t * 0.24) * 0.08;
    }
    if (haloBRef.current) {
      haloBRef.current.rotation.z = -t * 0.12;
      haloBRef.current.rotation.y = Math.PI / 5 + Math.sin(t * 0.18) * 0.1;
    }
    if (scanRef.current) {
      scanRef.current.position.y = -0.36 + ((Math.sin(t * 0.85) + 1) / 2) * 1.36;
      const mat = scanRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.2 + Math.sin(t * 1.7) * 0.08;
    }
  });

  const skinMat = TJ_MATERIAL.coreAccent;
  const accentMat = TJ_MATERIAL.liquidCyan;
  const wireMat = TJ_MATERIAL.brushedAccent;

  const UPPER_ARM_LEN = 1.0;
  const FOREARM_LEN = 0.95;
  const SHOULDER_Y = 0.7;
  const SHOULDER_X = 0.72;
  const UPPER_ARM_DROP = -UPPER_ARM_LEN / 2;
  const ELBOW_Y = -UPPER_ARM_LEN;
  const FOREARM_DROP = -FOREARM_LEN / 2;
  const HAND_Y = -FOREARM_LEN;

  const Dumbbell = (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.62, 16]} />
        <meshStandardMaterial {...accentMat} />
      </mesh>
      {[-0.28, 0.28].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.16, 24]} />
            <meshStandardMaterial {...TJ_MATERIAL.polishedObsidian} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.16, 0.018, 10, 40]} />
            <meshStandardMaterial {...accentMat} />
          </mesh>
        </group>
      ))}
    </group>
  );

  const ArmGroup = ({
    side,
    forearmRef,
    bicepRef
  }: {
    side: 1 | -1;
    forearmRef: React.RefObject<THREE.Group>;
    bicepRef: React.RefObject<THREE.Mesh>;
  }) => (
    <group position={[SHOULDER_X * side, SHOULDER_Y, 0.05]}>
      <mesh>
        <icosahedronGeometry args={[0.22, 1]} />
        <meshStandardMaterial {...skinMat} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, UPPER_ARM_DROP, 0]}>
        <cylinderGeometry args={[0.13, 0.1, UPPER_ARM_LEN, 16]} />
        <meshStandardMaterial {...skinMat} emissiveIntensity={0.5} />
      </mesh>
      <mesh ref={bicepRef} position={[side * 0.02, UPPER_ARM_DROP + 0.12, 0.06]}>
        <sphereGeometry args={[0.14, 18, 14]} />
        <meshStandardMaterial color={TJ_PALETTE.accentHi} emissive={TJ_PALETTE.accent} emissiveIntensity={0.55} metalness={0.2} roughness={0.2} />
      </mesh>
      <group ref={forearmRef} position={[0, ELBOW_Y, 0]}>
        <mesh position={[0, 0, 0]}>
          <icosahedronGeometry args={[0.11, 0]} />
          <meshStandardMaterial {...skinMat} emissiveIntensity={0.45} />
        </mesh>
        <mesh position={[0, FOREARM_DROP, 0]}>
          <cylinderGeometry args={[0.1, 0.085, FOREARM_LEN, 14]} />
          <meshStandardMaterial {...skinMat} emissiveIntensity={0.45} />
        </mesh>
        <group position={[0, HAND_Y - 0.02, 0]}>
          <mesh>
            <icosahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial {...skinMat} emissiveIntensity={0.5} />
          </mesh>
          {Dumbbell}
        </group>
      </group>
    </group>
  );

  return (
    <group ref={rootRef} position={[0, -0.15, 0]}>
      <mesh ref={haloARef} rotation={[Math.PI / 2.25, 0, 0]} position={[0, 0.42, -0.1]}>
        <torusGeometry args={[2.0, 0.01, 8, 180]} />
        <meshStandardMaterial color={TJ_PALETTE.accentHi} emissive={TJ_PALETTE.accent} emissiveIntensity={0.7} transparent opacity={0.72} metalness={0.5} roughness={0.2} />
      </mesh>
      <mesh ref={haloBRef} rotation={[Math.PI / 2.85, Math.PI / 5, 0]} position={[0, 0.36, -0.22]}>
        <torusGeometry args={[2.42, 0.006, 8, 220]} />
        <meshStandardMaterial color={TJ_PALETTE.frostIce} emissive={TJ_PALETTE.accent} emissiveIntensity={0.34} transparent opacity={0.36} metalness={0.7} roughness={0.28} />
      </mesh>

      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.3, 28, 20]} />
        <meshStandardMaterial {...skinMat} emissiveIntensity={0.55} transparent opacity={0.92} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <icosahedronGeometry args={[0.43, 1]} />
        <meshStandardMaterial color={TJ_PALETTE.accentHi} wireframe transparent opacity={0.22} emissive={TJ_PALETTE.accent} emissiveIntensity={0.42} />
      </mesh>
      <mesh position={[0, 1.18, 0]}>
        <cylinderGeometry args={[0.13, 0.18, 0.2, 14]} />
        <meshStandardMaterial {...skinMat} emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.72, 0.48, 1.28, 36]} />
        <meshStandardMaterial color={TJ_PALETTE.accentHi} emissive={TJ_PALETTE.accent} emissiveIntensity={0.52} metalness={0.42} roughness={0.22} transparent opacity={0.9} />
      </mesh>
      <mesh ref={scanRef} position={[0, 0.12, 0.02]}>
        <cylinderGeometry args={[0.76, 0.52, 0.035, 48, 1, true]} />
        <meshStandardMaterial color={TJ_PALETTE.accentHi} emissive={TJ_PALETTE.accent} emissiveIntensity={1.1} transparent opacity={0.24} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={torsoWireRef} position={[0, 0.45, 0]}>
        <icosahedronGeometry args={[1.22, 2]} />
        <meshStandardMaterial color={TJ_PALETTE.accentHi} wireframe transparent opacity={0.22} emissive={TJ_PALETTE.accent} emissiveIntensity={0.46} />
      </mesh>
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.52, 0.7, 0.5, 10]} />
        <meshStandardMaterial {...skinMat} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, -1.25, 0]}>
        <coneGeometry args={[0.62, 1.3, 6]} />
        <meshStandardMaterial {...wireMat} wireframe transparent opacity={0.42} emissive={TJ_PALETTE.accent} emissiveIntensity={0.3} />
      </mesh>

      <ArmGroup side={-1} forearmRef={leftForearmRef} bicepRef={leftBicepRef} />
      <ArmGroup side={1} forearmRef={rightForearmRef} bicepRef={rightBicepRef} />

      <mesh position={[0, 0.3, -0.6]}>
        <torusGeometry args={[1.9, 0.006, 8, 140]} />
        <meshStandardMaterial color={TJ_PALETTE.accentHi} emissive={TJ_PALETTE.accent} emissiveIntensity={0.6} transparent opacity={0.55} />
      </mesh>
      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const radius = 1.42 + (i % 3) * 0.18;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, -0.36 + (i % 6) * 0.32, Math.sin(angle) * 0.36 - 0.18]}>
            <sphereGeometry args={[0.022 + (i % 2) * 0.008, 10, 8]} />
            <meshStandardMaterial color={TJ_PALETTE.accentHi} emissive={TJ_PALETTE.accent} emissiveIntensity={0.9} transparent opacity={0.72} />
          </mesh>
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
        <meshStandardMaterial {...TJ_MATERIAL.coreAccent} />
      </mesh>
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[1.85, 1]} />
        <meshStandardMaterial {...TJ_MATERIAL.onyxGlass} wireframe transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.3, 0.006, 8, 200]} />
        <meshStandardMaterial {...TJ_MATERIAL.liquidCyan} />
      </mesh>
    </group>
  );
}
