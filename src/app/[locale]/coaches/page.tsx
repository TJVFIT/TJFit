"use client";

import { useEffect, useMemo, useState } from "react";
import { CoachCard } from "@/components/coach-card";
import { PremiumPageShell } from "@/components/premium";
import { isLocale } from "@/lib/i18n";
import { searchNormalize } from "@/lib/turkish-chars";

export default function CoachesPage({ params }: { params: { locale: string } }) {
  const locale = isLocale(params.locale) ? params.locale : "en";
  const [loading, setLoading] = useState(true);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [acceptingOnly, setAcceptingOnly] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams();
        if (q.trim()) qs.set("q", searchNormalize(q));
        if (specialty.trim()) qs.set("specialty", specialty);
        if (acceptingOnly) qs.set("accepting", "1");
        const res = await fetch(`/api/coaches?${qs.toString()}`, { cache: "no-store" });
        if (!res.ok) {
          console.error("Coaches fetch error:", { status: res.status, statusText: res.statusText });
          setCoaches([]);
          return;
        }
        const data = await res.json().catch(() => ({}));
        setCoaches((data.coaches ?? []) as any[]);
      } catch (error) {
        console.error("Coaches fetch error:", error);
        setCoaches([]);
      } finally {
        setLoading(false);
      }
    };
    void fetchList();
  }, [acceptingOnly, q, specialty]);

  const specialtyOptions = useMemo(() => {
    const set = new Set<string>();
    for (const coach of coaches) {
      for (const tag of coach.specialty_tags ?? []) set.add(String(tag));
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [coaches]);

  return (
    <PremiumPageShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Coaches</h1>
          <p className="mt-1 text-sm text-zinc-400">Find the right coach by specialty and availability.</p>
        </div>
        <div className="grid gap-2 md:grid-cols-[1fr,220px,220px]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search coach name or username"
            className="rounded-xl border border-[#1E2028] bg-[#111215] px-3 py-2 text-sm text-white"
          />
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="rounded-xl border border-[#1E2028] bg-[#111215] px-3 py-2 text-sm text-white">
            <option value="">All specialties</option>
            {specialtyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <label className="inline-flex items-center gap-2 rounded-xl border border-[#1E2028] bg-[#111215] px-3 py-2 text-sm text-zinc-300">
            <input type="checkbox" checked={acceptingOnly} onChange={(e) => setAcceptingOnly(e.target.checked)} />
            Accepting clients only
          </label>
        </div>
        {loading ? <p className="text-sm text-zinc-500">Loading coaches...</p> : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {coaches.map((coach) => (
            <CoachCard key={coach.id} locale={locale} coach={coach} />
          ))}
        </div>
      </div>
    </PremiumPageShell>
  );
}
