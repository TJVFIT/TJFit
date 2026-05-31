"use client";

import { Feather, Flame, ThumbsUp, type LucideIcon } from "lucide-react";
import { useState } from "react";

import type { Locale } from "@/lib/i18n";
import { getWorkoutFeedbackCopy, type WorkoutFeedbackRating as Rating } from "@/lib/workout-feedback-copy";

const RATING_ICONS: Record<Rating, LucideIcon> = {
  too_easy: Feather,
  right: ThumbsUp,
  too_hard: Flame
};

// Adaptive feedback loop (master upgrade prompt 6.4) — drop this in
// any "workout complete" surface to capture a 1-tap rating that the
// TJAI weekly check-in flow consumes.
//
// Self-contained: no parent state, no callbacks required. POSTs to
// /api/tjai/feedback and shows a quiet "logged" confirmation. Dismiss
// is implicit — once submitted the prompt collapses to a one-line
// acknowledgement that pulls the eye back to the rest of the screen.

type State =
  | { kind: "idle" }
  | { kind: "submitting"; rating: Rating }
  | { kind: "ok"; rating: Rating }
  | { kind: "error" };

export function WorkoutFeedbackPrompt({
  locale,
  workoutLogId,
  context = "workout"
}: {
  locale: Locale;
  workoutLogId?: string;
  context?: "workout" | "meal" | "day" | "week";
}) {
  const copy = getWorkoutFeedbackCopy(locale);
  const [state, setState] = useState<State>({ kind: "idle" });

  const submit = async (rating: Rating) => {
    setState({ kind: "submitting", rating });
    try {
      const res = await fetch("/api/tjai/feedback", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, workoutLogId, context })
      });
      if (!res.ok) {
        setState({ kind: "error" });
        return;
      }
      setState({ kind: "ok", rating });
    } catch {
      setState({ kind: "error" });
    }
  };

  if (state.kind === "ok") {
    const ChosenIcon = RATING_ICONS[state.rating];
    return (
      <div className="rounded-2xl border border-divider bg-surface p-5">
        <p className="flex items-center text-sm text-bright">
          <ChosenIcon className="me-2 h-4 w-4 text-accent" aria-hidden />
          {copy.thanks}
        </p>
      </div>
    );
  }

  const ratings: Rating[] = ["too_easy", "right", "too_hard"];

  return (
    <div className="rounded-2xl border border-divider bg-surface p-5">
      <p className="text-sm font-semibold text-white">{copy.prompt}</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {ratings.map((rating) => {
          const opt = copy.options[rating];
          const OptIcon = RATING_ICONS[rating];
          const isSubmitting = state.kind === "submitting" && state.rating === rating;
          const disabled = state.kind === "submitting";
          return (
            <button
              key={rating}
              type="button"
              onClick={() => void submit(rating)}
              disabled={disabled}
              aria-busy={isSubmitting}
              className="inline-flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[12px] font-medium text-bright transition-colors duration-150 hover:border-accent/40 hover:bg-accent/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-progress disabled:opacity-60"
            >
              <OptIcon className="h-6 w-6 text-accent" aria-hidden />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
      {state.kind === "error" ? (
        <p className="mt-3 text-xs text-danger">{copy.retry}</p>
      ) : null}
    </div>
  );
}
