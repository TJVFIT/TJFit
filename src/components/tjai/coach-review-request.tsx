"use client";

import { useState } from "react";

import { getCoachReviewRequestCopy } from "@/lib/coach-review-request-copy";
import type { Locale } from "@/lib/i18n";

export function CoachReviewRequest({ locale, planId }: { locale: Locale; planId?: string }) {
  const copy = getCoachReviewRequestCopy(locale);
  const [state, setState] = useState<"idle" | "loading" | "ok" | "upgrade" | "err">("idle");

  const requestReview = async () => {
    setState("loading");
    // Server now reads the user's subscription tier directly; no
    // client-supplied `isPro` flag needed (or trusted).
    const response = await fetch("/api/tjai/request-coach-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId })
    });
    if (response.status === 402) {
      setState("upgrade");
      return;
    }
    if (!response.ok) {
      setState("err");
      return;
    }
    setState("ok");
  };

  return (
    <section className="rounded-2xl border border-[rgba(34,211,238,0.1)] bg-[linear-gradient(135deg,rgba(34,211,238,0.04),rgba(14, 165, 233,0.04))] p-8">
      <h3 className="text-xl font-semibold text-white">{copy.title}</h3>
      <p className="mt-2 text-sm text-muted">{copy.description}</p>
      <ul className="mt-4 space-y-1 text-sm text-bright">
        {copy.bullets.map((bullet) => (
          <li key={bullet}>✓ {bullet}</li>
        ))}
      </ul>
      <div className="mt-4 inline-flex rounded-full border border-divider px-3 py-1 text-xs text-muted">{copy.included}</div>
      <div className="mt-4">
        <button type="button" onClick={() => void requestReview()} disabled={state === "loading"} className="rounded-full bg-[linear-gradient(135deg,#22D3EE,#0EA5E9)] px-5 py-2 text-sm font-bold text-[#09090B] disabled:opacity-50">
          {state === "loading" ? copy.submitting : copy.request}
        </button>
      </div>
      {state === "ok" ? <p className="mt-3 text-sm text-accent">{copy.success}</p> : null}
      {state === "upgrade" ? <p className="mt-3 text-sm text-accent-violet">{copy.upgrade}</p> : null}
      {state === "err" ? <p className="mt-3 text-sm text-danger">{copy.error}</p> : null}
    </section>
  );
}
