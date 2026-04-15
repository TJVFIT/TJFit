"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { Suspense, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

export type HeroMouseRef = MutableRefObject<{ x: number; y: number }>;

// Central torus-knot — the signature 3D element of TJFit
function CentralOrb({ mouseRef }: { mouseRef: HeroMouseRef }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const m = mouseRef.current;

    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(t * 0.12) * 0.3 + m.y * 0.08;
      meshRef.current.rotation.y = t * 0.18 + m.x * 0.08;
      // Pulsing emissive
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + Math.sin(t * 1.2) * 0.25;
    }
    if (wireRef.current) {
      wireRef.current.rotation.x = Math.sin(t * 0.12) * 0.3 + m.y * 0.08;
      wireRef.current.rotation.y = t * 0.18 + m.x * 0.08;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.25;
      ringRef.current.rotation.z = t * 0.15;
    }
  });

  return (
    <group>
      {/* Central torus-knot — solid */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <torusKnotGeometry args={[1.3, 0.38, 180, 24, 2, 3]} />
        <meshStandardMaterial
          color="#061820"
          emissive="#22d3ee"
          emissiveIntensity={0.6}
          roughness={0.05}
          metalness={0.95}
        />
      </mesh>

      {/* Wireframe overlay for depth */}
      <mesh ref={wireRef} position={[0, 0, 0]}>
        <torusKnotGeometry args={[1.31, 0.39, 120, 16, 2, 3]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.12} />
      </mesh>

      {/* Orbital ring 1 */}
      <mesh ref={ringRef} position={[0, 0, 0]}>
        <torusGeometry args={[2.2, 0.018, 8, 120]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Orbital ring 2 */}
      <mesh rotation={[Math.PI / 3, 0, Math.PI / 4]} position={[0, 0, 0]}>
        <torusGeometry args={[2.8, 0.012, 8, 120]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#a78bfa"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}

// Orbiting satellites
function Satellites() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.22;
      groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.15;
    }
  });

  const positions: [number, number, number][] = [
    [3.8, 0.8, 0.5],
    [-3.5, -0.6, 1.0],
    [1.2, 3.2, -0.8],
    [-1.4, -3.0, 0.6],
    [2.8, -1.8, -1.2],
    [-2.4, 1.6, -1.5]
  ];

  const colors = ["#22d3ee", "#a78bfa", "#22d3ee", "#67e8f9", "#a78bfa", "#22d3ee"];

  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => (
        <Float key={i} speed={1.2 + i * 0.3} rotationIntensity={0.8} floatIntensity={0.5}>
          <mesh position={pos}>
            <octahedronGeometry args={[0.15 + (i % 3) * 0.06, 0]} />
            <meshStandardMaterial
              color={colors[i]}
              emissive={colors[i]}
              emissiveIntensity={0.6 + (i % 3) * 0.2}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function Scene({ mouseRef }: { mouseRef: HeroMouseRef }) {
  useFrame((state, delta) => {
    const m = mouseRef.current;
    const cam = state.camera;
    const tx = m.x * 0.6;
    const ty = m.y * -0.4 + 0.1;
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, tx, delta * 0.8);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, ty, delta * 0.8);
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, 6.5, delta * 0.5);
    cam.lookAt(0, 0, 0);
  });

  return (
    <>
      {/* Atmospheric sparkles */}
      <Sparkles count={120} scale={12} size={1.2} speed={0.3} color="#22d3ee" opacity={0.5} />
      <Sparkles count={60} scale={16} size={0.8} speed={0.2} color="#a78bfa" opacity={0.3} />

      <CentralOrb mouseRef={mouseRef} />
      <Satellites />
    </>
  );
}

function Lights() {
  const light1 = useRef<THREE.PointLight>(null);
  const light2 = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (light1.current) {
      light1.current.intensity = 2.5 + Math.sin(t * 0.8) * 0.8;
    }
    if (light2.current) {
      light2.current.intensity = 1.8 + Math.cos(t * 0.6) * 0.6;
    }
  });

  return (
    <>
      <ambientLight intensity={0.08} />
      <pointLight ref={light1} position={[4, 3, 4]} intensity={2.5} color="#22d3ee" distance={20} decay={1.8} />
      <pointLight ref={light2} position={[-4, -2, 3]} intensity={1.8} color="#a78bfa" distance={18} decay={1.8} />
      <pointLight position={[0, 5, 2]} intensity={0.8} color="#67e8f9" distance={14} decay={2} />
      <pointLight position={[0, -4, 1]} intensity={0.5} color="#7c3aed" distance={12} decay={2} />
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
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true
      }}
      camera={{ position: [0, 0, 6.5], fov: 45, near: 0.1, far: 50 }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      frameloop="always"
    >
      <fog attach="fog" args={["#09090b", 8, 28]} />
      <Suspense fallback={null}>
        <Lights />
        <Scene mouseRef={mouseRef} />
      </Suspense>
    </Canvas>
  );
}
