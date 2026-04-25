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
      <div
        className="pointer-events-none fixed -left-[80px] -top-[120px] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.05)_0%,transparent_70%)] blur-[40px]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -bottom-[80px] -right-[80px] h-[350px] w-[350px] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.04)_0%,transparent_70%)] blur-[40px]"
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
