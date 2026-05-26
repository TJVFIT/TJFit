"use client";

import { useEffect, useState } from "react";

import type { Locale } from "@/lib/i18n";
import { getTjaiMemoryCopy } from "@/lib/tjai-memory-copy";
import { TJAI_PERSONA_META, TJAI_PERSONAS, type TjaiPersona } from "@/lib/tjai/persona";
import { cn } from "@/lib/utils";

export function PersonaPicker({ compact = false, locale = "en" }: { compact?: boolean; locale?: Locale }) {
  const copy = getTjaiMemoryCopy(locale);
  const [persona, setPersona] = useState<TjaiPersona | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tjai/settings", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.persona) setPersona(data.persona as TjaiPersona);
        else setPersona("mentor");
      })
      .catch(() => setPersona("mentor"));
    return () => {
      cancelled = true;
    };
  }, []);

  const choose = async (next: TjaiPersona) => {
    setPersona(next);
    setSaving(true);
    try {
      await fetch("/api/tjai/settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona: next })
      });
    } finally {
      setSaving(false);
    }
  };

  if (!persona) return null;

  return (
    <div className={cn("flex items-center gap-2", compact ? "text-xs" : "text-sm")}>
      <span className="text-white/50">{copy.coachStyleLabel}</span>
      <div className="inline-flex overflow-hidden rounded-full border border-white/15 bg-white/5">
        {TJAI_PERSONAS.map((p) => {
          const meta = TJAI_PERSONA_META[p];
          const active = p === persona;
          return (
            <button
              key={p}
              type="button"
              onClick={() => choose(p)}
              disabled={saving}
              className={cn(
                "px-3 py-1.5 transition",
                active ? "bg-cyan-400 text-black" : "text-white/70 transition-[background-color,color] duration-200 hover:bg-cyan-300/[0.08] hover:text-cyan-100",
                saving && "opacity-60"
              )}
              title={meta.tagline}
            >
              <span className="mr-1">{meta.emoji}</span>
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
