"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { MessageCircle } from "lucide-react";
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
    <div className="space-y-3 px-3 py-2" aria-busy="true">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-3 rounded-xl px-2 py-1">
          <div className="tj-skeleton tj-shimmer h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2 border-b border-white/[0.04] py-1">
            <div className="tj-skeleton tj-shimmer h-3.5 w-32 rounded" />
            <div className="tj-skeleton tj-shimmer h-3 w-full max-w-[200px] rounded" />
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
          <div className="tj-empty-state mx-3 mt-4">
            <MessageCircle className="mx-auto h-8 w-8 text-[var(--color-text-muted)]" strokeWidth={1.5} aria-hidden />
            <h2 className="mt-4 text-lg font-semibold text-[var(--color-text-secondary)]">{t.noConversations}</h2>
            <p className="tj-empty-state__text mt-2 text-sm text-[var(--color-text-muted)]">{t.noConversationsSub}</p>
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
                      "flex min-h-[52px] items-stretch gap-3 px-5 py-3.5 transition-[background-color,border-color] duration-150 ease-out sm:min-h-0",
                      activeId === c.id
                        ? "border-l-[3px] border-l-[#22D3EE] bg-[rgba(34,211,238,0.06)]"
                        : "border-l-[3px] border-l-transparent hover:bg-[rgba(255,255,255,0.04)]",
                      unread && activeId !== c.id && "bg-[rgba(34,211,238,0.04)]"
                    )}
                  >
                    <div className="relative shrink-0">
                      <div
                        className={clsx(
                          "flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#1E2028] bg-[#18191E] text-xs font-semibold text-[#A1A1AA]",
                          unread ? "border-[rgba(34,211,238,0.35)]" : ""
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
                        <p className={clsx("truncate text-sm font-semibold", unread ? "text-white" : "text-white")}>
                          {c.peer.display_name}
                        </p>
                        <time
                          className="ms-auto shrink-0 text-[11px] text-[#52525B]"
                          dateTime={c.last_message_at ?? c.created_at}
                          suppressHydrationWarning
                        >
                          {formatInboxTime(c.last_message_at ?? c.created_at, locale)}
                        </time>
                      </div>
                      <p className="truncate text-[13px] text-[#52525B]">@{c.peer.username}</p>
                      <p className="mt-0.5 truncate text-[13px] leading-snug text-[#52525B]">
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
          "flex min-h-0 w-full flex-col border-[#1E2028] bg-[#09090B] lg:w-[320px] lg:max-w-[320px] lg:shrink-0 lg:border-r",
          activeId ? "hidden lg:flex" : "flex flex-1 lg:flex-none"
        )}
      >
        <div className="shrink-0 border-b border-[#1E2028] px-5 pb-4 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-white">{t.title}</h1>
              <p className="mt-0.5 text-[11px] text-[#52525B]">{t.encrypted}</p>
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
          "flex h-full min-h-0 min-w-0 flex-1 flex-col border-[#1E2028] bg-[#09090B] lg:border-l",
          activeId ? "flex" : "hidden lg:flex"
        )}
      >
        {!activeId ? (
          <div className="hidden min-h-0 flex-1 flex-col overflow-y-auto lg:flex">
            <div className="border-b border-[#1E2028] px-6 py-5">
              <h2 className="font-display text-lg font-semibold text-white">{t.newChatSectionTitle}</h2>
              <p className="mt-1 text-xs text-[#52525B]">{t.subtitle}</p>
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
