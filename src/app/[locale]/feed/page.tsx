"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { PremiumPageShell } from "@/components/premium";
import type { Locale } from "@/lib/i18n";

type FeedItem = {
  id: string;
  user_id: string;
  type: string;
  created_at: string;
  message: string;
  meta?: Record<string, unknown>;
  profile: { id: string; username: string; display_name: string; avatar_url: string | null } | null;
};

export default function FeedPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const [items, setItems] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (next?: boolean) => {
    if (next) setLoadingMore(true);
    else setLoading(true);
    const q = next && cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    const res = await fetch(`/api/feed${q}`, { credentials: "include", cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    const incoming = (data.items ?? []) as FeedItem[];
    setItems((prev) => (next ? [...prev, ...incoming] : incoming));
    setCursor((data.next_cursor as string | null) ?? null);
    setLoading(false);
    setLoadingMore(false);
  }, [cursor]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void load();
    }, 60000);
    return () => window.clearInterval(timer);
  }, [load]);

  return (
    <PremiumPageShell>
      <section className="rounded-2xl border border-divider bg-surface p-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-white">Feed</h1>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-full border border-white/15 px-4 py-1.5 text-xs text-bright"
          >
            Refresh
          </button>
        </div>

        {loading ? <p className="mt-4 text-sm text-muted">Loading feed...</p> : null}

        {!loading && items.length === 0 ? (
          <div className="mt-5 rounded-xl border border-white/10 bg-surface-2 p-5 text-center">
            <p className="text-sm text-bright">Follow other members to see their activity here.</p>
            <Link href={`/${locale}/community?tab=people`} className="mt-3 inline-flex text-sm text-cyan-300">
              Discover People →
            </Link>
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-white/10 bg-surface-2 p-4">
              <p className="text-sm text-bright">
                <Link href={`/${locale}/profile/${encodeURIComponent(item.profile?.username ?? "")}`} className="font-semibold text-white">
                  {item.profile?.display_name ?? "Member"}
                </Link>{" "}
                {item.message}
              </p>
              <p className="mt-1 text-xs text-faint">{new Date(item.created_at).toLocaleString(locale)}</p>
            </article>
          ))}
        </div>

        {cursor ? (
          <button
            type="button"
            onClick={() => void load(true)}
            disabled={loadingMore}
            className="mt-4 rounded-full border border-white/15 px-4 py-1.5 text-xs text-bright disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        ) : null}
      </section>
    </PremiumPageShell>
  );
}
