"use client";

import { Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export function CoachMyStudentsPanel({ locale }: { locale: Locale }) {
  const d = getDictionary(locale).dashboard.coach;
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/coach/active-student-count", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "—");
        setCount(null);
        return;
      }
      setCount(typeof data.count === "number" ? data.count : 0);
    } catch {
      setError("—");
      setCount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="mt-6 space-y-3" aria-busy="true">
        <div className="tj-skeleton tj-shimmer h-4 w-48 rounded-md" />
        <div className="tj-skeleton tj-shimmer h-24 w-full rounded-[20px]" />
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="tj-empty-state mt-6">
        <Users className="mx-auto h-8 w-8 text-[var(--color-text-muted)]" aria-hidden strokeWidth={1.5} />
        <h3 className="mt-4 text-lg font-semibold text-[var(--color-text-secondary)]">No students yet</h3>
        <p className="tj-empty-state__text mt-2 text-sm">Students will appear here once they join your program.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
      <p className="font-medium text-white">{d.myStudentsSubtitle}</p>
      {error ? (
        <p className="mt-2 text-sm text-zinc-500">{error}</p>
      ) : (
        <p className="mt-2 text-sm text-zinc-400">
          {count === 1 ? "1 active student" : `${count ?? 0} active students`}
        </p>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[d.chat, d.reschedule, d.viewPlan].map((action) => (
          <button
            key={action}
            type="button"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}
