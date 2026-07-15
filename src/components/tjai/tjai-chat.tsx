"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import {
  ChevronDown,
  Dumbbell,
  HeartPulse,
  Repeat2,
  Send,
  Sparkles,
  Square,
  TrendingUp,
  Utensils
} from "lucide-react";

import { BadgeUnlockToast } from "@/components/tjai/badge-unlock-toast";
import { CoachMessageBody, CoachThinkingPulse } from "@/components/tjai/coach-message-body";
import { PersonaPicker } from "@/components/tjai/persona-picker";
import { SpeakerButton } from "@/components/tjai/speaker-button";
import { StreakBanner } from "@/components/tjai/streak-banner";
import { SuggestionCards } from "@/components/tjai/suggestion-cards";
import { UpgradePrompt, showUpgradePrompt } from "@/components/tjai/upgrade-prompt";
import { GrainOverlay } from "@/components/ui/grain-overlay";
import type { Locale } from "@/lib/i18n";
import { getTJAIChatCopy } from "@/lib/tjai-chat-copy";
import type { QuizAnswers, TJAIMetrics, TJAIPlan } from "@/lib/tjai-types";
import {
  COACH_FOLLOW_UP_PROMPTS,
  COACH_NUTRITION_HINT_RE,
  COACH_TRAINING_HINT_RE,
  getCoachThinkingDelayMs
} from "@/lib/tjai/chat-client-utils";
import { cn } from "@/lib/utils";

import styles from "./tjai-chat.module.css";

type ChatMessage = { role: "user" | "assistant"; content: string };
function getChatLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const segment = window.location.pathname.split("/").filter(Boolean)[0];
  return segment === "tr" || segment === "ar" || segment === "es" || segment === "fr" ? segment : "en";
}

const SUGGESTION_ICONS = [Sparkles, Utensils, Dumbbell, Repeat2, HeartPulse, TrendingUp] as const;

export function TJAIChat({
  plan: _plan,
  metrics: _metrics,
  answers: _answers,
  coreLimited = false,
  onLimitReached
}: {
  plan: TJAIPlan;
  metrics: TJAIMetrics;
  answers: QuizAnswers;
  coreLimited?: boolean;
  onLimitReached?: () => void;
}) {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [ttsAutoplay, setTtsAutoplay] = useState(false);
  const [trialRemaining, setTrialRemaining] = useState<number | null>(null);
  const [trialLimit, setTrialLimit] = useState<number | null>(null);
  const [atBottom, setAtBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);
  const lastUserMessageRef = useRef<string>("");
  const copy = getTJAIChatCopy(getChatLocale());

  // User-initiated stop: abort the in-flight request. The server sees the
  // client disconnect and stops streaming (Phase 9 audit). We keep whatever
  // partial text already streamed.
  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setThinking(false);
  };

  // Retry the last failed send WITHOUT appending a duplicate user message:
  // drop the trailing empty assistant row, then re-ask the stored text.
  const retry = () => {
    const text = lastUserMessageRef.current;
    if (!text || loading) return;
    setHistory((prev) => {
      const next = [...prev];
      if (next.length && next[next.length - 1]?.role === "assistant" && next[next.length - 1]?.content === "") {
        next.pop();
        if (next.length && next[next.length - 1]?.role === "user") next.pop();
      }
      return next;
    });
    setApiError(null);
    void ask(text);
  };

  useEffect(() => {
    setConversationId(crypto.randomUUID());
    fetch("/api/tjai/settings", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.tts_autoplay === "boolean") setTtsAutoplay(data.tts_autoplay);
      })
      .catch(() => {});
    if (coreLimited) {
      fetch("/api/tjai/trial-status", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data?.trial) return;
          const used = Number(data.trial.messagesUsed ?? 0);
          const limit = Number(data.trial.messageLimit ?? 5);
          setTrialLimit(limit);
          setTrialRemaining(Math.max(0, limit - used));
        })
        .catch(() => {});
    }
  }, [coreLimited]);

  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    const handler = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      const next = distance < 80;
      stickToBottomRef.current = next;
      setAtBottom((prev) => (prev === next ? prev : next));
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (!stickToBottomRef.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, thinking]);

  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = "0px";
    const next = Math.min(el.scrollHeight, 168);
    el.style.height = `${Math.max(44, next)}px`;
  }, [message]);

  const submitComposer = () => {
    const trimmed = message.trim();
    if (!trimmed || loading || thinking) return;
    void ask(trimmed);
  };

  const suggestions = copy.suggestions;

  const ask = async (text: string) => {
    // Trial enforcement is atomic on the server inside /api/tjai/chat
    // (consume_trial_message RPC). The previous client-side fetch to
    // /api/tjai/trial-consume-message was bypassable in DevTools.
    // Optimistically decrement the local counter; a 402 from /chat is
    // handled below to surface the upgrade prompt.
    if (coreLimited && trialRemaining !== null) {
      setTrialRemaining(Math.max(0, trialRemaining - 1));
    }

    lastUserMessageRef.current = text;
    stickToBottomRef.current = true;
    setHistory((prev) => [...prev, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setMessage("");
    setLoading(true);
    setThinking(true);
    setApiError(null);

    const delay = getCoachThinkingDelayMs();
    if (delay > 0) {
      await new Promise((r) => setTimeout(r, delay));
    }
    setThinking(false);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/tjai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text, conversationId }),
        signal: controller.signal
      });

      const contentType = res.headers.get("Content-Type") ?? "";
      if (contentType.includes("application/json")) {
        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
          conversationId?: string;
          error?: string;
          code?: string;
        };
        if (res.status === 402) {
          // Trial limit reached server-side. Drop the optimistic user +
          // empty-assistant rows we just appended.
          setHistory((prev) => prev.slice(0, -2));
          showUpgradePrompt({
            reason: "limit_reached",
            title:
              data.code === "expired"
                ? copy.upgrade.limitTitleExpired
                : copy.upgrade.limitTitleHit,
            body: copy.upgrade.limitBody,
            ctaHref: "/membership",
            ctaLabel: copy.upgrade.limitCta
          });
          onLimitReached?.();
          return;
        }
        const assistantText = String(data?.message ?? "").trim();
        if (data?.conversationId && !conversationId) setConversationId(data.conversationId);
        setHistory((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantText || copy.fallbackReply
          };
          return updated;
        });
        return;
      }

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6)) as { delta?: string; conversationId?: string };
            if (data.delta) {
              setHistory((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: (last?.content ?? "") + data.delta
                };
                return updated;
              });
            }
            if (data.conversationId && !conversationId) {
              setConversationId(data.conversationId);
            }
          } catch {
            // skip malformed SSE chunks
          }
        }
      }
    } catch (error) {
      // User-initiated stop: keep partial text, don't show an error.
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      console.error("[TJAI chat client] error:", error);
      setHistory((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: copy.connectionLost
        };
        return updated;
      });
      setApiError(copy.apiErrorRetry);
    } finally {
      abortRef.current = null;
      setLoading(false);
      setThinking(false);
    }
  };

  const lastAssistantIdx = history.map((m, i) => (m.role === "assistant" ? i : -1)).filter((i) => i >= 0).pop();
  const showFollowUps =
    !loading &&
    !thinking &&
    history.length > 0 &&
    lastAssistantIdx !== undefined &&
    (history[lastAssistantIdx]?.content?.length ?? 0) > 12;
  const lastAssistantText = lastAssistantIdx !== undefined ? history[lastAssistantIdx]?.content ?? "" : "";
  const contextPrompts = COACH_NUTRITION_HINT_RE.test(lastAssistantText)
    ? copy.ongoing.nutrition
    : COACH_TRAINING_HINT_RE.test(lastAssistantText)
      ? copy.ongoing.training
      : [];

  return (
    <section
      className={cn(
        styles.panelBorder,
        "relative overflow-hidden rounded-2xl bg-[#0B0C10]/95 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.4)] backdrop-blur-md"
      )}
    >
      <div className={styles.panelGlow} aria-hidden />
      <GrainOverlay vignette={false} opacity={0.04} className="z-[2]" />
      <div className="relative z-[1]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className={cn(styles.avatarOrb, styles.orbBreathe, "mt-0.5 h-9 w-9 text-[10px]")} aria-hidden>
              TJ
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold tracking-tight text-white">{copy.askTitle}</h3>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] text-muted">
                  <span className={styles.statusDot} aria-hidden />
                  {copy.online}
                </span>
              </div>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
                {copy.askBody}
              </p>
            </div>
          </div>
          <a
            href={typeof window !== "undefined" ? `${window.location.pathname.replace(/\/$/, "")}/memory` : "./memory"}
            className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-[11px] uppercase tracking-wide text-white/60 transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-purple-300/35 hover:bg-purple-300/[0.05] hover:text-purple-100 hover:shadow-[0_0_12px_rgba(168,85,247,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {copy.memory}
          </a>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <PersonaPicker compact />
          {coreLimited && trialRemaining !== null && trialLimit !== null ? (
            <button
              type="button"
              onClick={() =>
                showUpgradePrompt({
                  reason: "manual",
                  title: copy.upgrade.manualTitle,
                  body: copy.upgrade.manualBody,
                  ctaHref: "/membership",
                  ctaLabel: copy.upgrade.manualCta
                })
              }
              className={cn(
                "rounded-full text-[11px] font-medium uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                trialRemaining <= 1
                  ? "text-purple-200 underline-offset-4 hover:underline"
                  : "text-white/60 hover:text-purple-200"
              )}
              title={copy.askTitle}
            >
              {trialRemaining <= 1
                ? copy.trialLeft(trialRemaining)
                : copy.trialRemaining(trialRemaining, trialLimit)}
            </button>
          ) : null}
        </div>
        {apiError ? (
          <div
            className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200"
            role="alert"
            aria-live="assertive"
          >
            <span>{apiError}</span>
            <button
              type="button"
              onClick={retry}
              disabled={loading}
              className="shrink-0 rounded-full border border-red-300/40 px-3 py-1 font-semibold text-red-100 transition hover:bg-red-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50 disabled:opacity-40"
            >
              {copy.retry}
            </button>
          </div>
        ) : null}

        <div className="mt-5">
          <StreakBanner />
          <SuggestionCards />
          <BadgeUnlockToast />
          <UpgradePrompt />
        </div>

        {history.length === 0 ? (
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {suggestions.map((s, index) => {
              const Icon = SUGGESTION_ICONS[index] ?? Sparkles;
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => void ask(s.prompt)}
                  className={cn(
                    styles.suggestionCard,
                    styles.riseIn,
                    "group flex items-start gap-3 px-4 py-3.5 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.99] motion-reduce:active:scale-100"
                  )}
                  style={{ "--rise-delay": `${index * 70}ms` } as CSSProperties}
                >
                  <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-accent/20 bg-[rgba(168,85,247,0.08)] text-[#C4B5FD]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-purple-200/70 transition-colors group-hover:text-purple-200 motion-reduce:transition-none">
                      {s.label}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-[13px] font-medium leading-snug text-bright/95">
                      {s.prompt}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="relative mt-5">
        <div
          ref={threadRef}
          className="max-h-[min(420px,52vh)] space-y-4 overflow-y-auto pe-1"
          aria-live="polite"
          aria-relevant="additions"
        >
          {history.map((m, i) =>
            m.role === "user" ? (
              <div key={`${m.role}-${i}`} className={cn("flex flex-col items-end", styles.messageEnter)}>
                <div className="max-w-[min(88%,26rem)] rounded-2xl border border-accent/20 bg-[rgba(168,85,247,0.10)] px-4 py-3 text-sm text-white shadow-sm">
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
              </div>
            ) : (
              <div key={`${m.role}-${i}`} className={cn("group flex gap-3", styles.messageEnter)}>
                <span className={cn(styles.avatarOrb, "mt-0.5 h-7 w-7 text-[9px]")} aria-hidden>
                  TJ
                </span>
                <div className="min-w-0 flex-1 border-s border-white/[0.04] ps-3 text-sm leading-7 text-bright sm:ps-4">
                  {!m.content && (thinking || loading) ? (
                    <CoachThinkingPulse />
                  ) : m.content ? (
                    <CoachMessageBody text={m.content} />
                  ) : null}
                  {loading && !thinking && i === history.length - 1 && m.content ? (
                    <span className={styles.streamCaret} aria-hidden />
                  ) : null}
                  {m.content && !(loading && i === history.length - 1) ? (
                    <div className="mt-1.5 flex items-center gap-2 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none">
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(m.content)}
                        aria-label={copy.copyLabel}
                        className="inline-flex items-center rounded-md border border-white/[0.08] bg-[#0E1014]/90 px-1.5 py-0.5 text-[10px] text-muted backdrop-blur transition-colors hover:border-accent/40 hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                      >
                        {copy.copyLabel}
                      </button>
                      <SpeakerButton
                        text={m.content}
                        autoplay={ttsAutoplay && i === history.length - 1}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            )
          )}
          <div ref={messagesEndRef} />
        </div>
          {!atBottom && history.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                stickToBottomRef.current = true;
                setAtBottom(true);
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              aria-label={copy.jumpToLatest}
              className="absolute bottom-2 end-3 z-[5] inline-flex h-9 w-9 items-center justify-center rounded-full border border-purple-300/40 bg-[#0E1014]/95 text-purple-100 shadow-[0_0_18px_rgba(168,85,247,0.25)] backdrop-blur transition-[transform,border-color,box-shadow] duration-200 hover:scale-105 hover:border-purple-300/60 hover:shadow-[0_0_26px_rgba(168,85,247,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 motion-safe:animate-[tj-fade-up_220ms_ease-out] motion-reduce:hover:scale-100"
            >
              <ChevronDown className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>

        {showFollowUps ? (
          <div className="mt-4">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">{copy.refine}</span>
            <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
              {(
                ["simplify", "deeper", "nextStep", "protein", "timeCrunch", "deload"] as const
              ).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => void ask(COACH_FOLLOW_UP_PROMPTS[k])}
                  className="flex-none whitespace-nowrap rounded-full border border-white/[0.08] bg-[#15171c] px-3.5 py-2 text-xs font-medium text-bright transition-all hover:border-accent/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
                >
                  {copy.followUps[k]}
                </button>
              ))}
              {contextPrompts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void ask(q)}
                  className="flex-none whitespace-nowrap rounded-full border border-accent/25 bg-[rgba(168,85,247,0.07)] px-3.5 py-2 text-xs font-medium text-purple-100 transition-all hover:border-accent/45 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <form
          className={cn("relative mt-5", styles.promptBox)}
          onSubmit={(e) => {
            e.preventDefault();
            submitComposer();
          }}
        >
          <textarea
            ref={composerRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submitComposer();
              }
            }}
            placeholder={copy.emptyPrompt}
            aria-label={copy.askTitle}
            rows={1}
            className="max-h-[168px] min-h-11 w-full resize-none bg-transparent px-4 pt-3 text-sm leading-snug text-white outline-none placeholder:text-dim"
          />
          <div className="flex items-center gap-2 px-2.5 pb-2.5">
            <p className="min-w-0 flex-1 truncate text-[10px] uppercase tracking-[0.14em] text-faint">
              {copy.composerHint}
            </p>
            {loading || thinking ? (
              <button
                type="button"
                onClick={stop}
                aria-label={copy.stop}
                className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-[transform,background-color] duration-150 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-[0.94] motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
              </button>
            ) : (
              <button
                type="submit"
                aria-label={copy.send}
                disabled={!message.trim()}
                className={cn(
                  "tj-cta-sheen inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[linear-gradient(135deg,#A855F7_0%,#7C3AED_100%)] text-[#0A0A0B] transition-[transform,filter,box-shadow,opacity] duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-[0.95] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none motion-reduce:active:scale-100",
                  message.trim()
                    ? "shadow-[0_0_26px_rgba(168,85,247,0.45)]"
                    : "opacity-70 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                )}
              >
                <Send className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
