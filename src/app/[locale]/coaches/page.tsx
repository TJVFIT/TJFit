import { Search } from "lucide-react";

import { AiCoachMatcher } from "@/components/ai-coach-matcher";
import { CoachCard, SectionHeading } from "@/components/ui";
import { coaches } from "@/lib/content";
import { Locale, isLocale } from "@/lib/i18n";

const filterGroups = {
  goal: ["Fat loss", "Muscle", "Rehab", "Sports"],
  specialty: ["Fat loss", "Bodybuilding", "Performance", "Nutrition", "Rehab"],
  price: ["0-800", "800-1200", "1200-1600", "1600+"],
  language: ["English", "Turkish", "Arabic"],
  country: ["Turkey", "UAE", "Qatar", "Global"],
  rating: ["4.5+", "4.8+", "5.0"],
  availability: ["Today", "Tomorrow", "This week"]
};

export default function CoachesPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  const locale = params.locale as Locale;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Find a Coach"
        title="Discover elite coaches with advanced filtering."
        copy="Designed like a premium marketplace: clean filters, fast scan patterns, and coach cards built to convert."
      />

      <div className="mt-10">
        <AiCoachMatcher locale={locale} />
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="glass-panel h-fit rounded-[28px] p-6">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
            <Search className="h-4 w-4" />
            Search coach, specialty, or language
          </div>

          <div className="mt-8 space-y-6">
            {Object.entries(filterGroups).map(([group, options]) => (
              <div key={group}>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{group}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {options.map((option) => (
                    <button
                      key={option}
                      className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-accent/40 hover:bg-white/5"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          <div className="glass-panel flex flex-col gap-4 rounded-[28px] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-zinc-400">Showing {coaches.length} premium coaches</p>
              <p className="mt-2 text-2xl font-semibold text-white">Smart coach discovery with AI ranking.</p>
              <p className="mt-2 text-sm text-zinc-400">
                Ranking uses goal fit, specialty, language, rating, success rate, availability, and price.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-white">Featured</button>
              <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-white">Top rated</button>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {coaches.map((coach) => (
              <CoachCard key={coach.slug} coach={coach} href={`/${locale}/coaches/${coach.slug}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
