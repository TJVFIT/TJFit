"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Debounce text search by 350ms; filters (specialty, accepting) apply immediately
    const doFetch = async () => {
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

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { void doFetch(); }, q ? 350 : 0);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
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
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <label className="inline-flex items-center gap-2 rounded-xl border border-[#1E2028] bg-[#111215] px-3 py-2 text-sm text-zinc-300">
            <input type="checkbox" checked={acceptingOnly} onChange={(e) => setAcceptingOnly(e.target.checked)} />
            Accepting clients only
          </label>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl border border-[#1E2028] bg-[#111215]" />
            ))}
          </div>
        ) : coaches.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {coaches.map((coach) => (
              <CoachCard key={coach.id} locale={locale} coach={coach} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[40svh] flex-col items-center justify-center rounded-2xl border border-dashed border-[#1E2028] bg-[#0D0F12] px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#1E2028] bg-[#111215] text-2xl">
              🏋️
            </div>
            <p className="text-lg font-semibold text-white">No coaches yet.</p>
            <p className="mt-2 max-w-sm text-sm text-zinc-400">
              We are onboarding our first certified coaches now. Are you a certified fitness professional?
            </p>
            <a
              href={`/${locale}/become-a-coach`}
              className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#22D3EE] px-6 py-2.5 text-sm font-bold text-[#09090B]"
            >
              Apply to Join
            </a>
            <button
              type="button"
              disabled
              className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#1E2028] px-5 py-2 text-sm text-zinc-500 opacity-50 cursor-not-allowed"
            >
              Help me find a coach — Coming Soon
            </button>
          </div>
        )}
      </div>
    </PremiumPageShell>
  );
}
