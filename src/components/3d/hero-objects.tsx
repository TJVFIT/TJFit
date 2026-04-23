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

/** Alternating dumbbell curl athlete — homepage hero centerpiece. */
export function CurlAthleteCenterpiece({ pointerRef, speed = 1 }: HeroProps) {
  const rootRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);
  const leftBicepRef = useRef<THREE.Mesh>(null);
  const rightBicepRef = useRef<THREE.Mesh>(null);
  const leftPecRef = useRef<THREE.Mesh>(null);
  const rightPecRef = useRef<THREE.Mesh>(null);
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

    const pulseBicep = (ref: React.RefObject<THREE.Mesh>, amt: number) => {
      if (!ref.current) return;
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.65 + amt * 0.8;
      const s = 1 + amt * 0.14;
      ref.current.scale.set(s, s * 0.95, s);
    };
    pulseBicep(leftBicepRef, leftAmt);
    pulseBicep(rightBicepRef, rightAmt);

    const pulsePec = (ref: React.RefObject<THREE.Mesh>, amt: number) => {
      if (!ref.current) return;
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + amt * 0.4;
    };
    pulsePec(leftPecRef, leftAmt);
    pulsePec(rightPecRef, rightAmt);

    if (rootRef.current) {
      const breath = Math.sin(t * 0.9) * 0.02;
      rootRef.current.position.y = -0.15 + breath;
      rootRef.current.rotation.z = (leftAmt - rightAmt) * 0.05;
      rootRef.current.rotation.y = -0.22 + m.x * 0.06;
      rootRef.current.rotation.x = 0.05 + m.y * 0.03;
    }

    if (torsoWireRef.current) {
      torsoWireRef.current.rotation.y = t * 0.1;
    }
  });

  const skinMat = TJ_MATERIAL.emberCore;
  const accentMat = TJ_MATERIAL.liquidGold;

  const UPPER_ARM_LEN = 1.05;
  const FOREARM_LEN = 0.95;
  const SHOULDER_Y = 0.78;
  const SHOULDER_X = 1.08;
  const UPPER_ARM_DROP = -UPPER_ARM_LEN / 2;
  const ELBOW_Y = -UPPER_ARM_LEN;
  const FOREARM_DROP = -FOREARM_LEN / 2;
  const HAND_Y = -FOREARM_LEN;

  const Dumbbell = (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.055, 0.68, 16]} />
        <meshStandardMaterial {...accentMat} />
      </mesh>
      {[-0.32, 0.32].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.19, 0.19, 0.2, 24]} />
            <meshStandardMaterial {...TJ_MATERIAL.polishedObsidian} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.19, 0.02, 10, 40]} />
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
      {/* Deltoid cap — big round shoulder, signature "jacked" silhouette */}
      <mesh position={[side * 0.05, 0.04, 0]}>
        <sphereGeometry args={[0.34, 20, 16]} />
        <meshStandardMaterial color={TJ_PALETTE.champagneHi} emissive={TJ_PALETTE.champagne} emissiveIntensity={0.55} metalness={0.25} roughness={0.22} />
      </mesh>
      {/* Upper arm — tapered from thick shoulder to narrower elbow */}
      <mesh position={[0, UPPER_ARM_DROP, 0]}>
        <cylinderGeometry args={[0.22, 0.15, UPPER_ARM_LEN, 18]} />
        <meshStandardMaterial {...skinMat} emissiveIntensity={0.55} />
      </mesh>
      {/* Bicep peak — front-facing bulge that swells on the concentric */}
      <mesh ref={bicepRef} position={[side * 0.04, UPPER_ARM_DROP + 0.15, 0.14]}>
        <sphereGeometry args={[0.2, 22, 18]} />
        <meshStandardMaterial color={TJ_PALETTE.champagneHi} emissive={TJ_PALETTE.champagne} emissiveIntensity={0.65} metalness={0.2} roughness={0.2} />
      </mesh>
      {/* Tricep mass — back of the upper arm */}
      <mesh position={[side * 0.02, UPPER_ARM_DROP, -0.14]}>
        <sphereGeometry args={[0.18, 18, 14]} />
        <meshStandardMaterial {...skinMat} emissiveIntensity={0.5} />
      </mesh>
      <group ref={forearmRef} position={[0, ELBOW_Y, 0]}>
        {/* Elbow joint */}
        <mesh>
          <icosahedronGeometry args={[0.15, 0]} />
          <meshStandardMaterial {...skinMat} emissiveIntensity={0.5} />
        </mesh>
        {/* Forearm — bulges in the middle (brachioradialis) */}
        <mesh position={[0, FOREARM_DROP, 0]}>
          <cylinderGeometry args={[0.16, 0.11, FOREARM_LEN, 16]} />
          <meshStandardMaterial {...skinMat} emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, FOREARM_DROP + 0.1, 0.06]}>
          <sphereGeometry args={[0.14, 16, 12]} />
          <meshStandardMaterial {...skinMat} emissiveIntensity={0.55} />
        </mesh>
        {/* Hand + dumbbell */}
        <group position={[0, HAND_Y - 0.02, 0]}>
          <mesh>
            <icosahedronGeometry args={[0.15, 0]} />
            <meshStandardMaterial {...skinMat} emissiveIntensity={0.5} />
          </mesh>
          {Dumbbell}
        </group>
      </group>
    </group>
  );

  return (
    <group ref={rootRef} position={[0, -0.15, 0]}>
      {/* Head — faceless icosahedron, squared-off jaw via scaling */}
      <mesh position={[0, 1.78, 0]} scale={[0.95, 1.05, 0.95]}>
        <icosahedronGeometry args={[0.36, 1]} />
        <meshStandardMaterial {...skinMat} emissiveIntensity={0.55} />
      </mesh>
      {/* Thick neck + traps ridge */}
      <mesh position={[0, 1.32, 0]}>
        <cylinderGeometry args={[0.2, 0.34, 0.28, 14]} />
        <meshStandardMaterial {...skinMat} emissiveIntensity={0.5} />
      </mesh>
      {/* Trap caps — the "no-neck" lift on either side */}
      {[-0.34, 0.34].map((x) => (
        <mesh key={x} position={[x, 1.18, 0]}>
          <sphereGeometry args={[0.2, 16, 12]} />
          <meshStandardMaterial {...skinMat} emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* Torso — wide chest tapering into narrow waist = V-shape */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[1.15, 0.55, 1.6, 12]} />
        <meshStandardMaterial color={TJ_PALETTE.champagneHi} emissive={TJ_PALETTE.champagne} emissiveIntensity={0.42} metalness={0.3} roughness={0.25} />
      </mesh>
      {/* Pec slabs — two separate domes for chest mass */}
      <mesh ref={leftPecRef} position={[-0.42, 0.88, 0.55]} rotation={[0, -0.08, 0.08]}>
        <sphereGeometry args={[0.48, 22, 16]} />
        <meshStandardMaterial color={TJ_PALETTE.champagneHi} emissive={TJ_PALETTE.champagne} emissiveIntensity={0.55} metalness={0.25} roughness={0.28} />
      </mesh>
      <mesh ref={rightPecRef} position={[0.42, 0.88, 0.55]} rotation={[0, 0.08, -0.08]}>
        <sphereGeometry args={[0.48, 22, 16]} />
        <meshStandardMaterial color={TJ_PALETTE.champagneHi} emissive={TJ_PALETTE.champagne} emissiveIntensity={0.55} metalness={0.25} roughness={0.28} />
      </mesh>
      {/* Ab block — six-pack read without detail */}
      <mesh position={[0, 0.15, 0.5]}>
        <boxGeometry args={[0.55, 0.68, 0.22]} />
        <meshStandardMaterial color={TJ_PALETTE.champagneHi} emissive={TJ_PALETTE.champagne} emissiveIntensity={0.45} metalness={0.2} roughness={0.3} />
      </mesh>
      {/* Lat spread — flare at mid-torso sells the V-taper from the side */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.68, 0.5, -0.1]} rotation={[0, 0, s * -0.18]}>
          <boxGeometry args={[0.28, 0.9, 0.45]} />
          <meshStandardMaterial {...skinMat} emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* Wireframe shell — premium "tech" overlay */}
      <mesh ref={torsoWireRef} position={[0, 0.45, 0]}>
        <icosahedronGeometry args={[1.48, 1]} />
        <meshStandardMaterial color={TJ_PALETTE.champagneHi} wireframe transparent opacity={0.28} emissive={TJ_PALETTE.champagne} emissiveIntensity={0.38} />
      </mesh>

      {/* Hips — narrow */}
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.42, 10]} />
        <meshStandardMaterial {...skinMat} emissiveIntensity={0.5} />
      </mesh>

      {/* Legs — individual quads for a serious lower body, not a wireframe cone */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.3, -1.1, 0]}>
          <mesh position={[0, 0, 0.02]}>
            <cylinderGeometry args={[0.32, 0.22, 1.2, 14]} />
            <meshStandardMaterial {...skinMat} emissiveIntensity={0.5} />
          </mesh>
          {/* Quad bulge */}
          <mesh position={[s * -0.04, 0.05, 0.22]}>
            <sphereGeometry args={[0.22, 16, 12]} />
            <meshStandardMaterial color={TJ_PALETTE.champagneHi} emissive={TJ_PALETTE.champagne} emissiveIntensity={0.45} metalness={0.2} roughness={0.3} />
          </mesh>
          {/* Calf */}
          <mesh position={[0, -0.95, 0]}>
            <cylinderGeometry args={[0.2, 0.13, 0.8, 12]} />
            <meshStandardMaterial {...skinMat} emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, -0.85, -0.14]}>
            <sphereGeometry args={[0.18, 14, 12]} />
            <meshStandardMaterial {...skinMat} emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}

      <ArmGroup side={-1} forearmRef={leftForearmRef} bicepRef={leftBicepRef} />
      <ArmGroup side={1} forearmRef={rightForearmRef} bicepRef={rightBicepRef} />

      {/* Aura halo behind figure */}
      <mesh position={[0, 0.3, -0.7]}>
        <torusGeometry args={[2.1, 0.008, 8, 140]} />
        <meshStandardMaterial color={TJ_PALETTE.champagneHi} emissive={TJ_PALETTE.champagne} emissiveIntensity={0.7} transparent opacity={0.6} />
      </mesh>
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
