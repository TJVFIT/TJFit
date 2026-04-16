"use client";

import { useEffect, useRef, useState } from "react";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConversationId(crypto.randomUUID());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const suggestions = [
    { label: "📋 Explain my plan", prompt: "Can you give me an overview of my TJAI plan and explain the main principles?" },
    { label: "🍌 What to eat before training?", prompt: "What should I eat before my workout, and when should I eat it?" },
    { label: "❌ I missed a workout", prompt: "I missed yesterday's workout. What should I do — make it up or skip it?" },
    { label: "🔄 Swap a meal", prompt: "Can you suggest an alternative for one of my meals? I'll tell you which one." },
    { label: "🦵 I have knee pain", prompt: "I'm experiencing knee pain. Which exercises should I avoid and what are safe alternatives?" },
    { label: "📈 How do I break a plateau?", prompt: "I've been stuck at the same weight for 2 weeks. What changes should I make to break through?" }
  ];

  // Task 2E — streaming sendMessage
  const ask = async (text: string) => {
    if (coreLimited) {
      const limitRes = await fetch("/api/tjai/trial-consume-message", { method: "POST" });
      if (!limitRes.ok) {
        onLimitReached?.();
        return;
      }
    }

    // Add user message + empty assistant placeholder
    setHistory((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "" }
    ]);
    setMessage("");
    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch("/api/tjai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text, conversationId })
      });

      // Non-streaming fallback (domain guard / error JSON response)
      const contentType = res.headers.get("Content-Type") ?? "";
      if (contentType.includes("application/json")) {
        const data = await res.json().catch(() => ({})) as { message?: string; conversationId?: string };
        const assistantText = String(data?.message ?? "").trim();
        if (data?.conversationId && !conversationId) setConversationId(data.conversationId);
        setHistory((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantText || "I could not respond right now. Please try again." };
          return updated;
        });
        return;
      }

      // Streaming path
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
    }
  };

  return (
    <section className="rounded-xl border border-[#1E2028] bg-[#111215] p-5">
      <h3 className="text-lg font-semibold text-white">Ask TJAI Anything About Your Plan</h3>
      <p className="mt-1 text-sm text-[#A1A1AA]">Your AI coach knows your exact plan and your real logged data.</p>
      {apiError ? <p className="mt-2 text-xs text-[#F87171]">{apiError}</p> : null}

      {history.length === 0 ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {suggestions.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => void ask(s.prompt)}
              className="rounded-xl border border-[#1E2028] bg-[#111215] px-4 py-3 text-start text-sm text-white transition-colors duration-150 hover:border-[#22D3EE] hover:bg-[rgba(34,211,238,0.04)]"
            >
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
              "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 chat-bubble-enter",
              m.role === "user"
                ? "ms-auto rounded-br-md border border-[rgba(34,211,238,0.2)] bg-[rgba(34,211,238,0.1)] text-white"
                : "me-auto rounded-bl-md border border-[#1E2028] bg-[#111215] text-[#D4D4D8]"
            )}
          >
            {m.content || (loading && i === history.length - 1
              ? <span className="flex gap-1">
                  <span className="thinking-dot inline-block h-1.5 w-1.5 rounded-full bg-[#22D3EE]" style={{ animationDelay: "0ms" }} />
                  <span className="thinking-dot inline-block h-1.5 w-1.5 rounded-full bg-[#22D3EE]" style={{ animationDelay: "160ms" }} />
                  <span className="thinking-dot inline-block h-1.5 w-1.5 rounded-full bg-[#22D3EE]" style={{ animationDelay: "320ms" }} />
                </span>
              : null
            )}
            {loading && i === history.length - 1 && m.content ? (
              <span className="ms-0.5 inline-block animate-pulse text-[#22D3EE]">▋</span>
            ) : null}
          </div>
        ))}
        <div ref={messagesEndRef} />
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
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#22D3EE] font-bold text-[#09090B] disabled:opacity-50"
        >
          →
        </button>
      </form>
    </section>
  );
}
