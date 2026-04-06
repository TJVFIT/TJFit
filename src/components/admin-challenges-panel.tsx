"use client";

import { useState } from "react";

export function AdminChallengesPanel() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    metric_type: "reps",
    start_date: "",
    end_date: "",
    coin_prize_1st: 500,
    coin_prize_2nd: 250,
    coin_prize_3rd: 100,
    coin_completion_reward: 50
  });
  const [status, setStatus] = useState<string>("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    const res = await fetch("/api/community/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(String(data.error ?? "Failed"));
      return;
    }
    setStatus("Challenge created.");
    setForm((prev) => ({ ...prev, title: "", description: "" }));
  };

  return (
    <section className="glass-panel rounded-[32px] p-6">
      <h3 className="text-lg font-semibold text-white">Challenges</h3>
      <form onSubmit={submit} className="mt-4 grid gap-3">
        <input className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white" placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
        <textarea className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white" placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white" placeholder="Metric type" value={form.metric_type} onChange={(e) => setForm((p) => ({ ...p, metric_type: e.target.value }))} />
          <input type="date" className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white" value={form.start_date} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} required />
          <input type="date" className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white" value={form.end_date} onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))} required />
          <input type="number" className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white" value={form.coin_prize_1st} onChange={(e) => setForm((p) => ({ ...p, coin_prize_1st: Number(e.target.value) }))} />
          <input type="number" className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white" value={form.coin_prize_2nd} onChange={(e) => setForm((p) => ({ ...p, coin_prize_2nd: Number(e.target.value) }))} />
          <input type="number" className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white" value={form.coin_prize_3rd} onChange={(e) => setForm((p) => ({ ...p, coin_prize_3rd: Number(e.target.value) }))} />
          <input type="number" className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white" value={form.coin_completion_reward} onChange={(e) => setForm((p) => ({ ...p, coin_completion_reward: Number(e.target.value) }))} />
        </div>
        <button type="submit" className="btn-primary-shimmer rounded-full bg-gradient-to-br from-[#22D3EE] to-[#0EA5E9] px-4 py-2 text-sm font-semibold text-[#09090B]">
          Create Challenge
        </button>
        {status ? <p className="text-xs text-zinc-300">{status}</p> : null}
      </form>
    </section>
  );
}

