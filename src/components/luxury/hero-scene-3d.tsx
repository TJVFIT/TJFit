"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { FloatingElements } from "@/components/luxury/floating-elements";

function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 1.55;
      target.current.y = -(e.clientY / window.innerHeight - 0.5) * 1.05;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => window.removeEventListener("pointermove", onPointer);
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    const k = 1 - Math.pow(0.0015, delta);
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, target.current.x, k * 0.1);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, target.current.y, k * 0.1);
  });

  return <group ref={group}>{children}</group>;
}

export type HeroScene3DProps = {
  className?: string;
  onReady?: () => void;
};

/**
 * Full-bleed WebGL layer for the luxury hero. Keep text in DOM overlay above this canvas.
 */
export function HeroScene3D({ className = "", onReady }: HeroScene3DProps) {
  return (
    <Canvas
      className={className}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true
      }}
      dpr={[1, 1.5]}
      camera={{ fov: 42, near: 0.1, far: 50, position: [0, 0, 10] }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(0x000000, 0);
        scene.fog = new THREE.Fog("#0A0A0B", 8, 26);
        onReady?.();
      }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.13} />
        <directionalLight position={[4, 6, 8]} intensity={0.32} color="#e4e4e7" />
        <pointLight position={[6, 2, 5]} intensity={0.85} color="#22d3ee" distance={24} decay={2} />
        <pointLight position={[-5, -3, 5]} intensity={0.52} color="#a78bfa" distance={20} decay={2} />
        <ParallaxRig>
          <FloatingElements />
        </ParallaxRig>
      </Suspense>
    </Canvas>
  );
}
