"use client";

import { Sparkles } from "lucide-react";
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

const TAB_ITEMS: Array<{ key: TabKey; label: string }> = [
  { key: "my-plan", label: "My Plan" },
  { key: "chat", label: "Chat" },
  { key: "meal-swap", label: "Meal Swap" },
  { key: "progress", label: "Progress" }
];

function normalizeTab(raw: string | null): TabKey {
  if (raw === "chat" || raw === "meal-swap" || raw === "progress" || raw === "my-plan") return raw;
  return "my-plan";
}

function tierLabel(tier: string) {
  if (tier === "apex") return "Apex";
  if (tier === "pro") return "Pro";
  return "Core";
}

export function TJAIHub({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const direction = getDirection(locale);
  const [tier, setTier] = useState<"core" | "pro" | "apex">("core");
  const [tab, setTab] = useState<TabKey>(normalizeTab(searchParams.get("tab")));

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
    return <TJAIProgressTab />;
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
                <p className="text-[13px] text-[#A1A1AA]">Your AI-powered transformation coach</p>
              </div>
              <span className="rounded-full border border-[rgba(34,211,238,0.35)] bg-[rgba(34,211,238,0.15)] px-3 py-1 text-xs font-semibold text-[#22D3EE]">
                {tierLabel(tier)}
              </span>
            </div>
            <nav className="mt-4 flex flex-wrap gap-2">
              {TAB_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTabInUrl(item.key)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-colors",
                    tab === item.key
                      ? "border-b-2 border-[#22D3EE] bg-[rgba(34,211,238,0.08)] text-white"
                      : "text-[#A1A1AA] hover:text-white"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">{content}</main>
      </div>
    </div>
  );
}
