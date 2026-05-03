// Shared exercise library (v3.9).
//
// Atomic-movement definitions referenced by every program. EN
// authored by hand; other locales `__TRANSLATE__` placeholders for
// the translation pipeline to fill.
//
// Initial set: 18 core compounds + isolations covering the Comeback
// 12w program (sufficient for a single full-program proof of the
// schema). Future programs add more as needed; the library grows
// organically with each new program file.
//
// Naming: kebab-case ids. Format `<modifier>-<movement>` e.g.
// `barbell-back-squat`, `dumbbell-bench-press`, `bodyweight-pushup`.

import { en, type Exercise } from "../schema";

export const exercises: Record<string, Exercise> = {
  "barbell-back-squat": {
    id: "barbell-back-squat",
    name: en("Barbell Back Squat"),
    muscleGroups: ["quads", "glutes", "hamstrings", "core", "lower_back"],
    equipment: ["barbell", "squat_rack"],
    description: en(
      "Compound lower-body lift. Bar rests on upper traps; descend into a deep squat by sitting back and down, then drive through the whole foot to stand."
    ),
    cues: en(
      "1) Brace core hard before unracking. 2) Feet shoulder-width, toes ~15° out. 3) Sit back AND down — knees track over toes, never collapse inward. 4) Descend until hips below knees if mobility allows. 5) Drive through whole foot — hips and chest rise together."
    ),
    warningNotes: en(
      "Knees collapsing inward is the #1 mistake. If knees or low back hurt, scale to box squat or goblet squat. Never round the back at the bottom."
    )
  },

  "romanian-deadlift": {
    id: "romanian-deadlift",
    name: en("Romanian Deadlift"),
    muscleGroups: ["hamstrings", "glutes", "lower_back", "core"],
    equipment: ["barbell"],
    description: en(
      "Hip-hinge movement. Bar slides down the front of the legs as hips push back; minimal knee bend. Felt almost entirely in hamstrings."
    ),
    cues: en(
      "1) Soft knees, never lock. 2) Push hips BACK, not down. 3) Bar stays glued to legs. 4) Stop when hamstrings stretch — usually mid-shin. 5) Drive hips forward to stand."
    ),
    warningNotes: en("Round the lower back = injury. If hamstring flexibility is limited, stop higher.")
  },

  "bulgarian-split-squat": {
    id: "bulgarian-split-squat",
    name: en("Bulgarian Split Squat"),
    muscleGroups: ["quads", "glutes", "hamstrings", "core"],
    equipment: ["bench", "dumbbells"],
    description: en("Single-leg quad-dominant squat with rear foot elevated on a bench. Brutal but effective."),
    cues: en(
      "1) Front foot far enough forward that the front shin stays vertical at the bottom. 2) Drop straight down. 3) Drive through the whole front foot. 4) Keep torso mostly upright."
    )
  },

  "leg-curl": {
    id: "leg-curl",
    name: en("Lying or Seated Leg Curl"),
    muscleGroups: ["hamstrings"],
    equipment: ["leg_curl_machine"],
    description: en("Isolation for hamstrings. Use whichever variant the gym has."),
    cues: en("Squeeze hamstrings hard at the top. Slow eccentric (3 seconds). Don't bounce.")
  },

  "standing-calf-raise": {
    id: "standing-calf-raise",
    name: en("Standing Calf Raise"),
    muscleGroups: ["calves"],
    equipment: ["calf_raise_machine"],
    description: en("Bodyweight or weighted plantar-flexion drill."),
    cues: en("Full stretch at the bottom — heel below platform. Pause one count at the top. Pause one count at the stretch.")
  },

  "barbell-bench-press": {
    id: "barbell-bench-press",
    name: en("Barbell Bench Press"),
    muscleGroups: ["chest", "front_delts", "triceps"],
    equipment: ["barbell", "bench"],
    description: en("Compound horizontal push. Lie supine on bench; lower bar to mid-chest; press to lockout."),
    cues: en(
      "1) Arch upper back, plant feet. 2) Bar over mid-chest, NOT collarbone. 3) Tuck elbows ~45° from torso (not flared 90°). 4) Touch lightly, drive bar in slight arc back over shoulders."
    ),
    warningNotes: en("Elbows flared at 90° wrecks shoulders. Always use a spotter or safety pins for working sets.")
  },

  "overhead-press": {
    id: "overhead-press",
    name: en("Overhead Press (Barbell)"),
    muscleGroups: ["front_delts", "side_delts", "triceps", "core"],
    equipment: ["barbell"],
    description: en("Standing strict press from rack position to overhead lockout."),
    cues: en(
      "1) Brace core, glutes squeezed. 2) Bar rests on front delts at start. 3) Press straight up — push head through arms at lockout. 4) Don't lean back."
    )
  },

  "bent-over-barbell-row": {
    id: "bent-over-barbell-row",
    name: en("Bent-Over Barbell Row"),
    muscleGroups: ["lats", "rhomboids", "rear_delts", "biceps", "lower_back"],
    equipment: ["barbell"],
    description: en("Hip-hinged horizontal pull. Torso parallel-ish to floor; row bar to lower ribs."),
    cues: en(
      "1) Hip-hinge to ~45° torso angle. 2) Pull bar to lower ribs / upper abs, not chest. 3) Squeeze shoulder blades at top. 4) Slow eccentric."
    )
  },

  "pull-up": {
    id: "pull-up",
    name: en("Pull-Up"),
    muscleGroups: ["lats", "rhomboids", "biceps", "rear_delts"],
    equipment: ["pull_up_bar"],
    description: en("Bodyweight vertical pull. Hands overhand, slightly wider than shoulders."),
    cues: en(
      "1) Dead hang at start — full stretch. 2) Pull elbows down and back, NOT just up. 3) Chest to bar at top, hold one count. 4) Slow eccentric — 3 seconds."
    )
  },

  "lat-pulldown": {
    id: "lat-pulldown",
    name: en("Lat Pulldown"),
    muscleGroups: ["lats", "rhomboids", "biceps", "rear_delts"],
    equipment: ["lat_pulldown_machine"],
    description: en("Cable-driven vertical pull. Substitute for pull-ups when bodyweight is too heavy."),
    cues: en("Same form as pull-up: pull elbows down and back, not just bring bar down. Lean back ~15°.")
  },

  "dumbbell-bench-press": {
    id: "dumbbell-bench-press",
    name: en("Dumbbell Bench Press"),
    muscleGroups: ["chest", "front_delts", "triceps"],
    equipment: ["dumbbells", "bench"],
    description: en("Bench press with dumbbells. Greater range of motion, more shoulder-friendly."),
    cues: en("Lower until elbows reach about chest depth. Press dumbbells slightly inward at lockout. Don't clang them.")
  },

  "dumbbell-row": {
    id: "dumbbell-row",
    name: en("Single-Arm Dumbbell Row"),
    muscleGroups: ["lats", "rhomboids", "rear_delts", "biceps"],
    equipment: ["dumbbells", "bench"],
    description: en("One hand on bench for support; row dumbbell to hip."),
    cues: en("Pull dumbbell to hip, not chest. Don't let torso rotate. Squeeze hard at the top.")
  },

  "dumbbell-shoulder-press": {
    id: "dumbbell-shoulder-press",
    name: en("Seated Dumbbell Shoulder Press"),
    muscleGroups: ["front_delts", "side_delts", "triceps"],
    equipment: ["dumbbells", "bench"],
    description: en("Vertical press with dumbbells from shoulder height to lockout."),
    cues: en("Start with dumbbells at ear level, palms forward. Press straight up — don't let elbows flare behind head.")
  },

  "barbell-curl": {
    id: "barbell-curl",
    name: en("Barbell Curl"),
    muscleGroups: ["biceps", "forearms"],
    equipment: ["barbell"],
    description: en("Standing bicep isolation. Strict — no body english."),
    cues: en("Elbows pinned to sides. Curl with biceps, not by swinging. Slow eccentric.")
  },

  "tricep-rope-pushdown": {
    id: "tricep-rope-pushdown",
    name: en("Tricep Rope Pushdown"),
    muscleGroups: ["triceps"],
    equipment: ["cable_machine"],
    description: en("Cable isolation for triceps. Spread rope at the bottom."),
    cues: en("Elbows pinned to sides. Push down and slightly out — squeeze triceps hard at lockout.")
  },

  "plank": {
    id: "plank",
    name: en("Plank"),
    muscleGroups: ["core", "shoulders", "glutes"],
    equipment: ["bodyweight"],
    description: en("Isometric core hold. Forearms on floor, body in straight line from head to heels."),
    cues: en("Squeeze glutes hard. Pull belly button toward spine. Don't let hips sag or pike up.")
  },

  "bodyweight-pushup": {
    id: "bodyweight-pushup",
    name: en("Push-Up"),
    muscleGroups: ["chest", "front_delts", "triceps", "core"],
    equipment: ["bodyweight"],
    description: en("Bodyweight horizontal push. Hands shoulder-width, body straight."),
    cues: en("Elbows ~45° from torso. Lower until chest grazes floor. Press up by pushing the floor away. Don't let hips sag.")
  },

  "goblet-squat": {
    id: "goblet-squat",
    name: en("Goblet Squat"),
    muscleGroups: ["quads", "glutes", "hamstrings", "core"],
    equipment: ["dumbbells"],
    description: en("Front-loaded squat holding a single dumbbell at chest. Best teaching tool for squat patterning."),
    cues: en("Hold DB at chest like a goblet. Sit straight down — feel knees track over toes, hips drop between feet. Drive through the whole foot.")
  }
};

/** Helper: get an exercise by id with a runtime guard. */
export function getExercise(id: string): Exercise | undefined {
  return exercises[id];
}

/** All exercise ids — useful for catalog views and translation runs. */
export function allExerciseIds(): string[] {
  return Object.keys(exercises);
}
