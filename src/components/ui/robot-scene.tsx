"use client";

import { useEffect, useState, type ComponentType } from "react";

type RobotCanvas = ComponentType<{ className?: string }>;

export function RobotScene({ className }: { className?: string }) {
  const [RobotCanvas, setRobotCanvas] = useState<RobotCanvas | null>(null);

  useEffect(() => {
    let mounted = true;
    void import("./robot-scene-canvas").then((module) => {
      if (mounted) setRobotCanvas(() => module.RobotSceneCanvas);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (RobotCanvas) {
    return <RobotCanvas className={className} />;
  }

  return (
    <div className="grid h-full place-items-center" aria-label="Loading interactive 3D training robot">
      <div className="relative h-56 w-36 animate-pulseSoft">
        <div className="absolute left-1/2 top-0 h-16 w-16 -translate-x-1/2 rounded-2xl border border-accent-soft/40 bg-white/10" />
        <div className="absolute left-1/2 top-[4.5rem] h-24 w-24 -translate-x-1/2 rounded-[1.75rem] border border-white/10 bg-white/[0.06]" />
        <div className="absolute left-0 top-24 h-4 w-36 rounded-full bg-accent-soft/30" />
        <div className="absolute left-3 top-[5.6rem] h-12 w-4 rounded-full bg-zinc-400/40" />
        <div className="absolute right-3 top-[5.6rem] h-12 w-4 rounded-full bg-zinc-400/40" />
        <div className="absolute bottom-0 left-8 h-20 w-5 rounded-full bg-zinc-400/35" />
        <div className="absolute bottom-0 right-8 h-20 w-5 rounded-full bg-zinc-400/35" />
      </div>
    </div>
  );
}
