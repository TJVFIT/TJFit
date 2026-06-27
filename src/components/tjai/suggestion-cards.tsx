"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Suggestion = {
  id: string;
  kind: string;
  title: string;
  summary: string;
  rationale: string;
};

const KIND_LABELS: Record<string, Record<string, string>> = {
  deload:           { en: "Deload",    tr: "Deload",      ar: "تخفيف الحمل",   es: "Descarga",     fr: "Décharge" },
  progression:      { en: "Progress",  tr: "İlerleme",    ar: "تقدم",          es: "Progreso",     fr: "Progrès" },
  swap:             { en: "Swap",      tr: "Değiştir",    ar: "استبدال",       es: "Intercambio",  fr: "Échange" },
  volume_change:    { en: "Volume",    tr: "Hacim",       ar: "الحجم",         es: "Volumen",      fr: "Volume" },
  frequency_change: { en: "Frequency", tr: "Sıklık",      ar: "التكرار",       es: "Frecuencia",   fr: "Frecuencia" },
  recovery_week:    { en: "Recovery",  tr: "Toparlanma",  ar: "التعافي",       es: "Recuperación", fr: "Récupération" },
  general:          { en: "Adjust",    tr: "Ayarla",      ar: "تعديل",         es: "Ajustar",      fr: "Ajuster" }
};

const KIND_COLOR: Record<string, string> = {
  deload: "text-violet-300",
  progression: "text-purple-300",
  swap: "text-violet-300",
  volume_change: "text-purple-300",
  frequency_change: "text-purple-300",
  recovery_week: "text-violet-300",
  general: "text-white/70"
};

const COPY = {
  en: { prefix: "TJAI suggests · ", hint: "tap accept or skip", accept: "Accept", skip: "Skip" },
  tr: { prefix: "TJAI öneriyor · ", hint: "kabul et veya atla",  accept: "Kabul",  skip: "Atla" },
  ar: { prefix: "يقترح TJAI · ",    hint: "اقبل أو تخطَّ",       accept: "قبول",   skip: "تخطي" },
  es: { prefix: "TJAI sugiere · ",  hint: "acepta o salta",      accept: "Aceptar",skip: "Saltar" },
  fr: { prefix: "TJAI suggère · ",  hint: "accepte ou ignore",   accept: "Accepter",skip: "Ignorer" }
} as const;

type Locale = keyof typeof COPY;

function useLocale(): Locale {
  const pathname = usePathname() ?? "";
  const seg = pathname.split("/").filter(Boolean)[0] ?? "";
  if (seg === "tr" || seg === "ar" || seg === "es" || seg === "fr") return seg;
  return "en";
}

export function SuggestionCards() {
  const locale = useLocale();
  const t = COPY[locale];
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
        const kindLabels = KIND_LABELS[s.kind] ?? KIND_LABELS.general;
        const kindLabel = kindLabels[locale] ?? kindLabels.en;
        const color = KIND_COLOR[s.kind] ?? KIND_COLOR.general;
        return (
          <div
            key={s.id}
            className="rounded-xl border border-purple-300/20 bg-gradient-to-br from-purple-300/[0.06] to-transparent p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${color}`}>
                {t.prefix}{kindLabel}
              </span>
              <span className="text-[10px] text-white/40">{t.hint}</span>
            </div>
            <h4 className="mt-1 text-sm font-semibold text-white">{s.title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-white/85">{s.summary}</p>
            <p className="mt-2 text-xs italic text-white/55">{s.rationale}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => decide(s.id, "accepted")}
                disabled={busyId === s.id}
                className="rounded-md bg-purple-400 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-purple-300 disabled:opacity-50"
              >
                {t.accept}
              </button>
              <button
                type="button"
                onClick={() => decide(s.id, "rejected")}
                disabled={busyId === s.id}
                className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-purple-300/35 hover:bg-purple-300/[0.05] hover:text-purple-100 hover:shadow-[0_0_12px_rgba(168,85,247,0.1)] disabled:opacity-50"
              >
                {t.skip}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
