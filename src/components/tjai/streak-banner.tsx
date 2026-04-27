"use client";

import { useEffect, useState } from "react";

type Streak = {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
};

type Badge = { code: string; label: string; emoji: string; awarded_at: string };

export function StreakBanner() {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    fetch("/api/tjai/streak", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setStreak(data));
    fetch("/api/tjai/badges", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setBadges((data.awarded ?? []).slice(0, 6)));
  }, []);

  if (!streak || (streak.current_streak === 0 && badges.length === 0)) return null;

  return (
    <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5">
      <div className="flex items-center gap-3 text-sm">
        <span className="text-lg" aria-hidden>
          {streak.current_streak >= 30 ? "💎" : streak.current_streak >= 7 ? "⚡" : "🔥"}
        </span>
        <div className="leading-tight">
          <div className="font-semibold text-white">
            {streak.current_streak} day{streak.current_streak === 1 ? "" : "s"} streak
          </div>
          <div className="text-[11px] text-white/50">Best: {streak.longest_streak}</div>
        </div>
      </div>
      {badges.length > 0 ? (
        <div className="flex items-center gap-1">
          {badges.map((b) => (
            <span
              key={b.code}
              title={`${b.label} · ${new Date(b.awarded_at).toLocaleDateString()}`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-base"
            >
              {b.emoji}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
