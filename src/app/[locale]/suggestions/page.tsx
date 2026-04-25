"use client";

import { useEffect, useState } from "react";
import { Lightbulb, ChevronUp } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { isLocale } from "@/lib/i18n";

type Suggestion = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  vote_count: number;
  created_at: string;
  user_voted?: boolean;
};

const STATUS_COLORS: Record<string, string> = {
  under_review: "border-faint/30 bg-faint/10 text-bright",
  planned: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
  done: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  rejected: "border-red-400/20 bg-red-500/10 text-red-300"
};

const CATEGORY_OPTIONS = ["Feature", "Bug", "Design", "Content", "Other"] as const;

export default function SuggestionsPage({ params }: { params: { locale: string } }) {
  const locale = isLocale(params.locale) ? params.locale : "en";
  const { user } = useAuth();
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "Feature" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (f = filter) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/suggestions?filter=${f}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      setItems(Array.isArray(data.suggestions) ? data.suggestions : []);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [filter]);

  const vote = async (id: string) => {
    if (!user) return;
    await fetch(`/api/suggestions/${id}/vote`, { method: "POST", credentials: "include" });
    void load();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setError("Please sign in to submit a suggestion."); return; }
    if (form.description.trim().length < 20) { setError("Description must be at least 20 characters."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(String(d.error ?? "Submit failed")); return; }
      setShowModal(false);
      setForm({ title: "", description: "", category: "Feature" });
      void load();
    } finally {
      setSubmitting(false);
    }
  };

  const FILTERS = [
    { key: "all", label: "All" },
    { key: "top", label: "Most Voted" },
    { key: "new", label: "New" },
    { key: "planned", label: "Planned" },
    { key: "done", label: "Done" }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Lightbulb className="h-7 w-7 text-accent" />
            <h1 className="text-3xl font-extrabold text-white">Share Your Ideas</h1>
          </div>
          <p className="mt-2 text-sm text-muted">Help us build the best fitness platform in the world.</p>
        </div>
        <button
          type="button"
          onClick={() => { if (!user) { window.location.href = `/${locale}/login?redirect=/${locale}/suggestions`; return; } setShowModal(true); }}
          className="shrink-0 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-[#09090B]"
        >
          Submit an idea →
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f.key} type="button" onClick={() => setFilter(f.key)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${filter === f.key ? "border-accent bg-[rgba(34,211,238,0.1)] text-white" : "border-divider text-muted hover:text-white"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl border border-divider bg-surface" />)
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-divider bg-[#0D0F12] px-6 py-16 text-center">
            <Lightbulb className="mx-auto h-10 w-10 text-dim" />
            <p className="mt-4 text-lg font-semibold text-white">No ideas yet.</p>
            <p className="mt-2 text-sm text-muted">Be the first to suggest something!</p>
          </div>
        ) : (
          items.map((item) => (
            <article key={item.id} className="flex gap-4 rounded-2xl border border-divider bg-surface p-4">
              <button type="button" onClick={() => void vote(item.id)}
                className="flex shrink-0 flex-col items-center gap-1 rounded-xl border border-divider bg-[#0D0F12] px-3 py-2 text-sm text-bright hover:border-accent hover:text-white"
              >
                <ChevronUp className="h-4 w-4" />
                <span className="font-semibold">{item.vote_count}</span>
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${STATUS_COLORS[item.status] ?? STATUS_COLORS.under_review}`}>
                    {item.status.replace("_", " ")}
                  </span>
                  <span className="rounded-full border border-divider px-2 py-0.5 text-[10px] text-faint">
                    {item.category}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted line-clamp-2">{item.description}</p>
              </div>
            </article>
          ))
        )}
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-divider bg-surface p-6">
            <h2 className="text-xl font-bold text-white">Submit an Idea</h2>
            <form onSubmit={submit} className="mt-4 space-y-4">
              <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
              <textarea className="min-h-[100px] w-full rounded-xl border border-divider bg-[#0D0F12] p-3 text-sm text-white outline-none placeholder:text-dim focus:border-accent"
                placeholder="Describe your idea (min 20 characters)..."
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                required minLength={20}
              />
              <select className="input" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {error ? <p className="text-xs text-red-400">{error}</p> : null}
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="flex-1 rounded-full bg-accent py-2.5 text-sm font-bold text-[#09090B] disabled:opacity-50">
                  {submitting ? "Submitting..." : "Submit Idea"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="rounded-full border border-divider px-4 py-2.5 text-sm text-muted">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
