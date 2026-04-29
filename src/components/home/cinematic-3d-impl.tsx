"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function CoreOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    const m = meshRef.current;
    if (!m) return;
    m.rotation.y += delta * 0.18;
    m.rotation.x += delta * 0.08;
  });
  return (
    <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.25, 1]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#0ea5e9"
          emissiveIntensity={1.6}
          metalness={0.45}
          roughness={0.2}
          wireframe
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.18, 0]} />
        <meshStandardMaterial
          color="#06080d"
          emissive="#0891b2"
          emissiveIntensity={0.42}
          transparent
          opacity={0.55}
        />
      </mesh>
    </Float>
  );
}

function OrbitRings() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.z += delta * 0.05;
  });
  return (
    <group ref={groupRef}>
      {[1.85, 2.4, 3.05].map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.18, i * 0.4, 0]}>
          <torusGeometry args={[r, 0.006, 16, 120]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.45 - i * 0.1} />
        </mesh>
      ))}
    </group>
  );
}

function PointerCamera() {
  const tx = useRef(0);
  const ty = useRef(0);
  useFrame(({ camera, mouse }) => {
    tx.current = THREE.MathUtils.lerp(tx.current, mouse.x * 0.6, 0.05);
    ty.current = THREE.MathUtils.lerp(ty.current, mouse.y * 0.4, 0.05);
    camera.position.x = tx.current;
    camera.position.y = ty.current;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export function Cinematic3DSceneImpl() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5.5], fov: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <fog attach="fog" args={["#06080d", 6, 14]} />
        <ambientLight intensity={0.18} />
        <pointLight position={[3, 2, 3]} intensity={1.4} color="#22d3ee" />
        <pointLight position={[-3, -1, -1]} intensity={0.85} color="#3b82f6" />
        <CoreOrb />
        <OrbitRings />
        <Sparkles count={220} scale={[10, 10, 10]} size={1.8} speed={0.45} color="#67e8f9" opacity={0.7} />
        <PointerCamera />
      </Suspense>
    </Canvas>
  );
}
