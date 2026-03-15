"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { coaches, Goal } from "@/lib/content";
import { Locale } from "@/lib/i18n";
import { CoachMatchInput, rankCoaches } from "@/lib/recommendations";
import { formatCurrency } from "@/lib/utils";

const initialState: CoachMatchInput = {
  goal: "fat loss",
  experienceLevel: "beginner",
  language: "English",
  budget: 1300,
  trainingLocation: "home"
};

export function AiCoachMatcher({ locale }: { locale: Locale }) {
  const [form, setForm] = useState<CoachMatchInput>(initialState);

  const recommendations = useMemo(() => rankCoaches(coaches, form).slice(0, 3), [form]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="glass-panel rounded-[32px] p-6">
        <p className="text-lg font-semibold text-white">AI coach matching</p>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          The ranking engine scores coaches using goal fit, specialty relevance, rating, success rate,
          availability, language, and price.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <select
            className="input"
            value={form.goal}
            onChange={(event) => setForm((current) => ({ ...current, goal: event.target.value as Goal }))}
          >
            <option value="fat loss">Fat loss</option>
            <option value="muscle">Muscle</option>
            <option value="rehab">Rehab</option>
            <option value="sports">Sports</option>
          </select>
          <select
            className="input"
            value={form.experienceLevel}
            onChange={(event) =>
              setForm((current) => ({ ...current, experienceLevel: event.target.value }))
            }
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select
            className="input"
            value={form.language}
            onChange={(event) => setForm((current) => ({ ...current, language: event.target.value }))}
          >
            {["English", "Turkish", "Arabic", "Spanish", "French"].map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={String(form.budget)}
            onChange={(event) => setForm((current) => ({ ...current, budget: Number(event.target.value) }))}
          >
            {[900, 1100, 1300, 1500].map((amount) => (
              <option key={amount} value={amount}>
                Up to {formatCurrency(amount)}
              </option>
            ))}
          </select>
          <select
            className="input sm:col-span-2"
            value={form.trainingLocation}
            onChange={(event) =>
              setForm((current) => ({ ...current, trainingLocation: event.target.value }))
            }
          >
            {["home", "gym", "field", "clinic"].map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((coach, index) => (
          <div key={coach.slug} className="glass-panel rounded-[28px] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="badge">Top {index + 1}</span>
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-xs text-accent">
                    Match score {coach.score}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-semibold text-white">{coach.name}</p>
                <p className="mt-2 text-sm text-zinc-400">{coach.specialty}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {coach.reasons.map((reason) => (
                    <span key={reason} className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-sm text-zinc-400">Starting price</p>
                <p className="mt-1 text-xl font-semibold text-white">{formatCurrency(coach.price)}</p>
                <p className="mt-2 text-sm text-zinc-400">
                  {coach.rating} rating • {coach.successRate}% success
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/coaches/${coach.slug}`}
                className="gradient-button rounded-full px-5 py-2.5 text-sm font-medium text-white"
              >
                View coach
              </Link>
              <Link
                href={`/${locale}/checkout`}
                className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white transition hover:bg-white/5"
              >
                Book now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
