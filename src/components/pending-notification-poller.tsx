"use client";

import { useEffect } from "react";

import { useAuth } from "@/components/auth-provider";
import { useDynamicIsland } from "@/components/ui/dynamic-island";

type PendingRow = {
  id: string;
  type: "success" | "coins" | "achievement" | "streak";
  message: string;
};

export function PendingNotificationPoller() {
  const island = useDynamicIsland();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id || !island) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch("/api/notifications/pending", {
          credentials: "include",
          cache: "no-store"
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || cancelled) return;
        const rows = (data.notifications ?? []) as PendingRow[];
        for (const row of rows) {
          const t = row.type === "success" ? "signup" : row.type;
          island.showNotification(t as "signup" | "coins" | "achievement" | "streak", row.message);
        }
      } catch {
        // no-op
      }
    };

    void poll();
    const timer = window.setInterval(() => {
      void poll();
    }, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [island, user?.id]);

  return null;
}
