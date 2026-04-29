"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Trophy, Zap } from "lucide-react";

type NotificationType = "signup" | "purchase" | "coins" | "achievement" | "streak";

type DynamicIslandItem = {
  id: number;
  type: NotificationType;
  message: string;
};

type DynamicIslandContextType = {
  showNotification: (type: NotificationType, message?: string) => void;
};

const DynamicIslandContext = createContext<DynamicIslandContextType | null>(null);

const DEFAULT_MESSAGES: Record<NotificationType, string> = {
  signup: "🎉 Welcome to TJFit!",
  purchase: "✅ Purchase successful — full access unlocked",
  coins: "⚡ TJCOIN earned",
  achievement: "🏆 Achievement unlocked",
  streak: "🔥 Streak milestone reached"
};

export function DynamicIslandProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<DynamicIslandItem[]>([]);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

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
            <div className="rounded-full border border-divider bg-surface px-5 py-2.5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl backdrop-saturate-[1.1]">
              <div className="flex max-w-[min(440px,calc(100vw-2rem))] items-center gap-2 text-sm font-medium">
                {current.type === "achievement" ? (
                  <Trophy className="h-4 w-4 shrink-0 text-accent-violet" />
                ) : current.type === "coins" ? (
                  <Zap className="h-4 w-4 shrink-0 text-accent" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                )}
                <span>{current.message}</span>
              </div>
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
