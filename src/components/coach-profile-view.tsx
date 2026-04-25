"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CoachStats = {
  student_count: number;
  program_count: number;
  average_rating: number;
  review_count: number;
  blog_post_count: number;
  blog_view_count: number;
};

type CoachPayload = {
  coach: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
    about_me: string | null;
    specialty_tags: string[] | null;
    certifications: string[] | null;
    accepting_clients: boolean | null;
    featured_program_id: string | null;
  };
  stats: CoachStats;
};

export function CoachProfileView({ locale, slug }: { locale: string; slug: string }) {
  const [data, setData] = useState<CoachPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/coaches/${encodeURIComponent(slug)}/stats`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (res.ok) setData(json as CoachPayload);
      setLoading(false);
      void fetch(`/api/coaches/${encodeURIComponent(slug)}/view`, { method: "POST" });
    };
    void load();
  }, [slug]);

  const about = useMemo(() => {
    const text = (data?.coach.about_me || data?.coach.bio || "").trim();
    if (!text) return "";
    if (expanded || text.length <= 300) return text;
    return `${text.slice(0, 300)}...`;
  }, [data?.coach.about_me, data?.coach.bio, expanded]);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-14 text-sm text-muted">Loading coach profile...</div>;
  if (!data) return <div className="mx-auto max-w-4xl px-4 py-14 text-sm text-muted">Coach not found.</div>;

  const coach = data.coach;

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-10">
      <section className="rounded-2xl border border-divider bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{coach.display_name || coach.username}</h1>
            <p className="mt-1 text-sm text-faint">@{coach.username}</p>
            <p className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs ${coach.accepting_clients === false ? "bg-red-500/10 text-red-300" : "bg-green-500/10 text-green-300"}`}>
              {coach.accepting_clients === false ? "🔴 Not Currently Accepting Clients" : "🟢 Accepting New Clients"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(coach.specialty_tags ?? []).slice(0, 5).map((tag) => (
              <span key={tag} className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-200">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-divider bg-surface p-4 md:grid-cols-4">
        {[
          ["Students", data.stats.student_count],
          ["Programs", data.stats.program_count],
          ["Avg Rating", data.stats.average_rating],
          ["Blog Posts", data.stats.blog_post_count]
        ].map(([label, value]) => (
          <article key={String(label)} className="rounded-lg border border-divider bg-surface-2 p-3">
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-faint">{label}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-divider bg-surface p-5">
        <h2 className="text-lg font-semibold text-white">About Me</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm text-bright">{about || "No detailed profile yet."}</p>
        {(coach.about_me || "").length > 300 ? (
          <button type="button" className="mt-3 text-xs text-cyan-300" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Read less" : "Read more"}
          </button>
        ) : null}
      </section>

      <section className="rounded-2xl border border-divider bg-surface p-5">
        <h2 className="text-lg font-semibold text-white">Certifications</h2>
        <div className="mt-3 space-y-2">
          {(coach.certifications ?? []).map((cert) => (
            <p key={cert} className="inline-flex items-center gap-2 text-sm text-bright">
              <Check className="h-4 w-4 text-green-400" /> {cert}
            </p>
          ))}
          {(coach.certifications ?? []).length === 0 ? <p className="text-sm text-faint">No certifications listed.</p> : null}
        </div>
      </section>

      <section className="rounded-2xl border border-divider bg-surface p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-faint">Most popular program by this coach</p>
        <h3 className="mt-2 text-lg font-semibold text-white">{coach.featured_program_id ? `Program ${coach.featured_program_id}` : "No featured program selected yet"}</h3>
        {coach.featured_program_id ? (
          <Link href={`/${locale}/programs/${encodeURIComponent(coach.featured_program_id)}`} className="mt-3 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-[#09090B]">
            View Program
          </Link>
        ) : null}
      </section>
    </div>
  );
}
