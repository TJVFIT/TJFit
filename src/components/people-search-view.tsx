"use client";

import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthRequiredPanel } from "@/components/auth-required-panel";
import { useAuth } from "@/components/auth-provider";
import { DirectMessageLaunchButton } from "@/components/direct-message-launch-button";
import { getSocialCopy } from "@/lib/social-copy";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

type SearchHit = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio_preview: string;
  is_private: boolean;
  can_message?: boolean;
};

function initials(display: string, username: string) {
  const base = (display || username).trim();
  return base.slice(0, 2).toUpperCase() || "??";
}

export function PeopleSearchView({ locale }: { locale: Locale }) {
  const s = getSocialCopy(locale);
  const dict = getDictionary(locale);
  const { user, loading: authLoading } = useAuth();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dmErrors, setDmErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(q.trim()), 320);
    return () => window.clearTimeout(t);
  }, [q]);

  const runSearch = useCallback(async () => {
    setDmErrors({});
    if (debounced.length < 2) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/profiles/search?q=${encodeURIComponent(debounced)}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : s.errorGeneric);
        setResults([]);
        return;
      }
      const rows = (data.results ?? []) as (SearchHit & { account_visibility?: string })[];
      setResults(
        rows.map((r) => ({
          ...r,
          is_private: Boolean(r.is_private ?? r.account_visibility === "private"),
          can_message: r.can_message === true
        }))
      );
    } catch {
      setError(s.errorGeneric);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [debounced, s.errorGeneric]);

  useEffect(() => {
    void runSearch();
  }, [runSearch]);

  const showInitial = debounced.length < 2;
  const showEmpty = !loading && debounced.length >= 2 && results.length === 0 && !error;

  const skeletonKeys = useMemo(() => ["a", "b", "c", "d", "e"], []);

  if (authLoading) {
    return (
      <div className="relative mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center px-4 py-16">
        <p className="text-sm text-faint">{s.loading}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative mx-auto min-h-[70dvh] max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="pointer-events-none absolute inset-x-0 -top-24 h-64 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent blur-3xl" />
        <div className="relative">
          <Link href={`/${locale}`} className="text-xs font-medium text-faint transition hover:text-bright">
            ← {dict.nav.home}
          </Link>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {s.peopleSearchTitle}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{s.peopleSearchSubtitle}</p>
        </div>
        <div className="relative mt-12">
          <AuthRequiredPanel locale={locale} className="w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto min-h-[70dvh] max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-64 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent blur-3xl" />

      <div className="relative">
        <Link href={`/${locale}/messages`} className="text-xs font-medium text-faint transition hover:text-bright">
          ← {s.threadBack}
        </Link>

        <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {s.peopleSearchTitle}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{s.peopleSearchSubtitle}</p>
        <p className="mt-3 max-w-xl text-xs leading-relaxed text-dim">{s.searchPrivacyNote}</p>

        <div className="relative mt-8">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-faint">
            <Search className="h-4 w-4" strokeWidth={2} aria-hidden />
          </div>
          <input
            className="input w-full rounded-2xl border-white/[0.12] bg-[#0c0c0f]/80 py-3.5 pl-11 pr-4 text-[15px] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-sm placeholder:text-dim focus:border-cyan-400/35 focus:ring-cyan-400/20"
            placeholder={s.searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            aria-label={s.searchPlaceholder}
            enterKeyHint="search"
          />
        </div>

        {debounced.length > 0 && debounced.length < 2 ? (
          <p className="mt-3 text-xs text-muted">{s.searchHint}</p>
        ) : null}
      </div>

      {showInitial ? (
        <div className="relative mt-10 overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent p-8 text-center shadow-[0_0_60px_-30px_rgba(34,211,238,0.25)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200/90">
            <Search className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          </div>
          <p className="font-display text-lg font-semibold text-white">{s.searchStartPrompt}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-faint">{s.searchStartDetail}</p>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="relative mt-8 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200/90"
        >
          <p>{error}</p>
          <button
            type="button"
            className="mt-3 rounded-full border border-white/15 px-4 py-1.5 text-xs text-bright hover:border-white/25"
            onClick={() => void runSearch()}
          >
            {s.retryLabel}
          </button>
        </div>
      ) : null}

      {loading ? (
        <ul className="relative mt-8 space-y-4" aria-busy="true" aria-label={s.loading}>
          {skeletonKeys.map((k) => (
            <li
              key={k}
              className="overflow-hidden rounded-[24px] border border-white/[0.06] bg-white/[0.03] p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 animate-pulse rounded-2xl bg-white/10" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-40 animate-pulse rounded-md bg-white/10" />
                    <div className="h-3 w-28 animate-pulse rounded-md bg-white/5" />
                    <div className="h-3 w-full max-w-xs animate-pulse rounded-md bg-white/[0.04]" />
                  </div>
                </div>
                <div className="flex shrink-0 gap-2 sm:ml-auto">
                  <div className="h-10 flex-1 animate-pulse rounded-full bg-white/10 sm:w-24 sm:flex-none" />
                  <div className="h-10 flex-1 animate-pulse rounded-full bg-white/[0.06] sm:w-24 sm:flex-none" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {showEmpty ? (
        <div className="tj-empty-state relative mt-10">
          <Search className="mx-auto h-7 w-7 text-[var(--color-text-muted)]" strokeWidth={1.75} aria-hidden />
          <h2 className="mt-4 text-lg font-semibold text-[var(--color-text-secondary)]">{s.noResults}</h2>
          <p className="tj-empty-state__text mt-2 text-sm text-[var(--color-text-muted)]">{s.noResultsSub}</p>
        </div>
      ) : null}

      {!loading && results.length > 0 ? (
        <ul className="relative mt-8 space-y-4">
          {results.map((r) => {
            const id = r.id ?? r.username;
            const safeBio = r.is_private ? "" : (r.bio_preview ?? "").trim();
            const dmErr = id ? dmErrors[id] : undefined;
            const displayName = (r.display_name ?? r.username ?? "").trim() || "—";
            const uname = (r.username ?? "").trim() || "—";

            return (
              <li key={id || uname}>
                <article className="group overflow-hidden rounded-[24px] border border-white/[0.08] bg-gradient-to-br from-white/[0.07] via-white/[0.02] to-transparent p-4 shadow-[0_0_40px_-24px_rgba(34,211,238,0.35)] transition hover:border-cyan-400/20 sm:p-5">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-stretch sm:gap-6">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-background shadow-inner ring-1 ring-white/5">
                        {r.avatar_url ? (
                          <Image src={r.avatar_url} alt="" fill sizes="64px" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-sm font-semibold text-muted">
                            {initials(displayName, uname)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate font-display text-lg font-semibold text-white">{displayName}</h2>
                          {r.is_private ? (
                            <span className="shrink-0 rounded border border-violet-400/25 bg-violet-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-violet-200/85">
                              {s.privateProfile}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 font-mono text-sm text-cyan-200/70">@{uname}</p>
                        {safeBio ? (
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{safeBio}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:min-w-[11rem] sm:justify-center">
                      <div
                        className={`grid gap-2 ${r.can_message ? "grid-cols-2 sm:grid-cols-1" : "grid-cols-1"}`}
                      >
                        {uname !== "—" ? (
                          <Link
                            href={`/${locale}/profile/${encodeURIComponent(uname)}`}
                            className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-center text-xs font-semibold text-bright transition hover:border-cyan-400/35 hover:bg-white/[0.08]"
                          >
                            {s.viewProfileButton}
                          </Link>
                        ) : (
                          <span className="rounded-full border border-white/10 px-4 py-2.5 text-center text-xs text-faint">
                            {s.viewProfileButton}
                          </span>
                        )}
                        {r.can_message && id ? (
                          <DirectMessageLaunchButton
                            locale={locale}
                            peerId={id}
                            variant="gradient"
                            className="py-2.5 text-xs"
                            onError={(msg) => setDmErrors((prev) => ({ ...prev, [id]: msg }))}
                          />
                        ) : null}
                      </div>
                      {dmErr ? <p className="text-center text-[11px] text-red-400 sm:text-start">{dmErr}</p> : null}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
