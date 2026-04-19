"use client";

import { useEffect, useRef, useState } from "react";
import { Crown, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

import { PremiumPageShell } from "@/components/premium";
import { useInView } from "@/hooks/useInView";

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

function getMetricValue(item: LeaderboardItem, tab: TabKey) {
  return tab === "streaks"
    ? `${item.streak} days`
    : tab === "blog" || tab === "coaches"
      ? `${item.blogViews} views`
      : tab === "programs"
        ? `${item.programsDone} done`
        : `${item.coinsEarned} ⚡`;
}

// M5 — Animated podium for top 3
function Podium({ items, tab }: { items: LeaderboardItem[]; tab: TabKey }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.2, once: true });
  const confettiFired = useRef(false);

  useEffect(() => {
    if (!inView || confettiFired.current) return;
    const t = window.setTimeout(() => {
      confettiFired.current = true;
      confetti({
        particleCount: 80,
        spread: 72,
        origin: { y: 0.52, x: 0.5 },
        colors: ["#22D3EE", "#A78BFA", "#F59E0B"]
      });
    }, 720);
    return () => window.clearTimeout(t);
  }, [inView]);

  if (items.length < 3) return null;

  const order = [items[1], items[0], items[2]]; // 2nd left, 1st center, 3rd right
  const heights = [140, 180, 110];
  const colors = ["rgba(34,211,238,0.6)", "#22D3EE", "rgba(34,211,238,0.35)"];
  const glows = [
    "shadow-[0_0_20px_rgba(34,211,238,0.2)]",
    "shadow-[0_0_40px_rgba(245,158,11,0.35)]",
    "shadow-[0_0_12px_rgba(34,211,238,0.12)]"
  ];
  const crowns = [
    <Crown key="s" className="h-4 w-4" style={{ color: "rgba(34,211,238,0.6)" }} />,
    <Crown key="g" className="crown-glow-gold h-5 w-5" style={{ color: "#F59E0B", filter: "drop-shadow(0 0 8px rgba(245,158,11,0.5))" }} />,
    <Crown key="b" className="h-4 w-4" style={{ color: "rgba(34,211,238,0.35)" }} />
  ];

  return (
    <div ref={ref} className="mb-8 flex items-end justify-center gap-3 px-4 pt-4">
      {order.map((item, i) => (
        <div key={item.userId} className="flex flex-col items-center gap-2" style={{ width: "30%" }}>
          <div className="text-center">
            <div className="mb-1 flex justify-center">{crowns[i]}</div>
            <p className="text-xs font-semibold text-white truncate max-w-[100px]">{item.displayName}</p>
            <p className="text-[10px] text-zinc-500">{getMetricValue(item, tab)}</p>
          </div>
          <div
            className={`w-full rounded-t-xl transition-all duration-700 ease-out ${glows[i]}`}
            style={{
              height: inView ? `${heights[i]}px` : "0px",
              transitionDelay: `${i * 120}ms`,
              background: `linear-gradient(to top, ${colors[i]}33, ${colors[i]}22)`,
              border: `1px solid ${colors[i]}55`,
              borderBottom: "none"
            }}
          />
          <p className="text-[11px] font-bold" style={{ color: colors[i] }}>
            #{item.rank}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function LeaderboardPage({ params }: { params: { locale: string } }) {
  const locale = params?.locale ?? "en";
  const [tab, setTab] = useState<TabKey>("coins");
  const [period, setPeriod] = useState<"week" | "alltime">("week");
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [me, setMe] = useState<LeaderboardItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?type=${tab}&period=${period}`, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) {
          setItems(json.items ?? []);
          setMe(json.me ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [tab, period]);

  return (
    <PremiumPageShell>
      <section className="rounded-2xl border border-[#1E2028] bg-[#111215] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[#52525B]">Leaderboard</p>
        <h1 className="mt-2 text-3xl font-extrabold text-white">TJFit Leaderboards</h1>
        <p className="mt-2 text-sm text-[#A1A1AA]">The most active members of the TJFit community.</p>

        <div className="relative mt-5 flex flex-wrap gap-2">
          {TABS.map((entry, idx) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => { setTab(entry.key); setActiveTabIdx(idx); }}
              className={`relative rounded-full border px-3 py-2 text-xs font-semibold transition-colors duration-200 ${tab === entry.key ? "border-cyan-400/40 bg-cyan-400/10 text-[#22D3EE]" : "border-[#1E2028] text-[#A1A1AA] hover:border-white/10 hover:text-white"}`}
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
              className={`rounded-full border px-3 py-1.5 transition-colors duration-200 ${period === p ? "border-white/20 text-white" : "border-[#1E2028] text-[#A1A1AA] hover:border-white/10"}`}
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
          <>
            <Podium items={items} tab={tab} />
            <div className="space-y-2">
              {items.map((item) => {
                const isMe = item.userId === me?.userId;
                const isTop1 = item.rank === 1;
                const isTop2 = item.rank === 2;
                const isTop3 = item.rank === 3;
                const rankClass = isTop1
                  ? "border-cyan-400/50"
                  : isTop2
                    ? "border-cyan-400/25"
                    : isTop3
                      ? "border-cyan-400/15"
                      : "border-[#1E2028]";
                return (
                  <div
                    key={item.userId}
                    className={`flex items-center justify-between rounded-xl border bg-[#0D0E12] px-4 py-3 transition-all duration-200 ${rankClass} ${isMe ? "animate-pulse ring-1 ring-[#22D3EE]/40" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#14161D] text-sm font-bold text-white">
                        {item.rank === 1 ? (
                          <Crown className="crown-glow-gold h-4 w-4" style={{ color: "#F59E0B", filter: "drop-shadow(0 0 8px rgba(245,158,11,0.5))" }} />
                        ) : item.rank === 2 ? (
                          <Crown className="h-4 w-4" style={{ color: "rgba(34,211,238,0.6)" }} />
                        ) : item.rank === 3 ? (
                          <Crown className="h-4 w-4" style={{ color: "rgba(34,211,238,0.35)" }} />
                        ) : (
                          <span className="text-zinc-400">{item.rank}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {item.displayName} {item.isVerified ? <span className="text-[#22D3EE]">✓</span> : null}
                          {isMe ? <span className="ml-1.5 text-[10px] text-[#22D3EE]">(you)</span> : null}
                        </p>
                        <p className="text-xs text-[#52525B]">🔥 {item.streak} streak</p>
                      </div>
                    </div>
                    <p className={`text-sm font-semibold ${isTop1 ? "text-[#22D3EE]" : isTop2 ? "text-cyan-400/70" : isTop3 ? "text-cyan-400/45" : "text-[#52525B]"}`}>
                      {getMetricValue(item, tab)}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
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
