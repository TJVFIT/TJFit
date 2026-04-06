"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
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
      <div className="pointer-events-none fixed left-1/2 top-4 z-[9999] -translate-x-1/2">
        {current ? (
          <div className="animate-[tj-island-in_400ms_cubic-bezier(0.34,1.56,0.64,1)_forwards] rounded-full border border-[#1E2028] bg-[#111215] px-5 py-2.5 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2 text-sm font-medium">
              {current.type === "achievement" ? (
                <Trophy className="h-4 w-4 text-[#A78BFA]" />
              ) : current.type === "coins" ? (
                <Zap className="h-4 w-4 text-[#22D3EE]" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
              )}
              <span>{current.message}</span>
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

