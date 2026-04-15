"use client";

import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import type { Locale } from "@/lib/i18n";
import { AsyncButton } from "@/components/ui/AsyncButton";
import { getMessagesCopy } from "@/lib/feature-copy";
import { getSocialCopy } from "@/lib/social-copy";
import { decryptText, encryptText, unwrapConversationKeyForSelf } from "@/lib/chat-crypto";
import { ensureUserKeyPair } from "@/lib/chat-keyring";

type MessageRow = {
  id: string;
  sender_id: string;
  message_type: "text" | "image" | "file" | "link" | "call_event";
  ciphertext: string;
  nonce: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  read_at?: string | null;
};

type DecryptedMessage = MessageRow & { plaintext: string | null; pending?: boolean };

type PeerInfo = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  conversation_type: string;
};

function mergeFetchedMessages(
  prev: DecryptedMessage[],
  fetched: MessageRow[]
): DecryptedMessage[] {
  const next: DecryptedMessage[] = fetched.map((m) => ({ ...m, plaintext: null }));
  const byId = new Map<string, DecryptedMessage>();
  for (const m of next) {
    byId.set(m.id, m);
  }
  for (const m of prev) {
    const existing = byId.get(m.id);
    if (existing) {
      if (m.plaintext !== null) {
        byId.set(m.id, { ...existing, plaintext: m.plaintext });
      }
    } else {
      byId.set(m.id, m);
    }
  }
  return Array.from(byId.values());
}

function bubbleTime(iso: string, locale: Locale) {
  try {
    const d = new Date(iso);
    const loc =
      locale === "tr" ? "tr-TR" : locale === "ar" ? "ar" : locale === "es" ? "es" : locale === "fr" ? "fr-FR" : "en-US";
    return d.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function MessageSkeleton() {
  return (
    <div className="space-y-4 px-2 py-4" aria-busy="true">
      <div className="flex justify-end">
        <div className="tj-skeleton tj-shimmer h-11 w-[52%] max-w-[min(60%,18rem)] rounded-2xl rounded-br-md" />
      </div>
      <div className="flex justify-end">
        <div className="tj-skeleton tj-shimmer h-14 w-[44%] max-w-[min(60%,18rem)] rounded-2xl rounded-br-md" />
      </div>
      <div className="flex justify-start">
        <div className="tj-skeleton tj-shimmer h-12 w-[48%] max-w-[min(60%,18rem)] rounded-2xl rounded-bl-md" />
      </div>
    </div>
  );
}

export function ChatThreadView({ locale, conversationId }: { locale: Locale; conversationId: string }) {
  const t = getMessagesCopy(locale);
  const s = getSocialCopy(locale);
  const { user } = useAuth();
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [wrappedKey, setWrappedKey] = useState<string | null>(null);
  const conversationKeyRef = useRef<CryptoKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [peer, setPeer] = useState<PeerInfo | null>(null);
  const [peerLoadFailed, setPeerLoadFailed] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationIdRef = useRef(conversationId);
  conversationIdRef.current = conversationId;
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const myId = user?.id ?? "";
  const sorted = useMemo(
    () =>
      messages.slice().sort((a, b) => String(a.created_at ?? "").localeCompare(String(b.created_at ?? ""))),
    [messages]
  );

  const loadPeer = useCallback(async () => {
    const res = await fetch(`/api/chat/conversations/${conversationId}/peer`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPeer(null);
      setPeerLoadFailed(true);
      return;
    }
    const p = data.peer as Record<string, unknown> | null;
    if (p && typeof p.id === "string") {
      setPeer({
        id: p.id,
        username: String(p.username ?? "").trim() || "—",
        display_name: String(p.display_name ?? "").trim() || String(p.username ?? "").trim() || "—",
        avatar_url: typeof p.avatar_url === "string" ? p.avatar_url : null,
        conversation_type: String(p.conversation_type ?? "")
      });
      setPeerLoadFailed(false);
    } else {
      setPeer(null);
      setPeerLoadFailed(true);
    }
  }, [conversationId]);

  useEffect(() => {
    void loadPeer();
  }, [loadPeer]);

  useEffect(() => {
    setMessages([]);
    setWrappedKey(null);
    setFetchError(null);
    setError(null);
    conversationKeyRef.current = null;
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !user?.id) return;
    void fetch(`/api/chat/conversations/${conversationId}/read`, {
      method: "POST",
      credentials: "include"
    });
  }, [conversationId, user?.id]);

  const loadMessages = useCallback(
    async (opts?: { silent?: boolean; before?: string; appendOlder?: boolean }) => {
      const silent = Boolean(opts?.silent);
      const appendOlder = Boolean(opts?.appendOlder);
      const cid = conversationId;
      if (!silent) {
        setInitializing(true);
        setFetchError(null);
      }
      const sp = new URLSearchParams();
      sp.set("limit", "50");
      if (opts?.before) sp.set("before", opts.before);
      const res = await fetch(`/api/chat/messages/${cid}?${sp.toString()}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (conversationIdRef.current !== cid) return;

      if (!res.ok) {
        if (!silent) {
          setFetchError(typeof data.error === "string" ? data.error : t.loadError);
          setWrappedKey(null);
          setMessages([]);
          setInitializing(false);
        }
        return;
      }
      const wk = (data.encrypted_conversation_key ?? null) as string | null;
      if (!silent) {
        setWrappedKey(wk);
      } else if (wk) {
        setWrappedKey((prev) => prev ?? wk);
      }
      const rawRows = data.messages;
      const rows = (Array.isArray(rawRows) ? rawRows : []) as MessageRow[];
      const safeRows = rows.filter(
        (m) =>
          m &&
          typeof m.id === "string" &&
          typeof m.sender_id === "string" &&
          typeof m.ciphertext === "string" &&
          typeof m.nonce === "string" &&
          typeof m.created_at === "string"
      );
      setHasMore(Boolean(data.has_more));
      setMessages((prev) => (appendOlder ? mergeFetchedMessages(prev, safeRows) : mergeFetchedMessages([], safeRows)));
      if (!wk && !silent) {
        setInitializing(false);
      }
    },
    [conversationId, t.loadError]
  );

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !conversationId) return;

    const cid = conversationId;
    let cancelled = false;

    const channel = supabase
      .channel(`thread-messages:${cid}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${cid}` },
        async (payload) => {
          const row = payload.new as Record<string, unknown> | null;
          if (!row || typeof row.id !== "string") return;
          const convId = row.conversation_id;
          if (typeof convId === "string" && convId !== cid) return;

          const ciphertext = typeof row.ciphertext === "string" ? row.ciphertext : "";
          const nonce = typeof row.nonce === "string" ? row.nonce : "";
          const senderId = typeof row.sender_id === "string" ? row.sender_id : "";
          const mt = row.message_type;
          const messageType: MessageRow["message_type"] =
            mt === "image" || mt === "file" || mt === "link" || mt === "call_event" ? mt : "text";
          const createdAt = typeof row.created_at === "string" ? row.created_at : new Date().toISOString();
          const readAt = typeof row.read_at === "string" ? row.read_at : null;
          if (!ciphertext || !nonce || !senderId) return;

          const safeRow: MessageRow = {
            id: row.id,
            sender_id: senderId,
            message_type: messageType,
            ciphertext,
            nonce,
            metadata: row.metadata && typeof row.metadata === "object" ? (row.metadata as Record<string, unknown>) : null,
            created_at: createdAt,
            read_at: readAt
          };

          const key = conversationKeyRef.current;
          let plaintext: string | null = null;
          if (key) {
            try {
              plaintext = await decryptText(safeRow.ciphertext, safeRow.nonce, key);
            } catch {
              plaintext = `[${t.decryptError}]`;
            }
          }

          if (cancelled) return;

          setMessages((prev) => {
            if (prev.some((m) => m.id === safeRow.id)) return prev;
            return [...prev, { ...safeRow, plaintext }];
          });

          if (senderId !== myId && typeof window !== "undefined" && document.visibilityState !== "visible") {
            if ("Notification" in window) {
              if (Notification.permission === "granted") {
                new Notification("TJFit — New Message", {
                  body: "You received a new message.",
                  icon: "/favicon.ico"
                });
              } else if (Notification.permission === "default") {
                void Notification.requestPermission();
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [conversationId, myId, t.decryptError]);

  useEffect(() => {
    let wasHidden = false;
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        wasHidden = true;
        return;
      }
      if (document.visibilityState === "visible" && wasHidden) {
        wasHidden = false;
        void loadMessages({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [loadMessages]);

  useEffect(() => {
    const boot = async () => {
      if (!user?.id || !wrappedKey) {
        return;
      }
      try {
        const { privateKey } = await ensureUserKeyPair(user.id);
        const conversationKey = await unwrapConversationKeyForSelf(wrappedKey, privateKey);
        conversationKeyRef.current = conversationKey;
        const rows = messagesRef.current;
        const decrypted = await Promise.all(
          rows.map(async (msg) => {
            try {
              const plaintext = await decryptText(msg.ciphertext, msg.nonce, conversationKey);
              return { ...msg, plaintext };
            } catch {
              return { ...msg, plaintext: `[${t.decryptError}]` };
            }
          })
        );
        setMessages(decrypted);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : t.decryptError);
      } finally {
        setInitializing(false);
      }
    };
    void boot();
  }, [user?.id, wrappedKey, t.decryptError]);

  useEffect(() => {
    const hydrate = async () => {
      const key = conversationKeyRef.current;
      if (!key) return;
      if (messagesRef.current.every((m) => m.plaintext !== null)) return;

      const decrypted = await Promise.all(
        messagesRef.current.map(async (msg) => {
          if (msg.plaintext !== null) return msg;
          try {
            const plaintext = await decryptText(msg.ciphertext, msg.nonce, key);
            return { ...msg, plaintext };
          } catch {
            return { ...msg, plaintext: `[${t.decryptError}]` };
          }
        })
      );
      setMessages(decrypted);
    };
    void hydrate();
  }, [messages, t.decryptError]);

  useEffect(() => {
    const unreadInbound = sorted.find((msg) => msg.sender_id !== myId && !msg.read_at);
    if (!unreadInbound) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit) return;
        void fetch(`/api/chat/conversations/${conversationId}/read`, {
          method: "POST",
          credentials: "include"
        });
      },
      { threshold: 0.4 }
    );
    const el = document.getElementById(`msg-${unreadInbound.id}`);
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [conversationId, myId, sorted]);

  useEffect(() => {
    if (loadingOlder) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [sorted.length, initializing, loadingOlder]);

  const sendText = async () => {
    const key = conversationKeyRef.current;
    const trimmed = messageText.trim();
    if (!key || !trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      const optimisticId = `pending-${Date.now()}`;
      const optimistic: DecryptedMessage = {
        id: optimisticId,
        sender_id: myId,
        message_type: "text",
        ciphertext: "",
        nonce: "",
        metadata: null,
        created_at: new Date().toISOString(),
        read_at: null,
        plaintext: trimmed,
        pending: true
      };
      setMessages((prev) => [...prev, optimistic]);
      const encrypted = await encryptText(trimmed, key);
      const res = await fetch(`/api/chat/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message_type: "text",
          ciphertext: encrypted.ciphertext,
          nonce: encrypted.nonce
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        setError(typeof data.error === "string" ? data.error : t.sendError);
        return;
      }
      const created = data.message as MessageRow | undefined;
      if (created?.id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId
              ? {
                  ...m,
                  id: created.id,
                  ciphertext: created.ciphertext,
                  nonce: created.nonce,
                  created_at: created.created_at,
                  read_at: created.read_at ?? null,
                  pending: false
                }
              : m
          )
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      }
      setMessageText("");
      inputRef.current?.focus();
    } catch (e) {
      setError(e instanceof Error ? e.message : t.sendError);
    } finally {
      setSending(false);
    }
  };

  const showComposer = !fetchError && !initializing && conversationKeyRef.current !== null;

  const loadOlder = async () => {
    if (loadingOlder || !hasMore) return;
    const oldest = sorted[0]?.created_at;
    if (!oldest) return;
    setLoadingOlder(true);
    try {
      await loadMessages({ silent: true, before: oldest, appendOlder: true });
    } finally {
      setLoadingOlder(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-center gap-2 border-b border-[#1E2028] bg-[#111215] px-3 py-3 sm:gap-3 sm:px-4">
        <Link
          href={`/${locale}/messages`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-zinc-300 transition hover:border-white/20 hover:text-white lg:hidden"
          aria-label={s.threadBack}
        >
          <span className="text-lg leading-none">‹</span>
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/[0.08] bg-surface-elevated">
            {peer?.avatar_url ? (
              <Image src={peer.avatar_url} alt="" fill sizes="40px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-400">
                {(peer?.display_name || peer?.username || "?").slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-white">{peer?.display_name || "…"}</p>
            <p className="truncate text-xs text-zinc-500">
              @{peer?.username || "…"}
              {peer?.conversation_type === "coach_student" ? (
                <span className="ml-1.5 text-[10px] uppercase tracking-wider text-zinc-600">· {s.conversationCoach}</span>
              ) : null}
            </p>
          </div>
        </div>
        {peer?.username ? (
          <Link
            href={`/${locale}/profile/${encodeURIComponent(peer.username)}`}
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-white/10 px-3 py-2 text-xs text-zinc-300 transition hover:border-cyan-400/30 hover:text-white"
          >
            {s.openProfile}
          </Link>
        ) : null}
      </header>

      {peerLoadFailed && !fetchError ? (
        <div className="shrink-0 border-b border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-center text-[11px] text-cyan-100/90 sm:px-4">
          {s.threadParticipantUnknown}
          <button
            type="button"
            className="ml-2 underline underline-offset-2 hover:text-white"
            onClick={() => void loadPeer()}
          >
            {s.retryLabel}
          </button>
        </div>
      ) : null}

      <div
        ref={listRef}
        className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3 sm:px-4"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {fetchError ? (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <p className="text-sm text-red-400">{fetchError}</p>
            <button
              type="button"
              className="mt-4 rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-200 hover:border-white/25"
              onClick={() => void loadMessages()}
            >
              {t.threadRetry}
            </button>
          </div>
        ) : initializing ? (
          <MessageSkeleton />
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <p className="max-w-xs text-sm italic text-[var(--color-text-muted)]">{t.threadEmpty}</p>
            <p className="mt-2 text-[11px] text-zinc-600">{t.encrypted}</p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-1 pb-2">
            {hasMore ? (
              <div className="mb-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => void loadOlder()}
                  disabled={loadingOlder}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-300 hover:border-white/25 disabled:opacity-60"
                >
                  {loadingOlder ? "Loading..." : "Load older messages"}
                </button>
              </div>
            ) : null}
            {sorted.map((msg, idx) => {
              const mine = Boolean(myId) && msg.sender_id === myId;
              return (
                <div
                  key={msg.id ?? `msg-${idx}-${msg.created_at ?? ""}`}
                  id={`msg-${msg.id}`}
                  className={clsx(
                    "flex w-full chat-bubble-enter",
                    mine ? "justify-end" : "justify-start"
                  )}
                  style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
                >
                  <div
                    className={clsx(
                      "flex max-w-[min(70%,28rem)] flex-col gap-0.5",
                      mine ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={clsx(
                        "w-full px-4 py-3 text-[15px] leading-snug text-white transition-[box-shadow] duration-200",
                        mine
                          ? "rounded-2xl rounded-br rounded-tl-2xl border border-[rgba(34,211,238,0.2)] bg-[rgba(34,211,238,0.12)] hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                          : "rounded-2xl rounded-bl rounded-tr-2xl border border-[#1E2028] bg-[#111215] hover:border-white/10"
                      )}
                    >
                      {msg.plaintext === null
                        ? "…"
                        : msg.plaintext || (msg.message_type === "text" ? "" : `[${msg.message_type}]`)}
                    </div>
                    <time
                      className="px-1 text-[10px] tabular-nums text-zinc-600"
                      dateTime={msg.created_at}
                      suppressHydrationWarning
                    >
                      {bubbleTime(msg.created_at, locale)}
                    </time>
                    {mine ? (
                      <span className={clsx("px-1 text-[10px] tabular-nums", msg.pending ? "text-zinc-500" : msg.read_at ? "text-cyan-300" : "text-zinc-500")}>
                        {msg.pending ? "✓" : "✓✓"}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && !fetchError ? (
        <div className="shrink-0 border-t border-red-500/15 bg-red-500/5 px-4 py-2 text-center text-xs text-red-300">{error}</div>
      ) : null}

      <div
        className="sticky bottom-0 z-10 shrink-0 border-t border-[#1E2028] bg-[#111215]/95 px-3 pt-2 backdrop-blur-md supports-[backdrop-filter]:bg-[#111215]/85"
        style={{ paddingBottom: "max(0.65rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto flex max-w-3xl items-stretch gap-2 pb-2 sm:items-center">
          <input
            ref={inputRef}
            className="input min-h-[46px] min-w-0 flex-1 rounded-xl border-white/[0.08] bg-surface-elevated/80 py-2.5 pl-4 pr-3 text-[15px] text-white placeholder:text-zinc-500"
            placeholder={t.messageInputPlaceholder}
            value={messageText}
            disabled={!showComposer || sending}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendText();
              }
            }}
            aria-label={t.messageInputPlaceholder}
          />
          <AsyncButton
            type="button"
            variant="primary"
            size="sm"
            loading={sending}
            disabled={!showComposer || !messageText.trim()}
            className="flex h-12 w-12 shrink-0 touch-manipulation !min-h-[48px] !min-w-[48px] !rounded-xl !bg-cyan-500 !px-0 !text-[#05080a] !shadow-none hover:!scale-100 hover:!bg-cyan-400 hover:!opacity-100 sm:h-11 sm:w-11 sm:!min-h-[44px] sm:!min-w-[44px]"
            aria-label={t.send}
            onClick={() => void sendText()}
          >
            <span className="text-lg leading-none">➤</span>
          </AsyncButton>
        </div>
      </div>
    </div>
  );
}
