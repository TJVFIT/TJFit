"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "tjai";
  text: string;
  delay: number;
};

const SEQUENCES: Record<Locale, Message[]> = {
  en: [
    { role: "user", text: "I want to lose 10kg in 12 weeks", delay: 0 },
    { role: "tjai", text: "Based on your TDEE of 2,650 kcal, your target is 2,150 kcal/day. With 4 training days and a structured split, you'll hit that goal comfortably.", delay: 1200 },
    { role: "user", text: "What should I eat before training?", delay: 4500 },
    { role: "tjai", text: "30 min before: 30g protein + 40g fast carbs. Banana + protein shake works perfectly. Keep fat low — it slows gastric emptying.", delay: 5700 },
  ],
  tr: [
    { role: "user", text: "12 haftada 10 kg vermek istiyorum", delay: 0 },
    { role: "tjai", text: "TDEE'n 2,650 kcal olduğuna göre günlük hedefin 2,150 kcal. 4 antrenman günüyle bu hedefe rahatça ulaşırsın.", delay: 1200 },
    { role: "user", text: "Antrenmandan önce ne yemeliyim?", delay: 4500 },
    { role: "tjai", text: "30 dk önce: 30g protein + 40g hızlı karbonhidrat. Muz + protein shake mükemmel çalışır.", delay: 5700 },
  ],
  ar: [
    { role: "user", text: "أريد خسارة 10 كغ في 12 أسبوع", delay: 0 },
    { role: "tjai", text: "بناءً على TDEE الخاص بك البالغ 2,650 سعرة، هدفك اليومي هو 2,150 سعرة. مع 4 أيام تدريب ستصل بسهولة.", delay: 1200 },
    { role: "user", text: "ماذا آكل قبل التمرين؟", delay: 4500 },
    { role: "tjai", text: "قبل 30 دقيقة: 30غ بروتين + 40غ كربوهيدرات سريعة. موزة + مخفوق بروتين مثالي.", delay: 5700 },
  ],
  es: [
    { role: "user", text: "Quiero perder 10kg en 12 semanas", delay: 0 },
    { role: "tjai", text: "Con tu TDEE de 2,650 kcal, tu objetivo es 2,150 kcal/día. Con 4 días de entrenamiento llegarás sin problemas.", delay: 1200 },
    { role: "user", text: "¿Qué como antes de entrenar?", delay: 4500 },
    { role: "tjai", text: "30 min antes: 30g proteína + 40g carbos rápidos. Plátano + batido de proteínas funciona perfectamente.", delay: 5700 },
  ],
  fr: [
    { role: "user", text: "Je veux perdre 10kg en 12 semaines", delay: 0 },
    { role: "tjai", text: "Avec ton TDEE de 2 650 kcal, ton objectif est 2 150 kcal/jour. Avec 4 jours d'entraînement tu y arrives facilement.", delay: 1200 },
    { role: "user", text: "Que manger avant l'entraînement ?", delay: 4500 },
    { role: "tjai", text: "30 min avant : 30g protéines + 40g glucides rapides. Banane + shake protéiné, c'est parfait.", delay: 5700 },
  ],
};

const COPY: Record<Locale, { badge: string; title: string; sub: string; cta: string }> = {
  en: { badge: "TJAI — YOUR AI COACH", title: "Real answers. In seconds.", sub: "Ask anything about your plan, nutrition, or training. TJAI knows your data.", cta: "Preview TJAI →" },
  tr: { badge: "TJAI — YAPAY ZEKA KOÇUN", title: "Gerçek cevaplar. Saniyeler içinde.", sub: "Plan, beslenme veya antrenman hakkında her şeyi sor.", cta: "TJAI Önizleme →" },
  ar: { badge: "TJAI — مدربك الذكي", title: "إجابات حقيقية. في ثوانٍ.", sub: "اسأل عن أي شيء في خطتك وتغذيتك وتدريبك.", cta: "معاينة TJAI →" },
  es: { badge: "TJAI — TU COACH IA", title: "Respuestas reales. En segundos.", sub: "Pregunta cualquier cosa sobre tu plan, nutrición o entrenamiento.", cta: "Vista previa TJAI →" },
  fr: { badge: "TJAI — VOTRE COACH IA", title: "Des réponses réelles. En secondes.", sub: "Demandez n'importe quoi sur votre plan, nutrition ou entraînement.", cta: "Aperçu TJAI →" },
};

function useTypewriter(text: string, speed = 28) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

function TJAIMessage({ msg, active }: { msg: Message; active: boolean }) {
  const { displayed, done } = useTypewriter(active && msg.role === "tjai" ? msg.text : "", 22);

  if (!active) return null;

  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[rgba(34,211,238,0.12)] border border-[rgba(34,211,238,0.2)] px-4 py-2.5 text-sm text-white">
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(34,211,238,0.15)] text-[#22D3EE]">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-[#1E2028] bg-[#111215] px-4 py-2.5 text-sm text-[#D4D4D8]">
        {displayed}
        {!done && <span className="cursor-blink ml-0.5 inline-block w-[2px] h-[14px] bg-[#22D3EE] align-middle" />}
      </div>
    </div>
  );
}

export function TJAITypingShowcase({ locale }: { locale: Locale }) {
  const messages = SEQUENCES[locale] ?? SEQUENCES.en;
  const copy = COPY[locale] ?? COPY.en;
  const [visibleCount, setVisibleCount] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { inView.current = entry.isIntersecting; },
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setVisibleCount(0);
      await new Promise(r => setTimeout(r, 800));

      for (let i = 0; i < messages.length; i++) {
        if (cancelled) return;
        await new Promise(r => setTimeout(r, messages[i].delay - (messages[i - 1]?.delay ?? 0)));
        if (cancelled) return;
        setVisibleCount(i + 1);
        // Wait for typewriter to finish (~text.length * 22ms + buffer)
        if (messages[i].role === "tjai") {
          await new Promise(r => setTimeout(r, messages[i].text.length * 22 + 1000));
        }
      }

      // Restart cycle
      await new Promise(r => setTimeout(r, 3000));
      if (!cancelled) setCycleKey(k => k + 1);
    };

    void run();
    return () => { cancelled = true; };
  }, [cycleKey, messages]);

  return (
    <section className="border-y border-[#1E2028] bg-[#09090B] px-6 py-16 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: copy */}
          <div>
            <span className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
              {copy.badge}
            </span>
            <h2 className="mt-5 text-3xl font-extrabold text-white sm:text-4xl">{copy.title}</h2>
            <p className="mt-3 max-w-md text-base text-[#A1A1AA]">{copy.sub}</p>
            <a
              href={`/${locale}/ai`}
              className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#22D3EE] px-7 py-3 text-sm font-bold text-[#09090B] transition hover:bg-white"
            >
              {copy.cta}
            </a>
          </div>

          {/* Right: chat mock */}
          <div
            ref={containerRef}
            className="rounded-2xl border border-[#1E2028] bg-[#0D0F12] p-5"
          >
            {/* Header */}
            <div className="mb-4 flex items-center gap-2 border-b border-[#1E2028] pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(34,211,238,0.15)]">
                <Sparkles className="h-3.5 w-3.5 text-[#22D3EE]" />
              </div>
              <span className="text-sm font-semibold text-white">TJAI</span>
              <span className="ml-auto flex items-center gap-1.5 text-xs text-[#22C55E]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                Online
              </span>
            </div>

            {/* Messages */}
            <div key={cycleKey} className="min-h-[160px] space-y-3">
              {messages.map((msg, i) => (
                <TJAIMessage key={`${cycleKey}-${i}`} msg={msg} active={i < visibleCount} />
              ))}
            </div>

            {/* Input mock */}
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#1E2028] bg-[#111215] px-4 py-2.5">
              <span className="flex-1 text-sm text-[#52525B]">Ask TJAI anything...</span>
              <span className="rounded-full bg-[#22D3EE] p-1.5">
                <svg className="h-3.5 w-3.5 text-[#09090B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
