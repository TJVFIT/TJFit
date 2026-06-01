"use client";

import { useEffect, useState } from "react";

type Reason = "first_badge" | "first_plan" | "limit_reached" | "manual";

type Payload = {
  reason: Reason;
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
};

let listeners: Array<(p: Payload) => void> = [];

export function showUpgradePrompt(p: Payload) {
  // Dedupe per reason per session.
  try {
    const key = `tjai_upgrade_shown_${p.reason}`;
    if (typeof window !== "undefined" && window.sessionStorage.getItem(key)) return;
    if (typeof window !== "undefined") window.sessionStorage.setItem(key, "1");
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn(p));
}

export function UpgradePrompt() {
  const [payload, setPayload] = useState<Payload | null>(null);

  useEffect(() => {
    const handler = (p: Payload) => setPayload(p);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  if (!payload) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-purple-300/25 bg-gradient-to-br from-[#0D0F12] via-[#0D0F12] to-[rgba(168,85,247,0.08)] p-6 shadow-[0_30px_80px_rgba(168,85,247,0.2)]">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-purple-300/20 blur-3xl"
          aria-hidden
        />
        <button
          type="button"
          onClick={() => setPayload(null)}
          className="absolute right-3 top-3 text-white/50 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="relative">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-300">
            Unlock TJAI Pro
          </div>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-white">{payload.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/75">{payload.body}</p>

          <ul className="mt-5 space-y-2 text-sm text-white/85">
            <li className="flex items-center gap-2">
              <span className="text-purple-300">✓</span> Unlimited TJAI chat & coaching
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-300">✓</span> Adaptive plan suggestions every week
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-300">✓</span> Voice replies, meal swaps, grocery lists
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-300">✓</span> Long-term memory & coach handoff
            </li>
          </ul>

          <div className="mt-6 flex gap-2">
            <a
              href={payload.ctaHref}
              className="flex-1 rounded-md bg-purple-400 px-4 py-2.5 text-center text-sm font-semibold text-black transition hover:bg-purple-300"
            >
              {payload.ctaLabel}
            </a>
            <button
              type="button"
              onClick={() => setPayload(null)}
              className="rounded-md border border-white/15 px-4 py-2.5 text-sm text-white/70 transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-purple-300/40 hover:bg-purple-300/[0.05] hover:text-purple-100 hover:shadow-[0_0_14px_rgba(168,85,247,0.12)]"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
