import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import type { FreeProductBlock, FreeProductPageModel } from "@/lib/free-product-pages";

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
  upgradeProgramTitle
}: {
  model: FreeProductPageModel;
  locale: Locale;
  upgradeProgramTitle: string;
}) {
  const href = `/${locale}/checkout?program=${model.upgrade.checkoutSlug}`;

  return (
    <div className="rounded-[24px] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-transparent to-sky-500/5 p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">{upgradeProgramTitle}</p>
      <p className="mt-3 text-sm leading-7 text-zinc-300">{model.upgrade.body}</p>
      <Link
        href={href}
        className="mt-5 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 px-5 py-2.5 text-sm font-semibold text-[#05080a]"
      >
        {model.upgrade.cta} →
      </Link>
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
