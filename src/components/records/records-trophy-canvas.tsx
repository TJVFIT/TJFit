"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

/** M8 — slow gold torus-knot “trophy” for records hero */
function TrophyMesh() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.35;
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[0.95, 0.3, 128, 32, 2, 3]} />
      <meshStandardMaterial
        color="#F59E0B"
        emissive="#F59E0B"
        emissiveIntensity={0.5}
        metalness={0.88}
        roughness={0.18}
      />
    </mesh>
  );
}

export default function RecordsTrophyCanvas() {
  return (
    <Canvas
      className="h-full w-full"
      style={{ background: "transparent" }}
      camera={{ position: [0, 0, 3.4], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 4]} intensity={1.15} color="#fff8e7" />
      <pointLight position={[-3, -2, 2]} intensity={0.6} color="#F59E0B" />
      <TrophyMesh />
    </Canvas>
  );
}
