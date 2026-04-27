/**
 * Phase-2 messages loader (JSON-based namespace).
 *
 * This is a forward-compat layer that sits alongside the legacy `src/lib/i18n.ts`
 * dictionary. New surfaces can read from `/messages/{locale}.json`; legacy
 * surfaces keep using the hand-rolled TypeScript dictionaries until a full
 * next-intl migration is scheduled.
 *
 * Fallback rule (Path B, Phase 1):
 *   - Requested key found in `{locale}.json` → use it.
 *   - Missing → fall back to `en.json`.
 *   - Still missing → return the dotted key string (helpful in dev).
 */
import type { SupportedLocale } from "@/lib/i18n";

// Static imports so Next.js inlines them at build-time — zero runtime fetch,
// and Turbopack tree-shakes unused locales per-page via RSC serialization.
import en from "../../messages/en.json";
import tr from "../../messages/tr.json";
import ar from "../../messages/ar.json";
import es from "../../messages/es.json";
import fr from "../../messages/fr.json";

type Messages = typeof en;

const MESSAGES: Record<SupportedLocale, Messages> = {
  en: en as Messages,
  tr: tr as Messages,
  ar: ar as Messages,
  es: es as Messages,
  fr: fr as Messages
};

export function getMessages(locale: SupportedLocale): Messages {
  return MESSAGES[locale] ?? (en as Messages);
}

/** Read a dotted key from messages with English fallback. */
export function t(locale: SupportedLocale, key: string, vars?: Record<string, string | number>): string {
  const primary = resolveDottedKey(MESSAGES[locale] as unknown as Record<string, unknown>, key);
  const value = primary ?? resolveDottedKey(MESSAGES.en as unknown as Record<string, unknown>, key) ?? key;
  if (typeof value !== "string") return key;
  if (!vars) return value;
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), value);
}

function resolveDottedKey(obj: Record<string, unknown>, key: string): string | undefined {
  const parts = key.split(".");
  let node: unknown = obj;
  for (const p of parts) {
    if (node && typeof node === "object" && p in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return typeof node === "string" ? node : undefined;
}

export type { Messages };
