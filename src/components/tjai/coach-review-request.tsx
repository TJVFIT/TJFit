"use client";

import { useState } from "react";

export function CoachReviewRequest({ planId }: { planId?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "ok" | "upgrade" | "err">("idle");

  const requestReview = async () => {
    setState("loading");
    const response = await fetch("/api/tjai/request-coach-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, isPro: true })
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
    <section className="rounded-2xl border border-[rgba(34,211,238,0.1)] bg-[linear-gradient(135deg,rgba(34,211,238,0.04),rgba(167,139,250,0.04))] p-8">
      <h3 className="text-xl font-semibold text-white">Want a Coach to Review Your Plan?</h3>
      <p className="mt-2 text-sm text-[#A1A1AA]">
        A certified TJFit coach will review your AI-generated plan, leave personalized comments, and suggest adjustments.
      </p>
      <ul className="mt-4 space-y-1 text-sm text-[#D4D4D8]">
        <li>✓ Reviewed within 48 hours</li>
        <li>✓ Personalized comments on your diet + program</li>
        <li>✓ One round of adjustments included</li>
      </ul>
      <div className="mt-4 inline-flex rounded-full border border-[#1E2028] px-3 py-1 text-xs text-[#A1A1AA]">Included with TJFit Pro</div>
      <div className="mt-4">
        <button type="button" onClick={() => void requestReview()} disabled={state === "loading"} className="rounded-full bg-[linear-gradient(135deg,#22D3EE,#0EA5E9)] px-5 py-2 text-sm font-bold text-[#09090B] disabled:opacity-50">
          {state === "loading" ? "Submitting..." : "Request Coach Review"}
        </button>
      </div>
      {state === "ok" ? <p className="mt-3 text-sm text-[#22D3EE]">Request submitted. A coach will review within 48 hours.</p> : null}
      {state === "upgrade" ? <p className="mt-3 text-sm text-[#A78BFA]">Upgrade to TJFit Pro to unlock coach review.</p> : null}
      {state === "err" ? <p className="mt-3 text-sm text-[#EF4444]">Could not submit your request right now.</p> : null}
    </section>
  );
}

