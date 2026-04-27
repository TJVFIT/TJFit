import type { ProgramEliteLabels, ProgramEliteMeta } from "@/lib/program-elite-meta";

const rows: Array<{ key: keyof ProgramEliteMeta; labelKey: keyof ProgramEliteLabels }> = [
  { key: "periodization", labelKey: "periodization" },
  { key: "weeklyLayout", labelKey: "weeklyLayout" },
  { key: "progressionModel", labelKey: "progressionModel" },
  { key: "volumeAndIntensity", labelKey: "volumeAndIntensity" },
  { key: "fatigueManagement", labelKey: "fatigueManagement" },
  { key: "recoveryIntegration", labelKey: "recoveryIntegration" },
  { key: "injuryPrevention", labelKey: "injuryPrevention" },
  { key: "personalization", labelKey: "personalization" },
  { key: "executionQuality", labelKey: "executionQuality" },
  { key: "smartProgression", labelKey: "smartProgression" }
];

export function ProgramEliteSystemCard({ meta, labels }: { meta: ProgramEliteMeta; labels: ProgramEliteLabels }) {
  return (
    <section className="reveal-section relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0C0D10]">
      <header className="border-b border-white/[0.06] px-6 py-5 sm:px-8 sm:py-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-accent">{labels.badge}</p>
        <h2 className="mt-2 font-display text-[22px] font-semibold tracking-tight text-white sm:text-[26px]">
          {labels.title}
        </h2>
        <p className="mt-2 max-w-2xl text-[13px] leading-[1.6] text-white/55 sm:text-sm">{labels.subtitle}</p>
      </header>
      <dl className="grid grid-cols-1 divide-y divide-white/[0.05] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        {rows.map(({ key, labelKey }, idx) => (
          <div
            key={key}
            className={`px-6 py-5 sm:px-8 ${idx >= 2 ? "sm:border-t sm:border-white/[0.05]" : ""}`}
          >
            <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
              {labels[labelKey]}
            </dt>
            <dd className="mt-2 text-[13px] leading-[1.55] text-white/85 sm:text-sm">{meta[key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
