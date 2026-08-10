"use client";

import {
  Dumbbell,
  HeartPulse,
  MessagesSquare,
  Mic,
  Plus,
  Repeat2,
  Send,
  Sparkles,
  TrendingUp,
  Utensils,
  X
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { CoachMessageBody, CoachThinkingPulse } from "@/components/tjai/coach-message-body";
import { useDynamicIsland } from "@/components/ui/dynamic-island";
import { GrainOverlay } from "@/components/ui/grain-overlay";
import {
  COACH_FOLLOW_UP_PROMPTS,
  COACH_NUTRITION_HINT_RE,
  COACH_TRAINING_HINT_RE
} from "@/lib/tjai/chat-client-utils";
import { getTJAIAccess } from "@/lib/tjai-access";
import { getTJAIChatCopy } from "@/lib/tjai-chat-copy";
import { isSupportedLocale, type Locale, type SupportedLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import styles from "./tjai-chat.module.css";

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

type SourceChipKey = "plan" | "grocery" | "swap" | "progress" | "bundle";
type SourceChip = { key: SourceChipKey; href: string };

const BUNDLE_PATH_RE = /\/bundles\/([a-z0-9][a-z0-9-]{1,63})/i;

const SOURCE_CHIP_TESTS: Array<{ key: Exclude<SourceChipKey, "bundle">; re: RegExp; tab: string }> = [
  {
    key: "grocery",
    re: /grocer|shopping list|alışveriş listesi|market listesi|قائمة التسوق|قائمة البقالة|lista de (?:la )?compras?|liste de courses/i,
    tab: "my-plan"
  },
  {
    key: "swap",
    re: /meal swap|swap (?:a |the |that )?meal|öğün değişimi|öğünü değiştir|تبديل الوجبة|بديل الوجبة|cambio de comida|cambiar (?:una |la )?comida|remplacer (?:un |le )?repas/i,
    tab: "meal-swap"
  },
  {
    key: "progress",
    re: /progress|check-?in|ilerleme|التقدم|progreso|progression/i,
    tab: "progress"
  },
  {
    key: "plan",
    re: /\bplan|خطتك|خطة/i,
    tab: "my-plan"
  }
];

// Client-side detection over the FINAL assistant text only. Hub tabs and
// bundle slugs are the only allowed targets — nothing external.
function detectSourceChips(text: string, locale: Locale): SourceChip[] {
  const chips: SourceChip[] = [];
  const bundle = BUNDLE_PATH_RE.exec(text);
  if (bundle) chips.push({ key: "bundle", href: `/${locale}/bundles/${bundle[1].toLowerCase()}` });
  for (const { key, re, tab } of SOURCE_CHIP_TESTS) {
    if (chips.length >= 3) break;
    const href = `/${locale}/ai?tab=${tab}`;
    if (re.test(text) && !chips.some((c) => c.href === href)) chips.push({ key, href });
  }
  return chips;
}

const SUGGESTION_ICONS = [Sparkles, Utensils, Dumbbell, Repeat2, HeartPulse, TrendingUp] as const;

function relativeTime(iso: string, locale: SupportedLocale): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const diffSec = Math.round((then - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    if (abs < 60) return rtf.format(diffSec, "second");
    if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
    if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
    return rtf.format(Math.round(diffSec / 86400), "day");
  } catch {
    return new Date(iso).toLocaleDateString(locale);
  }
}

function voiceLang(locale: Locale) {
  if (locale === "tr") return "tr-TR";
  if (locale === "ar") return "ar-SA";
  if (locale === "es") return "es-ES";
  if (locale === "fr") return "fr-FR";
  return "en-US";
}

export function TJAIChatStandalone({ locale }: { locale: Locale }) {
  const routingLocale = useRoutingLocale(locale);
  const copy = getTJAIChatCopy(locale);
  const t = copy.standalone;
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
  // Data-driven chip keys from the route's `done` event (see chat-suggestions.ts).
  const [suggestionKeys, setSuggestionKeys] = useState<string[]>([]);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [showConversationsSheet, setShowConversationsSheet] = useState(false);
  const recognitionRef = useRef<any>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setConversationId(crypto.randomUUID());
  }, []);

  // Visual only: auto-grow the composer textarea up to 160px.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  // Visual only: close the mobile conversations sheet on Escape.
  useEffect(() => {
    if (!showConversationsSheet) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowConversationsSheet(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showConversationsSheet]);

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
  const lastAssistantText = lastAssistant?.content ?? "";
  // Data-driven chips (from the user's real plan/log state) win over the
  // regex topic fallback; unknown keys are skipped so an older client and a
  // newer server never break each other.
  const contextualPrompts = suggestionKeys
    .map((k) => copy.contextual[k as keyof typeof copy.contextual])
    .filter((v): v is string => Boolean(v));
  const ongoingPrompts =
    contextualPrompts.length > 0
      ? contextualPrompts
      : COACH_NUTRITION_HINT_RE.test(lastAssistantText)
        ? copy.ongoing.nutrition
        : COACH_TRAINING_HINT_RE.test(lastAssistantText)
          ? copy.ongoing.training
          : t.quickPrompts;

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

    // Trial enforcement is atomic on the server inside /api/tjai/chat
    // (consume_trial_message RPC). The previous client-side fetch to
    // /api/tjai/trial-consume-message was bypassable in DevTools.
    // Optimistically decrement; a 402 from /chat below rolls back UI
    // state and surfaces the limit overlay.
    if (tier === "core") {
      setRemaining((r) => Math.max(0, r - 1));
    }

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: message, created_at: new Date().toISOString() };
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, userMessage, { id: assistantId, role: "assistant", content: "", created_at: new Date().toISOString() }]);
    setInput("");
    setApiError(null);
    setIsStreaming(true);
    setIsThinking(true);
    // Stale chips from the previous turn must not survive into this one.
    setSuggestionKeys([]);

    // No artificial pre-fetch delay — the request starts now, and the thinking
    // pulse reflects real wait time (send until response headers arrive).
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
      setIsThinking(false);
      const contentType = response.headers.get("Content-Type") ?? "";
      if (contentType.includes("application/json")) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 402) {
          // Trial limit reached server-side. Drop the optimistic user +
          // empty-assistant rows we just appended.
          setMessages((prev) => prev.filter((m) => m.id !== userMessage.id && m.id !== assistantId));
          setShowLimitOverlay(true);
          setRemaining(0);
          return;
        }
        if (!response.ok) {
          setApiError(t.errorGeneric);
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
              const data = JSON.parse(line.slice(5).trim()) as {
                delta?: string;
                conversationId?: string;
                done?: boolean;
                suggestionKeys?: string[];
              };
              if (typeof data.conversationId === "string" && data.conversationId) {
                setConversationId(data.conversationId);
              }
              if (Array.isArray(data.suggestionKeys)) {
                setSuggestionKeys(data.suggestionKeys);
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
        setApiError(t.errorTimeout);
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

  const startNewChat = () => {
    setConversationId(crypto.randomUUID());
    setMessages([]);
  };

  const currentTitle = messages.find((m) => m.role === "user")?.content ?? t.fallbackConversation;

  const renderConversationItems = (fromSheet: boolean) =>
    conversations.map((item) => {
      const active = item.conversation_id === conversationId;
      return (
        <button
          key={item.conversation_id}
          type="button"
          onClick={() => {
            void loadConversation(item.conversation_id);
            if (fromSheet) setShowConversationsSheet(false);
          }}
          className={cn(
            "relative block w-full rounded-lg px-3 py-2 text-start text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
            active
              ? "bg-[rgba(168,85,247,0.08)] text-white"
              : "text-bright hover:bg-white/[0.04] hover:text-white"
          )}
        >
          {active ? (
            <span
              aria-hidden
              className="absolute inset-y-1.5 start-0 w-[2px] rounded-full bg-gradient-to-b from-[#A855F7] to-[#7C3AED]"
            />
          ) : null}
          <span className="block truncate font-medium">{item.starter || t.fallbackConversation}</span>
          <span className="mt-0.5 block text-[10px] text-faint">
            {relativeTime(item.created_at, routingLocale)}
          </span>
        </button>
      );
    });

  return (
    <div className="grid h-[calc(100svh-220px)] gap-4 md:grid-cols-[280px,1fr]">
      <aside className="hidden min-h-0 flex-col rounded-2xl border border-white/[0.08] bg-[#0D0F12]/80 p-3 backdrop-blur-md md:flex">
        <button
          type="button"
          onClick={startNewChat}
          className={cn(
            styles.newChatBtn,
            "inline-flex w-full items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          )}
        >
          <Plus className="h-4 w-4" /> {t.newChat}
        </button>
        <p className="mt-4 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-dim">
          {t.recent}
        </p>
        <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto">
          {renderConversationItems(false)}
        </div>
      </aside>

      <section
        className={cn(
          styles.panelBorder,
          "relative flex min-h-0 flex-col overflow-hidden rounded-2xl bg-[#0B0C10]/95 shadow-[0_20px_70px_rgba(0,0,0,0.4)] backdrop-blur-md"
        )}
      >
        <div className={styles.panelGlow} aria-hidden />
        <GrainOverlay vignette={false} opacity={0.04} className="z-[2]" />

        <header className="relative z-[3] flex items-center gap-3 border-b border-white/[0.06] bg-[#0B0C10]/80 px-4 py-2.5 backdrop-blur-md">
          <span className={cn(styles.avatarOrb, "h-8 w-8 text-[10px]")} aria-hidden>
            TJ
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-white">TJAI</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] text-muted">
                <span className={styles.statusDot} aria-hidden />
                {copy.online}
              </span>
            </div>
            <p className="truncate text-[11px] text-faint">{currentTitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowConversationsSheet(true)}
            aria-label={t.conversationsLabel}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-white/[0.08] px-3 text-xs text-bright transition-colors hover:border-accent/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 md:hidden"
          >
            <MessagesSquare className="h-4 w-4" />
            {t.conversationsLabel}
          </button>
        </header>

        <div
          ref={listRef}
          className={cn(
            "relative z-[1] flex-1 overflow-y-auto px-4 py-5",
            messages.length === 0 ? "flex" : "space-y-5"
          )}
        >
          {messages.length === 0 ? (
            <div className="m-auto flex w-full max-w-xl flex-col items-center text-center">
              <span
                className={cn(styles.avatarOrb, styles.orbBreathe, styles.riseIn, "h-16 w-16 text-lg")}
                aria-hidden
              >
                TJ
              </span>
              <h2
                className={cn(styles.riseIn, "mt-5 text-2xl font-semibold tracking-tight text-white sm:text-3xl")}
                style={{ "--rise-delay": "80ms" } as CSSProperties}
              >
                {t.greeting}
              </h2>
              <p
                className={cn(styles.riseIn, "mt-2 text-sm text-muted")}
                style={{ "--rise-delay": "160ms" } as CSSProperties}
              >
                {t.greetingSub}
              </p>
              <div className="mt-8 grid w-full gap-2.5 sm:grid-cols-2">
                {copy.suggestions.map((s, index) => {
                  const Icon = SUGGESTION_ICONS[index] ?? Sparkles;
                  return (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => void sendMessage(s.prompt)}
                      className={cn(
                        styles.suggestionCard,
                        styles.riseIn,
                        "flex items-start gap-3 px-4 py-3.5 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.99] motion-reduce:active:scale-100"
                      )}
                      style={{ "--rise-delay": `${240 + index * 70}ms` } as CSSProperties}
                    >
                      <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-accent/20 bg-[rgba(168,85,247,0.08)] text-[#C4B5FD]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">
                          {t.starter}
                        </span>
                        <span className="mt-0.5 block text-sm font-medium text-bright">{s.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          {messages.map((message) => {
            const isLast = message.id === messages[messages.length - 1]?.id;
            const chips =
              message.role === "assistant" && message.content && !((isStreaming || isThinking) && isLast)
                ? detectSourceChips(message.content, locale)
                : [];
            const time = message.created_at ? new Date(message.created_at).toLocaleTimeString(locale) : "";
            if (message.role === "user") {
              return (
                <article key={message.id} className={cn("group flex flex-col items-end", styles.messageEnter)}>
                  <div className="max-w-[min(88%,32rem)] rounded-2xl border border-accent/20 bg-[rgba(168,85,247,0.10)] px-4 py-3 text-sm text-white shadow-sm">
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  <p className="mt-1 pe-1 text-[10px] text-faint opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                    {time}
                  </p>
                </article>
              );
            }
            return (
              <article key={message.id} className={cn("group flex gap-3", styles.messageEnter)}>
                <span className={cn(styles.avatarOrb, "mt-0.5 h-7 w-7 text-[9px]")} aria-hidden>
                  TJ
                </span>
                <div className="min-w-0 max-w-[44rem] flex-1 border-s border-white/[0.04] ps-3 text-sm leading-7 text-white sm:ps-4">
                  {!message.content && (isThinking || isStreaming) ? (
                    <CoachThinkingPulse />
                  ) : message.content ? (
                    <CoachMessageBody text={message.content} />
                  ) : null}
                  {isStreaming && isLast && message.content ? (
                    <span className={styles.streamCaret} aria-hidden />
                  ) : null}
                  {chips.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {chips.map((chip) => (
                        <a
                          key={`${chip.key}-${chip.href}`}
                          href={chip.href}
                          className="inline-flex items-center rounded-full border border-accent/25 bg-[rgba(168,85,247,0.08)] px-2.5 py-1 text-[11px] font-medium text-purple-200 transition-colors hover:border-accent/50 hover:text-white"
                        >
                          {t.sources[chip.key]}
                        </a>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-1.5 flex items-center gap-2 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(message.content)}
                      aria-label={copy.copyLabel}
                      className="inline-flex items-center rounded-md border border-white/[0.08] bg-[#0E1014]/90 px-1.5 py-0.5 text-[10px] text-muted backdrop-blur transition-colors hover:border-accent/40 hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                      {copy.copyLabel}
                    </button>
                    <span className="text-[10px] text-faint">{time}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="relative z-[3] border-t border-white/[0.06] px-3 py-3 sm:px-4">
          {showVoiceTip ? <p className="mb-2 text-xs text-faint">{t.voiceInput}</p> : null}
          {!voiceSupported ? <p className="mb-2 text-xs text-red-300">{t.voiceUnsupportedInline}</p> : null}
          {apiError ? <p className="mb-2 text-xs text-red-300">{apiError}</p> : null}
          {showFollowUps ? (
            <div className="mb-3">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">{copy.refine}</span>
              <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                {(
                  ["simplify", "deeper", "nextStep", "protein", "timeCrunch", "deload"] as const
                ).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => void sendMessage(COACH_FOLLOW_UP_PROMPTS[k])}
                    className="flex-none whitespace-nowrap rounded-full border border-white/[0.08] bg-[#15171c] px-3.5 py-2 text-xs font-medium text-bright transition-all hover:border-accent/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.98] motion-reduce:active:scale-100"
                  >
                    {copy.followUps[k]}
                  </button>
                ))}
                {ongoingPrompts.slice(0, 2).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void sendMessage(q)}
                    className="flex-none whitespace-nowrap rounded-full border border-accent/25 bg-[rgba(168,85,247,0.07)] px-3.5 py-2 text-xs font-medium text-purple-100 transition-all hover:border-accent/45 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.98] motion-reduce:active:scale-100"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {messages.length > 0 && !showFollowUps ? (
            <div className="mb-3">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">{t.tryLabel}</span>
              <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                {ongoingPrompts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void sendMessage(q)}
                    className="flex-none whitespace-nowrap rounded-full border border-white/[0.08] bg-[#15171c] px-3.5 py-2 text-xs font-medium text-bright transition-all hover:border-accent/45 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.98] motion-reduce:active:scale-100"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <form
            className={styles.promptBox}
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(input);
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={1}
              placeholder={t.askPlaceholder}
              className="max-h-[160px] min-h-[56px] w-full resize-none bg-transparent px-4 pt-3.5 text-sm leading-relaxed text-white outline-none placeholder:text-dim"
            />
            <div className="flex items-center gap-2 px-2.5 pb-2.5">
              <button
                type="button"
                onClick={startVoice}
                aria-label={t.voiceInput}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                  isListening
                    ? "border-red-400/50 text-red-300"
                    : "border-white/[0.08] text-bright hover:border-accent/30 hover:text-white"
                )}
              >
                <Mic className={cn("h-4 w-4", isListening && "animate-pulse motion-reduce:animate-none")} />
                <span className="hidden sm:inline">{isListening ? t.listening : t.voice}</span>
              </button>
              <p className="min-w-0 flex-1 truncate text-[10px] text-faint">{t.disclaimer}</p>
              <button
                type="submit"
                disabled={isStreaming || isThinking}
                aria-label={copy.send}
                className={cn(
                  "tj-cta-sheen inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[linear-gradient(135deg,#A855F7_0%,#7C3AED_100%)] text-[#0A0A0B] transition-[transform,filter,box-shadow,opacity] duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-[0.95] motion-reduce:active:scale-100 disabled:opacity-45",
                  input.trim()
                    ? "shadow-[0_0_26px_rgba(168,85,247,0.45)]"
                    : "opacity-70 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
          <p className="mt-2 px-1 text-[10px] text-faint">{tier === "core" ? `${remaining} ${t.coreRemaining}` : tier === "pro" ? t.proUnlocked : t.apexUnlimited}</p>
        </div>
      </section>

      {showConversationsSheet ? (
        <div className="fixed inset-0 z-[70] md:hidden">
          <button
            type="button"
            aria-label={t.close}
            onClick={() => setShowConversationsSheet(false)}
            className={cn(styles.sheetBackdrop, "absolute inset-0 bg-black/60 backdrop-blur-sm")}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.conversationsLabel}
            className={cn(
              styles.sheet,
              "absolute inset-y-0 end-0 flex w-[85%] max-w-xs flex-col border-s border-white/[0.08] bg-[#0C0D11]/95 p-3 backdrop-blur-xl"
            )}
          >
            <div className="flex items-center justify-between gap-2 px-1 pb-2">
              <span className="text-sm font-semibold text-white">{t.conversationsLabel}</span>
              <button
                type="button"
                onClick={() => setShowConversationsSheet(false)}
                aria-label={t.close}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] text-bright transition-colors hover:border-accent/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                startNewChat();
                setShowConversationsSheet(false);
              }}
              className={cn(
                styles.newChatBtn,
                "inline-flex w-full items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              )}
            >
              <Plus className="h-4 w-4" /> {t.newChat}
            </button>
            <p className="mt-4 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-dim">
              {t.recent}
            </p>
            <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto">
              {renderConversationItems(true)}
            </div>
          </div>
        </div>
      ) : null}

      {showLimitOverlay ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div
            className={cn(
              styles.panelBorder,
              styles.messageEnter,
              "w-full max-w-md rounded-2xl bg-[#0C0D11]/95 p-6 text-center backdrop-blur-xl"
            )}
          >
            <span className={cn(styles.avatarOrb, styles.orbBreathe, "mx-auto h-12 w-12 text-sm")} aria-hidden>
              TJ
            </span>
            <h3 className="mt-4 text-lg font-semibold text-white">{t.trialUsed}</h3>
            <p className="mt-2 text-sm text-muted">{t.trialSub}</p>
            <a href={`/${locale}/membership`} className="mt-5 inline-flex tj-cta-sheen rounded-full bg-[linear-gradient(135deg,#A855F7,#7C3AED)] shadow-[0_0_16px_rgba(168,85,247,0.2)] hover:shadow-[0_0_24px_rgba(168,85,247,0.32)] transition-[transform,box-shadow] duration-200 hover:scale-[1.02] motion-reduce:hover:scale-100 px-5 py-2.5 text-sm font-semibold text-[#09090B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              {t.upgradeCta}
            </a>
            <button
              type="button"
              className="mx-auto mt-3 block text-xs text-faint transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              onClick={() => setShowLimitOverlay(false)}
            >
              {t.close}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
