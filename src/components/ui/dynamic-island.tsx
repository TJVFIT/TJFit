"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Trophy, XCircle } from "lucide-react";

import { useDevice } from "@/lib/device/DeviceContext";

type NotificationType = "signup" | "purchase" | "achievement" | "streak" | "error";

type DynamicIslandItem = {
  id: number;
  type: NotificationType;
  message: string;
};

type DynamicIslandContextType = {
  showNotification: (type: NotificationType, message?: string) => void;
};

import { computeIslandStack } from "@/components/ui/dynamic-island-stack";

const DynamicIslandContext = createContext<DynamicIslandContextType | null>(null);

// NOTE: English-only, matching existing precedent in this module — the
// other notification types here were never localized either.
const DEFAULT_MESSAGES: Record<NotificationType, string> = {
  signup: "Welcome to TJFit!",
  purchase: "Purchase successful — full access unlocked",
  achievement: "Achievement unlocked",
  streak: "Streak milestone reached",
  error: "Something went wrong"
};

export function DynamicIslandProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<DynamicIslandItem[]>([]);
  // Exact match for the old local `(prefers-reduced-motion: reduce)`
  // matchMedia + live "change" listener — DeviceContext already tracks
  // this reactively.
  const { prefersReducedMotion: reduceMotion } = useDevice();

  const showNotification = useCallback((type: NotificationType, message?: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const item = { id, type, message: message?.trim() || DEFAULT_MESSAGES[type] };
    setQueue((prev) => [...prev, item]);
    window.setTimeout(() => {
      setQueue((prev) => prev.filter((x) => x.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ showNotification }), [showNotification]);

  // Newest-first stack, capped at 3 visible bubbles; anything older collapses
  // into the count badge instead of rendering. Pure math lives in
  // computeIslandStack so the queue behavior is unit-testable.
  const { visible, overflow } = computeIslandStack(queue);

  return (
    <DynamicIslandContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-[9999] flex flex-col items-center md:inset-x-auto md:left-auto md:right-6 md:items-end">
        <div className="relative w-full" style={{ minHeight: visible.length ? 44 + (visible.length - 1) * 10 : 0 }}>
          {visible.map((item, i) => {
            const isNewest = i === 0;
            const offset = i * 10;
            const scale = 1 - i * 0.06;
            const opacity = isNewest ? 1 : i === 1 ? 0.62 : 0.36;
            return (
              <div
                key={item.id}
                className="absolute inset-x-0 top-0 flex justify-center transition-[transform,opacity] duration-300 ease-out md:justify-end"
                style={{
                  transform: `translateY(${offset}px) scale(${scale})`,
                  opacity,
                  zIndex: visible.length - i
                }}
              >
                <div
                  className={reduceMotion ? "opacity-100" : "tj-dynamic-island-bubble"}
                  role={isNewest ? "status" : undefined}
                  aria-live={isNewest ? "polite" : undefined}
                  aria-hidden={isNewest ? undefined : true}
                >
                  <div className="flex items-center gap-2 rounded-full border border-purple-300/20 bg-surface px-5 py-2.5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_28px_rgba(168,85,247,0.16)] backdrop-blur-xl backdrop-saturate-[1.1]">
                    <div className="flex max-w-[min(440px,calc(100vw-2rem))] items-center gap-2 text-sm font-medium">
                      {item.type === "achievement" ? (
                        <Trophy className="h-4 w-4 shrink-0 text-accent-violet" />
                      ) : item.type === "error" ? (
                        <XCircle className="h-4 w-4 shrink-0 text-danger" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                      )}
                      <span>{item.message}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {overflow > 0 ? (
          <span
            className="pointer-events-none mt-1.5 shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/80"
            aria-label={`+${overflow} more`}
          >
            +{overflow}
          </span>
        ) : null}
      </div>
    </DynamicIslandContext.Provider>
  );
}

export function useDynamicIsland() {
  return useContext(DynamicIslandContext);
}
