
"use client";

import { useEffect, useRef, useState } from "react";
import { Trophy, Dumbbell, Timer, Repeat } from "lucide-react";
import { requireLocaleParam } from "@/lib/require-locale";
import { useInView } from "@/hooks/useInView";

type PR = {
  exercise: string;
  max_weight_kg: number | null;
  max_reps: number | null;
  max_duration_minutes: number | null;
  total_sets: number;
};

function PRValue({ value, suffix, color }: { value: number; suffix: string; color: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref as React.RefObject<HTMLElement>, { threshold: 0.5, once: true });
  const [displayed, setDisplayed] = useState(0);
  const ran = useRef(false);
  useEffect(() => {
    if (!inView || ran.current) return;
    ran.current = true;
    const start = performance.now();
    const dur = 1000;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplayed(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return (
    <p ref={ref} className="text-sm font-bold tabular-nums" style={{ color }}>{displayed}{suffix}</p>
  );
}

export default function RecordsPage({ params }: { params: { locale: string } }) {
  requireLocaleParam(params.locale);
  const locale = params.locale;
  const [prs, setPrs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/progress/records", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setPrs(data.records ?? []);
      } catch { setError("Could not load your personal records."); }
      finally { setLoading(false); }
    };
    void run();
  }, []);
  const filtered = search.trim() ? prs.filter((p) => p.exercise.toLowerCase().includes(search.toLowerCase())) : prs;
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#52525B]">Records</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">Personal Records</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">Your all-time bests auto-computed from your workout logs.</p>
      </div>
      {!loading && prs.length > 0 && (
        <input className="input w-full max-w-sm" placeholder="Search exercises…" value={search} onChange={(e) => setSearch(e.target.value)} />
      )}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#111215]" />
          ))}
        </div>
      )}
      {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-400">{error}</div>}
      {!loading && !error && prs.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-[#1E2028] bg-[#111215] py-20 text-center">
          <Dumbbell className="mx-auto h-12 w-12 text-zinc-600" strokeWidth={1.5} />
          <p className="mt-4 text-lg font-semibold text-white">No records yet.</p>
          <p className="mt-2 max-w-xs text-sm text-zinc-400">Log workouts with sets, reps, and weight to see your personal bests here.</p>
          <a href={`/${locale}/progress`} className="mt-6 inline-flex items-center justify-center rounded-full border border-[#22D3EE]/30 bg-[#22D3EE]/10 px-6 py-2.5 text-sm font-semibold text-[#22D3EE]">Go to progress log →</a>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((pr) => (
            <div key={pr.exercise} className="rounded-2xl border border-[#1E2028] bg-[#111215] p-5 transition-[border-color,box-shadow] duration-200 hover:border-[rgba(34,211,238,0.2)]">
              <div className="flex items-start justify-between gap-2">
                <p className="text-base font-semibold text-white">{pr.exercise}</p>
                <span className="shrink-0 text-xs text-zinc-600">{pr.total_sets} sets</span>
              </div>
              <div className="mt-1 h-px w-full bg-[#1E2028]" />
              <div className="mt-3 flex flex-wrap gap-3">
                {pr.max_weight_kg != null ? <div className="flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5 text-[#F59E0B]" /><PRValue value={pr.max_weight_kg} suffix=" kg" color="#F59E0B" /></div> : null}
                {pr.max_reps != null ? <div className="flex items-center gap-1.5"><Repeat className="h-3.5 w-3.5 text-[#22D3EE]" /><PRValue value={pr.max_reps} suffix=" reps" color="#22D3EE" /></div> : null}
                {pr.max_duration_minutes != null ? <div className="flex items-center gap-1.5"><Timer className="h-3.5 w-3.5 text-[#A78BFA]" /><PRValue value={pr.max_duration_minutes} suffix=" min" color="#A78BFA" /></div> : null}
              </div>
              <p className="mt-3 text-xs text-zinc-500">Total sets logged: {pr.total_sets}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
