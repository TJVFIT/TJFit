"use client";

import { useEffect, useRef, useState } from "react";

import { BadgeUnlockToast } from "@/components/tjai/badge-unlock-toast";
import { CoachMessageBody, CoachThinkingPulse } from "@/components/tjai/coach-message-body";
import { PersonaPicker } from "@/components/tjai/persona-picker";
import { SpeakerButton } from "@/components/tjai/speaker-button";
import { StreakBanner } from "@/components/tjai/streak-banner";
import { SuggestionCards } from "@/components/tjai/suggestion-cards";
import { UpgradePrompt, showUpgradePrompt } from "@/components/tjai/upgrade-prompt";
import type { QuizAnswers, TJAIMetrics, TJAIPlan } from "@/lib/tjai-types";
import { COACH_FOLLOW_UP_PROMPTS, getCoachThinkingDelayMs } from "@/lib/tjai/chat-client-utils";
import { cn } from "@/lib/utils";

import styles from "./tjai-chat.module.css";

type ChatMessage = { role: "user" | "assistant"; content: string };
type ChatLocale = "en" | "tr" | "ar" | "es" | "fr";

const CHAT_COPY: Record<ChatLocale, { suggestions: { label: string; prompt: string }[]; emptyPrompt: string; askTitle: string; askBody: string; memory: string; tapToAsk: string; refine: string; send: string }> = {
  en: {
    suggestions: [
      { label: "Plan overview", prompt: "Can you give me an overview of my TJAI plan and explain the main principles?" },
      { label: "Pre-workout fuel", prompt: "What should I eat before my workout, and when should I eat it?" },
      { label: "Missed a session", prompt: "I missed yesterday's workout. What should I do - make it up or skip it?" },
      { label: "Meal swap", prompt: "Can you suggest an alternative for one of my meals? I'll tell you which one." },
      { label: "Knee-friendly options", prompt: "I'm experiencing knee pain. Which exercises should I avoid and what are safe alternatives?" },
      { label: "Break a plateau", prompt: "I've been stuck at the same weight for 2 weeks. What changes should I make to break through?" }
    ],
    emptyPrompt: "Ask about meals, sessions, or your plan...",
    askTitle: "Ask TJAI",
    askBody: "Your coach knows your plan and your logged sessions. Ask with specifics for sharper answers.",
    memory: "Memory",
    tapToAsk: "Tap to ask",
    refine: "Refine",
    send: "Send"
  },
  tr: {
    suggestions: [
      { label: "Plan ozeti", prompt: "TJAI planimin genel ozetini ve ana prensiplerini anlatir misin?" },
      { label: "Antrenman oncesi", prompt: "Antrenmandan once ne yemeliyim ve ne zaman yemeliyim?" },
      { label: "Seansi kacirdim", prompt: "Dunku antrenmani kacirdim. Telafi mi etmeliyim yoksa atlamali miyim?" },
      { label: "Ogun degisimi", prompt: "Ogunlerimden biri icin alternatif onerebilir misin? Hangisi oldugunu soyleyecegim." },
      { label: "Diz dostu secenekler", prompt: "Diz agrisi yasiyorum. Hangi egzersizlerden kacinmaliyim ve guvenli alternatifler neler?" },
      { label: "Plateau kir", prompt: "2 haftadir ayni kilodayim. Bunu kirabilmek icin ne degistirmeliyim?" }
    ],
    emptyPrompt: "Ogunler, seanslar veya planin hakkinda sor...",
    askTitle: "TJAI'ye sor",
    askBody: "Kocun planini ve kayitli seanslarini bilir. Daha keskin cevaplar icin net sorular sor.",
    memory: "Hafiza",
    tapToAsk: "Sormak icin dokun",
    refine: "Netlestir",
    send: "Gonder"
  },
  ar: {
    suggestions: [
      { label: "ملخص الخطة", prompt: "هل يمكنك أن تعطيني ملخصاً لخطة TJAI وتشرح المبادئ الأساسية؟" },
      { label: "قبل التمرين", prompt: "ماذا آكل قبل التمرين ومتى آكله؟" },
      { label: "فاتتني حصة", prompt: "فاتني تمرين الأمس. هل أعوضه أم أتجاوزه؟" },
      { label: "بديل وجبة", prompt: "هل يمكنك اقتراح بديل لإحدى وجباتي؟ سأخبرك أي وجبة." },
      { label: "خيارات للركبة", prompt: "أشعر بألم في الركبة. ما التمارين التي أتجنبها وما البدائل الآمنة؟" },
      { label: "كسر الثبات", prompt: "ثبت وزني منذ أسبوعين. ما التغييرات التي تساعدني على التقدم؟" }
    ],
    emptyPrompt: "اسأل عن الوجبات أو الحصص أو خطتك...",
    askTitle: "اسأل TJAI",
    askBody: "مدربك يعرف خطتك وحصصك المسجلة. اسأل بتفاصيل لتحصل على إجابات أدق.",
    memory: "الذاكرة",
    tapToAsk: "اضغط للسؤال",
    refine: "حسّن السؤال",
    send: "إرسال"
  },
  es: {
    suggestions: [
      { label: "Resumen del plan", prompt: "Dame un resumen de mi plan TJAI y explica los principios principales." },
      { label: "Antes de entrenar", prompt: "Que deberia comer antes de entrenar y cuando deberia hacerlo?" },
      { label: "Sesion perdida", prompt: "Me perdi el entrenamiento de ayer. Deberia recuperarlo o saltarlo?" },
      { label: "Cambio de comida", prompt: "Puedes sugerir una alternativa para una de mis comidas? Te dire cual." },
      { label: "Opciones para rodilla", prompt: "Tengo dolor de rodilla. Que ejercicios debo evitar y que alternativas son seguras?" },
      { label: "Romper estancamiento", prompt: "Llevo 2 semanas con el mismo peso. Que cambios hago para avanzar?" }
    ],
    emptyPrompt: "Pregunta sobre comidas, sesiones o tu plan...",
    askTitle: "Pregunta a TJAI",
    askBody: "Tu coach conoce tu plan y tus sesiones registradas. Pregunta con detalles para respuestas mas precisas.",
    memory: "Memoria",
    tapToAsk: "Toca para preguntar",
    refine: "Refinar",
    send: "Enviar"
  },
  fr: {
    suggestions: [
      { label: "Resume du plan", prompt: "Peux-tu me donner un resume de mon plan TJAI et expliquer les principes principaux ?" },
      { label: "Avant entrainement", prompt: "Que dois-je manger avant mon entrainement, et quand ?" },
      { label: "Seance manquee", prompt: "J'ai manque l'entrainement d'hier. Dois-je le rattraper ou le sauter ?" },
      { label: "Remplacer un repas", prompt: "Peux-tu proposer une alternative pour l'un de mes repas ? Je te dirai lequel." },
      { label: "Options genou", prompt: "J'ai mal au genou. Quels exercices eviter et quelles alternatives sont sures ?" },
      { label: "Casser un plateau", prompt: "Je stagne au meme poids depuis 2 semaines. Quels changements faire ?" }
    ],
    emptyPrompt: "Pose une question sur tes repas, seances ou ton plan...",
    askTitle: "Demander a TJAI",
    askBody: "Ton coach connait ton plan et tes seances enregistrees. Donne des details pour des reponses plus nettes.",
    memory: "Memoire",
    tapToAsk: "Appuyer pour demander",
    refine: "Affiner",
    send: "Envoyer"
  }
};

function getChatLocale(): ChatLocale {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const copy = CHAT_COPY[getChatLocale()];

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
      stickToBottomRef.current = distance < 80;
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

    try {
      const res = await fetch("/api/tjai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text, conversationId })
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
            title: data.code === "expired" ? "Your free trial has ended" : "You hit your free messages",
            body: "TJAI is still here when you upgrade — unlimited coaching, voice replies, and adaptive weekly plans.",
            ctaHref: "/membership",
            ctaLabel: "Upgrade now"
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
            content: assistantText || "TJAI couldn't pick that up — mind asking again?"
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
          content: "Lost the connection mid-thought — try again?"
        };
        return updated;
      });
      setApiError("Briefly lost connection. Send it again.");
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
            <h3 className="text-lg font-semibold tracking-tight text-white">{copy.askTitle}</h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
              {copy.askBody}
            </p>
          </div>
          <a
            href={typeof window !== "undefined" ? `${window.location.pathname.replace(/\/$/, "")}/memory` : "./memory"}
            className="shrink-0 rounded-md border border-white/10 px-3 py-1.5 text-[11px] uppercase tracking-wide text-white/60 hover:bg-white/5"
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
                  title: "Get unlimited TJAI",
                  body: "Pro removes the message cap and unlocks voice, swaps, weekly adaptive plans, and coach handoff.",
                  ctaHref: "/membership",
                  ctaLabel: "See plans"
                })
              }
              className={cn(
                "text-[11px] font-medium uppercase tracking-[0.14em] transition",
                trialRemaining <= 1
                  ? "text-cyan-200 underline-offset-4 hover:underline"
                  : "text-white/60 hover:text-cyan-200"
              )}
              title="Free preview usage"
            >
              {trialRemaining <= 1
                ? `${trialRemaining} preview message left — unlock unlimited`
                : `${trialRemaining} of ${trialLimit} preview messages — go unlimited`}
            </button>
          ) : null}
        </div>
        {apiError ? (
          <p className="mt-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">{apiError}</p>
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
                className="group rounded-xl border border-white/[0.06] bg-surface/90 px-4 py-3.5 text-start text-sm text-white/95 shadow-sm transition-[border-color,background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-[rgba(34,211,238,0.06)] hover:shadow-[0_0_28px_rgba(34,211,238,0.1)] active:translate-y-0 active:scale-[0.99]"
              >
                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200/70 transition-colors group-hover:text-cyan-200">
                  {s.label}
                </span>
                <span className="mt-1.5 line-clamp-2 block text-[13px] font-medium leading-snug text-bright/95">
                  {s.prompt}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <div
          ref={threadRef}
          className="mt-5 max-h-[min(420px,52vh)] space-y-3 overflow-y-auto pe-1"
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
                  ? "chat-bubble-user ms-auto rounded-br-md border border-[rgba(34,211,238,0.22)] bg-gradient-to-br from-[rgba(34,211,238,0.14)] to-[rgba(34,211,238,0.06)] text-white"
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

        {showFollowUps ? (
          <div className="relative mt-4 flex flex-wrap gap-2">
            <span className="w-full text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">{copy.refine}</span>
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
                className="rounded-full border border-white/[0.08] bg-[#15171c] px-3 py-1.5 text-xs font-medium text-bright transition-all hover:border-accent/40 hover:text-white active:scale-[0.98]"
              >
                {label}
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
          <button
            type="submit"
            aria-label={copy.send}
            disabled={loading || thinking || !message.trim()}
            className="inline-flex h-10 min-w-[44px] items-center justify-center rounded-xl bg-[linear-gradient(135deg,#22D3EE_0%,#0EA5E9_100%)] px-4 text-sm font-bold text-[#0A0A0B] shadow-[0_0_20px_rgba(34,211,238,0.22)] transition-[transform,filter,box-shadow,opacity] duration-150 hover:brightness-110 hover:shadow-[0_0_28px_rgba(34,211,238,0.28)] active:scale-[0.94] disabled:pointer-events-none disabled:opacity-40"
          >
            {copy.send}
          </button>
        </form>
        <p className="mt-2 text-center text-[10px] uppercase tracking-[0.18em] text-dim">
          Enter to send · Shift + Enter for newline
        </p>
      </div>
    </section>
  );
}
