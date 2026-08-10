/**
 * Quiz step-funnel beacon: server-side validation + event-row shape +
 * structural pins that the quiz actually fires it.
 *
 * The endpoint is public (the quiz runs pre-signup), so the parser is the
 * only thing between the internet and the tjai_events stream — rejection
 * cases are pinned as exhaustively as the accept cases.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, it, expect } from "vitest";

import { toEventRow } from "@/lib/tjai/events";
import { parseQuizStepEvent } from "@/lib/tjai/quiz-step-events";

const VALID = {
  stepId: "s17_injury_areas",
  stepIndex: 12,
  totalSteps: 46,
  quizSessionId: "6f9619ff-8b86-d011-b42d-00c04fc964ff",
  locale: "tr"
};

describe("parseQuizStepEvent", () => {
  it("accepts a valid beacon and passes the locale through", () => {
    expect(parseQuizStepEvent(VALID)).toEqual(VALID);
  });

  it("lowercases an uppercase session uuid", () => {
    const parsed = parseQuizStepEvent({
      ...VALID,
      quizSessionId: VALID.quizSessionId.toUpperCase()
    });
    expect(parsed?.quizSessionId).toBe(VALID.quizSessionId);
  });

  it("accepts the review pseudo-step at stepIndex === totalSteps", () => {
    expect(
      parseQuizStepEvent({ ...VALID, stepId: "review", stepIndex: 46, totalSteps: 46 })
    ).not.toBeNull();
  });

  it("keeps supported locales and nulls unknown or non-string ones", () => {
    expect(parseQuizStepEvent({ ...VALID, locale: "ar" })?.locale).toBe("ar");
    // de/hi/id/pt/ru have message stubs but are not routing locales yet.
    expect(parseQuizStepEvent({ ...VALID, locale: "de" })?.locale).toBeNull();
    expect(parseQuizStepEvent({ ...VALID, locale: "xx" })?.locale).toBeNull();
    expect(parseQuizStepEvent({ ...VALID, locale: 42 })?.locale).toBeNull();
    expect(parseQuizStepEvent({ ...VALID, locale: undefined })?.locale).toBeNull();
  });

  it("rejects non-object bodies", () => {
    expect(parseQuizStepEvent(null)).toBeNull();
    expect(parseQuizStepEvent(undefined)).toBeNull();
    expect(parseQuizStepEvent("body")).toBeNull();
    expect(parseQuizStepEvent([VALID])).toBeNull();
    expect(parseQuizStepEvent({})).toBeNull();
  });

  it("rejects malformed step ids", () => {
    for (const stepId of [
      "S17_upper",
      "17_starts_with_digit",
      "step-with-dash",
      "step id",
      "<script>",
      "s",
      "s".repeat(65),
      42,
      null
    ]) {
      expect(parseQuizStepEvent({ ...VALID, stepId }), String(stepId)).toBeNull();
    }
  });

  it("rejects malformed session ids", () => {
    for (const quizSessionId of ["not-a-uuid", "6f9619ff8b86d011b42d00c04fc964ff", "", 42, null]) {
      expect(parseQuizStepEvent({ ...VALID, quizSessionId }), String(quizSessionId)).toBeNull();
    }
  });

  it("rejects out-of-range or non-integer indices", () => {
    expect(parseQuizStepEvent({ ...VALID, stepIndex: -1 })).toBeNull();
    expect(parseQuizStepEvent({ ...VALID, stepIndex: 1.5 })).toBeNull();
    expect(parseQuizStepEvent({ ...VALID, stepIndex: Number.NaN })).toBeNull();
    expect(parseQuizStepEvent({ ...VALID, stepIndex: "12" })).toBeNull();
    expect(parseQuizStepEvent({ ...VALID, stepIndex: 47 })).toBeNull(); // > totalSteps
    expect(parseQuizStepEvent({ ...VALID, totalSteps: 0 })).toBeNull();
    expect(parseQuizStepEvent({ ...VALID, totalSteps: 100 })).toBeNull();
    expect(parseQuizStepEvent({ ...VALID, totalSteps: 46.5 })).toBeNull();
  });
});

describe("quiz_step_reached event row", () => {
  it("builds a scalar-only row that keeps the funnel fields", () => {
    const row = toEventRow({
      event: "quiz_step_reached",
      userId: null,
      locale: "tr",
      metadata: {
        step_id: VALID.stepId,
        step_index: VALID.stepIndex,
        total_steps: VALID.totalSteps,
        quiz_session_id: VALID.quizSessionId
      }
    });
    expect(row.event).toBe("quiz_step_reached");
    expect(row.locale).toBe("tr");
    expect(row.metadata).toEqual({
      step_id: VALID.stepId,
      step_index: VALID.stepIndex,
      total_steps: VALID.totalSteps,
      quiz_session_id: VALID.quizSessionId
    });
  });
});

describe("structural pins", () => {
  const quizSrc = readFileSync(
    path.join(process.cwd(), "src", "components", "tjai", "tjai-quiz.tsx"),
    "utf8"
  );
  const routeSrc = readFileSync(
    path.join(process.cwd(), "src", "app", "api", "tjai", "quiz-events", "route.ts"),
    "utf8"
  );

  it("the quiz fires the beacon, dedupes per step id, and persists the session id", () => {
    expect(quizSrc).toContain('"/api/tjai/quiz-events"');
    expect(quizSrc).toMatch(/sentStepsRef\.current\.has\(/);
    expect(quizSrc).toMatch(/sentStepsRef\.current\.add\(/);
    expect(quizSrc).toMatch(/sessionId: quizSessionIdRef\.current/);
    // The review screen is part of the funnel.
    expect(quizSrc).toMatch(/stepId: "review"/);
  });

  it("the route validates, rate-limits, and records through the shared event API", () => {
    expect(routeSrc).toMatch(/parseQuizStepEvent/);
    expect(routeSrc).toMatch(/rateLimit\(/);
    expect(routeSrc).toMatch(/recordTjaiEvent\(/);
    expect(routeSrc).toMatch(/"quiz_step_reached"/);
  });
});
