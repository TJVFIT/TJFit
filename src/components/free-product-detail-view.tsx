import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import type { FreeProductBlock, FreeProductPageModel } from "@/lib/free-product-pages";
import { getProgramUiCopy } from "@/lib/program-localization";

function renderBlocks(blocks: FreeProductBlock[], dayLabels: { warmup: string; main: string; cooldown: string }) {
  return blocks.map((block, i) => {
    const key = `${block.type}-${i}`;
    switch (block.type) {
      case "h2":
        return (
          <h2 key={key} className="mt-10 text-xl font-semibold text-white first:mt-0 sm:text-2xl">
            {block.text}
          </h2>
        );
      case "h3":
        return (
          <h3 key={key} className="mt-6 text-lg font-semibold text-zinc-100">
            {block.text}
          </h3>
        );
      case "p":
        return (
          <p key={key} className="mt-3 text-sm leading-7 text-zinc-400">
            {block.text}
          </p>
        );
      case "ul":
        return (
          <ul key={key} className="mt-3 list-inside list-disc space-y-2 text-sm leading-7 text-zinc-300">
            {block.items.map((item, idx) => (
              <li key={`${item}-${idx}`}>{item}</li>
            ))}
          </ul>
        );
      case "day":
        return (
          <div key={key} className="mt-6 rounded-[20px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <p className="text-base font-semibold text-white">{block.day.title}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-zinc-500">{dayLabels.warmup}</p>
            <ul className="mt-2 space-y-1 text-sm text-zinc-300">
              {block.day.warmupLines.map((line, idx) => (
                <li key={`${line}-${idx}`}>{line}</li>
              ))}
            </ul>
            <p className="mt-5 text-xs uppercase tracking-[0.2em] text-zinc-500">{dayLabels.main}</p>
            <ul className="mt-3 space-y-3">
              {block.day.exercises.map((ex, j) => (
                <li key={`${ex.line}-${j}`} className="text-sm text-zinc-200">
                  <span className="font-medium text-white">{ex.line}</span>
                  {ex.note ? <span className="mt-1 block text-zinc-500">{ex.note}</span> : null}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs uppercase tracking-[0.2em] text-zinc-500">{dayLabels.cooldown}</p>
            <ul className="mt-2 space-y-1 text-sm text-zinc-300">
              {block.day.cooldownLines.map((line, idx) => (
                <li key={`${line}-${idx}`}>{line}</li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  });
}

export function FreeProductBodyBlocks({
  model,
  dayLabels
}: {
  model: FreeProductPageModel;
  dayLabels: { warmup: string; main: string; cooldown: string };
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">{renderBlocks(model.blocks, dayLabels)}</div>
  );
}

export function FreeProductUpgradeFooter({
  model,
  locale,
  upgradeProgramTitle,
  freeDownloadHref,
  freeDownloadLabel
}: {
  model: FreeProductPageModel;
  locale: Locale;
  upgradeProgramTitle: string;
  freeDownloadHref?: string;
  freeDownloadLabel?: string;
}) {
  const href = `/${locale}/checkout?program=${model.upgrade.checkoutSlug}`;
  const ui = getProgramUiCopy(locale);

  return (
    <div className="mx-auto max-w-[540px] border-t border-[#1E2028] bg-[#111215] px-8 py-12 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{upgradeProgramTitle}</p>
      <h2 className="mt-3 text-xl font-semibold text-white">{ui.upgradeFullSystemTitle}</h2>
      <p className="mt-3 text-sm leading-[1.7] text-[var(--color-text-secondary)]">{model.upgrade.body}</p>
      {freeDownloadHref ? (
        <a
          href={freeDownloadHref}
          className="mt-5 inline-flex min-h-[44px] w-full max-w-sm items-center justify-center rounded-full border border-cyan-400/45 bg-cyan-500/15 px-5 py-2.5 text-sm font-bold text-cyan-100 transition-colors hover:bg-cyan-500/25 sm:w-auto"
        >
          {freeDownloadLabel ?? "Download for free PDF"}
        </a>
      ) : null}
      <Link
        href={href}
        className="lux-btn-primary mt-6 inline-flex min-h-[48px] w-full max-w-sm items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-[#09090B] sm:w-auto"
      >
        {ui.getFullAccess} →
      </Link>
      <Link
        href={`/${locale}/programs`}
        className="mt-4 block text-sm text-[var(--color-text-muted)] transition-colors duration-150 hover:text-white"
      >
        {ui.upgradeViewAllPrograms}
      </Link>
      <p className="mt-3 text-xs text-[var(--color-text-muted)]">{ui.upgradeNoFluff}</p>
    </div>
  );
}

export function FreeProductDetailView({
  model,
  locale,
  upgradeProgramTitle,
  dayLabels
}: {
  model: FreeProductPageModel;
  locale: Locale;
  upgradeProgramTitle: string;
  dayLabels: { warmup: string; main: string; cooldown: string };
}) {
  return (
    <div className="mt-10 space-y-2">
      <FreeProductBodyBlocks model={model} dayLabels={dayLabels} />
      <FreeProductUpgradeFooter model={model} locale={locale} upgradeProgramTitle={upgradeProgramTitle} />
    </div>
  );
}
