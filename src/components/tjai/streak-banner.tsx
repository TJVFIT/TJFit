"use client";

import { useEffect, useState } from "react";

import { BadgeIcon, StreakIcon } from "@/lib/tjai/badge-icons";

type Streak = {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
};

type Badge = { code: string; label: string; awarded_at: string };

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
    <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-purple-300/20 bg-[linear-gradient(135deg,rgba(168,85,247,0.06),rgba(0,0,0,0.3))] px-4 py-2.5 shadow-[0_0_24px_-12px_rgba(168,85,247,0.4)]">
      <div className="flex items-center gap-3 text-sm">
        <StreakIcon streak={streak.current_streak} className="h-5 w-5 text-purple-300 motion-safe:animate-pulse" />
        <div className="leading-tight">
          <div className="font-semibold text-white">
            {streak.current_streak} day{streak.current_streak === 1 ? "" : "s"} streak
          </div>
          <div className="text-[11px] text-purple-200/70">Best: {streak.longest_streak}</div>
        </div>
      </div>
      {badges.length > 0 ? (
        <div className="flex items-center gap-1">
          {badges.map((b) => (
            <span
              key={b.code}
              title={`${b.label} · ${new Date(b.awarded_at).toLocaleDateString()}`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-purple-300/20 bg-purple-300/[0.06] text-purple-200 transition-[border-color,background-color,box-shadow] duration-200 hover:border-purple-300/45 hover:bg-purple-300/[0.1] hover:shadow-[0_0_14px_rgba(168,85,247,0.22)]"
            >
              <BadgeIcon code={b.code} className="h-3.5 w-3.5" />
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
