"use client";

import { useRef, useState } from "react";

import { EquipmentVisual } from "@/components/store/equipment-visual";
import { AccessoryCollection } from "@/components/store/accessory-collection";
import { ACCESSORY_COPY, SHOPIFY_STORE_URL } from "@/lib/store/accessories";
import type { Locale } from "@/lib/i18n";
import { buildQuoteRequest, STORE_COPY, STORE_EMAIL, type ProductId, type StoreCategory } from "@/lib/store/catalog";

function Arrow({ diagonal = false, className = "" }: { diagonal?: boolean; className?: string }) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={`shrink-0 rtl:-scale-x-100 ${className}`}><path d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h15m-6-6 6 6-6 6"} /></svg>;
}

const primary = "inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#C4B5FD] px-6 py-3 text-sm font-semibold text-[#18151F] transition-colors hover:bg-[#DDD6FE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C4B5FD] motion-safe:active:scale-[0.98]";
const secondary = "inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white/50 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C4B5FD] motion-safe:active:scale-[0.98]";
const field = "w-full rounded-xl border border-white/15 bg-[#111215] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-[#C4B5FD] focus:outline-none focus:ring-1 focus:ring-[#C4B5FD]";

export function EquipmentStore({ locale }: { locale: Locale }) {
  const copy = STORE_COPY[locale];
  const [category, setCategory] = useState<StoreCategory>("all");
  const [selection, setSelection] = useState<ProductId | "package" | "custom">("package");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copying" | "done" | "error">("idle");
  const previewRef = useRef<HTMLTextAreaElement>(null);
  const disclosureRef = useRef<HTMLDetailsElement>(null);
  const request = buildQuoteRequest(locale, selection, location, notes);
  const visibleProducts = copy.products.filter((product) => category === "all" || product.category === category);
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);

  function chooseRequest(value: ProductId | "package" | "custom") {
    setSelection(value);
    setCopyState("idle");
  }

  async function copyRequest() {
    setCopyState("copying");
    try {
      await navigator.clipboard.writeText(`${STORE_EMAIL}\n\n${request.subject}\n\n${request.body}`);
      setCopyState("done");
    } catch {
      setCopyState("error");
      if (disclosureRef.current) disclosureRef.current.open = true;
      previewRef.current?.focus();
      previewRef.current?.select();
    }
  }

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className="bg-[#0A0A0B] text-zinc-100">
      <nav aria-label={copy.eyebrow} className="mx-auto flex max-w-[1400px] flex-wrap gap-7 px-5 pt-6 text-xs text-zinc-300 sm:px-8 lg:px-12">
        <a href="#accessories" className="py-3 hover:text-[#C4B5FD]">{ACCESSORY_COPY[locale].gear}</a>
        <a href="#request" className="py-3 hover:text-[#C4B5FD]">{ACCESSORY_COPY[locale].gyms}</a>
        <a href={SHOPIFY_STORE_URL} className="py-3 hover:text-[#C4B5FD]">{ACCESSORY_COPY[locale].store} ↗</a>
      </nav>
      <section aria-labelledby="store-title" className="mx-auto max-w-[1400px] px-5 pb-12 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:px-12">
        <div className="mb-9 flex items-center justify-between gap-5 border-b border-white/10 pb-5 sm:mb-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#C4B5FD]">{copy.eyebrow}</p>
          <a href="#catalog" className="inline-flex min-h-10 items-center gap-2 text-xs text-zinc-400 hover:text-white">{copy.browse}<Arrow /></a>
        </div>
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.08fr] lg:gap-12">
          <div className="max-w-xl py-2 lg:py-10">
            <h1 id="store-title" className="font-display text-[clamp(2.75rem,5.1vw,4.75rem)] font-semibold leading-[1.06] tracking-[-0.045em]">
              {copy.title}<span className="mt-1 block text-[#C4B5FD]">{copy.titleAccent}</span>
            </h1>
            <p className="mt-6 max-w-[45ch] text-base leading-relaxed text-zinc-400 sm:text-lg">{copy.description}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#catalog" className={primary}>{copy.browse}<Arrow /></a>
              <a href="#request" onClick={() => chooseRequest("package")} className={secondary}>{copy.packageCta}</a>
            </div>
            <p className="mt-6 flex items-center gap-3 text-xs text-zinc-500"><span className="h-px w-6 bg-[#C4B5FD]/50" />{copy.priceOnRequest}</p>
          </div>
          <div className="relative min-w-0 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#151518]">
            <div className="absolute inset-x-6 top-6 flex justify-between gap-3 font-mono text-[10px] tracking-[0.14em] text-zinc-500" dir="ltr"><span>TJ / 08</span><span>TPU · 390 KG</span></div>
            <div className="aspect-[1.13] p-3 sm:p-8"><EquipmentVisual product="dumbbells" hero /></div>
            <div className="flex flex-wrap items-end justify-between gap-4 border-t border-white/10 px-6 py-5">
              <div><p className="text-sm font-medium text-zinc-200">{copy.products.find((product) => product.id === "dumbbells")?.name}</p><p className="mt-1 max-w-[32ch] text-[11px] leading-relaxed text-zinc-500">{copy.illustration}</p></div>
              <a href="#catalog" aria-label={copy.browse} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-[#C4B5FD] transition-colors hover:bg-white/5"><Arrow diagonal /></a>
            </div>
          </div>
        </div>
      </section>

      <AccessoryCollection locale={locale}/>
      <section id="catalog" aria-labelledby="catalog-title" className="scroll-mt-20 border-y border-white/10 bg-[#101012]">
        <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div><p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#C4B5FD]">{copy.newOnly}</p><h2 id="catalog-title" className="font-display text-3xl font-medium tracking-tight sm:text-4xl">{copy.collection}</h2></div>
            <p className="max-w-md text-sm leading-relaxed text-zinc-400">{copy.collectionDescription}</p>
          </div>
          <div className="mb-7 mt-8 flex flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-5">
            <div role="group" aria-label={copy.collection} className="flex flex-wrap gap-2">
              {(Object.keys(copy.categories) as StoreCategory[]).map((value) => <button key={value} type="button" aria-pressed={category === value} onClick={() => setCategory(value)} className={`min-h-11 rounded-full border px-4 py-2 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C4B5FD] ${category === value ? "border-[#C4B5FD] bg-[#C4B5FD] text-[#18151F]" : "border-white/15 text-zinc-400 hover:border-white/35 hover:text-white"}`}>{copy.categories[value]}</button>)}
            </div>
            <p role="status" className="font-mono text-[11px] text-zinc-500">{number(visibleProducts.length)} {copy.resultsLabel}</p>
          </div>
          <div className="grid grid-cols-1 items-start gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
            {visibleProducts.map((product, index) => (
              <article key={product.id} className={`min-w-0 ${category === "all" && index === 0 ? "sm:col-span-2" : ""}`}>
                <div className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A1E] ${category === "all" && index === 0 ? "aspect-[2.16]" : "aspect-[1.06]"}`}>
                  <span className="absolute start-4 top-4 font-mono text-[10px] text-zinc-500" dir="ltr">{String(copy.products.findIndex((item) => item.id === product.id) + 1).padStart(2, "0")} / 09</span>
                  <div className="h-full w-full px-4 pb-1 pt-5 motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.04]"><EquipmentVisual product={product.id} /></div>
                </div>
                <div className="pt-5">
                  <div className="flex items-start justify-between gap-3"><p className="font-mono text-[9px] uppercase tracking-[0.13em] text-zinc-500">{copy.categories[product.category]}</p><span className="shrink-0 text-[10px] text-[#C4B5FD]">{number(product.quantity)} {product.unit === "kg" ? copy.kgLabel : copy.unitLabel}</span></div>
                  <h3 className="mt-2 font-display text-xl font-medium leading-tight tracking-tight">{product.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">{product.subtitle}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4"><span className="text-xs text-zinc-300">{copy.priceOnRequest}</span><a href="#request" onClick={() => chooseRequest(product.id)} aria-label={`${copy.quoteItem}: ${product.name}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-[#C4B5FD] transition-colors hover:bg-[#C4B5FD] hover:text-[#18151F]"><Arrow diagonal /></a></div>
                  <details className="mt-2 border-b border-white/10 pb-3">
                    <summary className="min-h-10 cursor-pointer py-3 text-xs text-zinc-500 marker:text-[#C4B5FD] hover:text-white">{copy.details}</summary>
                    <ul className="space-y-2 pb-2 ps-4 text-xs leading-relaxed text-zinc-400">{product.requirements.map((requirement) => <li key={requirement} className="list-disc marker:text-[#C4B5FD]/60">{requirement}</li>)}</ul>
                  </details>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-9 max-w-2xl text-[11px] leading-relaxed text-zinc-500">{copy.illustration}</p>
        </div>
      </section>

      <section aria-labelledby="package-title" className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="grid overflow-hidden rounded-[1.75rem] border border-[#C4B5FD]/20 bg-[#17151C] lg:grid-cols-[.95fr_1.05fr]">
          <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12">
            <div><p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#C4B5FD]">{copy.packageEyebrow}</p><h2 id="package-title" className="mt-5 max-w-[15ch] font-display text-4xl font-medium leading-[1.1] tracking-tight sm:text-5xl">{copy.packageTitle}</h2><p className="mt-5 max-w-md text-sm leading-relaxed text-zinc-400">{copy.packageDescription}</p></div>
            <div className="mt-8"><a href="#request" onClick={() => chooseRequest("package")} className={primary}>{copy.packageCta}<Arrow /></a><p className="mt-5 max-w-md text-[11px] leading-relaxed text-zinc-500">{copy.packageNote}</p></div>
          </div>
          <div className="border-t border-white/10 bg-[#1C1923] px-6 py-8 sm:px-10 lg:border-s lg:border-t-0 lg:py-10">
            <h3 className="mb-5 font-mono text-[10px] uppercase tracking-[0.17em] text-zinc-400">{copy.packageContents}</h3>
            <ul className="divide-y divide-white/10">{copy.products.map((product) => <li key={product.id} className="flex items-center justify-between gap-5 py-3 text-sm"><span className="text-zinc-300">{product.name}</span><span className="shrink-0 font-mono text-xs text-[#C4B5FD]">{number(product.quantity)} {product.unit === "kg" ? copy.kgLabel : copy.unitLabel}</span></li>)}</ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="process-title" className="mx-auto max-w-[1400px] px-5 pb-14 sm:px-8 sm:pb-20 lg:px-12">
        <div className="grid gap-8 border-t border-white/10 pt-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#C4B5FD]">{copy.processEyebrow}</p><h2 id="process-title" className="mt-4 max-w-sm font-display text-3xl font-medium leading-tight tracking-tight">{copy.processTitle}</h2></div>
          <ol className="divide-y divide-white/10">{copy.processSteps.map((step, index) => <li key={step.title} className="grid grid-cols-[2rem_1fr] gap-5 py-5 first:pt-0"><span className="pt-1 font-mono text-xs text-[#C4B5FD]" dir="ltr">{String(index + 1).padStart(2, "0")}</span><div><h3 className="text-base font-medium text-zinc-200">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-zinc-500">{step.body}</p></div></li>)}</ol>
        </div>
      </section>

      <section id="request" aria-labelledby="request-title" className="scroll-mt-20 border-t border-white/10 bg-[#131216]">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[.75fr_1.25fr] lg:gap-20 lg:px-12">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#C4B5FD]">{copy.requestEyebrow}</p><h2 id="request-title" className="mt-5 max-w-sm font-display text-4xl font-medium leading-[1.1] tracking-tight">{copy.requestTitle}</h2><p className="mt-5 max-w-sm text-sm leading-relaxed text-zinc-400">{copy.requestDescription}</p><div className="mt-8 border-t border-white/10 pt-6"><p className="text-xs text-zinc-500">{copy.contact}</p><a href={`mailto:${STORE_EMAIL}`} dir="ltr" className="mt-2 inline-block break-all text-sm text-[#C4B5FD] underline decoration-[#C4B5FD]/30 underline-offset-4 hover:decoration-[#C4B5FD]">{STORE_EMAIL}</a></div></div>
          <div className="min-w-0">
            <div className="space-y-6">
              <div><label htmlFor="store-request-selection" className="mb-2 block text-xs font-medium text-zinc-300">{copy.requestFor}</label><select id="store-request-selection" value={selection} onChange={(event) => chooseRequest(event.target.value as ProductId | "package" | "custom")} className={field}><option value="package">{copy.fullPackage}</option>{copy.products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}<option value="custom">{copy.customProject}</option></select></div>
              <div><label htmlFor="store-request-location" className="mb-2 block text-xs font-medium text-zinc-300">{copy.location}</label><input id="store-request-location" type="text" autoComplete="address-level2" maxLength={160} value={location} onChange={(event) => { setLocation(event.target.value); setCopyState("idle"); }} placeholder={copy.locationPlaceholder} className={field} /></div>
              <div><label htmlFor="store-request-notes" className="mb-2 block text-xs font-medium text-zinc-300">{copy.notes}</label><textarea id="store-request-notes" rows={4} maxLength={1200} value={notes} onChange={(event) => { setNotes(event.target.value); setCopyState("idle"); }} placeholder={copy.notesPlaceholder} className={`${field} resize-y`} /></div>
            </div>
            <p className="mb-5 mt-6 text-xs leading-relaxed text-zinc-500">{copy.emailHelp}</p>
            <div className="flex flex-wrap gap-3"><a href={request.mailto} className={primary}>{copy.openEmail}<Arrow diagonal /></a><button type="button" disabled={copyState === "copying"} aria-busy={copyState === "copying"} onClick={() => void copyRequest()} className={`${secondary} disabled:opacity-50`}>{copyState === "done" ? copy.copied : copy.copyRequest}</button></div>
            <p role="status" className={`mt-3 min-h-5 text-xs ${copyState === "error" ? "text-rose-300" : "text-[#C4B5FD]"}`}>{copyState === "error" ? copy.copyFailed : copyState === "done" ? copy.requestReady : ""}</p>
            <details ref={disclosureRef} className="mt-2 border-t border-white/10 pt-4"><summary className="min-h-11 cursor-pointer py-3 text-xs text-zinc-400 marker:text-[#C4B5FD] hover:text-white">{copy.requestPreview}</summary><label htmlFor="store-request-preview" className="mb-3 block text-xs leading-relaxed text-zinc-500">{copy.emailFallback}</label><textarea ref={previewRef} id="store-request-preview" readOnly rows={15} value={`${STORE_EMAIL}\n\n${request.subject}\n\n${request.body}`} className={`${field} resize-y font-mono text-xs leading-relaxed`} /></details>
          </div>
        </div>
      </section>
    </div>
  );
}
