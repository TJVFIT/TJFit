"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Locale } from "@/lib/i18n";
import { useAuth } from "@/components/auth-provider";

type Stage = "hidden" | "entry" | "marketing" | "email";

const ENTRY_DONE_KEY = "tjfit_entry_choice_done";
const MARKETING_FLAG_KEY = "tjfit_show_marketing_prompt";
const MARKETING_DONE_KEY = "tjfit_marketing_prompt_done";

export function GuestOnboardingPopup({ locale }: { locale: Locale }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("hidden");
  const [email, setEmail] = useState("");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
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
  }, [user, loading]);

  const markMarketingDone = () => {
    localStorage.setItem(MARKETING_DONE_KEY, "1");
    localStorage.removeItem(MARKETING_FLAG_KEY);
    setStage("hidden");
    setMessage(null);
  };

  const chooseCreateAccount = () => {
    localStorage.setItem(ENTRY_DONE_KEY, "1");
    localStorage.setItem(MARKETING_FLAG_KEY, "1");
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
      setMessage("Please enter a valid email.");
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
      setMessage(data.error ?? "Could not subscribe.");
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
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Welcome</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Create account or view website?</h2>
            <p className="mt-3 text-sm text-zinc-400">
              Create an account for programs, progress tracking, and secure coach chat. You can also browse first.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={chooseCreateAccount}
                className="gradient-button rounded-full px-5 py-2.5 text-sm font-medium text-white"
              >
                Create account
              </button>
              <button
                onClick={chooseViewWebsite}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white hover:bg-white/5"
              >
                View website
              </button>
            </div>
          </>
        )}

        {stage === "marketing" && (
          <>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Stay Updated</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Want discount and feature emails?</h2>
            <p className="mt-3 text-sm text-zinc-400">
              Get discount alerts and announcements when new TJFit features and programs are released.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setStage("email")}
                className="gradient-button rounded-full px-5 py-2.5 text-sm font-medium text-white"
              >
                Yes, sign me up
              </button>
              <button
                onClick={markMarketingDone}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white hover:bg-white/5"
              >
                No thanks
              </button>
            </div>
          </>
        )}

        {stage === "email" && (
          <>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Email Signup</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Enter your email</h2>
            <p className="mt-3 text-sm text-zinc-400">We will send discounts and updates for new TJFit features.</p>
            <input
              className="input mt-4"
              type="email"
              placeholder="you@example.com"
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
                {working ? "Submitting..." : "Subscribe"}
              </button>
              <button
                onClick={markMarketingDone}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white hover:bg-white/5"
              >
                Skip
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
