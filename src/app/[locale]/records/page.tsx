"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Trophy, Dumbbell, Timer, Repeat } from "lucide-react";
import { requireLocaleParam } from "@/lib/require-locale";
import { useInView } from "@/hooks/useInView";

const RecordsTrophyCanvas = dynamic(() => import("@/components/records/records-trophy-canvas"), {
  ssr: false,
  loading: () => <div className="h-32 w-full animate-pulse rounded-2xl bg-surface/80" aria-hidden />
});

type PR = {
  exercise: string;
  max_weight_kg: number | null;
  max_reps: number | null;
  max_duration_minutes: number | null;
  total_sets: number;
};

const RECORDS_COPY = {
  en: {
    eyebrow: "Records",
    title: "Personal Records",
    sub: "Your all-time bests auto-computed from your workout logs.",
    search: "Search exercises...",
    loadError: "Could not load your personal records.",
    emptyTitle: "No records yet.",
    emptyBody: "Log workouts with sets, reps, and weight to see your personal bests here.",
    progressCta: "Go to progress log ->",
    sets: "sets",
    totalSets: "Total sets logged"
  },
  tr: {
    eyebrow: "Rekorlar",
    title: "Kisisel Rekorlar",
    sub: "Tum zamanlarin en iyi dereceleri antrenman kayitlarindan otomatik hesaplanir.",
    search: "Egzersiz ara...",
    loadError: "Kisisel rekorlarin yuklenemedi.",
    emptyTitle: "Henuz rekor yok.",
    emptyBody: "Kisisel en iyilerini gormek icin set, tekrar ve agirlikla antrenman kaydet.",
    progressCta: "Progress kaydina git ->",
    sets: "set",
    totalSets: "Kayitli toplam set"
  },
  ar: {
    eyebrow: "الأرقام القياسية",
    title: "أرقامك الشخصية",
    sub: "أفضل نتائجك يتم حسابها تلقائياً من سجلات التمرين.",
    search: "ابحث عن تمرين...",
    loadError: "تعذر تحميل أرقامك الشخصية.",
    emptyTitle: "لا توجد أرقام بعد.",
    emptyBody: "سجل التمارين بالمجموعات والتكرارات والوزن لترى أفضل نتائجك هنا.",
    progressCta: "اذهب إلى سجل التقدم ->",
    sets: "مجموعات",
    totalSets: "إجمالي المجموعات المسجلة"
  },
  es: {
    eyebrow: "Records",
    title: "Records personales",
    sub: "Tus mejores marcas se calculan automaticamente desde tus entrenamientos.",
    search: "Buscar ejercicios...",
    loadError: "No se pudieron cargar tus records personales.",
    emptyTitle: "Aun no hay records.",
    emptyBody: "Registra series, repeticiones y peso para ver tus mejores marcas aqui.",
    progressCta: "Ir al registro de progreso ->",
    sets: "series",
    totalSets: "Series totales registradas"
  },
  fr: {
    eyebrow: "Records",
    title: "Records personnels",
    sub: "Tes meilleurs resultats sont calcules automatiquement depuis tes entrainements.",
    search: "Rechercher des exercices...",
    loadError: "Impossible de charger tes records personnels.",
    emptyTitle: "Aucun record pour l'instant.",
    emptyBody: "Enregistre tes series, repetitions et charges pour voir tes records ici.",
    progressCta: "Aller au journal de progression ->",
    sets: "series",
    totalSets: "Total des series enregistrees"
  }
} as const;

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
  const copy = RECORDS_COPY[locale as keyof typeof RECORDS_COPY] ?? RECORDS_COPY.en;
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
      } catch { setError(copy.loadError); }
      finally { setLoading(false); }
    };
    void run();
  }, [copy.loadError]);
  const filtered = search.trim() ? prs.filter((p) => p.exercise.toLowerCase().includes(search.toLowerCase())) : prs;
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-divider/80 bg-gradient-to-b from-[#111215] to-[#0A0A0B] p-4 sm:p-6">
        <div className="h-36 w-full max-w-md mx-auto sm:h-40">
          <RecordsTrophyCanvas />
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">{copy.eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{copy.sub}</p>
      </div>
      {!loading && prs.length > 0 && (
        <input className="input w-full max-w-sm" placeholder={copy.search} value={search} onChange={(e) => setSearch(e.target.value)} />
      )}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
      )}
      {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-400">{error}</div>}
      {!loading && !error && prs.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-divider bg-surface py-20 text-center">
          <Dumbbell className="mx-auto h-12 w-12 text-dim" strokeWidth={1.5} />
          <p className="mt-4 text-lg font-semibold text-white">{copy.emptyTitle}</p>
          <p className="mt-2 max-w-xs text-sm text-muted">{copy.emptyBody}</p>
          <a href={`/${locale}/progress`} className="mt-6 inline-flex items-center justify-center rounded-full border border-accent/30 bg-accent/10 px-6 py-2.5 text-sm font-semibold text-accent">{copy.progressCta}</a>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((pr) => (
            <div key={pr.exercise} className="rounded-2xl border border-divider bg-surface p-5 transition-[border-color,box-shadow] duration-200 hover:border-[rgba(34,211,238,0.2)]">
              <div className="flex items-start justify-between gap-2">
                <p className="text-base font-semibold text-white">{pr.exercise}</p>
                <span className="shrink-0 text-xs text-dim">{pr.total_sets} {copy.sets}</span>
              </div>
              <div className="mt-1 h-px w-full bg-divider" />
              <div className="mt-3 flex flex-wrap gap-3">
                {pr.max_weight_kg != null ? (
                  <div className="tj-pr-weight-shimmer relative flex items-center gap-1.5 overflow-hidden rounded-md px-1 py-0.5">
                    <Trophy className="h-3.5 w-3.5 text-accent" />
                    <PRValue value={pr.max_weight_kg} suffix=" kg" color="#22D3EE" />
                  </div>
                ) : null}
                {pr.max_reps != null ? <div className="flex items-center gap-1.5"><Repeat className="h-3.5 w-3.5 text-accent" /><PRValue value={pr.max_reps} suffix=" reps" color="#22D3EE" /></div> : null}
                {pr.max_duration_minutes != null ? <div className="flex items-center gap-1.5"><Timer className="h-3.5 w-3.5 text-accent-violet" /><PRValue value={pr.max_duration_minutes} suffix=" min" color="#A78BFA" /></div> : null}
              </div>
              <p className="mt-3 text-xs text-faint">{copy.totalSets}: {pr.total_sets}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
