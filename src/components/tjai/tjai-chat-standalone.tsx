"use client";

import { Mic, Plus, Send, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { CoachMessageBody, CoachThinkingPulse } from "@/components/tjai/coach-message-body";
import { useDynamicIsland } from "@/components/ui/dynamic-island";
import { COACH_FOLLOW_UP_PROMPTS, getCoachThinkingDelayMs } from "@/lib/tjai/chat-client-utils";
import { getTJAIAccess } from "@/lib/tjai-access";
import { isSupportedLocale, type Locale, type SupportedLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Detect the routing locale from the URL (can be any of the 10 supported locales),
 * while the `locale` prop remains the 5-key copy locale used for UI strings.
 * This lets TJAI respond in de/pt/ru/hi/id even though our copy dicts fall back to EN.
 */
function useRoutingLocale(fallback: Locale): SupportedLocale {
  const pathname = usePathname() ?? "";
  const seg = pathname.split("/").filter(Boolean)[0] ?? "";
  return isSupportedLocale(seg) ? seg : fallback;
}

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
      "Explain my plan",
      "What to eat before training",
      "I missed a workout",
      "Swap a meal",
      "Knee pain — safe options",
      "Break a plateau"
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
    proUnlocked: "Unlimited TJAI chat",
    apexUnlimited: "Unlimited chat",
    trialUsed: "You've reached your TJAI chat preview limit",
    trialSub: "Upgrade to Pro or Apex for unlimited coaching conversations.",
    upgrade: "Upgrade membership",
    close: "Close"
  },
  ar: {
    suggested: [
      "اشرح خطتي",
      "ماذا آكل قبل التمرين",
      "فاتتني حصة تدريب",
      "بدّل وجبة",
      "ألم في الركبة",
      "تجاوز الثبات"
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
    proUnlocked: "دردشة TJAI غير محدودة",
    apexUnlimited: "دردشة غير محدودة",
    trialUsed: "لقد وصلت إلى حد معاينة دردشة TJAI",
    trialSub: "قم بالترقية إلى Pro أو Apex لمحادثات TJAI غير المحدودة.",
    upgrade: "ترقية العضوية",
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
  const routingLocale = useRoutingLocale(locale);
  const t = locale === "ar" ? COPY.ar : COPY.en;
  const island = useDynamicIsland();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
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
  }, [messages, isStreaming, isThinking]);

  const access = useMemo(() => getTJAIAccess(tier, { coreTrialMessagesRemaining: remaining }), [remaining, tier]);

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const showFollowUps =
    !isStreaming &&
    !isThinking &&
    messages.length > 0 &&
    (lastAssistant?.content?.length ?? 0) > 12;

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
    if (!message.trim() || isStreaming || isThinking) return;
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
    setIsThinking(true);
    const thinkMs = getCoachThinkingDelayMs();
    if (thinkMs > 0) {
      await new Promise((r) => setTimeout(r, thinkMs));
    }
    setIsThinking(false);

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 35000);
    try {
      const response = await fetch("/api/tjai/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversationId, locale: routingLocale }),
        signal: controller.signal
      });
      const contentType = response.headers.get("Content-Type") ?? "";
      if (contentType.includes("application/json")) {
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
      } else {
        if (!response.ok || !response.body) {
          throw new Error("Stream failed");
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finalMessage = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() ?? "";
          for (const chunk of chunks) {
            const line = chunk
              .split("\n")
              .map((entry) => entry.trim())
              .find((entry) => entry.startsWith("data:"));
            if (!line) continue;
            try {
              const data = JSON.parse(line.slice(5).trim()) as { delta?: string; conversationId?: string; done?: boolean };
              if (typeof data.conversationId === "string" && data.conversationId) {
                setConversationId(data.conversationId);
              }
              if (data.delta) {
                finalMessage += data.delta;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, content: finalMessage } : m))
                );
              }
            } catch {
              /* ignore malformed SSE payload */
            }
          }
        }
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: finalMessage || t.chatFailed } : m))
        );
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setApiError("TJAI request timed out. Please try again.");
      }
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: t.chatFailed } : m)));
    } finally {
      window.clearTimeout(timer);
      setIsStreaming(false);
      setIsThinking(false);
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

      <section className="relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0D0F12]/90 shadow-[0_0_0_1px_rgba(34,211,238,0.04),0_20px_70px_rgba(0,0,0,0.4)] backdrop-blur-md">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 70% 45% at 0% 0%, rgba(34,211,238,0.08), transparent 50%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(167,139,250,0.06), transparent 45%)"
          }}
          aria-hidden
        />
        <div ref={listRef} className="relative z-[1] flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {t.suggested.map((item, index) => (
                <button
                  key={`s-${index}`}
                  type="button"
                  onClick={() => void sendMessage(STARTER_PROMPTS[index] ?? item)}
                  className="rounded-xl border border-white/[0.06] bg-[#111215]/90 px-4 py-3 text-start text-sm text-white/95 shadow-sm transition-all duration-200 hover:border-[#22D3EE]/35 hover:bg-[rgba(34,211,238,0.05)] active:scale-[0.99]"
                >
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#52525B]">Starter</span>
                  <span className="mt-1 block font-medium text-zinc-100">{item}</span>
                </button>
              ))}
            </div>
          ) : null}
          {messages.map((message) => (
            <article
              key={message.id}
              className={cn(
                "group relative max-w-[min(92%,28rem)] rounded-2xl px-4 py-3 text-sm shadow-sm transition-[transform,box-shadow] duration-200",
                message.role === "user"
                  ? "ms-auto bg-gradient-to-br from-[#22D3EE] to-[#0EA5E9] text-[#0A0A0B]"
                  : "me-auto border border-white/[0.07] bg-[#111215]/95 text-white"
              )}
            >
              {message.role === "assistant" ? <Sparkles className="mb-1 h-3.5 w-3.5 text-[#22D3EE]" /> : null}
              {message.role === "assistant" ? (
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(message.content)}
                  className="absolute end-2 top-2 hidden rounded-md border border-white/[0.08] bg-[#0E1014]/90 px-1.5 py-0.5 text-[10px] text-[#A1A1AA] backdrop-blur group-hover:inline-flex"
                >
                  Copy
                </button>
              ) : null}
              {message.role === "assistant" ? (
                !message.content && (isThinking || isStreaming) ? (
                  <CoachThinkingPulse />
                ) : message.content ? (
                  <CoachMessageBody text={message.content} />
                ) : null
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              )}
              {isStreaming && message.role === "assistant" && message.id === messages[messages.length - 1]?.id && message.content ? (
                <span className="ms-1 inline-block animate-pulse text-[#22D3EE]" aria-hidden>
                  ▋
                </span>
              ) : null}
              <p className="mt-1 text-[10px] text-zinc-500">{message.created_at ? new Date(message.created_at).toLocaleTimeString(locale) : ""}</p>
            </article>
          ))}
        </div>

        <div className="relative z-[1] border-t border-white/[0.06] px-3 py-3">
          {showVoiceTip ? <p className="mb-2 text-xs text-zinc-500">{t.voiceInput}</p> : null}
          {!voiceSupported ? <p className="mb-2 text-xs text-red-300">{t.voiceUnsupportedInline}</p> : null}
          {apiError ? <p className="mb-2 text-xs text-red-300">{apiError}</p> : null}
          {showFollowUps ? (
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="w-full text-[10px] font-semibold uppercase tracking-[0.14em] text-[#52525B]">Refine</span>
              {(
                [
                  { k: "simplify", label: "Simplify" },
                  { k: "deeper", label: "More detail" },
                  { k: "nextStep", label: "Next step" },
                  { k: "protein", label: "Protein" },
                  { k: "timeCrunch", label: "35 min" },
                  { k: "deload", label: "Deload" }
                ] as const
              ).map(({ k, label }) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => void sendMessage(COACH_FOLLOW_UP_PROMPTS[k])}
                  className="rounded-full border border-white/[0.08] bg-[#15171c] px-3 py-1.5 text-xs font-medium text-zinc-200 transition-all hover:border-[#22D3EE]/40 hover:text-white active:scale-[0.98]"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
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
              className="tj-chat-input-premium max-h-[120px] min-h-[42px] flex-1 resize-none rounded-xl border border-white/[0.08] bg-[#0E1014]/95 px-3 py-2 text-sm text-white outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[#52525B] focus-visible:border-[#22D3EE]/55 focus-visible:ring-2 focus-visible:ring-[#22D3EE]/15"
            />
            <button
              type="button"
              onClick={startVoice}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-3 text-xs transition-colors",
                isListening ? "border-red-400/50 text-red-300" : "border-white/[0.08] text-zinc-200 hover:border-[#22D3EE]/30"
              )}
            >
              <Mic className={cn("h-4 w-4", isListening && "animate-pulse")} />
              {isListening ? t.listening : t.voice}
            </button>
            <button
              type="submit"
              disabled={isStreaming || isThinking}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#22D3EE_0%,#0EA5E9_100%)] text-[#0A0A0B] shadow-[0_0_18px_rgba(34,211,238,0.2)] transition-[transform,filter] duration-200 hover:brightness-110 active:scale-[0.95] disabled:opacity-45"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          ) : (
            <p className="text-xs text-zinc-500">Or type any fitness question below after choosing a starter.</p>
          )}
          <p className="mt-2 text-xs text-zinc-500">{tier === "core" ? `${remaining} ${t.coreRemaining}` : tier === "pro" ? t.proUnlocked : t.apexUnlimited}</p>
        </div>
      </section>

      {showLimitOverlay ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#1E2028] bg-[#111215] p-6">
            <h3 className="text-lg font-semibold text-white">{t.trialUsed}</h3>
            <p className="mt-2 text-sm text-zinc-400">{t.trialSub}</p>
            <a href={`/${locale}/membership`} className="mt-4 inline-flex rounded-full bg-[#22D3EE] px-4 py-2 text-sm font-semibold text-[#09090B]">
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
