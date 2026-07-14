"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";

import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { TJ_MATERIAL } from "@/components/3d/materials";
import { TJ_PALETTE } from "@/components/3d/palette";

type EnergyRef = MutableRefObject<number>;

/** TJ monogram centerpiece — boxed T + hooked J in brand metals, wireframe shell around it. */
function TJMonogram({ energyRef }: { energyRef: EnergyRef }) {
  const groupRef = useRef<THREE.Group>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const tStemRef = useRef<THREE.Mesh>(null);
  const jHookRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const e = energyRef.current;
    const t = state.clock.elapsedTime;
    g.rotation.y += delta * (0.16 + e * 0.5);
    g.rotation.x = Math.sin(t * 0.22) * 0.07;
    if (shellRef.current) shellRef.current.rotation.y -= delta * (0.05 + e * 0.12);
    if (tStemRef.current) {
      const mat = tStemRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.6 + e * 1.1;
    }
    if (jHookRef.current) {
      const mat = jHookRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + e * 0.9;
    }
  });

  return (
    <Float speed={1.3} rotationIntensity={0.2} floatIntensity={0.4}>
      <group ref={groupRef}>
        <group position={[0.3, 0, 0]}>
          <mesh position={[-0.72, 0.95, 0]}>
            <boxGeometry args={[1.35, 0.3, 0.3]} />
            <meshStandardMaterial {...TJ_MATERIAL.brushedAccent} />
          </mesh>
          <mesh ref={tStemRef} position={[-0.72, -0.08, 0]}>
            <boxGeometry args={[0.3, 1.75, 0.3]} />
            <meshStandardMaterial {...TJ_MATERIAL.coreAccent} />
          </mesh>

          <mesh position={[0.66, 0.95, 0]}>
            <boxGeometry args={[0.9, 0.28, 0.28]} />
            <meshStandardMaterial {...TJ_MATERIAL.brushedAccent} />
          </mesh>
          <mesh position={[0.66, 0.14, 0]}>
            <boxGeometry args={[0.28, 1.35, 0.28]} />
            <meshStandardMaterial {...TJ_MATERIAL.coreAccent} />
          </mesh>
          <mesh ref={jHookRef} position={[0.24, -0.53, 0]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.42, 0.14, 12, 48, Math.PI]} />
            <meshStandardMaterial {...TJ_MATERIAL.liquidCyan} />
          </mesh>
        </group>

        <mesh ref={shellRef}>
          <icosahedronGeometry args={[2.05, 1]} />
          <meshStandardMaterial {...TJ_MATERIAL.onyxGlass} wireframe transparent opacity={0.18} />
        </mesh>
      </group>
    </Float>
  );
}

const RING_RADII = [1.85, 2.4, 3.05];

function OrbitRings({ energyRef }: { energyRef: EnergyRef }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const e = energyRef.current;
    g.rotation.z += delta * (0.05 + e * 0.22);
    for (let i = 0; i < RING_RADII.length; i += 1) {
      const ring = ringRefs.current[i];
      if (ring) ring.scale.setScalar(1 + e * (0.06 + i * 0.05));
    }
  });

  return (
    <group ref={groupRef}>
      {RING_RADII.map((r, i) => (
        <mesh
          key={r}
          ref={(m) => {
            ringRefs.current[i] = m;
          }}
          rotation={[Math.PI / 2 + i * 0.18, i * 0.4, 0]}
        >
          <torusGeometry args={[r, 0.006, 16, 120]} />
          <meshBasicMaterial color={TJ_PALETTE.accent} transparent opacity={0.45 - i * 0.1} />
        </mesh>
      ))}
    </group>
  );
}

function PointerCamera() {
  const tx = useRef(0);
  const ty = useRef(0);
  // On touch devices there's no cursor to track — keep the camera in
  // its rest framing rather than letting `mouse.x/y` (which stays at
  // 0,0 with sporadic touch updates) jitter the view.
  const isTouch = useIsTouchDevice();
  useFrame(({ camera, mouse }) => {
    if (isTouch) return;
    tx.current = THREE.MathUtils.lerp(tx.current, mouse.x * 0.6, 0.05);
    ty.current = THREE.MathUtils.lerp(ty.current, mouse.y * 0.4, 0.05);
    camera.position.x = tx.current;
    camera.position.y = ty.current;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export function Cinematic3DSceneImpl() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const energyRef = useRef(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Scroll-through energy: 0 at section edges, 1 when centered in the viewport.
  useEffect(() => {
    if (reduce) {
      energyRef.current = 0;
      return;
    }
    const el = wrapRef.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress = THREE.MathUtils.clamp((vh - rect.top) / (vh + rect.height), 0, 1);
      energyRef.current = Math.sin(progress * Math.PI);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduce]);

  return (
    <div ref={wrapRef} className="h-full w-full">
      <Canvas
        frameloop={reduce ? "demand" : "always"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5.5], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={["#06080d", 6, 14]} />
          <ambientLight intensity={0.18} />
          <pointLight position={[3, 2, 3]} intensity={1.4} color="#A855F7" />
          <pointLight position={[-3, -1, -1]} intensity={0.85} color="#7C3AED" />
          <TJMonogram energyRef={energyRef} />
          <OrbitRings energyRef={energyRef} />
          <Sparkles count={220} scale={[10, 10, 10]} size={1.8} speed={0.45} color="#C4B5FD" opacity={0.7} />
          <PointerCamera />
        </Suspense>
      </Canvas>
    </div>
  );
}
