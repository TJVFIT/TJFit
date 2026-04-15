# CLAUDEUPGRADE3 — Cursor Agent Prompt

You are working on **TJFit** (tjfit.org) — a premium multilingual fitness platform built with:
- Next.js 14 App Router, TypeScript, Tailwind CSS
- Supabase (auth + RLS + server client)
- Locales: `en`, `tr`, `ar`, `es`, `fr` — all copy goes through i18n files
- Design system: dark theme `#09090B` bg, `#111215` panels, `#1E2028` borders, `#22D3EE` cyan accent, `#A78BFA` purple, Tailwind utility classes only

Complete ALL of the following tasks exactly as specified. Do not skip any. Do not invent new routes or tables — use existing ones.

---

## TASK 1 — Progress page: full workout logging form

**File:** `src/components/progress-view.tsx`
**File:** `src/lib/feature-copy.ts`

### What to change

The workout log form currently only captures `exercise` (a text input). The API at `POST /api/progress/workouts` and the `workout_logs` DB table already support `sets` (number), `reps` (number), `weight_kg` (number), and `duration_minutes` (number). Expose these fields in the form.

### Form layout
Replace the single `exercise` input with a small form that has:
1. `exercise` — text input, required (existing placeholder from i18n key `exercisePlaceholder`)
2. `sets` — number input, optional, placeholder "Sets" (add i18n key `setsPlaceholder`)
3. `reps` — number input, optional, placeholder "Reps" (add i18n key `repsPlaceholder`)
4. `weight_kg` — number input, optional, placeholder "Weight (kg)" (add i18n key `weightKgPlaceholder`)
5. `duration_minutes` — number input, optional, placeholder "Duration (min)" (add i18n key `durationPlaceholder`)

Lay out inputs 2–5 in a 2×2 grid below input 1. Keep the existing "Add" button.

### State
Add state: `sets`, `reps`, `workoutWeight`, `duration` (all string, default `""`). Clear all five after a successful add.

### POST body
Pass `sets`, `reps`, `weight_kg`, `duration_minutes` as numbers (parsed with `Number()`, or `null` if the string is empty) in the fetch body alongside `exercise`.

### List display
Each workout row already shows `workout_date - exercise`. Append the details if present:
`Apr 12 — Bench Press  3×8  80 kg  45 min`
Only append fields that are non-null.

### i18n
Add these keys to `ProgressCopy` type and all 5 locales in `src/lib/feature-copy.ts`:
- `setsPlaceholder` — "Sets" / "Setler" / "المجموعات" / "Series" / "Séries"
- `repsPlaceholder` — "Reps" / "Tekrarlar" / "التكرارات" / "Reps" / "Répétitions"
- `weightKgPlaceholder` — "Weight (kg)" / "Agirlik (kg)" / "الوزن (كغ)" / "Peso (kg)" / "Poids (kg)"
- `durationPlaceholder` — "Duration (min)" / "Sure (dk)" / "المدة (د)" / "Duración (min)" / "Durée (min)"

---

## TASK 2 — Progress page: body measurements form

**File:** `src/components/progress-view.tsx`
**File:** `src/lib/feature-copy.ts`

### What to change

The `POST /api/progress/entries` route and `progress_entries` table already accept `waist_cm`, `chest_cm`, and `hips_cm` but the form only shows `weight_kg` and `body_fat_percent`. Add these three fields.

### Form layout
Add three number inputs below the existing two:
- `waist_cm` — placeholder from i18n key `waistPlaceholder`
- `chest_cm` — placeholder from i18n key `chestPlaceholder`
- `hips_cm` — placeholder from i18n key `hipsPlaceholder`

All optional. Use same `input` CSS class as existing fields.

### State
Add state: `waist`, `chest`, `hips` (all string, default `""`). Clear after successful save.

### POST body
Include `waist_cm`, `chest_cm`, `hips_cm` as numbers or null alongside the existing fields.

### List display
Entry rows currently show `date - weight kg / fat%`. Append measurements if non-null:
`Apr 12 — 78 kg / 18%  |  W:82cm  C:95cm  H:88cm`

### i18n
Add to `ProgressCopy` type and all 5 locales:
- `waistPlaceholder` — "Waist (cm)" / "Bel (cm)" / "الخصر (سم)" / "Cintura (cm)" / "Tour de taille (cm)"
- `chestPlaceholder` — "Chest (cm)" / "Gogus (cm)" / "الصدر (سم)" / "Pecho (cm)" / "Poitrine (cm)"
- `hipsPlaceholder` — "Hips (cm)" / "Kalca (cm)" / "الورك (سم)" / "Caderas (cm)" / "Hanches (cm)"

---

## TASK 3 — Progress page: milestone target value

**File:** `src/components/progress-view.tsx`
**File:** `src/lib/feature-copy.ts`

### What to change

The `POST /api/progress/milestones` route already accepts `target_value` (a freeform string like "Bench press 100 kg"). The form currently only captures `title`. Add a second optional input for `target_value`.

### Form layout
Below the existing `milestoneTitle` input, add one more text input:
- placeholder from i18n key `milestoneTargetPlaceholder`
- optional — can be left blank

### State
Add state: `milestoneTarget` (string, default `""`). Clear after successful add.

### POST body
Include `target_value: milestoneTarget.trim() || undefined` in the POST body.

### List display
If `target_value` is non-null, show it as a smaller subtitle under the milestone title:
```
Bench press 100 kg          [Complete]
  → Target: 3 sets × 5 reps
```

Use `text-xs text-zinc-500` for the target line.

### i18n
Add to `ProgressCopy` type and all 5 locales:
- `milestoneTargetPlaceholder` — "Target (optional)" / "Hedef degeri (opsiyonel)" / "القيمة المستهدفة (اختياري)" / "Objetivo (opcional)" / "Objectif (facultatif)"

---

## TASK 4 — Dashboard: streak counter in header

**File:** `src/app/api/user/dashboard-summary/route.ts`
**File:** `src/components/user-dashboard-view.tsx`
**File:** `src/lib/user-dashboard-copy.ts` (or wherever `getUserDashboardCopy` is defined)

### Step A — API: compute streak

In `dashboard-summary/route.ts`, add a 5th parallel query to get all distinct `workout_date` values (or `entry_date` from progress_entries) for this user, ordered descending. Then compute a streak: count consecutive days from today backwards where the user has at least one workout or progress entry log.

Specifically:
1. Fetch `workout_logs` dates: `.select("workout_date").eq("user_id", uid).order("workout_date", { ascending: false }).limit(365)`
2. Merge both `entry_date` (from existing `entryRowsRes` — expand to `.limit(365)`) and `workout_date` into a single Set of ISO date strings.
3. Compute streak: starting from today, count backwards as long as each date exists in the Set. Stop at the first gap.
4. Add `streak: number` to the JSON response.

### Step B — Component: display streak

In `user-dashboard-view.tsx`:
1. Add `streak: number` to the `Summary` type.
2. In the header section, next to the date display (the `<p className="text-sm text-[#52525B]">` element showing the formatted date), add a streak badge **only if `summary.streak > 0`**:

```tsx
<span className="inline-flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-400">
  🔥 {summary.streak} {t.streakDays}
</span>
```

Place it in the `sm:flex-row` row alongside the date, wrapping in a `flex items-center gap-3`.

### i18n
Add `streakDays` key to the dashboard copy function/object for all 5 locales:
- en: "day streak" (e.g. "🔥 7 day streak")
- tr: "gunluk seri"
- ar: "أيام متتالية"
- es: "días seguidos"
- fr: "jours de suite"

---

## TASK 5 — Dashboard: quick-log widget

**File:** `src/components/user-dashboard-view.tsx`

### What to add

Add a compact inline workout log form at the bottom of the dashboard (after the stats grid section), visible only when the user has at least one paid program (`hasPaidProgram === true`) or has logged before (`!isBrandNew`).

### Layout

```
[ Quick Log ]  ──────────────────────────────────
[ Exercise input           ] [ Sets ] [ Reps ] [Log →]
```

- Section heading: small `text-[13px] font-medium uppercase tracking-widest text-[#52525B]` label: `t.quickLog`
- A single-row flex form with:
  - `exercise` text input (flex-1)
  - `sets` number input (w-16)
  - `reps` number input (w-16)
  - Submit button labeled `t.quickLogBtn` styled as `lux-btn-primary` (same class used for the empty-state CTA)
- On submit: `POST /api/progress/workouts` with `{ exercise, sets: sets ? Number(sets) : null, reps: reps ? Number(reps) : null }`
- After success: clear form fields, and increment `summary.progressEntryCount` locally by 1 (optimistic UI — no need to re-fetch)
- On error: do nothing silently (consistent with rest of app style)

### i18n
Add `quickLog` and `quickLogBtn` to the dashboard copy for all 5 locales:
- en: `quickLog: "Quick log"`, `quickLogBtn: "Log"`
- tr: `quickLog: "Hizli kayit"`, `quickLogBtn: "Kaydet"`
- ar: `quickLog: "تسجيل سريع"`, `quickLogBtn: "تسجيل"`
- es: `quickLog: "Registro rápido"`, `quickLogBtn: "Registrar"`
- fr: `quickLog: "Entrée rapide"`, `quickLogBtn: "Enregistrer"`

---

## TASK 6 — Leaderboard: podium colors (cyan tiers)

**File:** `src/app/[locale]/leaderboard/page.tsx`

### What to change

Currently all top-3 rows share the same `border-yellow-400/40` / `border-zinc-300/30` / `border-amber-700/40` border colors and the rank badge always shows a cyan crown.

Replace with a **cyan-tier** system:

| Rank | Border | Crown color | Score text |
|------|--------|-------------|------------|
| #1 | `border-cyan-400/50` | `text-[#22D3EE]` (full cyan) | `text-[#22D3EE]` |
| #2 | `border-cyan-400/25` | `text-cyan-400/60` | `text-cyan-400/70` |
| #3 | `border-cyan-400/15` | `text-cyan-400/35` | `text-cyan-400/45` |
| 4+ | `border-[#1E2028]` | rank number, `text-zinc-400` | `text-[#52525B]` |

Apply to:
- The row container border (`rankClass`)
- The crown icon / rank number inside the rank badge circle
- The score value on the right side of each row

Keep the streak sub-line as-is (`text-xs text-[#52525B]`).

---

## TASK 7 — Personal Records page

**File:** `src/app/[locale]/records/page.tsx`
**File:** `src/app/api/progress/records/route.ts` ← **create this new file**

### Step A — API route

Create `src/app/api/progress/records/route.ts`:

```
GET /api/progress/records
```

Auth-gated (use `requireAuth` from `@/lib/require-auth`).

Query `workout_logs` for this user:
```sql
SELECT exercise, max(weight_kg) as max_weight, max(reps) as max_reps, max(duration_minutes) as max_duration, count(*) as total_sets
FROM workout_logs
WHERE user_id = $uid AND exercise IS NOT NULL
GROUP BY exercise
ORDER BY exercise ASC
```

Translate to Supabase JS: fetch all rows with `select("exercise,weight_kg,reps,duration_minutes").eq("user_id", uid).not("exercise", "is", null)`, then aggregate in TypeScript:
- Group by `exercise` (case-insensitive, trimmed)
- For each exercise: `max_weight_kg`, `max_reps`, `max_duration_minutes`, `total_sets` (count of rows)

Return:
```json
{ "records": [ { "exercise": "Bench Press", "max_weight_kg": 100, "max_reps": 12, "max_duration_minutes": null, "total_sets": 24 }, ... ] }
```

### Step B — Page component

Replace `src/app/[locale]/records/page.tsx` (currently shows `ComingSoonLaunchPage`) with a full client component:

**Layout:**
- Same `PremiumPageShell` wrapper (import from `@/components/premium`)
- Page heading: "Personal Records" with `text-xs uppercase tracking-widest text-[#52525B]` label "Records" above it
- Search input to filter by exercise name (client-side, debounced 300ms)
- A responsive grid of record cards (1 col mobile, 2 col md, 3 col xl)

**Each card:**
```
┌─────────────────────────────────────┐
│  Bench Press                        │
│  ─────────────────────────────────  │
│  🏋️ 100 kg    🔁 12 reps    ⏱ —    │
│  Total sets logged: 24              │
└─────────────────────────────────────┘
```

- Card style: `rounded-2xl border border-[#1E2028] bg-[#111215] p-5`
- Exercise name: `text-base font-semibold text-white`
- Stats row: `text-sm text-zinc-300`, show `—` for null values
- "Total sets logged" sub-line: `text-xs text-zinc-500`

**Empty state** (no workouts logged yet):
- Center a `Dumbbell` icon from lucide-react
- Heading: "No records yet."
- Sub: "Log workouts with sets, reps, and weight to see your personal bests here."
- Link to `/progress`

**Loading state:** 6 skeleton cards (animate-pulse, h-28, rounded-2xl)

**Data fetching:** fetch on mount with `useEffect`, `GET /api/progress/records`.

---

## General rules

- Never use `select("*")` — always list columns explicitly
- Never introduce new Supabase tables or migrations
- Keep all i18n keys in the existing `src/lib/feature-copy.ts` file (or wherever the relevant copy function lives)
- Keep the dark design system: no light colors, no white backgrounds
- All numeric inputs: `type="number" min="0"` with `step="0.1"` for decimal fields (weight, body fat, measurements), `step="1"` for integer fields (sets, reps, duration)
- The app uses `import { cn } from "@/lib/utils"` for conditional class merging — use it where needed
- TypeScript strict mode — no implicit `any`, no unused variables
- Run `npx tsc --noEmit` mentally as you work — the codebase must compile clean

Complete all 7 tasks. Start with Tasks 1–3 (progress-view.tsx changes) together since they all touch the same file, then Task 4 (dashboard API + component), then Task 5 (quick-log), then Task 6 (leaderboard), then Task 7 (records page + new API route).
