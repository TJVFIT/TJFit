"use client";

import { useEffect, useState } from "react";

export function CoachAnalyticsWidget() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    void fetch("/api/coach/analytics", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-faint">Loading analytics...</div>;
  if (!data) return <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-faint">No analytics data yet.</div>;

  return (
    <section className="rounded-[24px] border border-white/10 bg-white/5 p-5">
      <h3 className="text-lg font-semibold text-white">Your Performance</h3>
      <div className="mt-4 grid gap-2 md:grid-cols-4">
        <div className="rounded-xl border border-white/10 p-3 text-sm text-bright">Profile views: {data.weekly.profile_views}</div>
        <div className="rounded-xl border border-white/10 p-3 text-sm text-bright">Program sales: {data.weekly.program_sales}</div>
        <div className="rounded-xl border border-white/10 p-3 text-sm text-bright">Revenue: €{Number(data.weekly.revenue ?? 0).toFixed(2)}</div>
        <div className="rounded-xl border border-white/10 p-3 text-sm text-bright">Blog views: {data.weekly.blog_views}</div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        <div className="rounded-xl border border-white/10 p-3 text-sm text-muted">Students: {data.all_time.total_students}</div>
        <div className="rounded-xl border border-white/10 p-3 text-sm text-muted">Total earnings: €{Number(data.all_time.total_earnings ?? 0).toFixed(2)}</div>
        <div className="rounded-xl border border-white/10 p-3 text-sm text-muted">Average rating: ⭐ {data.all_time.average_rating}</div>
        <div className="rounded-xl border border-white/10 p-3 text-sm text-muted">Programs created: {data.all_time.programs_created}</div>
      </div>
      {data.top_program ? (
        <p className="mt-3 text-sm text-muted">
          Top performing program: <span className="text-white">{data.top_program.slug}</span> ({data.top_program.sales} sales)
        </p>
      ) : null}
    </section>
  );
}
