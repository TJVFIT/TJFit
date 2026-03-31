"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Locale } from "@/lib/i18n";
import { useAuth } from "@/components/auth-provider";
import { getGuestPopupCopy } from "@/lib/launch-copy";

type Stage = "hidden" | "entry" | "marketing" | "email";

const ENTRY_DONE_KEY = "tjfit_entry_choice_done";
const MARKETING_FLAG_KEY = "tjfit_show_marketing_prompt";
const MARKETING_DONE_KEY = "tjfit_marketing_prompt_done";

export function GuestOnboardingPopup({ locale }: { locale: Locale }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [stage, setStage] = useState<Stage>("hidden");
  const [email, setEmail] = useState("");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const copy = getGuestPopupCopy(locale);

  useEffect(() => {
    if (loading) return;
    const isAuthRoute =
      pathname === `/${locale}/login` ||
      pathname === `/${locale}/signup` ||
      pathname === `/${locale}/admin`;

    if (isAuthRoute) {
      setStage("hidden");
      return;
    }

    if (user) {
      setStage("hidden");
      return;
    }

    const entryDone = localStorage.getItem(ENTRY_DONE_KEY) === "1";
    const marketingFlag = localStorage.getItem(MARKETING_FLAG_KEY) === "1";
    const marketingDone = localStorage.getItem(MARKETING_DONE_KEY) === "1";

    if (marketingFlag && !marketingDone) {
      setStage("marketing");
      return;
    }

    if (!entryDone) {
      setStage("entry");
      return;
    }

    setStage("hidden");
  }, [user, loading, locale, pathname]);

  const markMarketingDone = () => {
    localStorage.setItem(MARKETING_DONE_KEY, "1");
    localStorage.removeItem(MARKETING_FLAG_KEY);
    setStage("hidden");
    setMessage(null);
  };

  const chooseCreateAccount = () => {
    localStorage.setItem(ENTRY_DONE_KEY, "1");
    localStorage.setItem(MARKETING_FLAG_KEY, "1");
    setStage("hidden");
    router.push(`/${locale}/signup?from=welcome`);
  };

  const chooseViewWebsite = () => {
    localStorage.setItem(ENTRY_DONE_KEY, "1");
    localStorage.setItem(MARKETING_FLAG_KEY, "1");
    setStage("marketing");
  };

  const subscribeNewsletter = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setMessage(copy.invalidEmail);
      return;
    }

    setWorking(true);
    setMessage(null);
    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: cleanEmail,
        locale,
        source: "guest-onboarding"
      })
    });
    const data = await res.json().catch(() => ({}));
    setWorking(false);
    if (!res.ok) {
      setMessage(data.error ?? copy.subscribeFailed);
      return;
    }
    markMarketingDone();
  };

  if (stage === "hidden") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 px-4">
      <div className="glass-panel w-full max-w-lg rounded-[28px] p-6">
        {stage === "entry" && (
          <>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{copy.welcome}</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{copy.entryTitle}</h2>
            <p className="mt-3 text-sm text-zinc-400">
              {copy.entrySubtitle}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={chooseCreateAccount}
                className="gradient-button rounded-full px-5 py-2.5 text-sm font-medium text-white"
              >
                {copy.createAccount}
              </button>
              <button
                onClick={chooseViewWebsite}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white hover:bg-white/5"
              >
                {copy.viewWebsite}
              </button>
            </div>
          </>
        )}

        {stage === "marketing" && (
          <>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{copy.stayUpdated}</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{copy.marketingTitle}</h2>
            <p className="mt-3 text-sm text-zinc-400">
              {copy.marketingSubtitle}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setStage("email")}
                className="gradient-button rounded-full px-5 py-2.5 text-sm font-medium text-white"
              >
                {copy.yesSignMeUp}
              </button>
              <button
                onClick={markMarketingDone}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white hover:bg-white/5"
              >
                {copy.noThanks}
              </button>
            </div>
          </>
        )}

        {stage === "email" && (
          <>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{copy.emailSignup}</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{copy.enterEmail}</h2>
            <p className="mt-3 text-sm text-zinc-400">{copy.emailSubtitle}</p>
            <input
              className="input mt-4"
              type="email"
              placeholder={copy.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {message && <p className="mt-2 text-sm text-zinc-300">{message}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={subscribeNewsletter}
                disabled={working}
                className="gradient-button rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                {working ? copy.submitting : copy.subscribe}
              </button>
              <button
                onClick={markMarketingDone}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white hover:bg-white/5"
              >
                {copy.skip}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
