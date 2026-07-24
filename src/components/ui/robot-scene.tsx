"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";

function Dumbbell() {
  return (
    <group rotation={[0, 0, Math.PI / 2]} position={[0, -1.5, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.075, 0.075, 1.2, 18]} />
        <meshStandardMaterial color="#8ba7dc" metalness={0.82} roughness={0.24} />
      </mesh>
      {[-0.72, -0.55, 0.55, 0.72].map((position, index) => (
        <mesh key={position} position={[0, position, 0]} castShadow>
          <cylinderGeometry
            args={[
              index === 0 || index === 3 ? 0.34 : 0.29,
              index === 0 || index === 3 ? 0.34 : 0.29,
              0.2,
              20
            ]}
          />
          <meshStandardMaterial
            color={index === 0 || index === 3 ? "#1b315d" : "#2f6de8"}
            metalness={0.48}
            roughness={0.34}
          />
        </mesh>
      ))}
    </group>
  );
}

function ParticleField() {
  const positions = useMemo(() => {
    const values = new Float32Array(84 * 3);
    for (let index = 0; index < 84; index += 1) {
      const offset = index * 3;
      values[offset] = ((index * 47) % 100) / 11 - 4.5;
      values[offset + 1] = ((index * 29) % 100) / 13 - 3.2;
      values[offset + 2] = ((index * 61) % 100) / 15 - 3.3;
    }
    return values;
  }, []);

  const pointsRef = useRef<Group>(null);
  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.025;
  });

  return (
    <group ref={pointsRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#8eabef" opacity={0.42} transparent size={0.026} sizeAttenuation />
      </points>
    </group>
  );
}

function Robot({ onToggle }: { onToggle: () => void }) {
  const robotRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const [lifting, setLifting] = useState(false);

  useFrame((state, delta) => {
    if (robotRef.current) {
      robotRef.current.rotation.y = MathUtils.damp(
        robotRef.current.rotation.y,
        state.pointer.x * 0.3 + Math.sin(state.clock.elapsedTime * 0.24) * 0.08,
        4,
        delta
      );
      robotRef.current.rotation.x = MathUtils.damp(
        robotRef.current.rotation.x,
        state.pointer.y * -0.07,
        4,
        delta
      );
      robotRef.current.position.y = -0.65 + Math.sin(state.clock.elapsedTime * 1.15) * 0.055;
    }
    if (rightArmRef.current) {
      const target = lifting ? -1.02 : -0.12;
      rightArmRef.current.rotation.x = MathUtils.damp(rightArmRef.current.rotation.x, target, 5, delta);
    }
  });

  const toggleLift = () => {
    setLifting((current) => !current);
    onToggle();
  };

  return (
    <group ref={robotRef} position={[0, -0.65, 0]} onClick={toggleLift}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[1.35, 1.55, 0.72, 2, 2, 2]} />
        <meshStandardMaterial color="#dbe6fa" metalness={0.58} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.94, 0.42]}>
        <boxGeometry args={[0.82, 0.42, 0.12]} />
        <meshStandardMaterial color="#10244a" metalness={0.72} roughness={0.18} />
      </mesh>
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[0.96, 0.86, 0.72, 2, 2, 2]} />
        <meshStandardMaterial color="#eff4ff" metalness={0.55} roughness={0.22} />
      </mesh>

      {[-0.22, 0.22].map((x) => (
        <mesh key={x} position={[x, 2.03, 0.47]}>
          <boxGeometry args={[0.14, 0.055, 0.04]} />
          <meshStandardMaterial color="#88aaff" emissive="#386ff0" emissiveIntensity={2.4} />
        </mesh>
      ))}

      <mesh position={[0, 0.82, 0.39]}>
        <circleGeometry args={[0.22, 24]} />
        <meshStandardMaterial color="#274f9e" emissive="#235ccb" emissiveIntensity={1.1} metalness={0.52} />
      </mesh>

      <group position={[-0.9, 1.32, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.25, 18, 18]} />
          <meshStandardMaterial color="#b9cae9" metalness={0.52} roughness={0.28} />
        </mesh>
        <mesh position={[0, -0.62, 0]} castShadow>
          <capsuleGeometry args={[0.18, 0.78, 6, 14]} />
          <meshStandardMaterial color="#d6e1f5" metalness={0.48} roughness={0.26} />
        </mesh>
        <mesh position={[0, -1.24, 0]} castShadow>
          <capsuleGeometry args={[0.16, 0.6, 6, 14]} />
          <meshStandardMaterial color="#a9bcdf" metalness={0.55} roughness={0.25} />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[0.9, 1.32, 0]} rotation={[-0.12, 0, -0.08]}>
        <mesh castShadow>
          <sphereGeometry args={[0.25, 18, 18]} />
          <meshStandardMaterial color="#b9cae9" metalness={0.52} roughness={0.28} />
        </mesh>
        <mesh position={[0, -0.62, 0]} castShadow>
          <capsuleGeometry args={[0.18, 0.78, 6, 14]} />
          <meshStandardMaterial color="#d6e1f5" metalness={0.48} roughness={0.26} />
        </mesh>
        <mesh position={[0, -1.18, 0]} castShadow>
          <sphereGeometry args={[0.2, 18, 18]} />
          <meshStandardMaterial color="#315fbd" metalness={0.55} roughness={0.23} />
        </mesh>
        <Dumbbell />
      </group>

      {[-0.42, 0.42].map((x) => (
        <group key={x} position={[x, -0.2, 0]}>
          <mesh position={[0, -0.55, 0]} castShadow>
            <capsuleGeometry args={[0.23, 0.88, 6, 14]} />
            <meshStandardMaterial color="#afc1e2" metalness={0.46} roughness={0.3} />
          </mesh>
          <mesh position={[0, -1.42, 0.08]} castShadow>
            <capsuleGeometry args={[0.2, 0.72, 6, 14]} />
            <meshStandardMaterial color="#d3def1" metalness={0.45} roughness={0.28} />
          </mesh>
          <mesh position={[0, -1.98, 0.22]} castShadow>
            <boxGeometry args={[0.58, 0.25, 0.92]} />
            <meshStandardMaterial color="#152d5b" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function RobotScene({ className }: { className?: string }) {
  const [liftCount, setLiftCount] = useState(0);

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.45]}
        camera={{ position: [4.8, 3.15, 7.2], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        shadows
        fallback={
          <div className="grid h-full place-items-center text-sm text-zinc-400">
            3D preview unavailable
          </div>
        }
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.45} />
          <directionalLight position={[4, 7, 5]} intensity={3.3} color="#dce8ff" castShadow />
          <pointLight position={[-4, 2, 3]} intensity={18} distance={9} color="#376fe8" />
          <pointLight position={[3, -1, 2]} intensity={8} distance={7} color="#86a9ff" />
          <ParticleField />
          <Robot onToggle={() => setLiftCount((count) => count + 1)} />
          <mesh position={[0, -2.72, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[3.2, 40]} />
            <shadowMaterial color="#020713" opacity={0.52} transparent />
          </mesh>
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute bottom-5 left-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
        <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-accent-soft" />
        move to inspect / tap robot to lift
      </div>
      <output className="sr-only" aria-live="polite">
        {liftCount > 0 ? `Robot dumbbell lifts: ${liftCount}` : ""}
      </output>
    </div>
  );
}
