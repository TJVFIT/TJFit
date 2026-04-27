"use client";

import { useEffect, useRef, useState } from "react";

import { showUpgradePrompt } from "@/components/tjai/upgrade-prompt";

type Badge = { code: string; label: string; description: string; emoji: string };

let listeners: Array<(b: Badge[]) => void> = [];

export function celebrateBadges(newly: Badge[]) {
  if (!newly || newly.length === 0) return;
  listeners.forEach((fn) => fn(newly));

  // Value-moment upgrade trigger — gated to core tier, deduped per session.
  void (async () => {
    try {
      const res = await fetch("/api/tjai/trial-status", { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as { tier?: string };
      if (data?.tier !== "core") return;
      const first = newly[0];
      showUpgradePrompt({
        reason: "first_badge",
        title: `Nice — you just earned ${first.label} ${first.emoji}`,
        body: "You're already getting value. Unlock TJAI Pro to keep the streak going with unlimited chat, voice replies, and adaptive plans.",
        ctaHref: "/membership",
        ctaLabel: "See plans"
      });
    } catch {
      /* ignore */
    }
  })();
}

export function BadgeUnlockToast() {
  const [queue, setQueue] = useState<Badge[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (newly: Badge[]) => setQueue((prev) => [...prev, ...newly]);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  useEffect(() => {
    if (queue.length === 0) return;
    timerRef.current = setTimeout(() => {
      setQueue((prev) => prev.slice(1));
    }, 4000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [queue]);

  if (queue.length === 0) return null;
  const current = queue[0];

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50">
      <div className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-cyan-300/15 to-black/85 px-4 py-3 text-white shadow-[0_20px_60px_rgba(34,211,238,0.25)] backdrop-blur animate-in slide-in-from-bottom-4">
        <span className="text-3xl" aria-hidden>
          {current.emoji}
        </span>
        <div className="leading-tight">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Badge unlocked</div>
          <div className="text-sm font-semibold">{current.label}</div>
          <div className="text-xs text-white/70">{current.description}</div>
        </div>
      </div>
    </div>
  );
}
