/**
 * Paddle price IDs for program/diet slugs.
 *
 * **Source of truth (production):** env `PADDLE_PRICE_MAP` (JSON: slug → `pri_…`) and
 * optional `PADDLE_DEFAULT_PRICE_ID` for unlisted slugs.
 *
 * Never commit real `pri_` IDs — configure them in Vercel only.
 */

import {
  getPaddleApiBase,
  getPaddleEnvironment,
  isPaddleServerConfigured,
  parsePaddlePriceMap,
  resolvePaddlePriceId,
  type PaddleEnvironment
} from "@/lib/paddle-config";

export {
  getPaddleApiBase,
  getPaddleEnvironment,
  isPaddleServerConfigured,
  parsePaddlePriceMap,
  resolvePaddlePriceId,
  type PaddleEnvironment
};

/** Readable alias used by checkout routes. */
export function getPaddlePriceIdForProgramSlug(programSlug: string): string | null {
  return resolvePaddlePriceId(programSlug);
}

/** Generic alias for both program and diet slugs. */
export function getPaddlePriceIdForSlug(slug: string): string | null {
  return resolvePaddlePriceId(slug);
}
