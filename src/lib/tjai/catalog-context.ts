/**
 * Catalog awareness for the TJAI coach — deterministic retrieval over the
 * bundle registry (no embeddings, no DB). Builds a compact digest of all
 * bundles plus keyword-scored details for the bundles most relevant to the
 * current user message.
 */

import { listBundles, type Bundle, type BundleGoal } from "@/lib/bundles";

const GOAL_KEYWORDS: Array<{ pattern: RegExp; goal: BundleGoal }> = [
  {
    pattern: /fat.?loss|lose\s+(fat|weight)|weight\s+loss|cut(?:ting)?\b|shred|lean\s+out|slim(?:mer)?\b|deficit|definition|six.?pack|abs\b/i,
    goal: "fat-loss"
  },
  {
    pattern: /muscle|bulk(?:ing)?|mass\b|hypertrophy|gain\s+(size|muscle|weight)|bigger\s+(arms|chest|legs|back|shoulders)|skinny/i,
    goal: "muscle-gain"
  },
  {
    pattern: /recomp|recomposition|tone(?:d|\s+up)?\b|build\s+muscle\s+and\s+lose\s+fat|lose\s+fat\s+and\s+build\s+muscle/i,
    goal: "recomp"
  },
  {
    pattern: /strength|stronger|powerlift(?:ing)?|powerbuild(?:ing)?|1\s?rm|one\s+rep\s+max|squat|bench\s+press|deadlift/i,
    goal: "strength"
  },
  {
    pattern: /conditioning|cardio|endurance|stamina|engine\b|work\s+capacity|athlete|in.?season|sport/i,
    goal: "conditioning"
  },
  {
    pattern: /beginner|newbie|just\s+start(?:ed|ing)?|getting\s+started|never\s+(lifted|trained|worked\s+out)|first\s+time|foundation|complete\s+novice|basics/i,
    goal: "foundation"
  }
];

const SETTING_KEYWORDS: Array<{ pattern: RegExp; setting: NonNullable<Bundle["setting"]> }> = [
  {
    pattern: /at\s+home|home\s+(workout|training|gym)|no\s+(gym|equipment)|without\s+(a\s+)?gym|bodyweight|minimal\s+equipment|apartment|living\s+room/i,
    setting: "home"
  },
  { pattern: /\bgym\b|barbell|machines|weight\s+room/i, setting: "gym" }
];

const BEGINNER_PATTERN = /beginner|newbie|never\s+(lifted|trained)|just\s+start|first\s+time|new\s+to/i;
const ADVANCED_PATTERN = /advanced|experienced|contest|competition|peak\s+week|years\s+of\s+(lifting|training)/i;

// Generic words that appear across most bundle names/hooks and would skew scoring.
const TOKEN_STOPLIST = new Set(["bundle", "bundles", "week", "weeks", "training", "diet", "protocol", "your"]);

function priceLabel(b: Bundle): string {
  return b.priceUsd === 0 ? "FREE" : `$${b.priceUsd}`;
}

/** One line per bundle — compact enough to live in every chat system prompt. */
export function buildCatalogDigest(): string {
  return listBundles()
    .map((b) => {
      const level = b.difficultyLabel ? ` · ${b.difficultyLabel}` : "";
      const setting = b.setting ? ` · ${b.setting}` : "";
      return `- ${b.name} — /bundles/${b.slug} — ${b.goalLabel} (${b.goal}) · ${b.weeks} weeks · ${b.sessionsPerWeek} sessions/week${level}${setting} · ${priceLabel(b)} — ${b.hook}`;
    })
    .join("\n");
}

/**
 * Cheap deterministic relevance scoring: goal keywords in the message, the
 * user's stored plan goal, setting/level cues, and name/hook token overlap.
 * Returns the top 2-3 bundles, or [] when nothing genuinely matches.
 */
export function selectRelevantBundles(message: string, goal?: string): Bundle[] {
  const text = message.toLowerCase();
  const matchedGoals = new Set(GOAL_KEYWORDS.filter((k) => k.pattern.test(text)).map((k) => k.goal));
  const matchedSettings = new Set(SETTING_KEYWORDS.filter((k) => k.pattern.test(text)).map((k) => k.setting));
  const planGoal = goal ? goal.toLowerCase().replace(/_/g, "-") : null;
  const wantsBeginner = BEGINNER_PATTERN.test(text);
  const wantsAdvanced = ADVANCED_PATTERN.test(text);
  const tokens = new Set((text.match(/[a-z]{4,}/g) ?? []).filter((t) => !TOKEN_STOPLIST.has(t)));

  const scored = listBundles()
    .map((b) => {
      let score = 0;
      if (matchedGoals.has(b.goal)) score += 3;
      if (planGoal && b.goal === planGoal) score += 2;
      if (b.setting && matchedSettings.has(b.setting)) score += 2;
      if (wantsBeginner && b.difficultyLabel === "beginner") score += 2;
      if (wantsAdvanced && b.difficultyLabel === "advanced") score += 2;
      const name = b.name.toLowerCase();
      const hook = b.hook.toLowerCase();
      for (const token of tokens) {
        if (name.includes(token)) score += 3;
        else if (hook.includes(token)) score += 1;
      }
      return { bundle: b, score };
    })
    .filter((s) => s.score >= 3)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((s) => s.bundle);
}

function formatBundleDetail(b: Bundle): string {
  const meta = [b.difficultyLabel, b.setting].filter(Boolean).join(", ");
  const phases = b.phases.map((p) => p.name).join(" then ");
  const who = b.whoFor && b.whoFor.length > 0 ? ` Fits: ${b.whoFor.slice(0, 2).join("; ")}.` : "";
  return `- ${b.name} (/bundles/${b.slug}, ${priceLabel(b)}${meta ? `, ${meta}` : ""}): ${b.description} Phases: ${phases}. Nutrition: ${b.nutrition.style} — ${b.nutrition.proteinTarget} protein, ${b.nutrition.calorieBias}.${who}`;
}

/**
 * The full CATALOG system-prompt block: digest of every bundle, expanded
 * details for the ones scored relevant to the current message, and the
 * recommendation rules the coach must follow.
 */
export function buildCatalogBlock(message: string, goal?: string): string {
  const relevant = selectRelevantBundles(message, goal);
  const details =
    relevant.length > 0
      ? `\n\nMOST RELEVANT TO THE CURRENT MESSAGE (verified facts — use these when recommending):\n${relevant
          .map(formatBundleDetail)
          .join("\n")}`
      : "";

  return `TJFIT BUNDLE CATALOG (each bundle = a 12-week training + diet PDF dossier, downloadable from its page):
${buildCatalogDigest()}${details}

CATALOG RULES:
- Recommend a bundle ONLY when it genuinely answers the user's ask. Never force a bundle into an unrelated reply, and never pressure-sell — one natural mention, then move on.
- When you recommend, cite real facts from the catalog above (weeks, sessions/week, level, setting, phases) and point to its page as /bundles/<slug>.
- Prices: FREE where marked, otherwise exactly the price shown. Never invent prices, discounts, or bundle contents not listed here.
- For users who haven't purchased, suggest a FREE bundle first when it fits. For a fully custom plan, point to TJAI plan credits at /tjai/credits.`;
}
