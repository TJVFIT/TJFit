"use client";

import Link from "next/link";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import type { Locale } from "@/lib/i18n";
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
};

type DecryptedMessage = MessageRow & { plaintext: string | null };

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
      <div className="flex justify-start">
        <div className="h-10 w-[72%] animate-pulse rounded-2xl rounded-bl-md bg-white/[0.06]" />
      </div>
      <div className="flex justify-end">
        <div className="h-10 w-[64%] animate-pulse rounded-2xl rounded-br-md bg-cyan-500/20" />
      </div>
      <div className="flex justify-start">
        <div className="h-12 w-[55%] animate-pulse rounded-2xl rounded-bl-md bg-white/[0.05]" />
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
    async (opts?: { silent?: boolean }) => {
      const silent = Boolean(opts?.silent);
      const cid = conversationId;
      if (!silent) {
        setInitializing(true);
        setFetchError(null);
      }
      const res = await fetch(`/api/chat/messages/${cid}`, { credentials: "include" });
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
      setMessages((prev) => mergeFetchedMessages(prev, safeRows));
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
          if (!ciphertext || !nonce || !senderId) return;

          const safeRow: MessageRow = {
            id: row.id,
            sender_id: senderId,
            message_type: messageType,
            ciphertext,
            nonce,
            metadata: row.metadata && typeof row.metadata === "object" ? (row.metadata as Record<string, unknown>) : null,
            created_at: createdAt
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
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [conversationId, t.decryptError]);

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
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [sorted.length, initializing]);

  const sendText = async () => {
    const key = conversationKeyRef.current;
    const trimmed = messageText.trim();
    if (!key || !trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
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
        setError(typeof data.error === "string" ? data.error : t.sendError);
        return;
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

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-3 py-3 sm:px-4">
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
              // eslint-disable-next-line @next/next/no-img-element
              <img src={peer.avatar_url} alt="" className="h-full w-full object-cover" />
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
            className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-cyan-400/30 hover:text-white"
          >
            {s.openProfile}
          </Link>
        ) : null}
      </header>

      {peerLoadFailed && !fetchError ? (
        <div className="shrink-0 border-b border-amber-500/20 bg-amber-500/5 px-3 py-2 text-center text-[11px] text-amber-100/90 sm:px-4">
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

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 sm:px-4">
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
            <p className="max-w-xs text-sm text-zinc-500">{t.threadEmpty}</p>
            <p className="mt-2 text-[11px] text-zinc-600">{t.encrypted}</p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-1 pb-2">
            {sorted.map((msg, idx) => {
              const mine = Boolean(myId) && msg.sender_id === myId;
              return (
                <div
                  key={msg.id ?? `msg-${idx}-${msg.created_at ?? ""}`}
                  className={clsx("flex w-full", mine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={clsx(
                      "flex max-w-[min(85%,28rem)] flex-col gap-0.5",
                      mine ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={clsx(
                        "px-3.5 py-2 text-[15px] leading-snug",
                        mine
                          ? "rounded-2xl rounded-br-md bg-cyan-500/90 text-[#05080a]"
                          : "rounded-2xl rounded-bl-md bg-white/[0.06] text-zinc-100"
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
        className="shrink-0 border-t border-white/[0.06] px-3 pt-2"
        style={{ paddingBottom: "max(0.65rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-2 pb-2">
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
          <button
            type="button"
            disabled={!showComposer || sending || !messageText.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-[#05080a] transition hover:bg-cyan-400 disabled:opacity-35"
            aria-label={t.send}
            onClick={() => void sendText()}
          >
            {sending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <span className="text-lg leading-none">➤</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
