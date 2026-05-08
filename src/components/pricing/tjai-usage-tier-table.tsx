import type { Locale } from "@/lib/i18n";
import { getTjaiUsageTierCopy } from "@/lib/tjai-usage-tier-copy";

// Concrete TJAI usage tiering - Apple-style pricing-page table.
// Master prompt 1.3: subs unlock more *usage* of TJAI chat after the
// user has paid for a $8 plan, never the plan itself. This makes the
// distinction visible at a glance so visitors don't think Pro/Apex
// "include" plan generation.
//
// Server component - no interactivity needed; numbers are static.

export function TjaiUsageTierTable({ locale }: { locale: Locale }) {
  const copy = getTjaiUsageTierCopy(locale);
  return (
    <section className="mt-8 rounded-3xl border border-divider bg-surface p-6 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-premium">
        {copy.eyebrow}
      </p>
      <h2 className="mt-3 max-w-3xl font-display text-2xl font-bold leading-tight text-white sm:text-[32px]">
        {copy.title}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-[15px]">
        {copy.intro}
      </p>

      <div className="mt-7 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-divider">
              <th className="py-3 text-start text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
                {/* spacer */}
              </th>
              <th className="py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-bright">
                {copy.colOneTime}
              </th>
              <th className="py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                {copy.colPro}
              </th>
              <th className="py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-premium">
                {copy.colApex}
              </th>
            </tr>
          </thead>
          <tbody>
            {copy.rows.map((row, idx) => (
              <tr
                key={row.label}
                className={
                  idx % 2 === 0
                    ? "border-b border-divider/60"
                    : "border-b border-divider/60 bg-white/[0.012]"
                }
              >
                <td className="py-3 pe-4 text-[13px] text-muted">{row.label}</td>
                <td className="py-3 text-center text-[13px] tabular-nums text-bright">{row.oneTime}</td>
                <td className="py-3 text-center text-[13px] font-semibold tabular-nums text-white">{row.pro}</td>
                <td className="py-3 text-center text-[13px] font-semibold tabular-nums text-white">{row.apex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 max-w-2xl text-xs leading-relaxed text-faint">
        {copy.footnote}
      </p>
    </section>
  );
}
