"use client";

import { useEffect, useState } from "react";
import { Crown, Trophy } from "lucide-react";

import { PremiumPageShell } from "@/components/premium";

type LeaderboardItem = {
  rank: number;
  userId: string;
  displayName: string;
  isVerified: boolean;
  streak: number;
  coinsEarned: number;
  blogViews: number;
  programsDone: number;
};

const TABS = [
  { key: "coins", label: "TJCOIN" },
  { key: "streaks", label: "Streaks" },
  { key: "blog", label: "Blog" },
  { key: "coaches", label: "Coaches" },
  { key: "programs", label: "Programs" }
] as const;

type TabKey = (typeof TABS)[number]["key"];

const EMPTY_MESSAGES: Record<TabKey, { title: string; sub: string }> = {
  coins: {
    title: "No rankings yet.",
    sub: "Earn TJCOIN by buying programs, posting, and training daily to claim the top spot."
  },
  streaks: {
    title: "No streaks yet.",
    sub: "Log a workout today to start your streak and appear on the board."
  },
  blog: {
    title: "No blog rankings yet.",
    sub: "Publish your first post to appear here and earn TJCOIN."
  },
  coaches: {
    title: "No coaches ranked yet.",
    sub: "Coaches appear here based on student ratings and activity."
  },
  programs: {
    title: "No program completions yet.",
    sub: "Complete a 12-week program to appear on the programs leaderboard."
  }
};

export default function LeaderboardPage({ params }: { params: { locale: string } }) {
  const locale = params?.locale ?? "en";
  const [tab, setTab] = useState<TabKey>("coins");
  const [period, setPeriod] = useState<"week" | "alltime">("week");
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?type=${tab}&period=${period}`, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setItems(json.items ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [tab, period]);

  return (
    <PremiumPageShell>
      <section className="rounded-2xl border border-[#1E2028] bg-[#111215] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[#52525B]">Leaderboard</p>
        <h1 className="mt-2 text-3xl font-extrabold text-white">TJFit Leaderboards</h1>
        <p className="mt-2 text-sm text-[#A1A1AA]">The most active members of the TJFit community.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {TABS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => setTab(entry.key)}
              className={`rounded-full border px-3 py-2 text-xs font-semibold ${tab === entry.key ? "border-cyan-400/40 bg-cyan-400/10 text-[#22D3EE]" : "border-[#1E2028] text-[#A1A1AA]"}`}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2 text-xs">
          {(["week", "alltime"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-full border px-3 py-1.5 ${period === p ? "border-white/20 text-white" : "border-[#1E2028] text-[#A1A1AA]"}`}
            >
              {p === "week" ? "This Week" : "All Time"}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-[#1E2028] bg-[#111215] p-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-12 animate-pulse rounded-lg bg-[#0F1116]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Trophy className="mx-auto h-12 w-12 text-zinc-600" />
            <p className="mt-4 text-lg font-semibold text-white">{EMPTY_MESSAGES[tab].title}</p>
            <p className="mt-2 max-w-sm text-sm text-zinc-400">{EMPTY_MESSAGES[tab].sub}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a href={`/${locale}/coins#how-to-earn`} className="rounded-full border border-[#22D3EE]/35 bg-[#22D3EE]/10 px-4 py-2 text-sm font-semibold text-[#22D3EE]">
                How to earn TJCOIN →
              </a>
              <a href={`/${locale}/programs`} className="rounded-full border border-[#1E2028] px-4 py-2 text-sm text-zinc-300">
                Start Earning →
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const isTop1 = item.rank === 1;
              const isTop2 = item.rank === 2;
              const isTop3 = item.rank === 3;
              const rankClass = isTop1
                ? "border-yellow-400/40"
                : isTop2
                  ? "border-zinc-300/30"
                  : isTop3
                    ? "border-amber-700/40"
                    : "border-[#1E2028]";
              return (
                <div key={item.userId} className={`flex items-center justify-between rounded-xl border bg-[#0D0E12] px-4 py-3 ${rankClass}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#14161D] text-sm font-bold text-white">
                      {item.rank === 1 ? (
                        <Crown className="h-4 w-4 text-[#F59E0B]" />
                      ) : item.rank === 2 ? (
                        <Crown className="h-4 w-4 text-[#9CA3AF]" />
                      ) : item.rank === 3 ? (
                        <Crown className="h-4 w-4 text-[#CD7F32]" />
                      ) : (
                        item.rank
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {item.displayName} {item.isVerified ? <span className="text-[#22D3EE]">✓</span> : null}
                      </p>
                      <p className="text-xs text-[#52525B]">🔥 {item.streak} streak</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-[#22D3EE]">
                    {tab === "streaks"
                      ? `${item.streak} days`
                      : tab === "blog" || tab === "coaches"
                        ? `${item.blogViews} views`
                        : tab === "programs"
                          ? `${item.programsDone} done`
                          : `${item.coinsEarned} ⚡`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-xl border border-[#1E2028] bg-[#111215] p-5 text-sm text-[#A1A1AA]">
        <p className="inline-flex items-center gap-2 text-white">
          <Trophy className="h-4 w-4 text-[#A78BFA]" /> Weekly top 3 bonuses: +100, +50, +25 TJCOIN
        </p>
      </section>
    </PremiumPageShell>
  );
}

