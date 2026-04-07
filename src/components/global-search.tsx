"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { searchNormalize } from "@/lib/turkish-chars";

type GroupedResults = {
  programs: Array<{ id: string; title: string; href: string }>;
  diets: Array<{ id: string; title: string; href: string }>;
  coaches: Array<{ id: string; title: string; href: string }>;
  blog: Array<{ id: string; title: string; href: string }>;
  users: Array<{ id: string; title: string; href: string }>;
};

const EMPTY: GroupedResults = { programs: [], diets: [], coaches: [], blog: [], users: [] };

export function GlobalSearch({ locale, collapsed, onExpand }: { locale: string; collapsed: boolean; onExpand?: () => void }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GroupedResults>(EMPTY);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchNormalize(query).length < 2) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = window.setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      setResults((data.results ?? EMPTY) as GroupedResults);
      setLoading(false);
      setOpen(true);
    }, 300);
    return () => window.clearTimeout(t);
  }, [query]);

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => onExpand?.()}
        className="mt-2 flex h-10 w-full items-center justify-center rounded-lg text-[#52525B] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
        title="Search TJFit"
      >
        <Search className="h-5 w-5" />
      </button>
    );
  }

  const groups: Array<[string, Array<{ id: string; title: string; href: string }>]> = [
    ["Programs", results.programs],
    ["Diets", results.diets],
    ["Coaches", results.coaches],
    ["Blog", results.blog],
    ["Members", results.users]
  ];

  return (
    <div className="relative mt-2 px-2">
      <div className="flex items-center gap-2 rounded-lg border border-[#1E2028] bg-[#111215] px-3 py-2">
        <Search className="h-4 w-4 text-[#52525B]" />
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search TJFit..."
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#52525B]"
        />
      </div>
      {open ? (
        <div className="absolute left-2 right-2 top-[calc(100%+6px)] z-[120] max-h-[420px] overflow-y-auto rounded-xl border border-[#1E2028] bg-[#111215] p-3">
          {loading ? <p className="text-xs text-[#52525B]">Searching...</p> : null}
          {!loading &&
          groups.every(([, items]) => items.length === 0) &&
          searchNormalize(query).length >= 2 ? <p className="text-xs text-[#52525B]">No results for &quot;{query}&quot;</p> : null}
          {groups.map(([label, items]) =>
            items.length ? (
              <div key={label} className="mb-3">
                <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-[#52525B]">{label}</p>
                <div className="space-y-1">
                  {items.map((item) => (
                    <Link key={item.id} href={`/${locale}${item.href}`} className="block rounded-md px-2 py-1.5 text-xs text-[#D4D4D8] hover:bg-white/5">
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null
          )}
          {searchNormalize(query).length >= 2 ? (
            <Link href={`/${locale}/search?q=${encodeURIComponent(query)}`} className="block rounded-md border border-[#1E2028] px-2 py-2 text-center text-xs text-[#22D3EE]">
              View all results
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
