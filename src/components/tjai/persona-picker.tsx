"use client";

import { useEffect, useState } from "react";

import { TJAI_PERSONA_META, TJAI_PERSONAS, type TjaiPersona } from "@/lib/tjai/persona";
import { cn } from "@/lib/utils";

export function PersonaPicker({ compact = false }: { compact?: boolean }) {
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
      <span className="text-white/50">Coach style:</span>
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
                active ? "bg-cyan-400 text-black" : "text-white/70 hover:bg-white/10",
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
