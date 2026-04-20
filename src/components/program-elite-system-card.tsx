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
    <div className="reveal-section relative overflow-hidden rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-[#0E1218]/95 via-[#0B0D11]/95 to-[#12101c]/90 p-6 shadow-[0_0_0_1px_rgba(167,139,250,0.06),0_28px_80px_-40px_rgba(0,0,0,0.85)] sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 0% 0%, rgba(34,211,238,0.08), transparent 55%), radial-gradient(ellipse 55% 45% at 100% 100%, rgba(167,139,250,0.07), transparent 50%)"
        }}
        aria-hidden
      />
      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300/90">{labels.badge}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">{labels.title}</h2>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-500 sm:text-sm">{labels.subtitle}</p>
        <dl className="mt-8 grid gap-6 sm:grid-cols-2">
          {rows.map(({ key, labelKey }) => (
            <div key={key} className="rounded-xl border border-white/[0.06] bg-black/25 p-4 backdrop-blur-sm transition-colors duration-200 hover:border-cyan-400/20">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{labels[labelKey]}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-zinc-200">{meta[key]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
