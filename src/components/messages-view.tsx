"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { getMessagesCopy } from "@/lib/feature-copy";
import { ensureUserKeyPair } from "@/lib/chat-keyring";
import { createConversationKey, importPublicKeyJwk, wrapConversationKeyForRecipient } from "@/lib/chat-crypto";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Conversation = {
  id: string;
  created_at: string;
};

export function MessagesView({ locale }: { locale: Locale }) {
  const t = getMessagesCopy(locale);
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [participantId, setParticipantId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/chat/conversations", { credentials: "include" });
    const data = await res.json();
    setConversations(data.conversations ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const createConversation = async () => {
    try {
      setError(null);
      if (!user?.id || !participantId.trim()) return;
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const { privateKey } = await ensureUserKeyPair(user.id);
      const { data: myPublicKeyRow } = await supabase
        .from("user_public_keys")
        .select("public_key_jwk")
        .eq("user_id", user.id)
        .single();
      const { data: participantPublicKeyRow } = await supabase
        .from("user_public_keys")
        .select("public_key_jwk")
        .eq("user_id", participantId.trim())
        .single();

      if (!myPublicKeyRow?.public_key_jwk || !participantPublicKeyRow?.public_key_jwk) {
        setError("Public keys are missing for one of the users.");
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

      // Keep keypair warm in memory by touching private key. (future key rotation hook)
      void privateKey;

      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          participant_id: participantId.trim(),
          my_wrapped_key: myWrappedKey,
          participant_wrapped_key: participantWrappedKey
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to create conversation.");
        return;
      }
      setParticipantId("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create conversation.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
      <div>
        <span className="badge">{t.encrypted}</span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">{t.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">{t.subtitle}</p>
      </div>

      <div className="glass-panel rounded-[28px] p-6">
        <p className="text-sm text-zinc-400">Create private thread by participant user ID</p>
        <div className="mt-3 flex gap-3">
          <input
            className="input"
            placeholder="participant user id"
            value={participantId}
            onChange={(e) => setParticipantId(e.target.value)}
          />
          <button className="gradient-button rounded-full px-5 py-2 text-sm font-medium text-white" onClick={createConversation}>
            Create
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      <div className="space-y-3">
        {conversations.length === 0 ? (
          <div className="glass-panel rounded-[24px] p-5 text-sm text-zinc-500">{t.noConversations}</div>
        ) : (
          conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/${locale}/messages/${conversation.id}`}
              className="glass-panel block rounded-[24px] p-5 text-sm text-zinc-300 transition hover:border-white/20"
            >
              {conversation.id}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

