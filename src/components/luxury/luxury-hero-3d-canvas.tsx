"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { Suspense, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

export type HeroMouseRef = MutableRefObject<{ x: number; y: number }>;

function Scene({ mouseRef }: { mouseRef: HeroMouseRef }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const m = mouseRef.current;
    const cam = state.camera;
    const tx = m.x * 0.38;
    const ty = m.y * -0.24 + 0.12;
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, tx, Math.min(delta * 1.15, 0.15));
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, ty, Math.min(delta * 1.15, 0.15));
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, 5.15, Math.min(delta * 0.9, 0.12));
    cam.lookAt(0, 0, 0);

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.032;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.7} rotationIntensity={0.11} floatIntensity={0.32}>
        <mesh position={[-1.35, 0.25, -0.75]} rotation={[0.35, 0.55, 0.08]}>
          <octahedronGeometry args={[0.48, 0]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#06b6d4"
            emissiveIntensity={0.42}
            roughness={0.42}
            metalness={0.38}
            transparent
            opacity={0.9}
          />
        </mesh>
      </Float>

      <Float speed={1.35} rotationIntensity={0.09} floatIntensity={0.26}>
        <mesh position={[1.28, -0.12, -0.55]} rotation={[-0.22, -0.38, 0.18]}>
          <torusGeometry args={[0.3, 0.09, 8, 16]} />
          <meshStandardMaterial
            color="#a78bfa"
            emissive="#7c3aed"
            emissiveIntensity={0.36}
            roughness={0.48}
            metalness={0.42}
            transparent
            opacity={0.86}
          />
        </mesh>
      </Float>

      <Float speed={1.95} rotationIntensity={0.07} floatIntensity={0.2}>
        <mesh position={[0.15, 0.78, -1.1]} rotation={[0.48, 0.18, 0.12]}>
          <icosahedronGeometry args={[0.26, 0]} />
          <meshStandardMaterial
            color="#5eead4"
            emissive="#0d9488"
            emissiveIntensity={0.28}
            roughness={0.52}
            metalness={0.32}
            transparent
            opacity={0.58}
          />
        </mesh>
      </Float>

      <Float speed={1.55} rotationIntensity={0.05} floatIntensity={0.18}>
        <mesh position={[-0.45, -0.5, -0.25]} rotation={[0.08, 0.4, 0.05]} scale={[1.05, 0.07, 0.42]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#67e8f9"
            emissive="#0891b2"
            emissiveIntensity={0.22}
            roughness={0.58}
            metalness={0.48}
            transparent
            opacity={0.48}
          />
        </mesh>
      </Float>
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.14} />
      <pointLight position={[4, 2.2, 3.8]} intensity={1.15} color="#22d3ee" distance={14} decay={2} />
      <pointLight position={[-3.8, -0.8, 2.8]} intensity={0.85} color="#a78bfa" distance={12} decay={2} />
      <pointLight position={[0, 2.8, 1.8]} intensity={0.32} color="#e0e7ff" distance={10} decay={2} />
    </>
  );
}

export function LuxuryHero3DCanvas({ mouseRef }: { mouseRef: HeroMouseRef }) {
  return (
    <Canvas
      className="h-full w-full"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: true
      }}
      camera={{ position: [0, 0.12, 5.15], fov: 40, near: 0.1, far: 42 }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      frameloop="always"
    >
      <color attach="background" args={["#0A0A0B"]} />
      <fog attach="fog" args={["#0A0A0B", 4.2, 17]} />
      <Suspense fallback={null}>
        <Lights />
        <Scene mouseRef={mouseRef} />
      </Suspense>
    </Canvas>
  );
}
