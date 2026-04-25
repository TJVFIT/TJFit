"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Group = Array<{ id: string; title: string; href: string }>;
type SearchResults = { programs: Group; diets: Group; coaches: Group; blog: Group; users: Group };

const EMPTY: SearchResults = { programs: [], diets: [], coaches: [], blog: [], users: [] };

export default function SearchPage({ params }: { params: { locale: string } }) {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim();
  const [results, setResults] = useState<SearchResults>(EMPTY);

  useEffect(() => {
    if (!q) {
      setResults(EMPTY);
      return;
    }
    void fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setResults((data?.results ?? EMPTY) as SearchResults))
      .catch(() => setResults(EMPTY));
  }, [q]);

  const groups: Array<[string, Group]> = [
    ["Programs", results.programs],
    ["Diets", results.diets],
    ["Coaches", results.coaches],
    ["Blog", results.blog],
    ["Members", results.users]
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-white">Search results</h1>
      <p className="mt-1 text-sm text-faint">Query: {q || "—"}</p>
      <div className="mt-6 space-y-5">
        {groups.map(([label, items]) => (
          <section key={label} className="rounded-2xl border border-divider bg-surface p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-faint">{label}</h2>
            <div className="mt-3 space-y-2">
              {items.length === 0 ? <p className="text-sm text-faint">No results</p> : null}
              {items.map((item) => (
                <Link key={item.id} href={`/${params.locale}${item.href}`} className="block rounded-lg border border-divider px-3 py-2 text-sm text-bright">
                  {item.title}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
