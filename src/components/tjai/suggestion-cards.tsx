"use client";

import { useEffect, useState } from "react";

type Suggestion = {
  id: string;
  kind: string;
  title: string;
  summary: string;
  rationale: string;
};

const KIND_META: Record<string, { label: string; color: string }> = {
  deload: { label: "Deload", color: "text-amber-300" },
  progression: { label: "Progress", color: "text-cyan-300" },
  swap: { label: "Swap", color: "text-violet-300" },
  volume_change: { label: "Volume", color: "text-cyan-300" },
  frequency_change: { label: "Frequency", color: "text-cyan-300" },
  recovery_week: { label: "Recovery", color: "text-amber-300" },
  general: { label: "Adjust", color: "text-white/70" }
};

export function SuggestionCards() {
  const [items, setItems] = useState<Suggestion[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/tjai/suggestions", { credentials: "include" });
    if (!res.ok) {
      setItems([]);
      return;
    }
    const data = (await res.json()) as { suggestions: Suggestion[] };
    setItems(data.suggestions ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const decide = async (id: string, decision: "accepted" | "rejected") => {
    setBusyId(id);
    try {
      await fetch("/api/tjai/suggestions", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, decision })
      });
      setItems((prev) => (prev ?? []).filter((s) => s.id !== id));
    } finally {
      setBusyId(null);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-4 space-y-2">
      {items.map((s) => {
        const meta = KIND_META[s.kind] ?? KIND_META.general;
        return (
          <div
            key={s.id}
            className="rounded-xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/[0.06] to-transparent p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${meta.color}`}>
                TJAI suggests · {meta.label}
              </span>
              <span className="text-[10px] text-white/40">tap accept or skip</span>
            </div>
            <h4 className="mt-1 text-sm font-semibold text-white">{s.title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-white/85">{s.summary}</p>
            <p className="mt-2 text-xs italic text-white/55">{s.rationale}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => decide(s.id, "accepted")}
                disabled={busyId === s.id}
                className="rounded-md bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-cyan-300 disabled:opacity-50"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => decide(s.id, "rejected")}
                disabled={busyId === s.id}
                className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/5 disabled:opacity-50"
              >
                Skip
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
