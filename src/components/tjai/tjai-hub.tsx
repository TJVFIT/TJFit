"use client";

import { FileText, MessageCircle, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { TJHeroStage } from "@/components/3d/hero-stage";
import { TJ_PALETTE } from "@/components/3d/palette";
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
  en: "Your adaptive fitness coach with plan memory",
  tr: "Plan hafizasina sahip uyarlanabilir fitness kocunuz",
  ar: "مدرب لياقة متكيّف مع ذاكرة للخطة",
  es: "Tu coach fitness adaptativo con memoria de plan",
  fr: "Votre coach fitness adaptatif avec memoire de plan"
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

  const content = useMemo(() => {
    if (tab === "my-plan") return <TJAIMyPlanTab locale={locale} />;
    if (tab === "chat") return <TJAIChatStandalone locale={locale} />;
    if (tab === "meal-swap") return <TJAIMealSwapTab locale={locale} />;
    return <TJAIProgressTab locale={locale} />;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, tab]);

  return (
    <div
      dir={direction}
      className="relative min-h-[100svh] overflow-hidden"
      style={{ background: TJ_PALETTE.obsidian }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.55]"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 70% 0%, rgba(34,211,238,0.12), transparent 60%), radial-gradient(ellipse 60% 40% at 10% 100%, rgba(143,164,196,0.05), transparent 55%)`
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 hidden opacity-40 lg:block"
        style={{ maskImage: "radial-gradient(ellipse 50% 40% at 85% 20%, black 30%, transparent 85%)" }}
        aria-hidden
      >
        <TJHeroStage variant="neural" speed={0.6} intensity={0.7} />
      </div>
      <div className="relative z-[1] flex min-h-[100svh] flex-col">
        <header className="sticky top-0 z-20 border-b border-divider bg-[rgba(9,9,11,0.88)] backdrop-blur-xl">
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-2 text-[28px] font-extrabold text-accent">
                  <Sparkles className="sparkle-pulse h-7 w-7" />
                  TJAI
                </p>
                <p className="text-[13px] text-muted">{HUB_SUBTITLE[locale]}</p>
              </div>
              <div className="flex items-center gap-3">
                {tier === "apex" ? (
                  <div className="apex-rotating-border">
                    <div className="apex-rotating-border-inner">
                      [{tierLabel(locale, tier).toUpperCase()}]
                    </div>
                  </div>
                ) : (
                  <span className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold",
                    tier === "pro"
                      ? "border-blue-400/35 bg-blue-400/10 text-blue-300"
                      : "border-[rgba(34,211,238,0.35)] bg-[rgba(34,211,238,0.12)] text-accent"
                  )}>
                    [{tierLabel(locale, tier).toUpperCase()}]
                  </span>
                )}
                {tier === "core" ? (
                  <a href={`/${locale}/membership`} className="text-xs font-semibold text-accent hover:text-white">
                    Upgrade →
                  </a>
                ) : null}
              </div>
            </div>
            <nav className="mt-4 flex flex-wrap gap-1 rounded-[10px] border border-divider bg-[#0D0F12] p-1.5">
              {tabItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    if (item.key === "meal-swap" && tier === "core") {
                      router.push(`/${locale}/membership?tier=pro`);
                      return;
                    }
                    setTabInUrl(item.key);
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm transition-colors duration-150",
                    tab === item.key
                      ? "bg-accent font-bold text-[#09090B]"
                      : "bg-transparent text-muted hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
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
          {content}
        </main>
      </div>
    </div>
  );
}
