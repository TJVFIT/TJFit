"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { cn } from "@/lib/utils";

const metal = (color: THREE.ColorRepresentation, roughness = 0.28) =>
  new THREE.MeshStandardMaterial({ color, metalness: 0.56, roughness });

function addMesh(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number],
  rotation?: [number, number, number]
) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function buildDumbbell() {
  const dumbbell = new THREE.Group();
  dumbbell.rotation.z = Math.PI / 2;
  dumbbell.position.set(0, -1.48, 0);

  addMesh(dumbbell, new THREE.CylinderGeometry(0.075, 0.075, 1.2, 18), metal("#8ba7dc", 0.24), [0, 0, 0]);
  [-0.72, -0.55, 0.55, 0.72].forEach((position, index) => {
    const outside = index === 0 || index === 3;
    addMesh(
      dumbbell,
      new THREE.CylinderGeometry(outside ? 0.34 : 0.29, outside ? 0.34 : 0.29, 0.2, 20),
      metal(outside ? "#1b315d" : "#2f6de8", 0.3),
      [0, position, 0]
    );
  });

  return dumbbell;
}

function buildRobot() {
  const robot = new THREE.Group();
  robot.position.set(0, -0.65, 0);

  addMesh(robot, new THREE.BoxGeometry(1.35, 1.55, 0.72, 2, 2, 2), metal("#dbe6fa", 0.25), [0, 0.8, 0]);
  addMesh(robot, new THREE.BoxGeometry(0.96, 0.86, 0.72, 2, 2, 2), metal("#eff4ff", 0.22), [0, 2, 0]);
  addMesh(robot, new THREE.BoxGeometry(0.82, 0.42, 0.12), metal("#10244a", 0.18), [0, 1.94, 0.42]);

  [-0.22, 0.22].forEach((x) => {
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: "#88aaff",
      emissive: "#386ff0",
      emissiveIntensity: 2.4
    });
    addMesh(robot, new THREE.BoxGeometry(0.14, 0.055, 0.04), eyeMaterial, [x, 2.03, 0.49]);
  });

  const chestMaterial = new THREE.MeshStandardMaterial({
    color: "#274f9e",
    emissive: "#235ccb",
    emissiveIntensity: 1.1,
    metalness: 0.52
  });
  addMesh(robot, new THREE.CylinderGeometry(0.22, 0.22, 0.05, 24), chestMaterial, [0, 0.82, 0.39], [
    Math.PI / 2,
    0,
    0
  ]);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.9, 1.32, 0);
  addMesh(leftArm, new THREE.SphereGeometry(0.25, 18, 18), metal("#b9cae9"), [0, 0, 0]);
  addMesh(leftArm, new THREE.CapsuleGeometry(0.18, 0.78, 6, 14), metal("#d6e1f5"), [0, -0.62, 0]);
  addMesh(leftArm, new THREE.CapsuleGeometry(0.16, 0.6, 6, 14), metal("#a9bcdf"), [0, -1.24, 0]);
  robot.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.9, 1.32, 0);
  rightArm.rotation.set(-0.12, 0, -0.08);
  addMesh(rightArm, new THREE.SphereGeometry(0.25, 18, 18), metal("#b9cae9"), [0, 0, 0]);
  addMesh(rightArm, new THREE.CapsuleGeometry(0.18, 0.78, 6, 14), metal("#d6e1f5"), [0, -0.62, 0]);
  addMesh(rightArm, new THREE.SphereGeometry(0.2, 18, 18), metal("#315fbd"), [0, -1.18, 0]);
  rightArm.add(buildDumbbell());
  robot.add(rightArm);

  [-0.42, 0.42].forEach((x) => {
    const leg = new THREE.Group();
    leg.position.set(x, -0.2, 0);
    addMesh(leg, new THREE.CapsuleGeometry(0.23, 0.88, 6, 14), metal("#afc1e2", 0.3), [0, -0.55, 0]);
    addMesh(leg, new THREE.CapsuleGeometry(0.2, 0.72, 6, 14), metal("#d3def1"), [0, -1.42, 0.08]);
    addMesh(leg, new THREE.BoxGeometry(0.58, 0.25, 0.92), metal("#152d5b", 0.3), [0, -1.98, 0.22]);
    robot.add(leg);
  });

  return { robot, rightArm };
}

function buildParticles() {
  const positions = new Float32Array(84 * 3);
  for (let index = 0; index < 84; index += 1) {
    const offset = index * 3;
    positions[offset] = ((index * 47) % 100) / 11 - 4.5;
    positions[offset + 1] = ((index * 29) % 100) / 13 - 3.2;
    positions[offset + 2] = ((index * 61) % 100) / 15 - 3.3;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: "#8eabef",
      opacity: 0.42,
      transparent: true,
      size: 0.026,
      sizeAttenuation: true
    })
  );
}

export function RobotSceneCanvas({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [liftCount, setLiftCount] = useState(0);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      setAvailable(false);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.45));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-label", "Interactive 3D robot lifting a dumbbell");
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(4.8, 3.15, 7.2);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight("#ffffff", 1.45));
    const keyLight = new THREE.DirectionalLight("#dce8ff", 3.3);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);
    const blueLight = new THREE.PointLight("#376fe8", 18, 9);
    blueLight.position.set(-4, 2, 3);
    scene.add(blueLight);
    const rimLight = new THREE.PointLight("#86a9ff", 8, 7);
    rimLight.position.set(3, -1, 2);
    scene.add(rimLight);

    const { robot, rightArm } = buildRobot();
    scene.add(robot);
    const particles = buildParticles();
    scene.add(particles);
    addMesh(
      scene,
      new THREE.CircleGeometry(3.2, 40),
      new THREE.ShadowMaterial({ color: "#020713", opacity: 0.52, transparent: true }),
      [0, -2.72, 0],
      [-Math.PI / 2, 0, 0]
    );

    let frame = 0;
    let lifting = false;
    const pointer = new THREE.Vector2();
    const clock = new THREE.Clock();

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = mount.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1;
      pointer.y = -(((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 2 - 1);
    };

    const onClick = () => {
      lifting = !lifting;
      setLiftCount((count) => count + 1);
    };

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.elapsedTime;
      robot.rotation.y = THREE.MathUtils.damp(
        robot.rotation.y,
        pointer.x * 0.3 + Math.sin(elapsed * 0.24) * 0.08,
        4,
        delta
      );
      robot.rotation.x = THREE.MathUtils.damp(robot.rotation.x, pointer.y * -0.07, 4, delta);
      robot.position.y = -0.65 + Math.sin(elapsed * 1.15) * 0.055;
      rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, lifting ? -1.02 : -0.12, 5, delta);
      particles.rotation.y = elapsed * 0.025;
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    mount.addEventListener("pointermove", onPointerMove, { passive: true });
    renderer.domElement.addEventListener("click", onClick);
    resize();
    animate();

    return () => {
      observer.disconnect();
      mount.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("click", onClick);
      window.cancelAnimationFrame(frame);
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh || object instanceof THREE.Points)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={cn("relative h-full w-full", className)}
      data-testid="interactive-robot-3d"
    >
      {!available ? (
        <div className="grid h-full place-items-center text-sm text-zinc-400">3D preview unavailable</div>
      ) : null}
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
