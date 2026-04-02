"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useAuth } from "@/components/auth-provider";
import { getMessagesCopy } from "@/lib/feature-copy";
import { getSocialCopy } from "@/lib/social-copy";
import type { Locale } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type ConversationRow = {
  id: string;
  created_at: string;
  conversation_type: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
  peer: { id: string; username: string; display_name: string; avatar_url: string | null };
};

function formatInboxTime(iso: string | null, locale: Locale) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const loc =
    locale === "tr" ? "tr-TR" : locale === "ar" ? "ar" : locale === "es" ? "es" : locale === "fr" ? "fr-FR" : "en-US";
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dayDiff = (startOf(now) - startOf(d)) / 86400000;
  if (dayDiff === 0) {
    return d.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit" });
  }
  if (dayDiff === 1) {
    return locale === "tr" ? "Dün" : locale === "ar" ? "أمس" : locale === "es" ? "Ayer" : locale === "fr" ? "Hier" : "Yesterday";
  }
  if (dayDiff < 7) {
    return d.toLocaleDateString(loc, { weekday: "short" });
  }
  return d.toLocaleDateString(loc, { month: "short", day: "numeric" });
}

function InboxSkeleton() {
  return (
    <div className="space-y-1 px-3 py-2" aria-busy="true">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex gap-3 rounded-xl px-2 py-3">
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-white/[0.08]" />
          <div className="min-w-0 flex-1 space-y-2 border-b border-white/[0.04] py-1">
            <div className="flex justify-between gap-2">
              <div className="h-4 w-32 animate-pulse rounded bg-white/[0.08]" />
              <div className="h-3 w-10 animate-pulse rounded bg-white/[0.05]" />
            </div>
            <div className="h-3 w-full max-w-[220px] animate-pulse rounded bg-white/[0.05]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessagesLayoutShell({
  locale,
  children
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = getMessagesCopy(locale);
  const s = getSocialCopy(locale);
  const { user } = useAuth();
  const pathname = usePathname();
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const loadRef = useRef<(opts?: { silent?: boolean }) => void>(() => {});

  const activeId = (() => {
    const m = pathname.match(/\/messages\/([^/]+)\/?$/);
    const id = m?.[1];
    return id && id !== "messages" ? id : null;
  })();

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = Boolean(opts?.silent);
      if (!silent) {
        setListLoading(true);
      }
      const res = await fetch("/api/chat/conversations", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (!silent) {
          setLoadError(typeof data.error === "string" ? data.error : t.loadError);
          setConversations([]);
          setListLoading(false);
        }
        return;
      }
      setLoadError(null);
      const raw = Array.isArray(data.conversations) ? data.conversations : [];
      const normalized: ConversationRow[] = [];
      for (const r of raw as Partial<ConversationRow>[]) {
        if (!r || typeof r.id !== "string") continue;
        const peer = r.peer;
        const pid = peer && typeof peer.id === "string" ? peer.id : "";
        const pun = peer && typeof peer.username === "string" ? peer.username : "—";
        const pdn =
          peer && typeof peer.display_name === "string" && peer.display_name.trim()
            ? peer.display_name
            : pun;
        const pav = peer && typeof peer.avatar_url === "string" ? peer.avatar_url : null;
        normalized.push({
          id: r.id,
          created_at: typeof r.created_at === "string" ? r.created_at : new Date().toISOString(),
          conversation_type: typeof r.conversation_type === "string" ? r.conversation_type : "direct",
          last_message_at: r.last_message_at ?? null,
          last_message_preview: r.last_message_preview ?? null,
          unread_count: Number(r.unread_count ?? 0),
          peer: { id: pid, username: pun, display_name: pdn, avatar_url: pav }
        });
      }
      setConversations(normalized);
      if (!silent) {
        setListLoading(false);
      }
    },
    [t.loadError]
  );

  loadRef.current = (opts) => {
    void load(opts);
  };

  useEffect(() => {
    void load();
  }, [load, pathname]);

  useEffect(() => {
    const uid = user?.id;
    if (!uid) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleReload = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        debounceTimer = undefined;
        loadRef.current({ silent: true });
      }, 400);
    };

    const channel = supabase
      .channel(`inbox-messages:${uid}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          scheduleReload();
        }
      )
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const previewLabel = (p: string | null) => {
    if (!p) return t.inboxNoMessagesYet;
    if (p === "encrypted") return t.inboxEncryptedPreview;
    return p;
  };

  const listSection = (
    <>
      {loadError ? (
        <div className="mx-3 mb-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200/90">
          <p>{loadError}</p>
          <button
            type="button"
            className="mt-2 rounded-full border border-white/15 px-3 py-1 text-[11px] text-zinc-200 hover:border-white/25"
            onClick={() => void load()}
          >
            {t.threadRetry}
          </button>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {listLoading ? (
          <InboxSkeleton />
        ) : conversations.length === 0 ? (
          <div className="mx-3 mt-4 rounded-xl border border-dashed border-white/[0.08] px-5 py-10 text-center">
            <p className="text-sm text-zinc-400">{t.noConversations}</p>
            <p className="mx-auto mt-2 max-w-[240px] text-xs leading-relaxed text-zinc-600">{t.subtitle}</p>
            <Link
              href={`/${locale}/profile/search`}
              className="mt-5 inline-flex rounded-lg border border-white/[0.1] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04]"
            >
              {s.peopleSearchTitle}
            </Link>
          </div>
        ) : (
          <ul className="pb-2 pt-1" role="list">
            {conversations.map((c) => {
              const unread = c.unread_count > 0;
              return (
                <li key={c.id}>
                  <Link
                    href={`/${locale}/messages/${c.id}`}
                    className={clsx(
                      "mx-1 flex min-h-[4.25rem] items-stretch gap-3 rounded-lg px-2.5 py-2.5 transition sm:min-h-0 sm:py-2",
                      activeId === c.id ? "bg-white/[0.06]" : "hover:bg-white/[0.03]",
                      unread && activeId !== c.id && "bg-cyan-500/[0.04]"
                    )}
                  >
                    <div className="relative shrink-0">
                      <div
                        className={clsx(
                          "flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border bg-zinc-900 text-sm font-semibold text-zinc-400",
                          unread ? "border-cyan-400/35" : "border-white/10"
                        )}
                      >
                        {c.peer.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.peer.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          (c.peer.display_name || c.peer.username).slice(0, 2).toUpperCase()
                        )}
                      </div>
                      {unread ? (
                        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold text-[#05080a]">
                          {c.unread_count > 9 ? "9+" : c.unread_count}
                        </span>
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={clsx("truncate text-[15px]", unread ? "font-semibold text-white" : "font-medium text-zinc-200")}>
                          {c.peer.display_name}
                        </p>
                        <time
                          className="shrink-0 text-[11px] text-zinc-500"
                          dateTime={c.last_message_at ?? c.created_at}
                          suppressHydrationWarning
                        >
                          {formatInboxTime(c.last_message_at ?? c.created_at, locale)}
                        </time>
                      </div>
                      <p className="truncate text-xs text-zinc-500">@{c.peer.username}</p>
                      <p className={clsx("mt-0.5 truncate text-[13px] leading-snug", unread ? "text-zinc-300" : "text-zinc-500")}>
                        {previewLabel(c.last_message_preview)}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <div
      className={clsx(
        "mx-auto flex w-full max-w-5xl flex-1 flex-col lg:flex-row lg:gap-0",
        "min-h-[calc(100dvh-4.5rem)]",
        activeId &&
          "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:left-0 max-lg:right-0 max-lg:top-[calc(env(safe-area-inset-top,0px)+3.75rem)] max-lg:z-[35] max-lg:m-0 max-lg:max-w-none max-lg:min-h-0 max-lg:pb-[env(safe-area-inset-bottom,0px)]"
      )}
    >
      {/* Inbox column: full width on mobile; sidebar on desktop */}
      <aside
        className={clsx(
          "flex min-h-0 w-full flex-col border-white/[0.06] bg-background lg:max-w-[380px] lg:shrink-0 lg:border-r",
          activeId ? "hidden lg:flex" : "flex flex-1 lg:flex-none"
        )}
      >
        <div className="shrink-0 border-b border-white/[0.08] px-4 pb-4 pt-5 lg:pt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-white">{t.title}</h1>
              <p className="mt-0.5 text-[11px] text-zinc-500">{t.encrypted}</p>
            </div>
            <Link
              href={`/${locale}/profile/edit`}
              className="rounded-full border border-white/12 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/20 hover:text-white"
            >
              {s.settingsLink}
            </Link>
          </div>
          <Link
            href={`/${locale}/profile/search`}
            className="mt-4 flex w-full items-center justify-center rounded-xl border border-white/[0.08] py-3 text-sm font-medium text-zinc-200 transition hover:border-white/[0.12] hover:bg-white/[0.03]"
          >
            {s.peopleSearchTitle}
          </Link>
        </div>

        {listSection}

        {/* Mobile / tablet: new chat below list */}
        {!activeId ? <div className="mt-auto shrink-0 border-t border-white/[0.08] px-4 py-4 lg:hidden">{children}</div> : null}
      </aside>

      {/* Desktop: new chat or thread */}
      <main
        className={clsx(
          "flex h-full min-h-0 min-w-0 flex-1 flex-col bg-background lg:bg-transparent",
          activeId ? "flex" : "hidden lg:flex"
        )}
      >
        {!activeId ? (
          <div className="hidden min-h-0 flex-1 flex-col overflow-y-auto lg:flex">
            <div className="border-b border-white/[0.06] px-6 py-5">
              <h2 className="font-display text-lg font-semibold text-white">{t.newChatSectionTitle}</h2>
              <p className="mt-1 text-xs text-zinc-500">{t.subtitle}</p>
            </div>
            <div className="flex-1 px-6 py-6">{children}</div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        )}
      </main>
    </div>
  );
}
