"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AsyncButton } from "@/components/ui/AsyncButton";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { ensureUserKeyPair } from "@/lib/chat-keyring";
import { createConversationKey, importPublicKeyJwk, wrapConversationKeyForRecipient } from "@/lib/chat-crypto";
import { getMessagesCopy } from "@/lib/feature-copy";
import { getSocialCopy } from "@/lib/social-copy";
import type { Locale } from "@/lib/i18n";

type SearchUser = {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
};

export function MessagesInboxHome({ locale }: { locale: Locale }) {
  const t = getMessagesCopy(locale);
  const s = getSocialCopy(locale);
  const router = useRouter();
  const { user, activeCoachId, role } = useAuth();
  const [usernameInput, setUsernameInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedUsername(usernameInput.trim().replace(/^@/, ""));
    }, 300);
    return () => window.clearTimeout(id);
  }, [usernameInput]);

  useEffect(() => {
    if (debouncedUsername.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    void fetch(`/api/users/search?q=${encodeURIComponent(debouncedUsername)}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        setSearchResults(Array.isArray(data?.users) ? (data.users as SearchUser[]).slice(0, 8) : []);
      })
      .catch(() => {
        if (!cancelled) setSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedUsername]);

  const startChatWithPeerId = async (peerId: string) => {
    if (!user?.id || !peerId.trim()) return;
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError(s.chatSessionUnavailable);
        return;
      }

      const { privateKey } = await ensureUserKeyPair(user.id);
      const { data: myPublicKeyRow } = await supabase
        .from("user_public_keys")
        .select("public_key_jwk")
        .eq("user_id", user.id)
        .maybeSingle();
      const { data: participantPublicKeyRow } = await supabase
        .from("user_public_keys")
        .select("public_key_jwk")
        .eq("user_id", peerId)
        .maybeSingle();

      if (!myPublicKeyRow?.public_key_jwk || !participantPublicKeyRow?.public_key_jwk) {
        setError(t.missingPublicKeys);
        return;
      }

      const conversationKey = await createConversationKey();
      const myPublicKey = await importPublicKeyJwk(myPublicKeyRow.public_key_jwk as JsonWebKey);
      const participantPublicKey = await importPublicKeyJwk(
        participantPublicKeyRow.public_key_jwk as JsonWebKey
      );

      const [myWrappedKey, participantWrappedKey] = await Promise.all([
        wrapConversationKeyForRecipient(conversationKey, myPublicKey),
        wrapConversationKeyForRecipient(conversationKey, participantPublicKey)
      ]);

      void privateKey;

      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          participant_id: peerId,
          my_wrapped_key: myWrappedKey,
          participant_wrapped_key: participantWrappedKey
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : t.sendError);
        return;
      }
      const cid = typeof data.conversation_id === "string" ? data.conversation_id : undefined;
      if (cid) {
        router.push(`/${locale}/messages/${cid}`);
        router.refresh();
      } else {
        setError(t.sendError);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t.sendError);
    }
  };

  const resolveUsernameAndStart = async () => {
    const u = usernameInput.trim().replace(/^@/, "");
    if (!u || !user?.id) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/profiles/by-username/${encodeURIComponent(u)}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : t.sendError);
        return;
      }
      const profile = data.profile as { id?: string; self?: boolean; can_message?: boolean } | undefined;
      if (!profile?.id) {
        setError(s.profileNotFound);
        return;
      }
      if (profile.self) {
        setError(s.cannotMessageSelf);
        return;
      }
      if (profile.can_message === false) {
        setError(s.messagingBlocked);
        return;
      }
      await startChatWithPeerId(profile.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.sendError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-base font-semibold text-white lg:hidden">{t.newChatSectionTitle}</h2>

      <div className="rounded-xl border border-white/[0.07] bg-surface/25 p-4 sm:p-5">
        <p className="text-xs text-faint">{s.newChatTitle}</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <div className="relative flex-1">
            <input
              className="input min-h-[48px] w-full flex-1 rounded-xl border-white/10 bg-[#0c0c0f] py-3 text-[15px]"
              placeholder={s.newChatPlaceholder}
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void resolveUsernameAndStart();
              }}
              disabled={busy}
              autoComplete="off"
              spellCheck={false}
              aria-label={s.newChatPlaceholder}
            />
            {(searchLoading || searchResults.length > 0) && usernameInput.trim().length >= 2 ? (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0f]">
                {searchLoading ? (
                  <p className="px-3 py-2 text-xs text-faint">Searching...</p>
                ) : (
                  searchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-bright hover:bg-white/5"
                      onClick={() => {
                        setUsernameInput(`@${item.username}`);
                        setSearchResults([]);
                        void startChatWithPeerId(item.id);
                      }}
                    >
                      <span className="truncate">{item.display_name || item.username}</span>
                      <span className="ml-2 shrink-0 text-xs text-faint">@{item.username}</span>
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>
          <AsyncButton
            type="button"
            variant="primary"
            loading={busy}
            loadingText={s.saving}
            disabled={!usernameInput.trim()}
            className="min-h-[48px] shrink-0 !rounded-lg !bg-cyan-500 !px-5 !text-sm !font-medium !text-[#05080a] hover:!bg-cyan-400"
            onClick={() => resolveUsernameAndStart()}
          >
            {s.newChatButton}
          </AsyncButton>
        </div>
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      </div>

      {role === "user" && activeCoachId ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-faint">{s.coachChatShortcut}</p>
          <button
            type="button"
            disabled={busy}
            className="mt-2 text-left text-sm font-medium text-cyan-200/90 hover:text-cyan-100 disabled:opacity-40"
            onClick={() => void startChatWithPeerId(activeCoachId)}
          >
            {s.openCoachChat}
          </button>
        </div>
      ) : null}

      <p className="text-center text-xs text-dim lg:pb-2">
        <Link href={`/${locale}/profile/search`} className="text-muted underline-offset-2 hover:text-cyan-200/80 hover:underline">
          {s.peopleSearchTitle}
        </Link>
      </p>
    </div>
  );
}
