/**
 * Elite coaching metadata for catalog programs — drives the on-page "Coaching system" panel.
 * Defaults cover all slugs; `SLUG_OVERRIDES` deepens flagship programs without duplicating 30+ full writeups.
 */

import type { Locale } from "@/lib/i18n";

export type ProgramEliteLabels = {
  badge: string;
  title: string;
  subtitle: string;
  periodization: string;
  weeklyLayout: string;
  progressionModel: string;
  volumeAndIntensity: string;
  fatigueManagement: string;
  recoveryIntegration: string;
  injuryPrevention: string;
  personalization: string;
  executionQuality: string;
  smartProgression: string;
};

export type ProgramEliteMeta = {
  periodization: string;
  weeklyLayout: string;
  progressionModel: string;
  volumeAndIntensity: string;
  fatigueManagement: string;
  recoveryIntegration: string;
  injuryPrevention: string;
  personalization: string;
  executionQuality: string;
  smartProgression: string;
};

type ElitePartial = Partial<ProgramEliteMeta>;

const BASE_TRAINING_FAT: ProgramEliteMeta = {
  periodization:
    "12-week linear-to-undulating blend: early weeks prioritize movement quality and caloric deficit adherence; mid-phase introduces density and conditioning layers; final phase peaks output while guarding joints.",
  weeklyLayout:
    "Full-body or upper/lower splits (home) or push/pull/legs variants (gym) with 2 non-negotiable rest or active-recovery days. Each week lists primary lifts, accessories, and optional finishers.",
  progressionModel:
    "Double progression on foundational patterns (add reps inside a rep range, then load). Cardio blocks progress in duration or intensity using repeatable RPE or heart-rate anchors.",
  volumeAndIntensity:
    "Moderate weekly volume with clear caps on hard sets; harder days are bookended by easier sessions. Deload-style weeks every 3–4 weeks depending on accumulated fatigue signals you log.",
  fatigueManagement:
    "Hard sessions are separated by at least 48h for the same pattern; lower-back and knee stress are distributed across hinges, squats, and unilateral work instead of repeating identical stress daily.",
  recoveryIntegration:
    "Sleep, hydration, and step targets are treated as training inputs. Easy walks, mobility finishers, and breath work appear as low-cost recovery—not optional fluff.",
  injuryPrevention:
    "Unilateral work, isometric holds, and tempo prescriptions reduce shear and teach positions before load chases. Sharp pain always stops the set—escalate to a clinician when symptoms are acute or neurological.",
  personalization:
    "Taller athletes: favor range-friendly variations (elevated deadlifts, split squats, trap-bar where available) and longer eccentrics on bodyweight patterns. Heavier athletes: prioritize joint-friendly volume landmarks before maximal efforts.",
  executionQuality:
    "Default tempo cues: 2–0–1 on compounds unless noted; rest windows are tight on accessories and generous on primary lifts. Form videos map to the schedule’s headline lifts.",
  smartProgression:
    "When reps stall for two consecutive sessions on the same lift at the same load, switch to a micro-load progression, add a set, or swap a joint-friendly variant before forcing maximal grinders."
};

const BASE_TRAINING_MUSCLE: ProgramEliteMeta = {
  periodization:
    "Hypertrophy-first mesocycles with a late-phase strength exposure week. Volume climbs conservatively, then pulls back before a final performance week so joints and tendons keep pace with muscle.",
  weeklyLayout:
    "Classic PPL or upper/lower with a clear primary lift per session, supported by 2–4 accessories. Arm and calf volume are distributed to avoid elbow inflammation from stacking pressing and curling same day.",
  progressionModel:
    "Primary lifts use progressive overload; accessories use rep targets and RPE caps. Intensity techniques (drops, myo-reps) appear late and sparingly—not every session.",
  volumeAndIntensity:
    "Weekly hard sets stay inside recoverable ranges; failure is reserved for isolation finishers. Back thickness and shoulder health are balanced with horizontal and vertical pulls every week.",
  fatigueManagement:
    "Lower back volume is capped by rotating hinge patterns; knee-friendly squat variants appear when quad volume is high. A built-in deload resets systemic fatigue before peaking.",
  recoveryIntegration:
    "Protein distribution across meals, peri-workout fueling guidance, and sleep framing as the primary anabolic. Active recovery days stay low-stress but keep blood flow.",
  injuryPrevention:
    "Rotator-cuff prep, scapular rhythm drills, and hamstring isometrics are embedded—not a separate PDF. Any sharp joint pain means stop, regress range, and seek professional evaluation if it persists.",
  personalization:
    "Beginners: fewer variations, more practice reps. Advanced: density options and secondary strength slots. Home plans bias unilateral and tempo; gym plans bias barbell progression where equipment allows.",
  executionQuality:
    "Tempo and pause reps teach positions; controlled eccentrics on lengthened-range movements for hypertrophy stimulus with lower joint stress than ballistic cheating.",
  smartProgression:
    "If scale weight and bar speed diverge (bodyweight up, bar speed down), prioritize food quality and sleep before adding volume—then adjust accessories before changing primary lift structure."
};

const BASE_DIET: ProgramEliteMeta = {
  periodization:
    "Macro phases align to training: higher carbs around harder sessions, stable protein daily, fat adjusts for calorie targets. Refeeds or diet breaks appear only when adherence and biofeedback justify them—not randomly.",
  weeklyLayout:
    "Daily meal structure with swaps at similar macro bands. Grocery lists batch prep into 2–3 cook blocks to reduce decision fatigue.",
  progressionModel:
    "Calorie changes are small (5–8% steps) with 10–14 day evaluation windows. Protein is held constant while carbs/fat flex to protect lean mass and training quality.",
  volumeAndIntensity:
    "Fiber and hydration targets protect appetite and digestion on lower calories. Caffeine and stimulant reliance is discouraged as a substitute for sleep.",
  fatigueManagement:
    "Low-energy days trigger a protected ‘minimum viable day’ template: hit protein + steps + one whole-food meal pattern—never a punitive starvation rebound.",
  recoveryIntegration:
    "Sleep and stress are explicitly modeled as variables that change hunger and cravings; the plan gives practical swaps instead of moralizing slip-ups.",
  injuryPrevention:
    "No medical claims. Users with metabolic disease, eating-disorder history, or pregnancy must work with licensed professionals before aggressive deficits.",
  personalization:
    "Taller or more active users receive higher step and carb floors; smaller athletes receive tighter portion templates. Budget modes emphasize affordable protein sources without pseudo-science ‘fat burning’ foods.",
  executionQuality:
    "Meals are written with prep time, reheating behavior, and salt/satiety in mind. Spices and volume foods improve adherence without ‘magic’ ingredients.",
  smartProgression:
    "If weight loss stalls for 14+ days while adherence is high, the next lever is structured refeed or maintenance week—not blind additional cardio."
};

const SLUG_OVERRIDES: Record<string, ElitePartial> = {
  "gym-fat-loss-protocol-12w": {
    weeklyLayout:
      "Gym-reserved compound emphasis with belt-friendly hinge progressions, machine finishers for safety when fatigue rises, and two weekly conditioning slots that do not cannibalize leg recovery.",
    smartProgression:
      "Treadmill or bike intervals scale by measured output (pace or watts) week to week; when joint stress rises, rotate to low-impact modalities before dropping strength volume."
  },
  "home-fat-burn-accelerator-12w": {
    weeklyLayout:
      "Bodyweight density circuits paired with low-impact steady state. Progression uses timed sets and reduced rest before adding external load (backpack) where appropriate.",
    injuryPrevention:
      "Wrist-friendly push-up elevations and knee-tracked squat patterns are default; plyometrics are optional and low-volume to protect tendons on hard floors."
  },
  "hypertrophy-system-12w": {
    periodization:
      "Block emphasis rotates metabolic stress, mechanical tension, and muscular damage across mesocycles—never stacking all three in the same microcycle.",
    volumeAndIntensity:
      "Weekly set landmarks for each muscle group stay inside evidence-informed ranges for natural trainees, with explicit back-off weeks."
  },
  "gym-mass-builder-12w": {
    progressionModel:
      "Top-set + back-off sets on primary lifts; accessories stay 1–2 RIR. Strength slots appear mid-week so weekend social eating does not ruin Monday performance.",
    personalization:
      "Hardgainers receive higher carb peri-workout guidance; easy-gainers receive more vegetable volume and step targets to keep appetite controlled."
  },
  "fat-loss-diet-plan": {
    periodization:
      "Protein-forward structure with phased carb cycling around training days; weekend flexibility built in without ‘cheat day’ binge architecture.",
    smartProgression:
      "If hunger spikes for 3+ days, the next adjustment is food volume (low-calorie density) before cutting calories again."
  },
  "lean-bulk-nutrition-plan": {
    periodization:
      "Lean surplus weeks alternate with maintenance weeks to limit fat spillover while keeping strength progression honest.",
    volumeAndIntensity:
      "Carb timing favors peri-workout; fat stays sufficient for hormone support without sabotaging calorie targets."
  }
};

function mergeElite(base: ProgramEliteMeta, partial?: ElitePartial): ProgramEliteMeta {
  if (!partial) return base;
  return { ...base, ...partial };
}

function pickTrainingBase(category: string): ProgramEliteMeta {
  const c = category.toLowerCase();
  if (c.includes("muscle") || c.includes("hypertrophy") || c.includes("mass") || c.includes("strength")) {
    return BASE_TRAINING_MUSCLE;
  }
  return BASE_TRAINING_FAT;
}

export function getProgramEliteMeta(slug: string, category: string, isDiet: boolean): ProgramEliteMeta {
  if (isDiet || category.toLowerCase().includes("nutrition")) {
    return mergeElite(BASE_DIET, SLUG_OVERRIDES[slug]);
  }
  const base = pickTrainingBase(category);
  return mergeElite(base, SLUG_OVERRIDES[slug]);
}

const LABELS_EN_DIET: ProgramEliteLabels = {
  badge: "Nutrition system",
  title: "How this plan is engineered",
  subtitle: "Macro logic, adherence, and recovery — written like a coach, not a calorie guessing game.",
  periodization: "Phase logic",
  weeklyLayout: "Weekly structure",
  progressionModel: "Progression rules",
  volumeAndIntensity: "Energy & density",
  fatigueManagement: "Hunger & energy",
  recoveryIntegration: "Sleep & stress",
  injuryPrevention: "Safety boundaries",
  personalization: "Personalization levers",
  executionQuality: "Meal execution",
  smartProgression: "When to adjust"
};

const LABELS_EN_TRAIN: ProgramEliteLabels = {
  badge: "Training system",
  title: "How this program is engineered",
  subtitle: "Periodization, volume, and progression — designed to be readable in the PDF and executable in the gym or at home.",
  periodization: "Periodization",
  weeklyLayout: "Weekly layout",
  progressionModel: "Progression model",
  volumeAndIntensity: "Volume & intensity",
  fatigueManagement: "Fatigue management",
  recoveryIntegration: "Recovery integration",
  injuryPrevention: "Injury prevention",
  personalization: "Personalization",
  executionQuality: "Execution quality",
  smartProgression: "Smart progression"
};

const LABELS_TR_TRAIN: ProgramEliteLabels = {
  ...LABELS_EN_TRAIN,
  badge: "Antrenman sistemi",
  title: "Program nasil kurgulanir",
  subtitle: "Periyot, hacim ve ilerleme — PDF'te okunakli, salonda veya evde uygulanabilir.",
  periodization: "Periyotizasyon",
  weeklyLayout: "Haftalik yapi",
  progressionModel: "Ilerleme modeli",
  volumeAndIntensity: "Hacim ve siddet",
  fatigueManagement: "Yorgunluk yonetimi",
  recoveryIntegration: "Toparlanma",
  injuryPrevention: "Sakatlik onleme",
  personalization: "Kisillestirme",
  executionQuality: "Uygulama kalitesi",
  smartProgression: "Akilli ilerleme"
};

const LABELS_TR_DIET: ProgramEliteLabels = {
  ...LABELS_EN_DIET,
  badge: "Beslenme sistemi",
  title: "Plan nasil kurgulanir",
  subtitle: "Makro mantigi, uyum ve toparlanma — tahmin degil, koç mantigi.",
  periodization: "Faz mantigi",
  weeklyLayout: "Haftalik yapi",
  progressionModel: "Ilerleme kurallari",
  volumeAndIntensity: "Enerji ve yogunluk",
  fatigueManagement: "Ac ve enerji",
  recoveryIntegration: "Uyku ve stres",
  injuryPrevention: "Guvenlik sinirlari",
  personalization: "Kisillestirme kollari",
  executionQuality: "Ogun uygulamasi",
  smartProgression: "Ne zaman revize"
};

export function getProgramEliteLabels(locale: Locale, isDiet: boolean): ProgramEliteLabels {
  if (locale === "tr") return isDiet ? LABELS_TR_DIET : LABELS_TR_TRAIN;
  return isDiet ? LABELS_EN_DIET : LABELS_EN_TRAIN;
}
