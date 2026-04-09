"use client";

import { useEffect, useState } from "react";

import type { QuizAnswers, TJAIMetrics, TJAIPlan } from "@/lib/tjai-types";
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
  const [conversationId, setConversationId] = useState<string>("");
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    setConversationId(crypto.randomUUID());
  }, []);

  const suggestions = [
    { label: "📋 Explain my plan", prompt: "Can you give me an overview of my TJAI plan and explain the main principles?" },
    { label: "🍌 What to eat before training?", prompt: "What should I eat before my workout, and when should I eat it?" },
    { label: "❌ I missed a workout", prompt: "I missed yesterday's workout. What should I do — make it up or skip it?" },
    { label: "🔄 Swap a meal", prompt: "Can you suggest an alternative for one of my meals? I'll tell you which one." },
    { label: "🦵 I have knee pain", prompt: "I'm experiencing knee pain. Which exercises should I avoid and what are safe alternatives?" },
    { label: "📈 How do I break a plateau?", prompt: "I've been stuck at the same weight for 2 weeks. What changes should I make to break through?" }
  ];

  const ask = async (text: string) => {
    if (coreLimited) {
      const limitRes = await fetch("/api/tjai/trial-consume-message", { method: "POST" });
      if (!limitRes.ok) {
        onLimitReached?.();
        return;
      }
    }
    const nextHistory: ChatMessage[] = [...history, { role: "user", content: text }, { role: "assistant", content: "" }];
    setHistory(nextHistory);
    setLoading(true);
    setMessage("");
    setApiError(null);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 35000);
    try {
      const response = await fetch("/api/tjai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId }),
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
      setHistory((prev) => [...prev.slice(0, -1), { role: "assistant", content: assistantText || "I could not respond right now. Please try again." }]);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setApiError("TJAI request timed out. Please try again.");
      }
      setHistory((prev) => [...prev.slice(0, -1), { role: "assistant", content: "I could not respond right now. Please try again." }]);
    } finally {
      window.clearTimeout(timer);
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-[#1E2028] bg-[#111215] p-5">
      <h3 className="text-lg font-semibold text-white">Ask TJAI Anything About Your Plan</h3>
      <p className="mt-1 text-sm text-[#A1A1AA]">Your AI coach knows your exact plan. Ask anything.</p>
      {apiError ? <p className="mt-2 text-xs text-[#F87171]">{apiError}</p> : null}

      {history.length === 0 ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {suggestions.map((s) => (
            <button key={s.label} type="button" onClick={() => ask(s.prompt)} className="rounded-xl border border-[#1E2028] bg-[#111215] px-4 py-3 text-start text-sm text-white transition-colors duration-150 hover:border-[#22D3EE] hover:bg-[rgba(34,211,238,0.04)]">
              {s.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 max-h-[400px] space-y-2 overflow-y-auto">
        {history.map((m, i) => (
          <div
            key={`${m.role}-${i}`}
            className={cn(
              "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6",
              m.role === "user"
                ? "ms-auto rounded-br-md border border-[rgba(34,211,238,0.2)] bg-[rgba(34,211,238,0.1)] text-white"
                : "me-auto rounded-bl-md border border-[#1E2028] bg-[#111215] text-[#D4D4D8]"
            )}
          >
            {m.content}
            {loading && i === history.length - 1 ? <span className="ms-1 inline-block animate-pulse text-[#22D3EE]">|</span> : null}
          </div>
        ))}
      </div>

      <form
        className="mt-4 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!message.trim() || loading) return;
          void ask(message.trim());
        }}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about your meals, exercises, or plan..."
          className="min-h-10 flex-1 rounded-xl border border-[#1E2028] bg-[#111215] px-3 text-sm text-white outline-none focus:border-[#22D3EE]"
        />
        <button type="submit" disabled={loading} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#22D3EE] font-bold text-[#09090B] disabled:opacity-50">
          →
        </button>
      </form>
    </section>
  );
}

