"use client";

import { useState } from "react";

import type { QuizAnswers, TJAIMetrics, TJAIPlan } from "@/lib/tjai-types";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function TJAIChat({
  plan,
  metrics,
  answers,
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

  const suggestions = [
    "Can I replace chicken with beef?",
    "What if I miss a training day?",
    "Is my plan right for my goal?",
    "Can I eat out and stay on track?"
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
    try {
      const response = await fetch("/api/tjai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, planContext: plan, metricsContext: metrics, answersContext: answers, history })
      });
      if (!response.ok || !response.body) throw new Error("Chat request failed");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setHistory((prev) => [...prev.slice(0, -1), { role: "assistant", content: acc }]);
      }
    } catch {
      setHistory((prev) => [...prev.slice(0, -1), { role: "assistant", content: "I could not respond right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-[#1E2028] bg-[#111215] p-5">
      <h3 className="text-lg font-semibold text-white">Ask TJAI Anything About Your Plan</h3>
      <p className="mt-1 text-sm text-[#A1A1AA]">Your AI coach knows your exact plan. Ask anything.</p>

      {history.length === 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s} type="button" onClick={() => ask(s)} className="rounded-full border border-[#1E2028] px-3 py-1.5 text-xs text-[#A1A1AA] hover:border-[#22D3EE] hover:text-white">
              {s}
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

