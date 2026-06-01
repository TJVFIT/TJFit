"use client";

import { useEffect, useRef, useState } from "react";

import { ChevronDown } from "lucide-react";

import { BadgeUnlockToast } from "@/components/tjai/badge-unlock-toast";
import { CoachMessageBody, CoachThinkingPulse } from "@/components/tjai/coach-message-body";
import { PersonaPicker } from "@/components/tjai/persona-picker";
import { SpeakerButton } from "@/components/tjai/speaker-button";
import { StreakBanner } from "@/components/tjai/streak-banner";
import { SuggestionCards } from "@/components/tjai/suggestion-cards";
import { UpgradePrompt, showUpgradePrompt } from "@/components/tjai/upgrade-prompt";
import type { Locale } from "@/lib/i18n";
import { getTJAIChatCopy } from "@/lib/tjai-chat-copy";
import type { QuizAnswers, TJAIMetrics, TJAIPlan } from "@/lib/tjai-types";
import { COACH_FOLLOW_UP_PROMPTS, getCoachThinkingDelayMs } from "@/lib/tjai/chat-client-utils";
import { cn } from "@/lib/utils";

import styles from "./tjai-chat.module.css";

type ChatMessage = { role: "user" | "assistant"; content: string };
function getChatLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const segment = window.location.pathname.split("/").filter(Boolean)[0];
  return segment === "tr" || segment === "ar" || segment === "es" || segment === "fr" ? segment : "en";
}

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

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0D0F12]/85 p-5 shadow-[0_0_0_1px_rgba(168,85,247,0.05),0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 0% 0%, rgba(168,85,247,0.07), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(124,58,237,0.06), transparent 50%)"
        }}
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-white">{copy.askTitle}</h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
              {copy.askBody}
            </p>
          </div>
          <a
            href={typeof window !== "undefined" ? `${window.location.pathname.replace(/\/$/, "")}/memory` : "./memory"}
            className="shrink-0 rounded-md border border-white/10 px-3 py-1.5 text-[11px] uppercase tracking-wide text-white/60 transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-purple-300/35 hover:bg-purple-300/[0.05] hover:text-purple-100 hover:shadow-[0_0_12px_rgba(168,85,247,0.1)]"
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
                "text-[11px] font-medium uppercase tracking-[0.14em] transition",
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
              className="shrink-0 rounded-full border border-red-300/40 px-3 py-1 font-semibold text-red-100 transition hover:bg-red-400/15 disabled:opacity-40"
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
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {suggestions.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => void ask(s.prompt)}
                className="group rounded-xl border border-white/[0.06] bg-surface/90 px-4 py-3.5 text-start text-sm text-white/95 shadow-sm transition-[border-color,background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-[rgba(168,85,247,0.06)] hover:shadow-[0_0_28px_rgba(168,85,247,0.1)] active:translate-y-0 active:scale-[0.99]"
              >
                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-200/70 transition-colors group-hover:text-purple-200">
                  {s.label}
                </span>
                <span className="mt-1.5 line-clamp-2 block text-[13px] font-medium leading-snug text-bright/95">
                  {s.prompt}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="relative mt-5">
        <div
          ref={threadRef}
          className="max-h-[min(420px,52vh)] space-y-3 overflow-y-auto pe-1"
          aria-live="polite"
          aria-relevant="additions"
        >
          {history.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={cn(
                "max-w-[min(92%,28rem)] rounded-2xl px-4 py-3 text-sm shadow-sm transition-[transform,box-shadow] duration-200",
                styles.messageEnter,
                m.role === "user"
                  ? "chat-bubble-user ms-auto rounded-br-md border border-[rgba(168,85,247,0.22)] bg-gradient-to-br from-[rgba(168,85,247,0.14)] to-[rgba(168,85,247,0.06)] text-white"
                  : "chat-bubble-ai me-auto rounded-bl-md border border-white/[0.07] bg-surface/95 text-bright"
              )}
            >
              {m.role === "assistant" ? (
                !m.content && (thinking || loading) ? (
                  <CoachThinkingPulse />
                ) : m.content ? (
                  <CoachMessageBody text={m.content} />
                ) : null
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
              )}
              {loading && !thinking && m.role === "assistant" && i === history.length - 1 && m.content ? (
                <span className="ms-1 inline-block animate-pulse text-accent" aria-hidden>
                  ▋
                </span>
              ) : null}
              {m.role === "assistant" && m.content && !(loading && i === history.length - 1) ? (
                <div className="mt-2 flex justify-end">
                  <SpeakerButton
                    text={m.content}
                    autoplay={ttsAutoplay && i === history.length - 1}
                  />
                </div>
              ) : null}
            </div>
          ))}
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
              className="absolute bottom-2 end-3 z-[5] inline-flex h-9 w-9 items-center justify-center rounded-full border border-purple-300/40 bg-[#0E1014]/95 text-purple-100 shadow-[0_0_18px_rgba(168,85,247,0.25)] backdrop-blur transition-[transform,border-color,box-shadow] duration-200 hover:scale-105 hover:border-purple-300/60 hover:shadow-[0_0_26px_rgba(168,85,247,0.4)] motion-safe:animate-[tj-fade-up_220ms_ease-out]"
            >
              <ChevronDown className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>

        {showFollowUps ? (
          <div className="relative mt-4 flex flex-wrap gap-2">
            <span className="w-full text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">{copy.refine}</span>
            {(
              ["simplify", "deeper", "nextStep", "protein", "timeCrunch", "deload"] as const
            ).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => void ask(COACH_FOLLOW_UP_PROMPTS[k])}
                className="rounded-full border border-white/[0.08] bg-[#15171c] px-3 py-1.5 text-xs font-medium text-bright transition-all hover:border-accent/40 hover:text-white active:scale-[0.98]"
              >
                {copy.followUps[k]}
              </button>
            ))}
          </div>
        ) : null}

        <form
          className={cn(
            "relative mt-5 flex items-end gap-2 rounded-2xl border border-white/[0.08] bg-[#0E1014]/95 p-1.5",
            styles.composer
          )}
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
            className="tj-chat-input-premium min-h-11 max-h-[168px] flex-1 resize-none bg-transparent px-3.5 py-2.5 text-sm leading-snug text-white outline-none placeholder:text-dim"
          />
          {loading || thinking ? (
            <button
              type="button"
              onClick={stop}
              aria-label={copy.stop}
              className="inline-flex h-10 min-w-[44px] items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-bold text-white transition-[transform,background-color] duration-150 hover:bg-white/10 active:scale-[0.94]"
            >
              {copy.stop}
            </button>
          ) : (
            <button
              type="submit"
              aria-label={copy.send}
              disabled={!message.trim()}
              className="tj-cta-sheen inline-flex h-10 min-w-[44px] items-center justify-center rounded-xl bg-[linear-gradient(135deg,#A855F7_0%,#7C3AED_100%)] px-4 text-sm font-bold text-[#0A0A0B] shadow-[0_0_20px_rgba(168,85,247,0.22)] transition-[transform,filter,box-shadow,opacity] duration-150 hover:brightness-110 hover:shadow-[0_0_28px_rgba(168,85,247,0.28)] active:scale-[0.94] disabled:pointer-events-none disabled:opacity-40"
            >
              {copy.send}
            </button>
          )}
        </form>
        <p className="mt-2 text-center text-[10px] uppercase tracking-[0.18em] text-dim">
          {copy.composerHint}
        </p>
      </div>
    </section>
  );
}
