import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { scanSource } from "../scripts/i18n/check-hardcoded-ui";
import { locales } from "@/lib/i18n";
import { getTjaiCopy } from "@/lib/tjai-copy";
import { RESULT_VIEW_COPY, PROGRESS_VIEW_COPY, localizedLogDate, localizedPlanDuration } from "@/lib/tjai/result-view-copy";
import { validateAdultIntake } from "@/lib/tjai/intake-validation";
import { compactContext, expandCompactPlan } from "@/lib/tjai/compact-plan";

vi.mock("react-chartjs-2", () => ({
  Line: ({ data }: { data: unknown }) => createElement("pre", { "data-chart": "line" }, JSON.stringify(data)),
  Doughnut: ({ data }: { data: unknown }) => createElement("pre", { "data-chart": "macros" }, JSON.stringify(data))
}));

import { TJAIResult } from "@/components/tjai/tjai-result";
import { ProgressView } from "@/components/progress-view";

function escaped(value: string) {
  return renderToStaticMarkup(createElement("span", null, value)).slice(6, -7);
}

describe("core TJAI result localization", () => {
  it.each(locales)("%s renders labels, charts, actions and saved exercises in the selected language", (locale) => {
    const validation = validateAdultIntake({ s1_age: 29, s1_height: 175, s1_weight: 80, s5_days: 4, s5_type: "home", s5_equipment: ["bodyweight"], s5_duration: 45, s12_diet_style: "balanced" }, locale);
    if (!validation.ok) throw new Error(validation.error);
    const answers = validation.answers;
    const { profile, allowed } = compactContext(answers);
    const { plan, metrics } = expandCompactPlan({
      days: Array.from({ length: profile.trainingDays }, () => allowed.slice(0, 4)),
      meals: Array.from({ length: Math.max(3, Math.min(5, profile.mealsPerDay)) }, (_, i) => [{ protein: "chicken", carbs: "rice" }, { protein: "fish", carbs: "potato" }, { protein: "eggs", carbs: "oats" }][i % 3])
    }, answers);
    const html = renderToStaticMarkup(createElement(TJAIResult, {
      locale, answers, plan, metrics, copy: getTjaiCopy(locale), generatedAt: "2026-09-12T12:00:00Z",
      onSave: async () => {}, onStartOver: () => {}, isSaving: false
    }));
    const copy = RESULT_VIEW_COPY[locale];
    expect(html).toContain(`<section dir="${locale === "ar" ? "rtl" : "ltr"}"`);
    for (const label of [copy.overview, copy.forecast, copy.baseline, copy.projected, copy.pdfDownload, copy.viewRecipe, copy.shareTitle, copy.downloadCard, copy.copyImage, ...copy.checkins]) {
      expect(html).toContain(escaped(label));
    }
    expect(html).toContain(escaped(`${copy.week} 0`));
    expect(html).toContain(escaped(plan.program.weeks[0].days[0].exercises[0].name));
    expect(html).toContain(escaped(localizedPlanDuration(metrics.timeToGoal, locale)));
    expect(html).not.toMatch(/We detected signs of adaptation|most people with your metabolism|First noticeable energy improvements|Visible body composition changes begin|No action/);
    if (locale !== "en") {
      expect(html).not.toContain("approximately ");
      expect(html).not.toContain("Download my plan");
    }
    expect(Object.keys(copy)).toEqual(Object.keys(RESULT_VIEW_COPY.en));
    expect(Object.keys(PROGRESS_VIEW_COPY[locale])).toEqual(Object.keys(PROGRESS_VIEW_COPY.en));
  });

  it.each(locales)("%s renders the progress wrapper without English action labels", (locale) => {
    const html = renderToStaticMarkup(createElement(ProgressView, { locale }));
    expect(html).toContain(`<div dir="${locale === "ar" ? "rtl" : "ltr"}"`);
    expect(html).not.toMatch(/Metrics saved|Workout logged|Milestone added|Milestone completed|Weight trend|Body fat trend/);
    expect(html).not.toContain("/api/");
  });

  it.each([
    "src/components/tjai/tjai-result.tsx",
    "src/components/progress-view.tsx",
    "src/components/tjai/tjai-progress-tab.tsx",
    "src/components/tjai/share-card-generator.tsx"
  ])("%s has no direct untranslated copy sinks", (file) => {
    expect(scanSource(readFileSync(file, "utf8"), file)).toEqual([]);
  });

  it.each(locales)("%s formats relative log dates and legacy generated durations", (locale) => {
    const now = new Date(2026, 8, 12, 22);
    expect(localizedLogDate("2026-09-12", locale, now)).toBe(new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(0, "day"));
    expect(localizedLogDate("2026-09-11", locale, now)).toBe(new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(-1, "day"));
    expect(localizedLogDate("2026-08-01", locale, now)).toBe(new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date("2026-08-01T12:00:00Z")));
    expect(localizedPlanDuration("approximately 12-16 weeks", locale)).toBe(RESULT_VIEW_COPY[locale].duration.replace("{value}", "12-16"));
  });

  it("preserves custom saved duration content and invalid-date text", () => {
    expect(localizedPlanDuration("Custom coach timeline", "tr")).toBe("Custom coach timeline");
    expect(localizedLogDate("unavailable", "ar")).toBe("unavailable");
  });
});
