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
  const current = queue[0];

  return (
    <DynamicIslandContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 top-4 z-[9999] flex justify-center md:inset-x-auto md:left-auto md:right-6 md:justify-end"
        aria-live="polite"
        aria-relevant="additions"
      >
        {current ? (
          <div
            className={reduceMotion ? "opacity-100" : "tj-dynamic-island-bubble"}
            role="status"
          >
            <div className="flex items-center gap-2 rounded-full border border-purple-300/20 bg-surface px-5 py-2.5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_28px_rgba(168,85,247,0.16)] backdrop-blur-xl backdrop-saturate-[1.1]">
              <div className="flex max-w-[min(440px,calc(100vw-2rem))] items-center gap-2 text-sm font-medium">
                {current.type === "achievement" ? (
                  <Trophy className="h-4 w-4 shrink-0 text-accent-violet" />
                ) : current.type === "error" ? (
                  <XCircle className="h-4 w-4 shrink-0 text-danger" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                )}
                <span>{current.message}</span>
              </div>
              {queue.length > 1 ? (
                <span
                  className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/80"
                  aria-label={`+${queue.length - 1} more`}
                >
                  +{queue.length - 1}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </DynamicIslandContext.Provider>
  );
}

export function useDynamicIsland() {
  return useContext(DynamicIslandContext);
}
