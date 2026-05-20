"use client";

import { useEffect, useState } from "react";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { cn } from "@/lib/utils";

export function AuthPageFrame({ children }: { children: React.ReactNode }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <AmbientBackground variant="both" intensity="low" />
      {/* Two drifting brand-cyan orbs — same vocabulary as /bundles, /404, /coming-soon. */}
      <div
        className="pointer-events-none fixed -left-[80px] -top-[120px] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.10)_0%,rgba(34,211,238,0.02)_45%,transparent_70%)] blur-[60px] motion-safe:[animation:tj-orb-drift-a_38s_ease-in-out_infinite]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -bottom-[80px] -right-[80px] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.08)_0%,rgba(14,165,233,0.02)_45%,transparent_70%)] blur-[70px] motion-safe:[animation:tj-orb-drift-b_46s_ease-in-out_infinite]"
        aria-hidden
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-[440px] transition-[opacity,transform] duration-[400ms] ease-[cubic-bezier(0,0,0.2,1)] motion-reduce:translate-y-0 motion-reduce:opacity-100",
          entered ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        )}
      >
        <div className="rounded-[20px] border border-divider bg-surface p-8 shadow-[0_24px_64px_rgba(0,0,0,0.6)] sm:p-12 max-sm:rounded-none max-sm:border-0 max-sm:shadow-none max-sm:max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
}
