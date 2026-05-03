// Comeback 12w — Week 1: Foundation. RPE 6 across the board.
//
// Full 4 training days authored to spec (per Phase 3.4 of v3.9).
// Days 1, 3, 5, 6 = training. Days 2, 4, 7 = rest.
// Total weekly volume ~48 working sets, ~240 minutes session time.

import { en, type ProgramWeek } from "@/lib/programs/schema";

export const week01: ProgramWeek = {
  weekNumber: 1,
  phase: "foundation",
  focus: en(
    "Reintroduce movement patterns. Don't chase weight — build the groove. Today is technique, not strength."
  ),
  weeklyVolume_estimate: { sets: 48, minutes: 240 },
  days: [
    // ---------------- Day 1 — Lower Body, Squat focus ----------------
    {
      day: 1,
      weekNumber: 1,
      type: "training",
      name: en("Lower Body — Squat Focus"),
      duration_minutes_estimate: 65,
      rpe_target: 6,
      warmup: en(
        "5 min easy bike or row\nHip circles 10 each direction\nLeg swings 10/side\nBodyweight squats 2x10\nGoblet squats with light weight 2x8"
      ),
      cooldown: en(
        "Walk 5 min easy\nHip flexor stretch 30s/side x 2\nPigeon stretch 45s/side\nForward fold 30s"
      ),
      exercises: [
        {
          exerciseId: "barbell-back-squat",
          sets: [
            { type: "warmup", reps: 5, weight: "empty bar", rest_seconds: 60 },
            { type: "warmup", reps: 5, weight: "50% working weight", rest_seconds: 90 },
            { type: "warmup", reps: 3, weight: "70% working weight", rest_seconds: 120 },
            { type: "working", reps: 8, weight: "RPE 6 (4 reps in reserve)", rest_seconds: 180, rpe: 6 },
            { type: "working", reps: 8, weight: "RPE 6", rest_seconds: 180, rpe: 6 },
            { type: "working", reps: 8, weight: "RPE 6", rest_seconds: 180, rpe: 6 }
          ]
        },
        {
          exerciseId: "romanian-deadlift",
          sets: [
            { type: "working", reps: "8-10", weight: "RPE 6", rest_seconds: 120, rpe: 6 },
            { type: "working", reps: "8-10", weight: "RPE 6", rest_seconds: 120, rpe: 6 },
            { type: "working", reps: "8-10", weight: "RPE 6", rest_seconds: 120, rpe: 6 }
          ]
        },
        {
          exerciseId: "bulgarian-split-squat",
          sets: [
            { type: "working", reps: 10, weight: "BW or light DBs", rest_seconds: 90 },
            { type: "working", reps: 10, weight: "BW or light DBs", rest_seconds: 90 },
            { type: "working", reps: 10, weight: "BW or light DBs", rest_seconds: 90 }
          ]
        },
        {
          exerciseId: "leg-curl",
          sets: [
            { type: "working", reps: 12, weight: "RPE 7", rest_seconds: 60, rpe: 7 },
            { type: "working", reps: 12, weight: "RPE 7", rest_seconds: 60, rpe: 7 },
            { type: "working", reps: 12, weight: "RPE 7", rest_seconds: 60, rpe: 7 }
          ]
        },
        {
          exerciseId: "standing-calf-raise",
          sets: [
            { type: "working", reps: 15, weight: "RPE 8", rest_seconds: 60, rpe: 8 },
            { type: "working", reps: 15, weight: "RPE 8", rest_seconds: 60, rpe: 8 }
          ]
        },
        {
          exerciseId: "plank",
          sets: [
            { type: "working", duration: 30, rest_seconds: 30 },
            { type: "working", duration: 30, rest_seconds: 30 },
            { type: "working", duration: 30, rest_seconds: 30 }
          ]
        }
      ],
      notes: en(
        "Week 1, day 1 — keep weights conservative. Today is about reintroducing the movement pattern, not testing strength. If anything feels off, drop weight 10%. Soreness for 2-3 days is normal and expected."
      )
    },

    // ---------------- Day 2 — Rest ----------------
    {
      day: 2,
      weekNumber: 1,
      type: "rest",
      name: en("Rest"),
      duration_minutes_estimate: 0,
      warmup: en(""),
      cooldown: en(""),
      exercises: [],
      notes: en(
        "Active recovery: walk 30 minutes at conversational pace. Hydrate (3 L water). Sleep 8 hours. No training stimulus today — let week 1 day 1 settle."
      )
    },

    // ---------------- Day 3 — Upper Body Push ----------------
    {
      day: 3,
      weekNumber: 1,
      type: "training",
      name: en("Upper Body — Push Focus"),
      duration_minutes_estimate: 60,
      rpe_target: 6,
      warmup: en(
        "5 min easy row or bike\nArm circles 10/direction\nBand pull-aparts 2x15\nBand dislocates 2x10\nLight bench press warmup 2x8 with empty bar"
      ),
      cooldown: en(
        "Doorway pec stretch 30s/side x 2\nThoracic spine extension on foam roller 60s\nLat stretch 30s/side"
      ),
      exercises: [
        {
          exerciseId: "barbell-bench-press",
          sets: [
            { type: "warmup", reps: 5, weight: "empty bar", rest_seconds: 60 },
            { type: "warmup", reps: 5, weight: "50% working weight", rest_seconds: 90 },
            { type: "warmup", reps: 3, weight: "70% working weight", rest_seconds: 120 },
            { type: "working", reps: 8, weight: "RPE 6", rest_seconds: 180, rpe: 6 },
            { type: "working", reps: 8, weight: "RPE 6", rest_seconds: 180, rpe: 6 },
            { type: "working", reps: 8, weight: "RPE 6", rest_seconds: 180, rpe: 6 }
          ]
        },
        {
          exerciseId: "overhead-press",
          sets: [
            { type: "working", reps: "8-10", weight: "RPE 6", rest_seconds: 150, rpe: 6 },
            { type: "working", reps: "8-10", weight: "RPE 6", rest_seconds: 150, rpe: 6 },
            { type: "working", reps: "8-10", weight: "RPE 6", rest_seconds: 150, rpe: 6 }
          ]
        },
        {
          exerciseId: "dumbbell-bench-press",
          sets: [
            { type: "working", reps: 10, weight: "RPE 7", rest_seconds: 90, rpe: 7 },
            { type: "working", reps: 10, weight: "RPE 7", rest_seconds: 90, rpe: 7 },
            { type: "working", reps: 10, weight: "RPE 7", rest_seconds: 90, rpe: 7 }
          ]
        },
        {
          exerciseId: "tricep-rope-pushdown",
          sets: [
            { type: "working", reps: 12, weight: "RPE 7", rest_seconds: 60, rpe: 7 },
            { type: "working", reps: 12, weight: "RPE 7", rest_seconds: 60, rpe: 7 },
            { type: "working", reps: 12, weight: "RPE 7", rest_seconds: 60, rpe: 7 }
          ]
        },
        {
          exerciseId: "plank",
          sets: [
            { type: "working", duration: 30, rest_seconds: 30 },
            { type: "working", duration: 30, rest_seconds: 30 }
          ]
        }
      ],
      notes: en(
        "Use a spotter on bench. If you don't have one, set safety pins. Bench is the lift where ego gets people hurt — week 1 is not the week to test."
      )
    },

    // ---------------- Day 4 — Rest ----------------
    {
      day: 4,
      weekNumber: 1,
      type: "rest",
      name: en("Rest"),
      duration_minutes_estimate: 0,
      warmup: en(""),
      cooldown: en(""),
      exercises: [],
      notes: en("Walk 30 min. Hydrate. Sleep 8 h.")
    },

    // ---------------- Day 5 — Lower Body, Deadlift focus ----------------
    {
      day: 5,
      weekNumber: 1,
      type: "training",
      name: en("Lower Body — Hinge Focus"),
      duration_minutes_estimate: 65,
      rpe_target: 6,
      warmup: en(
        "5 min easy bike\nHip circles, leg swings, cat-cow 1 min each\nGoblet squats 2x8\nLight RDL 2x6 with empty bar"
      ),
      cooldown: en(
        "Hamstring stretch 45s/side\nPigeon stretch 45s/side\nFoam roll glutes + hamstrings 2 min total"
      ),
      exercises: [
        {
          exerciseId: "romanian-deadlift",
          sets: [
            { type: "warmup", reps: 5, weight: "empty bar", rest_seconds: 60 },
            { type: "warmup", reps: 5, weight: "50% working weight", rest_seconds: 90 },
            { type: "working", reps: 6, weight: "RPE 6", rest_seconds: 180, rpe: 6 },
            { type: "working", reps: 6, weight: "RPE 6", rest_seconds: 180, rpe: 6 },
            { type: "working", reps: 6, weight: "RPE 6", rest_seconds: 180, rpe: 6 }
          ]
        },
        {
          exerciseId: "barbell-back-squat",
          sets: [
            { type: "working", reps: 6, weight: "RPE 6 (lighter than Day 1)", rest_seconds: 150, rpe: 6 },
            { type: "working", reps: 6, weight: "RPE 6", rest_seconds: 150, rpe: 6 },
            { type: "working", reps: 6, weight: "RPE 6", rest_seconds: 150, rpe: 6 }
          ]
        },
        {
          exerciseId: "goblet-squat",
          sets: [
            { type: "working", reps: 12, weight: "Moderate DB", rest_seconds: 90 },
            { type: "working", reps: 12, weight: "Moderate DB", rest_seconds: 90 }
          ]
        },
        {
          exerciseId: "leg-curl",
          sets: [
            { type: "working", reps: 12, weight: "RPE 7", rest_seconds: 60, rpe: 7 },
            { type: "working", reps: 12, weight: "RPE 7", rest_seconds: 60, rpe: 7 },
            { type: "working", reps: 12, weight: "RPE 7", rest_seconds: 60, rpe: 7 }
          ]
        },
        {
          exerciseId: "standing-calf-raise",
          sets: [
            { type: "working", reps: 15, weight: "RPE 8", rest_seconds: 60, rpe: 8 },
            { type: "working", reps: 15, weight: "RPE 8", rest_seconds: 60, rpe: 8 }
          ]
        }
      ],
      notes: en(
        "RDL is the priority lift today — squat is supplementary. Focus on hip-hinge groove, hamstring stretch, no rounding. If your lower back feels tight, drop volume by one set per movement."
      )
    },

    // ---------------- Day 6 — Upper Body Pull ----------------
    {
      day: 6,
      weekNumber: 1,
      type: "training",
      name: en("Upper Body — Pull Focus"),
      duration_minutes_estimate: 60,
      rpe_target: 6,
      warmup: en(
        "5 min row\nBand pull-aparts 2x15\nScapular pull-ups 2x8 from a dead hang\nLight DB row 2x8 each side"
      ),
      cooldown: en(
        "Lat stretch 30s/side\nDoorway pec stretch 30s/side\nForward fold 30s"
      ),
      exercises: [
        {
          exerciseId: "lat-pulldown",
          sets: [
            { type: "warmup", reps: 8, weight: "Light", rest_seconds: 60 },
            { type: "working", reps: "8-10", weight: "RPE 6", rest_seconds: 120, rpe: 6 },
            { type: "working", reps: "8-10", weight: "RPE 6", rest_seconds: 120, rpe: 6 },
            { type: "working", reps: "8-10", weight: "RPE 6", rest_seconds: 120, rpe: 6 }
          ]
        },
        {
          exerciseId: "bent-over-barbell-row",
          sets: [
            { type: "warmup", reps: 5, weight: "empty bar", rest_seconds: 60 },
            { type: "working", reps: 8, weight: "RPE 6", rest_seconds: 150, rpe: 6 },
            { type: "working", reps: 8, weight: "RPE 6", rest_seconds: 150, rpe: 6 },
            { type: "working", reps: 8, weight: "RPE 6", rest_seconds: 150, rpe: 6 }
          ]
        },
        {
          exerciseId: "dumbbell-row",
          sets: [
            { type: "working", reps: 10, weight: "RPE 7 each side", rest_seconds: 90, rpe: 7 },
            { type: "working", reps: 10, weight: "RPE 7", rest_seconds: 90, rpe: 7 },
            { type: "working", reps: 10, weight: "RPE 7", rest_seconds: 90, rpe: 7 }
          ]
        },
        {
          exerciseId: "barbell-curl",
          sets: [
            { type: "working", reps: 10, weight: "RPE 7", rest_seconds: 60, rpe: 7 },
            { type: "working", reps: 10, weight: "RPE 7", rest_seconds: 60, rpe: 7 },
            { type: "working", reps: 10, weight: "RPE 7", rest_seconds: 60, rpe: 7 }
          ]
        },
        {
          exerciseId: "plank",
          sets: [
            { type: "working", duration: 30, rest_seconds: 30 },
            { type: "working", duration: 30, rest_seconds: 30 }
          ]
        }
      ],
      notes: en(
        "Pull-up is the gold-standard pulling movement; if you can do strict pull-ups for sets of 5+, swap them in for the lat pulldown. Otherwise, lat pulldown until you build back to bodyweight pull-ups."
      )
    },

    // ---------------- Day 7 — Rest ----------------
    {
      day: 7,
      weekNumber: 1,
      type: "rest",
      name: en("Rest"),
      duration_minutes_estimate: 0,
      warmup: en(""),
      cooldown: en(""),
      exercises: [],
      notes: en(
        "Long walk (45 min) or easy mobility. Reflect: how did week 1 feel? Note soreness, sleep, energy. Use this to calibrate week 2."
      )
    }
  ]
};
