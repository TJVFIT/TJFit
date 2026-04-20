"use client";

import { useEffect, useRef, useState } from "react";

import { CoachMessageBody, CoachThinkingPulse } from "@/components/tjai/coach-message-body";
import type { QuizAnswers, TJAIMetrics, TJAIPlan } from "@/lib/tjai-types";
import { COACH_FOLLOW_UP_PROMPTS, getCoachThinkingDelayMs } from "@/lib/tjai/chat-client-utils";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; content: string };

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConversationId(crypto.randomUUID());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, thinking]);

  const suggestions = [
    { label: "Plan overview", prompt: "Can you give me an overview of my TJAI plan and explain the main principles?" },
    { label: "Pre-workout fuel", prompt: "What should I eat before my workout, and when should I eat it?" },
    { label: "Missed a session", prompt: "I missed yesterday's workout. What should I do — make it up or skip it?" },
    { label: "Meal swap", prompt: "Can you suggest an alternative for one of my meals? I'll tell you which one." },
    { label: "Knee-friendly options", prompt: "I'm experiencing knee pain. Which exercises should I avoid and what are safe alternatives?" },
    { label: "Break a plateau", prompt: "I've been stuck at the same weight for 2 weeks. What changes should I make to break through?" }
  ];

  const ask = async (text: string) => {
    if (coreLimited) {
      const limitRes = await fetch("/api/tjai/trial-consume-message", { method: "POST" });
      if (!limitRes.ok) {
        onLimitReached?.();
        return;
      }
    }

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

    try {
      const res = await fetch("/api/tjai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text, conversationId })
      });

      const contentType = res.headers.get("Content-Type") ?? "";
      if (contentType.includes("application/json")) {
        const data = (await res.json().catch(() => ({}))) as { message?: string; conversationId?: string };
        const assistantText = String(data?.message ?? "").trim();
        if (data?.conversationId && !conversationId) setConversationId(data.conversationId);
        setHistory((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantText || "I could not respond right now. Please try again."
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
      console.error("[TJAI chat client] error:", error);
      setHistory((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "I had a brief connection issue. Please try again."
        };
        return updated;
      });
      setApiError("Connection issue. Please try again.");
    } finally {
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
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0D0F12]/85 p-5 shadow-[0_0_0_1px_rgba(34,211,238,0.05),0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 0% 0%, rgba(34,211,238,0.07), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(167,139,250,0.06), transparent 50%)"
        }}
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-white">Ask TJAI</h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#A1A1AA]">
              Your coach knows your plan and your logged sessions — ask with specifics for sharper answers.
            </p>
          </div>
        </div>
        {apiError ? (
          <p className="mt-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">{apiError}</p>
        ) : null}

        {history.length === 0 ? (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {suggestions.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => void ask(s.prompt)}
                className="rounded-xl border border-white/[0.06] bg-[#111215]/90 px-4 py-3 text-start text-sm text-white/95 shadow-sm transition-all duration-200 hover:border-[#22D3EE]/35 hover:bg-[rgba(34,211,238,0.06)] hover:shadow-[0_0_24px_rgba(34,211,238,0.08)] active:scale-[0.99]"
              >
                <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#52525B]">{s.label}</span>
                <span className="mt-1 block text-[13px] font-medium text-zinc-200">Tap to ask</span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-5 max-h-[min(420px,52vh)] space-y-3 overflow-y-auto pe-1">
          {history.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={cn(
                "max-w-[min(92%,28rem)] rounded-2xl px-4 py-3 text-sm shadow-sm transition-[transform,box-shadow] duration-200",
                m.role === "user"
                  ? "chat-bubble-user ms-auto rounded-br-md border border-[rgba(34,211,238,0.22)] bg-gradient-to-br from-[rgba(34,211,238,0.14)] to-[rgba(34,211,238,0.06)] text-white"
                  : "chat-bubble-ai me-auto rounded-bl-md border border-white/[0.07] bg-[#111215]/95 text-[#D4D4D8]"
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
                <span className="ms-1 inline-block animate-pulse text-[#22D3EE]" aria-hidden>
                  ▋
                </span>
              ) : null}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {showFollowUps ? (
          <div className="relative mt-4 flex flex-wrap gap-2">
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
                onClick={() => void ask(COACH_FOLLOW_UP_PROMPTS[k])}
                className="rounded-full border border-white/[0.08] bg-[#15171c] px-3 py-1.5 text-xs font-medium text-zinc-200 transition-all hover:border-[#22D3EE]/40 hover:text-white active:scale-[0.98]"
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}

        <form
          className="relative mt-5 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!message.trim() || loading || thinking) return;
            void ask(message.trim());
          }}
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about meals, sessions, or your plan…"
            className="tj-chat-input-premium min-h-11 flex-1 rounded-xl border border-white/[0.08] bg-[#0E1014]/95 px-4 text-sm text-white outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[#52525B] focus-visible:border-[#22D3EE]/55 focus-visible:ring-2 focus-visible:ring-[#22D3EE]/15"
          />
          <button
            type="submit"
            disabled={loading || thinking}
            className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#22D3EE_0%,#0EA5E9_100%)] px-4 text-sm font-bold text-[#0A0A0B] shadow-[0_0_20px_rgba(34,211,238,0.22)] transition-[transform,filter,box-shadow] duration-200 hover:brightness-110 hover:shadow-[0_0_28px_rgba(34,211,238,0.28)] active:scale-[0.96] disabled:pointer-events-none disabled:opacity-45"
          >
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
