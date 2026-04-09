"use client";

import { FileText, MessageCircle, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ParticleField } from "@/components/particle-field";
import { TJAIChatStandalone } from "@/components/tjai/tjai-chat-standalone";
import { TJAIMealSwapTab } from "@/components/tjai/tjai-meal-swap-tab";
import { TJAIMyPlanTab } from "@/components/tjai/tjai-my-plan-tab";
import { TJAIProgressTab } from "@/components/tjai/tjai-progress-tab";
import { getDirection, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type TabKey = "my-plan" | "chat" | "meal-swap" | "progress";

const TAB_ICONS: Record<TabKey, typeof FileText> = {
  "my-plan": FileText,
  chat: MessageCircle,
  "meal-swap": RefreshCw,
  progress: TrendingUp
};

const TAB_LABELS: Record<Locale, Record<TabKey, string>> = {
  en: { "my-plan": "My Plan", chat: "Chat", "meal-swap": "Meal Swap", progress: "Progress" },
  tr: { "my-plan": "Planim", chat: "Sohbet", "meal-swap": "Ogun Degistir", progress: "Ilerleme" },
  ar: { "my-plan": "خطتي", chat: "الدردشة", "meal-swap": "تبديل الوجبة", progress: "التقدم" },
  es: { "my-plan": "Mi Plan", chat: "Chat", "meal-swap": "Cambiar Comida", progress: "Progreso" },
  fr: { "my-plan": "Mon Plan", chat: "Chat", "meal-swap": "Changer le Repas", progress: "Progression" }
};

const HUB_SUBTITLE: Record<Locale, string> = {
  en: "Your AI-powered transformation coach",
  tr: "Yapay zeka destekli donusum kocunuz",
  ar: "مدرب التحول المدعوم بالذكاء الاصطناعي",
  es: "Tu coach de transformacion con IA",
  fr: "Votre coach de transformation propulse par IA"
};

function normalizeTab(raw: string | null): TabKey {
  if (raw === "chat" || raw === "meal-swap" || raw === "progress" || raw === "my-plan") return raw;
  return "my-plan";
}

function tierLabel(locale: Locale, tier: string) {
  if (tier === "apex") return "Apex";
  if (tier === "pro") return "Pro";
  if (locale === "ar") return "أساسي";
  if (locale === "tr") return "Cekirdek";
  if (locale === "es") return "Basico";
  if (locale === "fr") return "Essentiel";
  return "Core";
}

export function TJAIHub({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const direction = getDirection(locale);
  const [tier, setTier] = useState<"core" | "pro" | "apex">("core");
  const [tab, setTab] = useState<TabKey>(normalizeTab(searchParams.get("tab")));
  const tabItems = useMemo(
    () =>
      (Object.keys(TAB_LABELS[locale]) as TabKey[]).map((key) => ({
        key,
        label: TAB_LABELS[locale][key]
      })),
    [locale]
  );

  useEffect(() => {
    setTab(normalizeTab(searchParams.get("tab")));
  }, [searchParams]);

  useEffect(() => {
    void fetch("/api/tjai/trial-status", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.tier === "core" || data?.tier === "pro" || data?.tier === "apex") {
          setTier(data.tier);
        }
      })
      .catch(() => undefined);
  }, []);

  const setTabInUrl = (nextTab: TabKey) => {
    setTab(nextTab);
    const qs = new URLSearchParams(searchParams.toString());
    qs.set("tab", nextTab);
    router.replace(`${pathname}?${qs.toString()}`, { scroll: false });
  };

  const chatComingSoon = (
    <div className="flex min-h-[60svh] items-center justify-center">
      <div className="w-full max-w-lg rounded-2xl border border-[#1E2028] bg-[#111215] p-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(34,211,238,0.25)] bg-[rgba(34,211,238,0.08)]">
          <MessageCircle className="h-8 w-8 text-[#22D3EE]" style={{ filter: "drop-shadow(0 0 12px rgba(34,211,238,0.5))" }} />
        </div>
        <span className="inline-flex animate-pulse rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
          Coming Soon
        </span>
        <h2 className="mt-4 text-2xl font-bold text-white">TJAI Chat</h2>
        <p className="mt-2 text-sm text-[#A1A1AA]">Real-time AI coaching conversations are coming soon.</p>
        <ul className="mt-6 space-y-3 text-left">
          {[
            { icon: "💬", text: "Ask anything about fitness, nutrition, or your plan" },
            { icon: "🎤", text: "Voice input in Turkish, Arabic, and English" },
            { icon: "🧠", text: "TJAI remembers your preferences across sessions" }
          ].map((item) => (
            <li key={item.text} className="flex items-start gap-3 rounded-xl border border-[#1E2028] bg-[#0D0F12] px-4 py-3 text-sm text-[#D4D4D8]">
              <span className="text-base">{item.icon}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setTabInUrl("my-plan")}
          className="mt-6 text-sm font-semibold text-[#22D3EE] hover:text-white"
        >
          While you wait — try the TJAI Quiz →
        </button>
      </div>
    </div>
  );

  const content = useMemo(() => {
    if (tab === "my-plan") return <TJAIMyPlanTab locale={locale} />;
    if (tab === "chat") return null; // rendered below to access setTabInUrl
    if (tab === "meal-swap") return <TJAIMealSwapTab locale={locale} />;
    return <TJAIProgressTab locale={locale} />;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, tab]);

  return (
    <div dir={direction} className="relative min-h-[100svh] overflow-hidden bg-[#09090B]">
      <ParticleField className="pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative z-[1] flex min-h-[100svh] flex-col">
        <header className="sticky top-0 z-20 border-b border-[#1E2028] bg-[rgba(9,9,11,0.88)] backdrop-blur-xl">
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-2 text-[28px] font-extrabold text-[#22D3EE]">
                  <Sparkles className="h-7 w-7" />
                  TJAI
                </p>
                <p className="text-[13px] text-[#A1A1AA]">{HUB_SUBTITLE[locale]}</p>
              </div>
              <span className="rounded-full border border-[rgba(34,211,238,0.35)] bg-[rgba(34,211,238,0.15)] px-3 py-1 text-xs font-semibold text-[#22D3EE]">
                [{tierLabel(locale, tier).toUpperCase()}]
              </span>
              {tier === "core" ? (
                <a href={`/${locale}/membership?tier=apex`} className="text-xs font-semibold text-[#22D3EE] hover:text-white">
                  Upgrade →
                </a>
              ) : null}
            </div>
            <nav className="mt-4 flex flex-wrap gap-1 rounded-[10px] border border-[#1E2028] bg-[#0D0F12] p-1.5">
              {tabItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTabInUrl(item.key)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm transition-colors duration-150",
                    tab === item.key
                      ? "bg-[#22D3EE] font-bold text-[#09090B]"
                      : "bg-transparent text-[#A1A1AA] hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
                  )}
                >
                  {(() => {
                    const Icon = TAB_ICONS[item.key];
                    return <Icon className="h-4 w-4" />;
                  })()}
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
          {tab === "chat" ? chatComingSoon : content}
        </main>
      </div>
    </div>
  );
}
