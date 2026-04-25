"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AsyncButton } from "@/components/ui/AsyncButton";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { ensureUserKeyPair } from "@/lib/chat-keyring";
import { createConversationKey, importPublicKeyJwk, wrapConversationKeyForRecipient } from "@/lib/chat-crypto";
import { getMessagesCopy } from "@/lib/feature-copy";
import { getSocialCopy } from "@/lib/social-copy";
import type { Locale } from "@/lib/i18n";
import { isSafeRedirect } from "@/lib/safe-redirect";

type Variant = "gradient" | "outline";

export function DirectMessageLaunchButton({
  locale,
  peerId,
  variant = "gradient",
  className = "",
  onError
}: {
  locale: Locale;
  peerId: string;
  variant?: Variant;
  className?: string;
  onError?: (message: string) => void;
}) {
  const s = getSocialCopy(locale);
  const t = getMessagesCopy(locale);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const baseOutline =
    "rounded-full border border-white/15 px-4 py-2 text-center text-xs font-semibold text-bright transition hover:border-cyan-400/35 hover:bg-white/[0.06] disabled:opacity-40 sm:min-w-[7rem]";
  const baseGradient =
    "gradient-button rounded-full px-4 py-2 text-center text-xs font-semibold text-white disabled:opacity-40 sm:min-w-[7rem]";

  const start = async () => {
    if (!user?.id || peerId === user.id) return;
    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        onError?.(s.chatSessionUnavailable);
        return;
      }

      const { privateKey } = await ensureUserKeyPair(user.id);
      const { data: myPublicKeyRow } = await supabase
        .from("user_public_keys")
        .select("public_key_jwk")
        .eq("user_id", user.id)
        .single();
      const { data: participantPublicKeyRow } = await supabase
        .from("user_public_keys")
        .select("public_key_jwk")
        .eq("user_id", peerId)
        .single();

      if (!myPublicKeyRow?.public_key_jwk || !participantPublicKeyRow?.public_key_jwk) {
        onError?.(t.missingPublicKeys);
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
        onError?.(typeof data.error === "string" ? data.error : t.sendError);
        return;
      }
      const cid = data.conversation_id as string | undefined;
      if (cid) {
        router.push(`/${locale}/messages/${cid}`);
      }
    } catch (e) {
      onError?.(e instanceof Error ? e.message : t.sendError);
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    const href =
      pathname && isSafeRedirect(pathname, locale)
        ? `/${locale}/login?redirect=${encodeURIComponent(pathname)}`
        : `/${locale}/login`;
    return (
      <Link
        href={href}
        className={`${variant === "gradient" ? baseGradient : baseOutline} ${className} inline-flex items-center justify-center`}
      >
        {s.signInToMessage}
      </Link>
    );
  }

  return (
    <AsyncButton
      type="button"
      variant="ghost"
      loading={busy}
      loadingText={s.saving}
      className={`${variant === "gradient" ? baseGradient : baseOutline} ${className}`}
      onClick={() => start()}
    >
      {s.startChat}
    </AsyncButton>
  );
}
