import { Check } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { PUBLIC_COPY } from "@/lib/public-offers-copy";

export function TjaiUsageTierTable({ locale }: { locale: Locale }) {
  const c = PUBLIC_COPY[locale];
  return <section className="rounded-xl border border-white/10 bg-[#151119] p-6"><h2 className="text-xl font-semibold">{c.tjai.detail}</h2><p className="mt-2 text-sm text-muted">{c.oneTime}</p><ul className="mt-5 space-y-3">{c.features.map((feature) => <li key={feature} className="flex gap-3 text-sm"><Check className="h-4 w-4 shrink-0 text-violet-300" aria-hidden />{feature}</li>)}</ul><p className="mt-5 text-xs leading-6 text-muted">{c.availability}</p></section>;
}
