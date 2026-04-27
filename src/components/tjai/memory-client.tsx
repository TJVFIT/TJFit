"use client";

import { useEffect, useState } from "react";

import { PersonaPicker } from "@/components/tjai/persona-picker";

type Fact = {
  id: string;
  fact: string;
  category: string;
  source: string;
  created_at: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  goal: "Goals",
  injury: "Injuries",
  constraint: "Constraints",
  lift: "Lifts",
  milestone: "Milestones",
  preference: "Preferences",
  general: "General"
};

const CATEGORY_ORDER = ["goal", "injury", "constraint", "lift", "milestone", "preference", "general"];

export function TjaiMemoryClient() {
  const [facts, setFacts] = useState<Fact[] | null>(null);
  const [memoryEnabled, setMemoryEnabled] = useState<boolean | null>(null);
  const [ttsAutoplay, setTtsAutoplay] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/tjai/memory", { credentials: "include" });
    if (!res.ok) return;
    const data = (await res.json()) as { facts: Fact[] };
    setFacts(data.facts);
  };

  useEffect(() => {
    refresh();
    fetch("/api/tjai/settings", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (typeof data.memory_enabled === "boolean") setMemoryEnabled(data.memory_enabled);
        if (typeof data.tts_autoplay === "boolean") setTtsAutoplay(data.tts_autoplay);
        else setTtsAutoplay(false);
      });
  }, []);

  const removeOne = async (id: string) => {
    setBusy(true);
    try {
      await fetch(`/api/tjai/memory?id=${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const wipeAll = async () => {
    if (!confirm("Wipe everything TJAI remembers about you? This can't be undone.")) return;
    setBusy(true);
    try {
      await fetch("/api/tjai/memory?all=1", { method: "DELETE", credentials: "include" });
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const toggleMemory = async (next: boolean) => {
    setMemoryEnabled(next);
    await fetch("/api/tjai/settings", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memory_enabled: next })
    });
  };

  const toggleAutoplay = async (next: boolean) => {
    setTtsAutoplay(next);
    await fetch("/api/tjai/settings", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tts_autoplay: next })
    });
  };

  const grouped = (facts ?? []).reduce<Record<string, Fact[]>>((acc, f) => {
    (acc[f.category] ??= []).push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-sm font-medium text-white/80">Coaching style</h2>
        <p className="mb-4 text-xs text-white/50">Pick how TJAI talks to you. Changes apply on the next message.</p>
        <PersonaPicker />
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-white/80">Long-term memory</h2>
            <p className="text-xs text-white/50">
              When on, TJAI remembers facts you share across conversations. Off = session-only.
            </p>
          </div>
          <Toggle on={!!memoryEnabled} disabled={memoryEnabled === null} onChange={toggleMemory} label="memory" />
        </div>
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div>
            <h2 className="text-sm font-medium text-white/80">Auto-play voice replies</h2>
            <p className="text-xs text-white/50">
              Speak each reply automatically using your coach&apos;s voice.
            </p>
          </div>
          <Toggle on={!!ttsAutoplay} disabled={ttsAutoplay === null} onChange={toggleAutoplay} label="autoplay" />
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <h2 className="text-sm font-medium text-white/80">Stored facts</h2>
          <button
            type="button"
            onClick={wipeAll}
            disabled={busy || !facts || facts.length === 0}
            className="text-xs text-red-300 hover:text-red-200 disabled:opacity-40"
          >
            Wipe all
          </button>
        </header>
        <div className="p-5">
          {facts === null ? (
            <p className="text-sm text-white/50">Loading…</p>
          ) : facts.length === 0 ? (
            <p className="text-sm text-white/50">Nothing stored yet. Talk to TJAI and it&apos;ll remember the durable stuff.</p>
          ) : (
            <div className="space-y-5">
              {CATEGORY_ORDER.filter((c) => grouped[c]?.length).map((cat) => (
                <div key={cat}>
                  <h3 className="mb-2 text-xs uppercase tracking-wide text-cyan-300">
                    {CATEGORY_LABELS[cat] ?? cat}
                  </h3>
                  <ul className="space-y-2">
                    {grouped[cat].map((f) => (
                      <li
                        key={f.id}
                        className="flex items-start justify-between gap-3 rounded-lg border border-white/5 bg-black/30 px-3 py-2 text-sm"
                      >
                        <span className="text-white/85">{f.fact}</span>
                        <button
                          type="button"
                          onClick={() => removeOne(f.id)}
                          disabled={busy}
                          className="shrink-0 text-xs text-white/40 hover:text-red-300"
                          aria-label="Forget this"
                        >
                          forget
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Toggle({
  on,
  disabled,
  onChange,
  label
}: {
  on: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      disabled={disabled}
      className={`relative h-6 w-11 rounded-full transition ${on ? "bg-cyan-400" : "bg-white/15"}`}
      aria-label={`Toggle ${label}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${on ? "left-5" : "left-0.5"}`}
      />
    </button>
  );
}
