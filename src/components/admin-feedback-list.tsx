"use client";

import { useState } from "react";

type Submission = {
  id: string;
  created_at: string;
  type: string;
  subject: string | null;
  message: string;
  order_reference: string | null;
  email: string | null;
  locale: string | null;
};

export function AdminFeedbackList({
  initialSubmissions = []
}: {
  initialSubmissions?: Submission[];
}) {
  const [submissions] = useState<Submission[]>(initialSubmissions);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? submissions : submissions.filter((s) => s.type === filter);

  return (
    <div className="glass-panel rounded-[32px] p-6">
      <p className="text-lg font-semibold text-white">Feedback & Support</p>
      <p className="mt-2 text-sm text-zinc-400">
        {submissions.length} submission{submissions.length !== 1 ? "s" : ""} received
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {["all", "complaint", "suggestion", "feedback", "help_request", "refund_request"].map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                filter === f
                  ? "bg-accent text-white"
                  : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              {f === "all" ? "All" : f.replace("_", " ")}
            </button>
          )
        )}
      </div>
      <div className="mt-6 max-h-80 space-y-4 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-zinc-500">No submissions yet.</p>
        ) : (
          filtered.map((s) => (
            <div
              key={s.id}
              className="rounded-[24px] border border-white/10 bg-white/5 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-300">
                  {s.type}
                </span>
                <p className="text-xs text-zinc-500">
                  {new Date(s.created_at).toLocaleDateString()}
                </p>
              </div>
              {s.subject && (
                <p className="mt-2 font-medium text-white">{s.subject}</p>
              )}
              <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{s.message}</p>
              {s.order_reference && (
                <p className="mt-2 text-xs text-zinc-500">
                  Order ref: {s.order_reference}
                </p>
              )}
              {s.email && (
                <p className="mt-1 text-xs text-zinc-500">{s.email}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
