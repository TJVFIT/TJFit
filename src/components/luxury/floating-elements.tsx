"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

const PARTICLE_COUNT = 32;

const LINE_A: [number, number, number][] = [
  [-4.2, 1.1, 0.5],
  [3.8, -0.6, -0.8]
];
const LINE_B: [number, number, number][] = [
  [-3.5, -1.8, -0.4],
  [2.9, 2.1, 0.3]
];

function useParticleGeometry() {
  return useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 7;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);
}

function useLineGeometry(points: [number, number, number][]) {
  return useMemo(() => {
    const arr = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      arr[i * 3] = p[0];
      arr[i * 3 + 1] = p[1];
      arr[i * 3 + 2] = p[2];
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return geo;
  }, [points]);
}

/**
 * Low-poly abstract fitness-adjacent shapes: rings, icosahedron wireframe, particles, lines.
 */
export function FloatingElements() {
  const spinRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const particleGeo = useParticleGeometry();
  const lineGeoA = useLineGeometry(LINE_A);
  const lineGeoB = useLineGeometry(LINE_B);

  useFrame((_, delta) => {
    if (spinRef.current) spinRef.current.rotation.y += delta * 0.055;
    if (particlesRef.current) particlesRef.current.rotation.y -= delta * 0.018;
  });

  return (
    <group ref={spinRef}>
      <points ref={particlesRef} geometry={particleGeo}>
        <pointsMaterial
          color="#5eead4"
          size={0.038}
          transparent
          opacity={0.42}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      <lineSegments geometry={lineGeoA}>
        <lineBasicMaterial color="#22d3ee" transparent opacity={0.28} />
      </lineSegments>
      <lineSegments geometry={lineGeoB}>
        <lineBasicMaterial color="#a78bfa" transparent opacity={0.22} />
      </lineSegments>

      <Float speed={1.4} floatIntensity={0.32} rotationIntensity={0.12}>
        <mesh rotation={[0.45, 0.35, 0]} position={[2.4, 0.6, -0.8]}>
          <torusGeometry args={[1.05, 0.035, 10, 40]} />
          <meshStandardMaterial
            color="#0e7490"
            emissive="#22d3ee"
            emissiveIntensity={0.32}
            metalness={0.45}
            roughness={0.38}
          />
        </mesh>
      </Float>

      <Float speed={1.1} floatIntensity={0.28} rotationIntensity={0.18}>
        <mesh rotation={[-0.3, 0.9, 0.2]} position={[-2.2, -0.4, 0.2]}>
          <torusGeometry args={[0.72, 0.028, 10, 32]} />
          <meshStandardMaterial
            color="#4c1d95"
            emissive="#a78bfa"
            emissiveIntensity={0.28}
            metalness={0.35}
            roughness={0.42}
          />
        </mesh>
      </Float>

      <Float speed={1.6} floatIntensity={0.22} rotationIntensity={0.25}>
        <mesh position={[0.2, 1.5, -1.2]} rotation={[0.2, 0.5, 0.1]}>
          <icosahedronGeometry args={[0.55, 0]} />
          <meshBasicMaterial color="#71717a" wireframe transparent opacity={0.32} />
        </mesh>
      </Float>

      <Float speed={1.2} floatIntensity={0.2} rotationIntensity={0.1}>
        <mesh position={[-1.2, 1.3, 0.4]} rotation={[1.1, 0, 0.4]}>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial
            color="#164e63"
            emissive="#22d3ee"
            emissiveIntensity={0.45}
            metalness={0.5}
            roughness={0.25}
          />
        </mesh>
      </Float>

      <mesh position={[1.6, -1.1, 0.6]} rotation={[0.3, 0, 0.5]}>
        <octahedronGeometry args={[0.38, 0]} />
        <meshStandardMaterial
          color="#312e81"
          emissive="#818cf8"
          emissiveIntensity={0.22}
          metalness={0.4}
          roughness={0.45}
        />
      </mesh>
    </group>
  );
}
