"use client";

import { Mic, Plus, Send, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useDynamicIsland } from "@/components/ui/dynamic-island";
import { getTJAIAccess } from "@/lib/tjai-access";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

type ConversationPreview = {
  conversation_id: string;
  starter: string;
  created_at: string;
};

const COPY = {
  en: {
    suggested: [
      "📋 Explain my plan",
      "🍌 What to eat before training?",
      "❌ I missed a workout",
      "🔄 Swap a meal",
      "🦵 I have knee pain",
      "📈 How do I break a plateau?"
    ],
    newChat: "New Chat",
    fallbackConversation: "New chat",
    chatFailed: "I could not respond right now. Please try again.",
    voiceUnsupported: "Voice not supported in this browser",
    voiceInput: "Voice input",
    voiceUnsupportedInline: "Voice input is not supported in this browser.",
    askPlaceholder: "Ask TJAI...",
    listening: "Listening...",
    voice: "Voice",
    coreRemaining: "messages remaining",
    proLocked: "Chat is Apex-only",
    apexUnlimited: "Unlimited chat",
    trialUsed: "You&apos;ve reached your TJAI chat preview limit",
    trialSub: "Upgrade to Apex for unlimited coaching conversations.",
    upgrade: "Upgrade to Apex",
    close: "Close"
  },
  ar: {
    suggested: [
      "📋 اشرح خطتي",
      "🍌 ماذا آكل قبل التمرين؟",
      "❌ فاتتني حصة تدريب",
      "🔄 بدّل وجبة",
      "🦵 لدي ألم في الركبة",
      "📈 كيف أتجاوز الثبات؟"
    ],
    newChat: "محادثة جديدة",
    fallbackConversation: "محادثة جديدة",
    chatFailed: "تعذر الرد الآن. حاول مرة أخرى.",
    voiceUnsupported: "الإدخال الصوتي غير مدعوم في هذا المتصفح",
    voiceInput: "إدخال صوتي",
    voiceUnsupportedInline: "الإدخال الصوتي غير مدعوم في هذا المتصفح.",
    askPlaceholder: "اسأل TJAI...",
    listening: "جاري الاستماع...",
    voice: "صوت",
    coreRemaining: "رسائل متبقية",
    proLocked: "الدردشة متاحة فقط في Apex",
    apexUnlimited: "دردشة غير محدودة",
    trialUsed: "لقد وصلت إلى حد معاينة دردشة TJAI",
    trialSub: "قم بالترقية إلى Apex لمحادثات تدريب غير محدودة.",
    upgrade: "الترقية إلى Apex",
    close: "إغلاق"
  }
} as const;

const STARTER_PROMPTS = [
  "Can you give me an overview of my TJAI plan and explain the main principles?",
  "What should I eat before my workout, and when should I eat it?",
  "I missed yesterday's workout. What should I do — make it up or skip it?",
  "Can you suggest an alternative for one of my meals? I'll tell you which one.",
  "I'm experiencing knee pain. Which exercises should I avoid and what are safe alternatives?",
  "I've been stuck at the same weight for 2 weeks. What changes should I make to break through?"
];

function voiceLang(locale: Locale) {
  if (locale === "tr") return "tr-TR";
  if (locale === "ar") return "ar-SA";
  if (locale === "es") return "es-ES";
  if (locale === "fr") return "fr-FR";
  return "en-US";
}

export function TJAIChatStandalone({ locale }: { locale: Locale }) {
  const t = locale === "ar" ? COPY.ar : COPY.en;
  const island = useDynamicIsland();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [showVoiceTip, setShowVoiceTip] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [tier, setTier] = useState<"core" | "pro" | "apex">("core");
  const [remaining, setRemaining] = useState(10);
  const [showLimitOverlay, setShowLimitOverlay] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const recognitionRef = useRef<any>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConversationId(crypto.randomUUID());
  }, []);

  useEffect(() => {
    void fetch("/api/tjai/trial-status", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const nextTier = (data.tier ?? "core") as "core" | "pro" | "apex";
        const used = Number(data?.trial?.messagesUsed ?? 0);
        setTier(nextTier);
        setRemaining(Math.max(0, 10 - used));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    void fetch("/api/tjai/chat/conversations", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setConversations((data?.conversations ?? []) as ConversationPreview[]);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const hasApi =
      typeof window !== "undefined" &&
      (Boolean((window as any).SpeechRecognition) || Boolean((window as any).webkitSpeechRecognition));
    setVoiceSupported(hasApi);
    if (!localStorage.getItem("tjai-voice-hint-seen")) {
      setShowVoiceTip(true);
      localStorage.setItem("tjai-voice-hint-seen", "1");
    }
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isStreaming]);

  const access = useMemo(() => getTJAIAccess(tier, { coreTrialMessagesRemaining: remaining }), [remaining, tier]);

  const loadConversation = async (id: string) => {
    const res = await fetch(`/api/tjai/chat/conversations?conversationId=${encodeURIComponent(id)}`, {
      credentials: "include",
      cache: "no-store"
    });
    const data = await res.json().catch(() => ({}));
    const rows = (data.messages ?? []) as Array<{ id: string; role: "user" | "assistant"; content: string; created_at: string }>;
    setConversationId(id);
    setMessages(rows.map((row) => ({ id: row.id, role: row.role, content: row.content, created_at: row.created_at })));
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || isStreaming) return;
    if (!access.canUseChat) {
      setShowLimitOverlay(true);
      return;
    }

    if (tier === "core") {
      const consumeRes = await fetch("/api/tjai/trial-consume-message", { method: "POST", credentials: "include" });
      if (!consumeRes.ok) {
        setShowLimitOverlay(true);
        setRemaining(0);
        return;
      }
      setRemaining((r) => Math.max(0, r - 1));
    }

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: message, created_at: new Date().toISOString() };
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, userMessage, { id: assistantId, role: "assistant", content: "", created_at: new Date().toISOString() }]);
    setInput("");
    setApiError(null);
    setIsStreaming(true);

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 35000);
    try {
      const response = await fetch("/api/tjai/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversationId, locale }),
        signal: controller.signal
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setApiError("TJAI is having trouble. Please try again.");
        throw new Error(String(data?.error ?? "Chat request failed"));
      }
      if (typeof data?.conversationId === "string" && data.conversationId) {
        setConversationId(data.conversationId);
      }
      const assistantText = String(data?.message ?? "").trim();
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: assistantText || t.chatFailed } : m))
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setApiError("TJAI request timed out. Please try again.");
      }
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: t.chatFailed } : m)));
    } finally {
      window.clearTimeout(timer);
      setIsStreaming(false);
      void fetch("/api/tjai/chat/conversations", { credentials: "include", cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => setConversations((data?.conversations ?? []) as ConversationPreview[]))
        .catch(() => undefined);
    }
  };

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      island?.showNotification("signup", t.voiceUnsupported);
      return;
    }
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = voiceLang(locale);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = String(event?.results?.[0]?.[0]?.transcript ?? "").trim();
      if (!transcript) return;
      setInput(transcript);
      void sendMessage(transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
    setIsListening(true);
  };

  return (
    <div className="grid h-[calc(100svh-220px)] gap-4 md:grid-cols-[250px,1fr]">
      <aside className="hidden rounded-2xl border border-[#1E2028] bg-[#111215] p-3 md:block">
        <button
          type="button"
          onClick={() => {
            setConversationId(crypto.randomUUID());
            setMessages([]);
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#1E2028] px-3 py-2 text-xs text-zinc-200"
        >
          <Plus className="h-4 w-4" /> {t.newChat}
        </button>
        <div className="mt-3 space-y-2">
          {conversations.map((item) => (
            <button
              key={item.conversation_id}
              type="button"
              onClick={() => void loadConversation(item.conversation_id)}
              className="block w-full rounded-lg border border-[#1E2028] bg-[#0E0F12] px-3 py-2 text-left text-xs text-zinc-300"
            >
              {item.starter || t.fallbackConversation}
            </button>
          ))}
        </div>
      </aside>

      <section className="flex min-h-0 flex-col rounded-2xl border border-[#1E2028] bg-[#111215]">
        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {t.suggested.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => void sendMessage(STARTER_PROMPTS[index] ?? item)}
                  className="rounded-xl border border-[#1E2028] bg-[#111215] px-4 py-3 text-start text-sm text-white transition-colors duration-150 hover:border-[#22D3EE] hover:bg-[rgba(34,211,238,0.04)]"
                >
                  {item}
                </button>
              ))}
            </div>
          ) : null}
          {messages.map((message) => (
            <article
              key={message.id}
              className={cn("group relative max-w-[85%] rounded-2xl px-4 py-3 text-sm", message.role === "user" ? "ms-auto bg-[#22D3EE] text-[#09090B]" : "me-auto border border-[#1E2028] bg-[#111215] text-white")}
            >
              {message.role === "assistant" ? <Sparkles className="mb-1 h-3.5 w-3.5 text-[#22D3EE]" /> : null}
              {message.role === "assistant" ? (
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(message.content)}
                  className="absolute end-2 top-2 hidden rounded-md border border-[#1E2028] px-1.5 py-0.5 text-[10px] text-[#A1A1AA] group-hover:inline-flex"
                >
                  Copy
                </button>
              ) : null}
              <p className="whitespace-pre-wrap">
                {message.content}
                {isStreaming && message.id === messages[messages.length - 1]?.id ? <span className="ms-1 animate-pulse text-[#22D3EE]">▋</span> : null}
              </p>
              <p className="mt-1 text-[10px] text-zinc-500">{message.created_at ? new Date(message.created_at).toLocaleTimeString(locale) : ""}</p>
            </article>
          ))}
        </div>

        <div className="border-t border-[#1E2028] px-3 py-3">
          {showVoiceTip ? <p className="mb-2 text-xs text-zinc-500">{t.voiceInput}</p> : null}
          {!voiceSupported ? <p className="mb-2 text-xs text-red-300">{t.voiceUnsupportedInline}</p> : null}
          {apiError ? <p className="mb-2 text-xs text-red-300">{apiError}</p> : null}
          {messages.length > 0 ? (
          <form
            className="flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(input);
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={1}
              placeholder={t.askPlaceholder}
              className="max-h-[120px] min-h-[42px] flex-1 resize-none rounded-xl border border-[#1E2028] bg-[#0E0F12] px-3 py-2 text-sm text-white outline-none"
            />
            <button
              type="button"
              onClick={startVoice}
              className={cn("inline-flex h-10 items-center gap-2 rounded-full border px-3 text-xs", isListening ? "border-red-400/50 text-red-300" : "border-[#1E2028] text-zinc-200")}
            >
              <Mic className={cn("h-4 w-4", isListening && "animate-pulse")} />
              {isListening ? t.listening : t.voice}
            </button>
            <button type="submit" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#22D3EE] text-[#09090B]">
              <Send className="h-4 w-4" />
            </button>
          </form>
          ) : (
            <p className="text-xs text-zinc-500">Or type any fitness question below after choosing a starter.</p>
          )}
          <p className="mt-2 text-xs text-zinc-500">{tier === "core" ? `${remaining} ${t.coreRemaining}` : tier === "pro" ? t.proLocked : t.apexUnlimited}</p>
        </div>
      </section>

      {showLimitOverlay ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#1E2028] bg-[#111215] p-6">
            <h3 className="text-lg font-semibold text-white">{t.trialUsed}</h3>
            <p className="mt-2 text-sm text-zinc-400">{t.trialSub}</p>
            <a href={`/${locale}/membership?tier=apex`} className="mt-4 inline-flex rounded-full bg-[#22D3EE] px-4 py-2 text-sm font-semibold text-[#09090B]">
              {t.upgrade}
            </a>
            <button type="button" className="mt-3 block text-xs text-zinc-500" onClick={() => setShowLimitOverlay(false)}>
              {t.close}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
