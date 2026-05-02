# Locale Audit — 2026-05-02

## Summary
- Locale files on disk: 10 (ar, de, en, es, fr, hi, id, pt, ru, tr)
- Locales actually wired through routing/UI: **5** (en, tr, ar, es, fr) — see `src/lib/i18n.ts:1` and `src/lib/i18n.ts:924`
- Reference: `en`
- 🔴 Architectural mismatch: 5 of 10 message files (de, hi, id, pt, ru) are orphaned — no route, no `LOCALE_META`, no `BCP47`, no copy table consumes them.
- 🔴 Critical English-stub leaks: **31 of 31 keys** in each of `ar.json`, `es.json`, `fr.json`, `tr.json` (entire files identical to `en.json`).
- 🟡 Hardcoded English in code (`messages/*.json` is barely used): ~12+ instances in priority files; Programs catalog and metadata route through inline per-locale tables (`CATALOG_COPY`) where `ar` block is verbatim English.
- 🟡 Layout metadata covers only 5 routing locales; copy is hand-maintained inline in `layout.tsx:22-44`.
- RTL readiness for `ar`: **🔴** — `ar.json` is 100% English; layout sets `dir="rtl"` correctly, but Tailwind utilities are heavily physical (`ml/mr/pl/pr/left/right/text-left/right`) rather than logical (`ms/me/ps/pe/start/end/text-start/end`).

## Key parity
Each `messages/*.json` file is exactly 48 lines but the prior pass conflated lines with keys. Flattened (excluding the `$schema` annotation), every locale has **31 leaf keys**. Structural parity is clean.

| Locale | Leaf keys | vs. en | Missing | Extra |
|--------|-----------|--------|---------|-------|
| en | 31 | (ref) | — | — |
| ar | 31 | 0 | — | — |
| de | 31 | 0 | — | — |
| es | 31 | 0 | — | — |
| fr | 31 | 0 | — | — |
| hi | 31 | 0 | — | — |
| id | 31 | 0 | — | — |
| pt | 31 | 0 | — | — |
| ru | 31 | 0 | — | — |
| tr | 31 | 0 | — | — |

Caveat: `messages/*.json` is the **Phase-2 namespace** (`$schema` annotation says so). The legacy `src/lib/i18n.ts` `Dictionary` type is a separate, much larger structure that supplies 95% of the UI copy via inline per-locale tables; that surface is **not** covered by this 31-key namespace.

## English-stub leaks (in `messages/*.json`)

The following locales' files are **byte-identical to `en.json`** — every value is English:

| Locale | Key | Value (truncated 60ch) |
|--------|-----|------------------------|
| ar | common.cta.getStarted | "Get Started" |
| ar | common.cta.continue | "Continue" |
| ar | common.status.loading | "Loading…" |
| ar | common.nav.home | "Home" |
| ar | languageSwitcher.label | "Language" |
| ar | seo.defaultTitle | "TJFit — AI Fitness Programs, Coaching & Nutrition" |
| ar | payment.successBanner | "Payment successful. Your premium PDF is downloading…" |
| ar | (all 31 keys) | (English) — `messages/ar.json:1-48` |
| es | (all 31 keys) | (English) — `messages/es.json:1-48` |
| fr | (all 31 keys) | (English) — `messages/fr.json:1-48` |
| tr | (all 31 keys) | (English) — `messages/tr.json:1-48` |

Locales that **are** translated in `messages/*.json`: `de`, `hi` (Devanagari), `id`, `pt`, `ru` (Cyrillic). Note these are precisely the five locales **not** wired into routing — so the only locales with real UI traffic (en, tr, ar, es, fr) are exactly the ones with English stubs in this namespace. The Phase-2 namespace is effectively unused at runtime for the live locales.

## Hardcoded English in code

### Priority files (the eight requested):

- `src/app/[locale]/page.tsx:87` — `"The homepage could not be displayed. Please reload or try again later."` (error fallback, served to every locale)
- `src/app/[locale]/page.tsx:93` — `"Browse programs"` (CTA in fallback)
- `src/app/[locale]/programs/page.tsx:12-15` — `metadata.title = "Programs - TJFit"`, `metadata.description = "Premium training and nutrition programs..."` (locale-agnostic; same English title for every route)
- `src/app/[locale]/programs/page.tsx:113-135` — `CATALOG_COPY.ar` is verbatim English (eyebrow `"Catalog"`, title `"Programs built like products."`, all filter labels, all empty-state copy, helpCta `"Open TJAI"`). Compare to `tr` (90-112), `es` (136-158), `fr` (159-181) which are translated.
- `src/app/[locale]/programs/[slug]/page.tsx:130` — `"Free preview"` literal
- `src/app/[locale]/programs/[slug]/page.tsx:389` — `"Structure details are being prepared for this program."`
- `src/app/[locale]/programs/[slug]/page.tsx:542` — `"Program coming soon"`
- `src/app/[locale]/tjai/page.tsx:9-13` — `metadata.title = "TJAI — AI Fitness & Nutrition Coach | TJFit"`, description hardcoded; same metadata for `/ar/tjai`, `/es/tjai`, etc.
- `src/components/program-card.tsx:53-57` — difficulty fallbacks `"Expert"`, `"Advanced"`, `"Intermediate"`, `"Beginner"`, `"All levels"` baked into helper.
- `src/components/program-card.tsx:129-132` — spec strip labels `"Length"`, `"Setup"`, `"Goal"`, `"Level"` (these render unconditionally regardless of locale)
- `src/components/program-detail-hero.tsx:113-115` — `<Spec label="Goal" />`, `label={isDiet ? "Type" : "Setup"}`, `label="Level"` rendered inline
- `src/components/home/hero-section.tsx:69-71` — command-panel rows `"Training block"`, `"Upper strength"`, `"Week 04 / Day 02"`, `"Macro target"`, `"2,420 kcal"`, `"Protein 186g"`, `"Recovery"`, `"Load -8%"`, `"Auto adjusted"`
- `src/components/home/hero-section.tsx:79-83` — `"Today"`, `"Adaptive plan"`, `"Live"` pill
- `src/components/home/hero-section.tsx:108` — `"Consistency"` label
- `src/components/home/hero-section.tsx:195` — `<HeroSignal label="model" value="Adaptive split" />`

`src/components/site-shell.tsx` is clean — no inline copy; all locale-aware children receive `locale` prop.

## RTL (ar) readiness

- **`messages/ar.json` content**: 🔴 100% English — no Arabic Unicode anywhere in the file (`messages/ar.json:1-48`). `LOCALE_META.ar.native` correctly says `"العربية"` in `src/lib/i18n.ts:930`, but the messages namespace is not translated.
- **Layout `dir`**: ✅ Correct. `src/app/[locale]/layout.tsx:97` reads `LOCALE_META[routing].dir` (rtl for `ar`) and `:100` applies `<div dir={direction} lang={routing}>`. `BCP47.ar = "ar_SA"` is set for OG metadata.
- **Logical-property usage** in five priority components (`page.tsx`, `programs/page.tsx`, `programs/[slug]/page.tsx`, `tjai/page.tsx`, `site-shell.tsx`, `home/hero-section.tsx`, `program-card.tsx`, `program-detail-hero.tsx`):
  - Across the full `src/` tree: **54 occurrences of physical** classes (`ml-`, `mr-`, `pl-`, `pr-`, `text-left`, `text-right`, `left-`, `right-`) vs **51 occurrences of logical** (`ms-`, `me-`, `ps-`, `pe-`, `text-start`, `text-end`, `start-`, `end-`).
  - Sampled component examples with physical classes: `home/hero-section.tsx`, `program-card.tsx`, `program-detail-hero.tsx`, `cinematic-listing-header.tsx`, `coach-card.tsx`, `chat-thread-view.tsx`. Mixed adoption — no consistent migration to logical properties.
- **Verdict**: 🔴 **Fail**. The `dir` flip is correctly wired, but (1) Arabic copy doesn't exist in the Phase-2 namespace, (2) the inline locale tables for Programs and Tjai render English for `ar`, and (3) ~51% of layout utilities are physical and will break visually under RTL (icons left/right of text, padded asymmetric cards, nav offsets).

## Pricing language across locales
- `messages/*.json`: 🟢 **Clean**. No `$`, `€`, `₺`, or "Free" strings present in any of the 10 files.
- The pricing directive ($0 platform-wide) is honored in the i18n namespace.
- ⚠️ `src/app/[locale]/programs/[slug]/page.tsx:130` does ship the literal `"Free preview"` regardless of locale; not a price violation but a translation gap.

## Recommended fixes (prioritized for Phase B/C)

1. 🔴 **Decide the namespace's fate.** Either (a) wire `messages/*.json` into the live runtime via a `next-intl` provider and migrate copy out of `src/lib/i18n.ts` and the inline `CATALOG_COPY` tables, or (b) delete `de.json`, `hi.json`, `id.json`, `pt.json`, `ru.json` (all unreachable today) and stop pretending 10 locales ship. Current state ships dead translation work and live English stubs simultaneously.
2. 🔴 **Translate `ar.json`, `es.json`, `fr.json`, `tr.json`** in `messages/` (each is byte-identical to `en.json`). At minimum needed: `common.cta.*`, `common.status.*`, `common.nav.*`, `payment.*`, `seo.*`.
3. 🔴 **Translate the `ar` block of `CATALOG_COPY`** at `src/app/[locale]/programs/page.tsx:113-135` — currently 100% English while `tr`, `es`, `fr` are localized. This is the most user-visible RTL leak.
4. 🔴 **Localize TJAI route metadata** at `src/app/[locale]/tjai/page.tsx:9-13` — currently English regardless of locale.
5. 🟡 **Lift hardcoded labels into the dictionary**: `program-card.tsx:53-57,129-132` (`"Expert"/"Advanced"/"Intermediate"/"Beginner"/"All levels"`, `"Length"/"Setup"/"Goal"/"Level"`); `program-detail-hero.tsx:113-115` (same trio); `programs/[slug]/page.tsx:130,389,542`; `page.tsx:87,93` error-fallback copy.
6. 🟡 **Translate hero command-panel decorative strings** in `home/hero-section.tsx:69-71,79-83,108,195` — these read as content even though they decorate ("Training block", "Adaptive plan", "Live", "Consistency", etc.).
7. 🟡 **Add `de`, `hi`, `id`, `pt`, `ru` to `LOCALE_META`/`BCP47`/`TITLES`/`DESCRIPTIONS`** in `src/app/[locale]/layout.tsx:22-44` and `src/lib/i18n.ts:927-933,949-955` — or remove the orphan JSON.
8. 🟡 **Begin physical→logical migration** for RTL: codemod `ml-/mr-/pl-/pr-/text-left/text-right/left-/right-` → `ms-/me-/ps-/pe-/text-start/text-end/start-/end-` across the 38 files identified. Start with the home, programs catalog, and program detail surfaces (the highest-traffic pages).
9. 🟢 **Pricing strings**: clean today; keep an eye on the `"Free preview"` literal in `programs/[slug]/page.tsx:130` so it doesn't regress to a currency string.
