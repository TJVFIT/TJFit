"use client";
import { useState } from "react";
import { Cable, Hand, Link as Chain } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { ACCESSORY_COPY, ACCESSORY_IDS, buildAccessoryRequest, type AccessorySelection } from "@/lib/store/accessories";

export function AccessoryCollection({ locale }: { locale: Locale }) {
  const copy = ACCESSORY_COPY[locale];
  const [selection, setSelection] = useState<AccessorySelection>({});
  const [location, setLocation] = useState("");
  const request = buildAccessoryRequest(locale, selection, location);
  const button = "min-h-11 rounded-full border border-white/25 px-5 py-2 text-xs hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C4B5FD]";
  const icons = { "speed-rope": Cable, "training-gloves": Hand, "ankle-bands": Chain };
  return <section id="accessories" aria-labelledby="accessory-title" className="mx-auto max-w-[1400px] scroll-mt-20 px-5 py-14 sm:px-8 lg:px-12">
    <p className="font-mono text-[10px] uppercase tracking-widest text-[#C4B5FD]">{copy.status}</p>
    <h2 id="accessory-title" className="mt-4 max-w-2xl font-display text-4xl font-medium tracking-tight sm:text-5xl">{copy.title}</h2>
    <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-400">{copy.intro}</p>
    <div className="mt-9 grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div className="divide-y divide-white/10">{ACCESSORY_IDS.map(id => { const Icon = icons[id]; return <article key={id} className="grid gap-5 py-7 first:pt-0 sm:grid-cols-[140px_1fr]">
        <div className="flex aspect-square items-center justify-center rounded-2xl bg-[#1B1920] text-[#C4B5FD]"><Icon size={72} strokeWidth={1} aria-hidden="true"/></div>
        <div><h3 className="font-display text-xl font-medium">{copy.items[id].name}</h3><p className="mt-2 text-sm text-zinc-400">{copy.items[id].description}</p><p className="mt-2 text-xs leading-relaxed text-zinc-500">{copy.items[id].detail}</p><button type="button" className={`${button} mt-4 disabled:opacity-50`} disabled={!!selection[id]} onClick={() => setSelection(current => ({ ...current, [id]: 1 }))}>{selection[id] ? copy.selected : copy.add}</button></div>
      </article>; })}<p className="pt-4 text-xs text-zinc-500">{copy.preview}</p></div>
      <aside aria-labelledby="accessory-selection-title" className="min-w-0 rounded-2xl border border-white/15 bg-[#161419] p-6 lg:sticky lg:top-24">
        <h3 id="accessory-selection-title" className="text-xl font-medium">{copy.selected}</h3>
        <div aria-live="polite" className="mt-5 space-y-5">{!request.count && <p className="text-sm text-zinc-400">{copy.empty}</p>}{ACCESSORY_IDS.filter(id => selection[id]).map(id => <div key={id} className="border-b border-white/10 pb-4"><p className="text-sm">{copy.items[id].name}</p><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-3 text-xs text-zinc-400">{copy.quantity}<select value={selection[id]} onChange={event => setSelection(current => ({ ...current, [id]: Number(event.target.value) }))} className="min-h-11 rounded-lg border border-white/20 bg-[#111215] px-3 text-white">{Array.from({ length: 20 }, (_, index) => <option key={index} value={index + 1}>{index + 1}</option>)}</select></label><button type="button" className="min-h-11 text-xs text-zinc-400 underline hover:text-white" aria-label={`${copy.remove}: ${copy.items[id].name}`} onClick={() => setSelection(current => { const next = { ...current }; delete next[id]; return next; })}>{copy.remove}</button></div></div>)}</div>
        <label htmlFor="accessory-location" className="mb-2 mt-6 block text-xs text-zinc-400">{copy.location}</label><input id="accessory-location" value={location} maxLength={160} autoComplete="address-level2" onChange={event => setLocation(event.target.value)} className="w-full rounded-lg border border-white/20 bg-[#111215] px-3 py-3 text-sm focus:border-[#C4B5FD] focus:outline-none"/>
        <p className="my-5 text-xs leading-relaxed text-zinc-400">{copy.note}</p>
        {request.count > 0 && <><a href={request.mailto} className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#C4B5FD] px-5 py-3 text-center text-sm font-semibold text-[#18151F] hover:bg-[#DDD6FE]">{copy.request}</a><details className="mt-4 text-xs text-zinc-400"><summary className="cursor-pointer py-3">{copy.selected}</summary><textarea aria-label={copy.selected} readOnly value={`vexafit.co@gmail.com\n\n${request.body}`} rows={10} className="w-full resize-y rounded-lg border border-white/15 bg-[#111215] p-3 leading-relaxed"/></details></>}
      </aside>
    </div>
  </section>;
}
