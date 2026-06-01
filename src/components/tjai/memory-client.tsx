"use client";

import { useEffect, useState } from "react";

import { PersonaPicker } from "@/components/tjai/persona-picker";
import type { Locale } from "@/lib/i18n";
import { getTjaiMemoryCopy } from "@/lib/tjai-memory-copy";

type Fact = {
  id: string;
  fact: string;
  category: string;
  source: string;
  created_at: string;
};

const CATEGORY_ORDER = ["goal", "injury", "constraint", "lift", "milestone", "preference", "general"] as const;

export function TjaiMemoryClient({ locale = "en" }: { locale?: Locale }) {
  const copy = getTjaiMemoryCopy(locale);
  const [facts, setFacts] = useState<Fact[] | null>(null);
  const [memoryEnabled, setMemoryEnabled] = useState<boolean | null>(null);
  const [ttsAutoplay, setTtsAutoplay] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [saveError, setSaveError] = useState(false);

  const dateFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? "" : dateFmt.format(d);
  };

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

  const startEdit = (f: Fact) => {
    setSaveError(false);
    setEditingId(f.id);
    setEditText(f.fact);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
    setSaveError(false);
  };

  const saveEdit = async (id: string) => {
    const next = editText.trim();
    if (!next) return;
    setBusy(true);
    setSaveError(false);
    try {
      const res = await fetch("/api/tjai/memory", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, fact: next })
      });
      if (!res.ok) {
        setSaveError(true);
        return;
      }
      cancelEdit();
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const wipeAll = async () => {
    if (!confirm(copy.wipeConfirm)) return;
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
        <h2 className="text-sm font-medium text-white/80">{copy.coachingStyleTitle}</h2>
        <p className="mb-4 text-xs text-white/50">{copy.coachingStyleHint}</p>
        <PersonaPicker locale={locale} />
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-white/80">{copy.longMemoryTitle}</h2>
            <p className="text-xs text-white/50">{copy.longMemoryHint}</p>
          </div>
          <Toggle
            on={!!memoryEnabled}
            disabled={memoryEnabled === null}
            onChange={toggleMemory}
            label={copy.longMemoryTitle}
            ariaLabel={copy.toggleAria(copy.longMemoryTitle)}
          />
        </div>
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div>
            <h2 className="text-sm font-medium text-white/80">{copy.autoplayTitle}</h2>
            <p className="text-xs text-white/50">{copy.autoplayHint}</p>
          </div>
          <Toggle
            on={!!ttsAutoplay}
            disabled={ttsAutoplay === null}
            onChange={toggleAutoplay}
            label={copy.autoplayTitle}
            ariaLabel={copy.toggleAria(copy.autoplayTitle)}
          />
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <h2 className="text-sm font-medium text-white/80">{copy.storedFactsTitle}</h2>
          <button
            type="button"
            onClick={wipeAll}
            disabled={busy || !facts || facts.length === 0}
            className="text-xs text-red-300 hover:text-red-200 disabled:opacity-40"
          >
            {copy.wipeAll}
          </button>
        </header>
        <div className="p-5">
          {facts === null ? (
            <p className="text-sm text-white/50">{copy.loading}</p>
          ) : facts.length === 0 ? (
            <p className="text-sm text-white/50">{copy.empty}</p>
          ) : (
            (() => {
              const present = CATEGORY_ORDER.filter((c) => grouped[c]?.length);
              const visible = filter === "all" ? present : present.filter((c) => c === filter);
              return (
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label={copy.allFilter} />
                    {present.map((c) => (
                      <FilterChip
                        key={c}
                        active={filter === c}
                        onClick={() => setFilter(c)}
                        label={copy.categories[c] ?? c}
                      />
                    ))}
                  </div>
                  {visible.map((cat) => (
                    <div key={cat}>
                      <h3 className="mb-2 text-xs uppercase tracking-wide text-purple-300">
                        {copy.categories[cat] ?? cat}
                      </h3>
                      <ul className="space-y-2">
                        {grouped[cat].map((f) => (
                          <li
                            key={f.id}
                            className="rounded-lg border border-white/5 bg-black/30 px-3 py-2 text-sm"
                          >
                            {editingId === f.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  rows={2}
                                  maxLength={280}
                                  className="w-full resize-none rounded-md border border-purple-400/40 bg-black/40 px-2 py-1.5 text-white/90 outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60"
                                  aria-label={copy.editAria}
                                />
                                {saveError ? (
                                  <p className="text-xs text-red-300">{copy.saveError}</p>
                                ) : null}
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => saveEdit(f.id)}
                                    disabled={busy || !editText.trim()}
                                    className="rounded-full bg-purple-400/90 px-3 py-1.5 text-xs font-semibold text-black hover:bg-purple-300 disabled:opacity-40"
                                  >
                                    {copy.save}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEdit}
                                    disabled={busy}
                                    className="rounded-full px-3 py-1.5 text-xs text-white/60 hover:text-white/90"
                                  >
                                    {copy.cancel}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-white/85">{f.fact}</p>
                                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-white/35">
                                    {f.source ? (
                                      <span className="rounded-full border border-white/10 px-1.5 py-0.5 uppercase tracking-wide">
                                        {f.source}
                                      </span>
                                    ) : null}
                                    {formatDate(f.created_at) ? <span>{formatDate(f.created_at)}</span> : null}
                                  </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => startEdit(f)}
                                    disabled={busy}
                                    className="text-xs text-white/40 hover:text-purple-300"
                                    aria-label={copy.editAria}
                                  >
                                    {copy.edit}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeOne(f.id)}
                                    disabled={busy}
                                    className="text-xs text-white/40 hover:text-red-300"
                                    aria-label={copy.forgetAria}
                                  >
                                    {copy.forget}
                                  </button>
                                </div>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </div>
      </section>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs transition ${
        active
          ? "border-purple-400/60 bg-purple-400/15 text-purple-200"
          : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
      }`}
    >
      {label}
    </button>
  );
}

function Toggle({
  on,
  disabled,
  onChange,
  ariaLabel
}: {
  on: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  label: string;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      disabled={disabled}
      className={`relative h-6 w-11 rounded-full transition ${on ? "bg-purple-400" : "bg-white/15"}`}
      aria-label={ariaLabel}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${on ? "left-5" : "left-0.5"}`}
      />
    </button>
  );
}
