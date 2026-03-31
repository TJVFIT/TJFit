"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import type { Locale } from "@/lib/i18n";
import { getMessagesCopy } from "@/lib/feature-copy";
import { decryptText, encryptBinary, encryptText, unwrapConversationKeyForSelf } from "@/lib/chat-crypto";
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

type DecryptedMessage = MessageRow & { plaintext: string };

export function ChatThreadView({
  locale,
  conversationId
}: {
  locale: Locale;
  conversationId: string;
}) {
  const t = getMessagesCopy(locale);
  const { user } = useAuth();
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [linkText, setLinkText] = useState("");
  const [wrappedKey, setWrappedKey] = useState<string | null>(null);
  const conversationKeyRef = useRef<CryptoKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCallMode, setActiveCallMode] = useState<"voice" | "video" | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const myId = user?.id ?? "";
  const sorted = useMemo(
    () => messages.slice().sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [messages]
  );

  const loadMessages = useCallback(async () => {
    const res = await fetch(`/api/chat/messages/${conversationId}`, { credentials: "include" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? t.loadError);
      return;
    }
    setWrappedKey(data.encrypted_conversation_key ?? null);
    setMessages((data.messages ?? []).map((m: MessageRow) => ({ ...m, plaintext: "" })));
  }, [conversationId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        async (payload) => {
          const row = payload.new as MessageRow;
          const key = conversationKeyRef.current;
          let plaintext = "";
          if (key) {
            try {
              plaintext = await decryptText(row.ciphertext, row.nonce, key);
            } catch {
              plaintext = `[${t.decryptError}]`;
            }
          }
          setMessages((prev) => [...prev, { ...row, plaintext }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    const boot = async () => {
      if (!user?.id || !wrappedKey) return;
      try {
        const { privateKey } = await ensureUserKeyPair(user.id);
        const conversationKey = await unwrapConversationKeyForSelf(wrappedKey, privateKey);
        conversationKeyRef.current = conversationKey;
        const decrypted = await Promise.all(
          messages.map(async (msg) => {
            try {
              const plaintext = await decryptText(msg.ciphertext, msg.nonce, conversationKey);
              return { ...msg, plaintext };
            } catch {
              return { ...msg, plaintext: `[${t.decryptError}]` };
            }
          })
        );
        setMessages(decrypted);
      } catch (e) {
        setError(e instanceof Error ? e.message : t.decryptError);
      }
    };
    boot();
  }, [user?.id, wrappedKey]);

  useEffect(() => {
    const hydratePlaintext = async () => {
      const key = conversationKeyRef.current;
      if (!key || messages.length === 0) return;
      if (messages.every((m) => m.plaintext)) return;

      const decrypted = await Promise.all(
        messages.map(async (msg) => {
          if (msg.plaintext) return msg;
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
    hydratePlaintext();
  }, [messages]);

  const sendText = async () => {
    const key = conversationKeyRef.current;
    if (!key || !messageText.trim()) return;
    const encrypted = await encryptText(messageText.trim(), key);
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
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? t.sendError);
      return;
    }
    setMessageText("");
  };

  const sendLink = async () => {
    const key = conversationKeyRef.current;
    if (!key || !linkText.trim()) return;
    const encrypted = await encryptText(linkText.trim(), key);
    const res = await fetch(`/api/chat/messages/${conversationId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        message_type: "link",
        ciphertext: encrypted.ciphertext,
        nonce: encrypted.nonce
      })
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? t.sendError);
      return;
    }
    setLinkText("");
  };

  const sendAttachment = async (file: File) => {
    const key = conversationKeyRef.current;
    if (!key) return;
    try {
      const bytes = await file.arrayBuffer();
      const encryptedFile = await encryptBinary(bytes, key);

      const signRes = await fetch("/api/chat/attachments/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          conversation_id: conversationId,
          filename: file.name
        })
      });
      const signData = await signRes.json();
      if (!signRes.ok) {
        setError(signData.error ?? t.signAttachmentError);
        return;
      }

      const uploadRes = await fetch(signData.signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream"
        },
        body: encryptedFile.ciphertext
      });
      if (!uploadRes.ok) {
        setError(t.uploadAttachmentError);
        return;
      }

      const encryptedCaption = await encryptText(`[file] ${file.name}`, key);
      const messageRes = await fetch(`/api/chat/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message_type: "file",
          ciphertext: encryptedCaption.ciphertext,
          nonce: encryptedCaption.nonce,
          metadata: {
            attachment_nonce: encryptedFile.nonce,
            storage_path: signData.path,
            mime_type: file.type,
            size_bytes: file.size
          }
        })
      });
      const messageData = await messageRes.json();
      if (!messageRes.ok) {
        setError(messageData.error ?? t.postAttachmentError);
        return;
      }

      await fetch("/api/chat/attachments/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message_id: messageData.message.id,
          storage_path: signData.path,
          mime_type: file.type || "application/octet-stream",
          size_bytes: file.size,
          encrypted_name: encryptedCaption.ciphertext
        })
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t.sendFileError);
    }
  };

  const startCall = async (mode: "voice" | "video") => {
    try {
      setError(null);
      const callRes = await fetch("/api/chat/calls/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ conversation_id: conversationId, mode })
      });
      const callData = await callRes.json();
      if (!callRes.ok) {
        setError(callData.error ?? t.startCallError);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: mode === "video"
      });
      localStreamRef.current = stream;
      if (mode === "video" && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setActiveCallMode(mode);

      await fetch("/api/chat/calls/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          call_session_id: callData.call_session.id,
          event_type: "ring",
          payload: { mode }
        })
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t.startCallError);
    }
  };

  const endLocalCall = async () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setActiveCallMode(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-16 sm:px-6 lg:px-8">
      <div>
        <span className="badge">{t.encrypted}</span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">{t.title}</h1>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="glass-panel rounded-[28px] p-6">
        <div className="mb-4 flex gap-3">
          <button onClick={() => startCall("voice")} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white">
            {t.startCall}
          </button>
          <button onClick={() => startCall("video")} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white">
            {t.startVideoCall}
          </button>
          {activeCallMode && (
            <button onClick={endLocalCall} className="rounded-full border border-red-400/40 px-4 py-2 text-sm text-red-300">
              {t.endCall}
            </button>
          )}
        </div>

        {activeCallMode === "video" && (
          <video ref={localVideoRef} autoPlay muted playsInline className="mb-4 w-full rounded-xl border border-white/10 bg-black/30" />
        )}

        <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-4">
          {sorted.length === 0 ? (
            <p className="text-sm text-zinc-500">{t.noConversations}</p>
          ) : (
            sorted.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  msg.sender_id === myId ? "ml-auto bg-accent/20 text-white" : "bg-white/5 text-zinc-200"
                }`}
              >
                {msg.plaintext || t.encryptedMessage}
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <input
            className="input"
            placeholder={t.encryptedMessage}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <button onClick={sendText} className="gradient-button rounded-full px-5 py-2 text-sm font-medium text-white">
            {t.send}
          </button>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            className="input"
            placeholder={t.linkPlaceholder}
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
          />
          <button onClick={sendLink} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white">
            {t.linkButton}
          </button>
          <label className="cursor-pointer rounded-full border border-white/10 px-4 py-2 text-sm text-white">
            {t.fileButton}
            <input
              type="file"
              className="hidden"
              accept="image/*,.doc,.docx,.pdf,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void sendAttachment(file);
                }
                e.currentTarget.value = "";
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

