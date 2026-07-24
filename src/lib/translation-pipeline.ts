/**
 * Phase-2 translation pipeline — blueprint only, NOT wired yet.
 *
 * Goal: auto-translate program + diet copy (and eventually UI messages) into all
 * 10 supported locales with cache-first serving.
 *
 * Architecture (to be implemented in Phase 2):
 *
 *   1. Source of truth: English strings (hand-authored in TS dictionaries or JSON).
 *   2. Translation worker: scheduled job (cron or on-demand) that diffs new/changed
 *      English strings against the `translation_cache` Supabase table and calls the
 *      OpenAI API in batches to fill missing locales.
 *   3. Cache table schema (Supabase):
 *        translation_cache (
 *          namespace  text,            -- e.g. "program.keto-shred-diet-12w.description"
 *          locale     text,            -- SupportedLocale
 *          source_hash text,           -- sha256(englishSource) — cache invalidation
 *          translated text not null,
 *          model      text,            -- e.g. "gpt-4o-mini"
 *          created_at timestamptz default now(),
 *          primary key (namespace, locale)
 *        );
 *   4. Runtime: a server-side `getTranslated(namespace, locale)` helper that reads
 *      the cache row; if missing or hash mismatched, it falls back to the English
 *      source and enqueues a background translation job.
 *   5. Human QA: translators can override any auto-translated row via an admin UI.
 *      Setting `manual=true` on the row freezes it against future AI regeneration.
 *
 * Performance:
 *   - Batch 20 strings per OpenAI call. Rate-limit to 5 req/s.
 *   - Cache hits served from Supabase (single query, <30ms).
 *   - At build time, a script snapshots the cache into the `/messages/{locale}.json`
 *     files so first-paint is cache-free (no network, no DB hit).
 *
 * Why it's not implemented yet:
 *   Phase 1 (Path B) prioritized stability — adding 10-locale routing + switcher +
 *   TJAI language lock WITHOUT touching the 919-line `i18n.ts` or the 20 copy files.
 *   Enabling the pipeline means writing a migration, a worker, an admin UI, and
 *   translation QA — at least 2 dedicated sessions. Schedule it separately.
 */

import type { SupportedLocale } from "@/lib/i18n";

export type TranslationNamespace = string; // e.g. "program.slug.description"

export type CachedTranslation = {
  namespace: TranslationNamespace;
  locale: SupportedLocale;
  sourceHash: string;
  translated: string;
  model: string;
  manual?: boolean;
  createdAt: string;
};

/**
 * Stable fingerprint for cache-invalidation. Must match the worker so that a
 * change in English source re-triggers translation for all locales.
 * Implementation deferred — Phase-2 ships with the Supabase migration.
 */
export function sourceFingerprint(_source: string): string {
  // Intentional stub. Real impl: sha256 via node:crypto on the server.
  throw new Error("translation-pipeline: sourceFingerprint not yet implemented (Phase 2).");
}

/**
 * Phase-2 runtime read. Falls back to English on miss; enqueues a job for later.
 * Not wired yet — components should keep reading from existing TS dictionaries.
 */
export async function getTranslated(
  _namespace: TranslationNamespace,
  _locale: SupportedLocale,
  _englishSource: string
): Promise<string> {
  throw new Error("translation-pipeline: getTranslated not yet implemented (Phase 2).");
}
