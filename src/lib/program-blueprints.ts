export type ProgramBlueprint = {
  goal: string;
  level: string;
  equipment: string;
  weeklyPhases: Array<{
    title: string;
    focus: string;
    trainingDays: string[];
    conditioning: string[];
  }>;
  safety: string[];
};

export const programBlueprints: Record<string, ProgramBlueprint> = {
  "home-fat-burn-accelerator-12w": {
    goal: "Fat loss and cardio development",
    level: "Beginner to advanced progression",
    equipment: "No equipment required",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Foundation",
        focus: "Build movement quality, core endurance, and routine consistency.",
        trainingDays: [
          "Day 1: Jumping jacks, squats, high knees, push-ups, plank - 3 rounds",
          "Day 2: Mountain climbers, lunges, burpees, sit-ups - 3 rounds",
          "Day 4: Repeat Day 1 with execution quality focus",
          "Day 5: Repeat Day 2 with controlled pacing"
        ],
        conditioning: ["Day 3: Walk 20-25 min", "Day 6: Walk 25-30 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 3-4 Volume Build",
        focus: "Increase total work capacity and reduce rest windows.",
        trainingDays: [
          "Day 1 and Day 4: Week 2 structure increased to 4 rounds",
          "Day 2 and Day 5: Week 2 structure increased to 4 rounds",
          "Work intervals move to 40 sec in main cardio drills",
          "Push-up, squat, and core volumes increase each week"
        ],
        conditioning: ["Day 3: Walk 30-35 min", "Day 6: Light jog 10 min + walk 15 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 5-6 Density and Pace",
        focus: "Shorten rest periods and push total output per session.",
        trainingDays: [
          "Day 1 and Day 4: 4 to 5 rounds with 15-20 sec short rests",
          "Day 2 and Day 5: lunge, burpee, and sit-up output progression",
          "Core holds extended to improve trunk stability under fatigue",
          "Movement execution remains strict before speed"
        ],
        conditioning: ["Day 3: Walk 35-40 min", "Day 6: Jog 15-20 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 7-8 HIIT Shift",
        focus: "Introduce high-intensity blocks while preserving form quality.",
        trainingDays: [
          "Day 1 and Day 4: 5 rounds with 45 sec work intervals",
          "Day 2 and Day 5: 5 rounds with higher rep targets",
          "Week 8 finisher after sessions: burpees + jump squats x 3 rounds",
          "Rest management becomes critical between rounds"
        ],
        conditioning: ["Day 3: Walk 40 min", "Day 6: Jog 20 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 9-10 Work/Rest System",
        focus: "Switch to timed 40/20 format and increase training rounds.",
        trainingDays: [
          "Day 1 and Day 4: 40 sec work / 20 sec rest x 6 rounds, then 7 rounds",
          "Day 2 and Day 5: same 40/20 model with lower-body and core emphasis",
          "Output and consistency tracked weekly",
          "Technique quality is mandatory under fatigue"
        ],
        conditioning: ["Day 3: Walk 40-45 min", "Day 6: Jog 20-25 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 11-12 Peak",
        focus: "Final performance block with highest density and finishers.",
        trainingDays: [
          "Week 11: maintain 7 rounds + add high knees and plank finisher",
          "Week 12 Day 1/2/4/5: 45 sec work / 15 sec rest x 7 rounds",
          "Keep push-up, squat, and burpee standards strict",
          "Complete peak week without sacrificing form"
        ],
        conditioning: ["Day 3: Walk 45 min", "Day 6: Jog 25 min", "Day 7: Full rest"]
      }
    ],
    safety: [
      "Stop immediately if pain, dizziness, or instability appears.",
      "Hydrate before, during, and after sessions.",
      "Maintain controlled movement quality before increasing speed.",
      "Adjust rounds down if recovery markers drop for multiple days."
    ]
  },
  "bodyweight-shred-system-12w": {
    goal: "Fat loss with improved muscle tone",
    level: "Beginner to advanced progression",
    equipment: "No equipment required",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Strength and Cardio Foundation",
        focus: "Build base strength and cardio rhythm with controlled volume.",
        trainingDays: [
          "Day 1 and Day 4: Squats, push-ups, lunges, plank - 3 rounds with set rest",
          "Day 2 and Day 5: Jumping jacks, high knees, mountain climbers - 4 rounds",
          "Week 2 increases reps, holds, and interval time while keeping rest model",
          "Technique quality and pacing consistency are priority metrics"
        ],
        conditioning: ["Day 3: Walk 20-25 min", "Day 6: Walk 25-30 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 3-4 Capacity Build",
        focus: "Increase round count and interval density without losing control.",
        trainingDays: [
          "Week 3 Day 1 block increases to 4 rounds, Day 2 block to 5 rounds",
          "Week 4 strength day rises: squats 20, push-ups 14, lunges 14/leg, plank 35 sec",
          "Week 4 cardio day rises: jumping jacks 50 sec, high knees 40 sec, mountain climbers 40 sec",
          "Rest windows tighten to 25-30 sec during strength block"
        ],
        conditioning: ["Day 3: Walk 30-35 min", "Day 6: Light jog 10 min + walk 15 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 5-6 Superset Phase",
        focus: "Introduce paired movements to elevate workload and muscle tone demand.",
        trainingDays: [
          "Pair 1: Squats 20 -> Jump squats 10",
          "Pair 2: Push-ups 14 -> Shoulder taps 20",
          "Pair 3: Lunges 14/leg -> Squat hold 20 sec",
          "Week 6 progression: strength day to 5 rounds, cardio day to 6 rounds"
        ],
        conditioning: ["Day 3: Walk 35-40 min", "Day 6: Jog 15-20 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 7-8 Intensity Increase",
        focus: "Raise rep targets and session stress while keeping strong execution.",
        trainingDays: [
          "Strength day progression: squats 22, jump squats 12, push-ups 16, shoulder taps 24, lunges 16/leg, squat hold 25 sec",
          "Rest between rounds fixed to 30 sec in Week 7",
          "Cardio day progression: jumping jacks 55 sec, high knees 45 sec, mountain climbers 45 sec x 6 rounds",
          "Week 8 adds daily finisher: burpees 10 + plank 30 sec x 3 rounds"
        ],
        conditioning: ["Day 3: Walk 40 min", "Day 6: Jog 20 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 9-10 HIIT Structure",
        focus: "Transition to timed work/rest model and increase total rounds.",
        trainingDays: [
          "Day 1 and Day 4: 40 sec work / 20 sec rest for squats, push-ups, lunges, plank",
          "Day 2 and Day 5: 40/20 for jumping jacks, high knees, mountain climbers",
          "Week 9 runs 6 rounds; Week 10 runs 7 rounds",
          "Maintain full-range movement quality at all times"
        ],
        conditioning: ["Day 3: Walk 40 min", "Day 6: Jog 20 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 11-12 Peak Block",
        focus: "Final block with finishers and peak work-to-rest density.",
        trainingDays: [
          "Week 11 keeps 7-round structure and adds finisher: jump squats 12 + burpees 12 x 3 rounds",
          "Week 12 strength and cardio days move to 45 sec work / 15 sec rest",
          "Week 12 maintains 7 rounds for both main sessions",
          "Consistency and strict form define successful completion"
        ],
        conditioning: ["Day 3: Walk 45 min", "Day 6: Jog 25 min", "Day 7: Full rest"]
      }
    ],
    safety: [
      "Stop immediately if pain appears or form breaks down.",
      "Keep movement controlled through all supersets and timed rounds.",
      "Hydrate consistently and recover with adequate sleep.",
      "Reduce rounds temporarily when recovery quality drops."
    ]
  },
  "home-cardio-melt-12w": {
    goal: "Maximum calorie burn and endurance development",
    level: "Beginner to advanced progression",
    equipment: "No equipment required",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Cardio Base",
        focus: "Establish steady pacing and interval tolerance with simple structures.",
        trainingDays: [
          "Day 1 and Day 4: Jog in place, jumping jacks, high knees in repeated rounds",
          "Day 2 and Day 5: Fast march + sprint interval blocks with structured rest",
          "Week 2 increases jog and sprint durations while preserving interval control",
          "Breathing rhythm and pacing consistency are primary markers"
        ],
        conditioning: ["Day 3: Walk 25-30 min", "Day 6: Walk 30 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 3-4 Volume and Rest Reduction",
        focus: "Increase rounds and reduce rest intervals to improve output density.",
        trainingDays: [
          "Week 3 increases Day 1 to 5 rounds and Day 2 to 12 rounds",
          "Week 4 Day 1 moves jog to 3 min and high knees to 40 sec",
          "Week 4 Day 2 uses sprint 30 sec / rest 30 sec for 12 rounds",
          "Rest in steady rounds tightens to 40 sec"
        ],
        conditioning: ["Day 3: Walk 30-35 min", "Day 6: Light jog 10 min + walk 20 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 5-6 Density Build",
        focus: "Sustain longer cardio sessions with tighter rest and higher round counts.",
        trainingDays: [
          "Day 1 progression: high knees 45 sec, 5 then 6 rounds",
          "Day 2 progression: sprint/walk 30 sec/30 sec for 14 then 16 rounds",
          "Rest range narrows to 30-40 sec in Day 1 structure",
          "Session quality target is stable pace across all rounds"
        ],
        conditioning: ["Day 3: Walk 35-40 min", "Day 6: Jog 15-20 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 7-8 Higher Intensity",
        focus: "Push interval intensity while preserving recoverable workload.",
        trainingDays: [
          "Week 7 Day 1: high knees 50 sec, 6 rounds, 30 sec rest",
          "Week 7 Day 2: sprint 35 sec / walk 25 sec x 16 rounds",
          "Week 8 keeps same structure and adds daily finisher",
          "Week 8 finisher: sprint 20 sec / rest 10 sec x 8 rounds"
        ],
        conditioning: ["Day 3: Walk 40 min", "Day 6: Jog 20 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 9-10 HIIT and Tabata Transition",
        focus: "Shift to strict timed HIIT and Tabata sets for high calorie throughput.",
        trainingDays: [
          "Day 1 and Day 4: 30 sec work / 15 sec rest (jumping jacks, high knees, jog)",
          "Week 9 Day 1 uses 8 rounds; Week 10 rises to 10 rounds",
          "Day 2 and Day 5: Tabata sprint blocks with set-based progression",
          "Week 9 uses 2 sets, Week 10 uses 3 sets (1 min between sets)"
        ],
        conditioning: ["Day 3: Walk 40 min", "Day 6: Jog 20 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 11-12 Peak Endurance",
        focus: "Finalize at highest density with additional finishers and peak timing.",
        trainingDays: [
          "Week 11 Day 1 stays at 10 rounds and Day 2 Tabata stays 3 sets",
          "Week 11 adds finisher: jumping jacks 1 min + high knees 1 min x 2 rounds",
          "Week 12 Day 1 model: 40 sec work / 10 sec rest x 10 rounds",
          "Week 12 Day 2 Tabata progresses to 4 sets"
        ],
        conditioning: ["Day 3: Walk 45 min", "Day 6: Jog 25 min", "Day 7: Full rest"]
      }
    ],
    safety: [
      "Stop immediately if dizziness, pain, or instability appears.",
      "Control breathing pace during all interval and Tabata blocks.",
      "Do not sacrifice form quality for speed.",
      "Reduce rounds or sets if recovery is incomplete."
    ]
  },
  "lean-at-home-program-12w": {
    goal: "Fat loss with a lean, toned physique outcome",
    level: "Beginner to advanced progression",
    equipment: "No equipment required",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Tone and Cardio Base",
        focus: "Build a foundation of bodyweight tone work with cardio consistency.",
        trainingDays: [
          "Day 1 and Day 4: Squats, push-ups, sit-ups, plank in circuit format",
          "Day 2 and Day 5: Jumping jacks, high knees, mountain climbers for cardio burn",
          "Week 2 increases rep counts, hold durations, and cardio interval lengths",
          "Execution quality and posture control stay as top priorities"
        ],
        conditioning: ["Day 3: Walk 25-30 min", "Day 6: Walk 30 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 3-4 Volume Build",
        focus: "Increase rounds and tighten rest windows for improved sculpting density.",
        trainingDays: [
          "Week 3: Day 1 rises to 4 rounds and Day 2 rises to 5 rounds",
          "Week 4 strength progression: squats 20, push-ups 14, sit-ups 20, plank 40 sec",
          "Week 4 cardio progression: jumping jacks 50 sec, high knees 40 sec, mountain climbers 40 sec",
          "Strength day rest reduced to 25-30 sec"
        ],
        conditioning: ["Day 3: Walk 30-35 min", "Day 6: Light jog 10 min + walk 20 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 5-6 Shaping Phase",
        focus: "Introduce sculpting pairs and increase total workload through supersets.",
        trainingDays: [
          "Pair 1: Squats 20 -> Pulse squats 10",
          "Pair 2: Push-ups 14 -> Shoulder taps 20",
          "Pair 3: Sit-ups 20 -> Leg raises 12",
          "Week 6 progression: strength day to 5 rounds, cardio day to 6 rounds"
        ],
        conditioning: ["Day 3: Walk 35-40 min", "Day 6: Jog 15-20 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 7-8 Lean Focus Block",
        focus: "Push lean-physique output with higher reps, holds, and controlled rest.",
        trainingDays: [
          "Week 7 progression: squats 22, pulse squats 12, push-ups 16, shoulder taps 24, sit-ups 22, leg raises 14, plank 45 sec",
          "Week 7 rest set to 30 sec between rounds",
          "Cardio progression: jumping jacks 55 sec, high knees 45 sec, mountain climbers 45 sec x 6 rounds",
          "Week 8 adds finisher: burpees 10 + plank 40 sec x 3 rounds"
        ],
        conditioning: ["Day 3: Walk 40 min", "Day 6: Jog 20 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 9-10 HIIT Sculpt",
        focus: "Shift into timed sculpt circuits for higher density and calorie output.",
        trainingDays: [
          "Day 1 and Day 4: 40 sec work / 20 sec rest on squats, push-ups, sit-ups, plank",
          "Day 2 and Day 5: 40/20 on jumping jacks, high knees, mountain climbers",
          "Week 9 uses 6 rounds, Week 10 progresses to 7 rounds",
          "Core stability and movement depth remain non-negotiable"
        ],
        conditioning: ["Day 3: Walk 40 min", "Day 6: Jog 20 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 11-12 Peak Sculpt",
        focus: "Finalize with finishers and peak work-to-rest density.",
        trainingDays: [
          "Week 11 keeps core structure and adds finisher: jump squats 12 + burpees 12 x 3 rounds",
          "Week 12 Day 1 and Day 2 move to 45 sec work / 15 sec rest model",
          "Week 12 maintains 7 rounds in main sessions",
          "Completion target is full-session quality at peak intensity"
        ],
        conditioning: ["Day 3: Walk 45 min", "Day 6: Jog 25 min", "Day 7: Full rest"]
      }
    ],
    safety: [
      "Stop immediately if pain appears during any movement.",
      "Maintain control and strict form before increasing pace.",
      "Hydrate and recover appropriately between high-output days.",
      "Scale down rounds when form quality drops."
    ]
  },
  "sweat-and-burn-blueprint-12w": {
    goal: "Build a daily fat-burn habit with steady weight loss",
    level: "Beginner to advanced progression",
    equipment: "No equipment required",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Habit Foundation",
        focus: "Create consistency with short, repeatable sessions and low friction.",
        trainingDays: [
          "Day 1 and Day 2: jumping jacks, squats, plank in short rounds",
          "Day 3 and Day 5: jumping jacks, lunges, plank variation",
          "Day 4 repeats Day 1 for routine reinforcement",
          "Week 2 increases interval and rep targets while keeping session duration compact"
        ],
        conditioning: ["Day 6: Walk 20-25 min", "Day 7: Full rest", "Primary target: daily adherence"]
      },
      {
        title: "Weeks 3-4 Volume Habit Build",
        focus: "Increase rounds while preserving the daily rhythm and recovery balance.",
        trainingDays: [
          "Week 3 moves key days to 4 rounds",
          "Week 4 increases jumping jacks to 40 sec and core holds to 30 sec",
          "Squat and lunge reps move to 14 per set",
          "Repeat-day structure remains to strengthen habit loops"
        ],
        conditioning: ["Day 6: Walk 30 min", "Day 7: Full rest", "Keep pacing smooth, not rushed"]
      },
      {
        title: "Weeks 5-6 Daily Upgrade",
        focus: "Add upper-body work and expand weekly workload with controlled progress.",
        trainingDays: [
          "Push-ups added to both Day 1 and Day 3 templates",
          "Day 1 and Day 3 structures progress from 4 rounds to 5 rounds",
          "Rep targets rise for squats and lunges while plank stability is maintained",
          "Daily training pattern stays unchanged for behavior consistency"
        ],
        conditioning: ["Day 6: Walk 30-35 min", "Day 7: Full rest", "Recovery supports daily compliance"]
      },
      {
        title: "Weeks 7-8 Intensity Increase",
        focus: "Raise work demand while maintaining short-session practicality.",
        trainingDays: [
          "Week 7: jumping jacks 45 sec, squats/lunges 18, push-ups 12, plank 35 sec x 5 rounds",
          "Week 8 keeps Week 7 structure and adds daily finisher",
          "Week 8 finisher: burpees 8 reps with 30 sec rest x 3 rounds",
          "Execution quality remains mandatory at higher pace"
        ],
        conditioning: ["Day 6: Walk 35 min", "Day 7: Full rest", "Breathing control determines intensity tolerance"]
      },
      {
        title: "Weeks 9-10 HIIT Habit Block",
        focus: "Transition into timed HIIT while preserving daily habit momentum.",
        trainingDays: [
          "30 sec work / 20 sec rest structure for core movement stack",
          "Day 1 and Day 2 run squat version; Day 3 and Day 5 run lunge version",
          "Week 9 uses 6 rounds and Week 10 increases to 7 rounds",
          "Short duration stays aligned with high adherence goals"
        ],
        conditioning: ["Day 6: Walk 35 min", "Day 7: Full rest", "Prioritize consistency over perfection"]
      },
      {
        title: "Weeks 11-12 Peak Habit",
        focus: "Finalize with finishers and denser intervals under full control.",
        trainingDays: [
          "Week 11 keeps base structure and adds finisher: jump squats 10 + burpees 10 x 3 rounds",
          "Week 12 shifts to 40 sec work / 15 sec rest for main sessions",
          "Week 12 Day 3 and Day 5 swap squats for lunges to balance lower-body demand",
          "Main sessions remain at 7 rounds in peak week"
        ],
        conditioning: ["Day 6: Walk 40 min", "Day 7: Full rest", "Final objective is completion quality and routine permanence"]
      }
    ],
    safety: [
      "Stop immediately if pain appears during training.",
      "Focus on controlled form, not rushed execution.",
      "Consistency is the priority metric, not daily perfection.",
      "Scale down rounds if fatigue reduces movement quality."
    ]
  },
  "home-muscle-builder-12w": {
    goal: "Build muscle using bodyweight training",
    level: "Beginner to advanced progression",
    equipment: "No equipment required",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Foundation Strength",
        focus: "Build upper, lower, and core fundamentals with controlled reps.",
        trainingDays: [
          "Day 1 and Day 4: Upper body block (push-ups, incline push-ups, pike push-ups, plank)",
          "Day 2 and Day 5: Lower body block (squats, lunges, glute bridge, wall sit)",
          "Day 3: Core block (sit-ups, leg raises, plank)",
          "Week 2 increases reps and hold times while keeping 3-round structure"
        ],
        conditioning: ["Day 6: Walk 20 min", "Day 7: Full rest", "Rest between exercises: 45-60 sec"]
      },
      {
        title: "Weeks 3-4 Volume Base",
        focus: "Increase total workload while preserving strict movement control.",
        trainingDays: [
          "Week 3 raises all primary days to 4 rounds",
          "Week 4 progression: push-up and lower-body rep increases plus longer plank/wall sit durations",
          "Upper body key metrics: push-ups and pike push-ups rise with clean form",
          "Core day scales to higher sit-up and leg raise totals"
        ],
        conditioning: ["Day 6: Walk 20-25 min", "Day 7: Full rest", "No rushed reps allowed"]
      },
      {
        title: "Weeks 5-6 Slow Tempo Phase",
        focus: "Maximize muscle tension through tempo-controlled execution.",
        trainingDays: [
          "Tempo rule applied: 3 sec down, 1 sec up on major lifts",
          "Week 5 uses 4 rounds under tempo control",
          "Week 6 repeats Week 5 and increases to 5 rounds",
          "Plank and wall-sit holds progress to reinforce static strength"
        ],
        conditioning: ["Day 6: Walk 25-30 min", "Day 7: Full rest", "Tempo quality is priority over rep speed"]
      },
      {
        title: "Weeks 7-8 Volume Up",
        focus: "Push rep and hold targets with high-quality volume progression.",
        trainingDays: [
          "Week 7 upper and lower days move to higher rep ranges at 5 rounds",
          "Week 7 core day rises to sit-ups 22 and leg raises 16 with plank 50 sec",
          "Week 8 keeps Week 7 base and adds finisher",
          "Week 8 finisher: push-ups max reps + squats max reps for 2 rounds"
        ],
        conditioning: ["Day 6: Walk 30 min", "Day 7: Full rest", "Track total quality reps per session"]
      },
      {
        title: "Weeks 9-10 Advanced Control",
        focus: "Introduce paused reps and expand workload at higher control demand.",
        trainingDays: [
          "Day 1: push-ups include 2-sec pause at bottom position",
          "Day 2: squats include bottom pause to increase control and tension",
          "Week 9 uses 5 rounds and Week 10 increases to 6 rounds",
          "Core day maintains 5 to 6 round progression with strict form standards"
        ],
        conditioning: ["Day 6: Walk 30-35 min", "Day 7: Full rest", "Never sacrifice form for extra reps"]
      },
      {
        title: "Weeks 11-12 Peak Strength Endurance",
        focus: "Finalize with finishers and peak round targets under full control.",
        trainingDays: [
          "Week 11 keeps advanced control structure and adds finisher: push-ups max + lunges 20/leg x 3 rounds",
          "Week 12 targets: upper, lower, and core days all at 6 rounds",
          "Week 12 hold targets reach plank and wall sit 60 sec",
          "Final objective: complete full volume with strict rep mechanics"
        ],
        conditioning: ["Day 6: Walk 35 min", "Day 7: Full rest", "Recovery and precision define peak outcomes"]
      }
    ],
    safety: [
      "Control every repetition and avoid rushed movement.",
      "Stop immediately if pain appears.",
      "Maintain posture and joint alignment through all tempo phases.",
      "Reduce rounds if technique quality declines."
    ]
  },
  "bodyweight-mass-plan-12w": {
    goal: "Build maximum muscle with bodyweight training",
    level: "Beginner to advanced progression",
    equipment: "No equipment required",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Mass Foundation",
        focus: "Establish chest/triceps, legs, and core split with controlled volume.",
        trainingDays: [
          "Day 1 and Day 4: chest and triceps (push-ups, incline push-ups, close push-ups, plank)",
          "Day 2 and Day 5: legs (squats, lunges, glute bridge, wall sit)",
          "Day 3: core (sit-ups, leg raises, plank)",
          "Week 2 increases reps and hold durations while keeping 3-round base"
        ],
        conditioning: ["Day 6: Walk 20 min", "Day 7: Full rest", "Rest periods stay controlled at 45-60 sec"]
      },
      {
        title: "Weeks 3-4 Volume Expansion",
        focus: "Increase workload through higher rounds and stronger rep targets.",
        trainingDays: [
          "Week 3 scales Day 1, Day 2, and Day 3 to 4 rounds",
          "Week 4 progression: chest reps to 18/18/12 and plank to 40 sec",
          "Week 4 lower-body progression: squats 22, lunges 16/leg, glute bridge 20, wall sit 40 sec",
          "Week 4 core progression: sit-ups 22, leg raises 16, plank 40 sec"
        ],
        conditioning: ["Day 6: Walk 20-25 min", "Day 7: Full rest", "Focus on clean output consistency"]
      },
      {
        title: "Weeks 5-6 Failure Focus",
        focus: "Apply near-failure strategy to final sets while maintaining form.",
        trainingDays: [
          "Rule: last set in key movements is performed to technical failure",
          "Week 5 keeps 4 rounds with failure emphasis on final set quality",
          "Week 6 repeats Week 5 and increases total work to 5 rounds",
          "Plank and wall-sit integrity remain required when fatigue builds"
        ],
        conditioning: ["Day 6: Walk 25-30 min", "Day 7: Full rest", "Failure means form limit, not sloppy reps"]
      },
      {
        title: "Weeks 7-8 High Volume",
        focus: "Push hypertrophy-oriented bodyweight volume at high effort.",
        trainingDays: [
          "Week 7 Day 1: push-ups 20, incline push-ups 20, close push-ups 14, plank 45 sec x 5 rounds",
          "Week 7 Day 2: squats 25, lunges 18/leg, glute bridge 22, wall sit 45 sec x 5 rounds",
          "Week 7 Day 3: sit-ups 25, leg raises 18, plank 45 sec x 5 rounds",
          "Week 8 adds finisher: push-ups max + squats max for 3 rounds"
        ],
        conditioning: ["Day 6: Walk 30 min", "Day 7: Full rest", "Track quality reps completed per round"]
      },
      {
        title: "Weeks 9-10 Advanced Set Control",
        focus: "Introduce paused reps and extend workload at high control demand.",
        trainingDays: [
          "Day 1 push-ups include 2-sec bottom hold before concentric phase",
          "Day 2 squats include 2-sec bottom pause for tension and control",
          "Week 9 uses 5 rounds and Week 10 increases to 6 rounds",
          "Core day follows same progression under strict mechanics"
        ],
        conditioning: ["Day 6: Walk 30-35 min", "Day 7: Full rest", "Maintain control under fatigue accumulation"]
      },
      {
        title: "Weeks 11-12 Peak Volume",
        focus: "Finalize with finishers and highest volume targets.",
        trainingDays: [
          "Week 11 keeps advanced structure and adds finisher: push-ups max + lunges 20/leg x 3 rounds",
          "Week 12 Day 1 peaks at push-ups 20, incline 20, close 15, plank 60 sec x 6 rounds",
          "Week 12 Day 2 peaks at squats 30, lunges 20/leg, glute bridge 25, wall sit 60 sec x 6 rounds",
          "Week 12 Day 3 peaks at sit-ups 30, leg raises 20, plank 60 sec x 6 rounds"
        ],
        conditioning: ["Day 6: Walk 35 min", "Day 7: Full rest", "Final target is full-volume quality completion"]
      }
    ],
    safety: [
      "Stop before form breaks down.",
      "Quality always takes priority over ego or extra reps.",
      "Use technical failure only, never pain-based failure.",
      "Reduce rounds if movement control declines."
    ]
  },
  "home-strength-gain-12w": {
    goal: "Build maximum bodyweight strength through control",
    level: "Beginner to advanced progression",
    equipment: "No equipment required",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Strength Foundation",
        focus: "Establish strict tempo mechanics across upper, lower, and core days.",
        trainingDays: [
          "Day 1 and Day 4: upper strength (push-ups, incline push-ups, pike push-ups, plank) with controlled tempo",
          "Day 2 and Day 5: lower strength (squats, lunges, glute bridge, wall sit) with slowed eccentrics",
          "Day 3: core strength (sit-ups, leg raises, plank) under strict pacing",
          "Week 2 increases reps and hold durations while keeping 3-round base"
        ],
        conditioning: ["Day 6: Walk 20 min", "Day 7: Full rest", "Rest windows: 60-75 sec for strength quality"]
      },
      {
        title: "Weeks 3-4 Volume Strength Build",
        focus: "Increase round count while maintaining tempo discipline.",
        trainingDays: [
          "Week 3 scales primary days to 4 rounds",
          "Week 4 progression: upper body reps rise and plank reaches 40 sec",
          "Week 4 lower body progression: squats 16, lunges 14/leg, glute bridge 16, wall sit 40 sec",
          "Week 4 core progression: sit-ups 16, leg raises 14, plank 40 sec"
        ],
        conditioning: ["Day 6: Walk 20-25 min", "Day 7: Full rest", "No speed-based reps during this block"]
      },
      {
        title: "Weeks 5-6 Pause Phase",
        focus: "Increase strength stimulus through bottom-position pauses.",
        trainingDays: [
          "Rule: hold bottom position 2 sec on primary push and squat patterns",
          "Week 5 applies pause method at 4 rounds",
          "Week 6 repeats pause method and increases to 5 rounds",
          "Core and static holds progress to reinforce trunk stability"
        ],
        conditioning: ["Day 6: Walk 25-30 min", "Day 7: Full rest", "Control remains priority over rep count"]
      },
      {
        title: "Weeks 7-8 Strength Increase",
        focus: "Advance reps and hold durations with sustained pause control.",
        trainingDays: [
          "Week 7 progression: push-ups 12 pause, incline 14, pike 12, plank 45 sec x 5 rounds",
          "Week 7 lower progression: squats 18 pause, lunges 16/leg, glute bridge 20, wall sit 50 sec x 5 rounds",
          "Week 7 core progression: sit-ups 18, leg raises 16, plank 50 sec x 5 rounds",
          "Week 8 adds finisher: slow push-ups max + slow squats max for 2 rounds"
        ],
        conditioning: ["Day 6: Walk 30 min", "Day 7: Full rest", "Track quality rep completion per session"]
      },
      {
        title: "Weeks 9-10 Advanced Control",
        focus: "Apply longer eccentrics with pauses and increase total rounds.",
        trainingDays: [
          "Day 1: push-ups at 4 sec down plus bottom pause",
          "Day 2: squats at 4 sec down plus bottom pause",
          "Week 9 uses 5 rounds, Week 10 increases to 6 rounds",
          "Core day maintains strict control under higher fatigue"
        ],
        conditioning: ["Day 6: Walk 30-35 min", "Day 7: Full rest", "Joint alignment is mandatory on all paused reps"]
      },
      {
        title: "Weeks 11-12 Peak Strength",
        focus: "Finalize with finisher density and peak controlled workload.",
        trainingDays: [
          "Week 11 keeps advanced control and adds finisher: slow push-ups max + lunges 20/leg x 3 rounds",
          "Week 12 Day 1 peaks at push-ups 12 (4 sec down + pause), incline 15, pike 12, plank 60 sec x 6 rounds",
          "Week 12 Day 2 peaks at squats 20 (4 sec down + pause), lunges 18/leg, glute bridge 22, wall sit 60 sec x 6 rounds",
          "Week 12 Day 3 peaks at sit-ups 20, leg raises 18, plank 60 sec x 6 rounds"
        ],
        conditioning: ["Day 6: Walk 35 min", "Day 7: Full rest", "Goal is full-volume control without form breakdown"]
      }
    ],
    safety: [
      "Slow reps increase stress; stop if joints hurt.",
      "Never rush tempo or pause standards for extra reps.",
      "Use technical control as the performance benchmark.",
      "Scale rounds down if alignment or control drops."
    ]
  },
  "calisthenics-growth-system-12w": {
    goal: "Build muscle and develop calisthenics control skills",
    level: "Beginner to advanced progression",
    equipment: "No equipment required (wall/chair/floor variations allowed)",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Strength and Control Foundation",
        focus: "Build push, lower-body balance, and core control with stable mechanics.",
        trainingDays: [
          "Day 1 and Day 4: push focus (push-ups, incline push-ups, pike push-ups, plank)",
          "Day 2 and Day 5: legs plus balance (squats, lunges, single-leg stand, wall sit)",
          "Day 3: core and control (sit-ups, leg raises, plank)",
          "Week 2 progresses reps and hold durations while keeping 3-round base"
        ],
        conditioning: ["Day 6: Walk 20 min", "Day 7: Full rest", "Primary target: perfect control and posture"]
      },
      {
        title: "Weeks 3-4 Volume Build",
        focus: "Increase round count and reinforce movement precision before skill loading.",
        trainingDays: [
          "Week 3 scales Day 1, Day 2, and Day 3 to 4 rounds",
          "Week 4 push progression: push-ups 14, incline 14, pike 12, plank 40 sec",
          "Week 4 lower progression: squats 20, lunges 14/leg, single-leg stand 30 sec, wall sit 40 sec",
          "Week 4 core progression: sit-ups 20, leg raises 14, plank 40 sec"
        ],
        conditioning: ["Day 6: Walk 20-25 min", "Day 7: Full rest", "Control quality is non-negotiable"]
      },
      {
        title: "Weeks 5-6 Skill Intro",
        focus: "Introduce advanced skill variants while preserving base strength structure.",
        trainingDays: [
          "Day 1 adds decline push-ups and wall handstand hold to push progression",
          "Day 2 adds assisted pistol squat and lunge bottom-hold patterns",
          "Day 3 core hold times increase with stable trunk control",
          "Week 6 repeats skill-intro structure and increases total volume to 5 rounds"
        ],
        conditioning: ["Day 6: Walk 25-30 min", "Day 7: Full rest", "Skill quality overrides rep speed"]
      },
      {
        title: "Weeks 7-8 Skill Growth",
        focus: "Increase skill exposure and strengthen high-control movement endurance.",
        trainingDays: [
          "Week 7 Day 1: push-ups 16, decline 10, pike 14, wall handstand 20 sec x 5 rounds",
          "Week 7 Day 2: squats 22, assisted pistol 8/leg, lunges 16/leg x 5 rounds",
          "Week 7 Day 3: sit-ups 22, leg raises 16, plank 50 sec x 5 rounds",
          "Week 8 finisher: handstand hold max plus push-ups max for 2 rounds"
        ],
        conditioning: ["Day 6: Walk 30 min", "Day 7: Full rest", "Track controlled skill time under tension"]
      },
      {
        title: "Weeks 9-10 Advanced Control",
        focus: "Consolidate skill-led strength with higher rounds and stricter execution.",
        trainingDays: [
          "Day 1 moves to decline push-ups, pike push-ups, and wall handstand as primary stack",
          "Day 2 progresses squats, assisted pistols, and lunges with higher reps",
          "Day 3 maintains core structure and control standards at rising volume",
          "Week 9 uses 5 rounds and Week 10 increases to 6 rounds"
        ],
        conditioning: ["Day 6: Walk 30-35 min", "Day 7: Full rest", "No rushed skill attempts under fatigue"]
      },
      {
        title: "Weeks 11-12 Peak Skill Strength",
        focus: "Finalize with high-skill finishers and peak calisthenics workload.",
        trainingDays: [
          "Week 11 adds finisher: handstand hold max plus pistol squat 10/leg for 3 rounds",
          "Week 12 Day 1 peaks: decline push-ups 15, pike push-ups 15, wall handstand 30 sec x 6 rounds",
          "Week 12 Day 2 peaks: squats 25, assisted pistol 12/leg, lunges 20/leg x 6 rounds",
          "Week 12 Day 3 peaks: sit-ups 25, leg raises 18, plank 60 sec x 6 rounds"
        ],
        conditioning: ["Day 6: Walk 35 min", "Day 7: Full rest", "Peak objective is controlled execution at full volume"]
      }
    ],
    safety: [
      "Control always has priority over ego.",
      "Do not rush handstand or pistol-squat progressions.",
      "Stop any skill drill when form degrades.",
      "Scale rounds if technical quality drops."
    ]
  },
  "lean-muscle-home-program-12w": {
    goal: "Build lean, aesthetic muscle with balanced symmetry",
    level: "Beginner to advanced progression",
    equipment: "No equipment required",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Shape Foundation",
        focus: "Build base upper/lower/core symmetry with moderate controlled volume.",
        trainingDays: [
          "Day 1 and Day 4: upper body shape (push-ups, incline push-ups, pike push-ups, plank)",
          "Day 2 and Day 5: lower body shape (squats, lunges, glute bridge, wall sit)",
          "Day 3: core and tightening (sit-ups, leg raises, plank)",
          "Week 2 increases reps and hold durations while maintaining 3-round base"
        ],
        conditioning: ["Day 6: Walk 20 min", "Day 7: Full rest", "Primary emphasis: alignment and balanced output"]
      },
      {
        title: "Weeks 3-4 Volume Build",
        focus: "Increase round count and improve movement quality consistency.",
        trainingDays: [
          "Week 3 scales primary training days to 4 rounds",
          "Week 4 upper progression: push-ups 16, incline 16, pike 12, plank 40 sec",
          "Week 4 lower progression: squats 20, lunges 16/leg, glute bridge 20, wall sit 40 sec",
          "Week 4 core progression: sit-ups 20, leg raises 16, plank 40 sec"
        ],
        conditioning: ["Day 6: Walk 20-25 min", "Day 7: Full rest", "Use smooth tempo with no rushed reps"]
      },
      {
        title: "Weeks 5-6 Aesthetic Volume",
        focus: "Introduce detail-oriented supersets and tempo variations for symmetry.",
        trainingDays: [
          "Day 1 adds slow push-ups and shoulder taps after primary push movements",
          "Day 2 adds pulse squats and lunge-bottom holds for lower-body detail",
          "Day 3 raises core density with sit-up to leg-raise combination",
          "Week 6 repeats the same structure and increases total volume to 5 rounds"
        ],
        conditioning: ["Day 6: Walk 25-30 min", "Day 7: Full rest", "Technique precision remains mandatory"]
      },
      {
        title: "Weeks 7-8 Lean Growth",
        focus: "Raise hypertrophy-style volume while preserving aesthetic movement quality.",
        trainingDays: [
          "Week 7 upper progression: push-ups 18 plus slow variation, incline 18 plus shoulder taps, pike 14, plank 45 sec x 5 rounds",
          "Week 7 lower progression: squats 22 plus pulse squats, lunges 18/leg, glute bridge 22, wall sit 50 sec x 5 rounds",
          "Week 7 core progression: sit-ups 22, leg raises 18, plank 50 sec x 5 rounds",
          "Week 8 adds finisher: push-ups max plus squats max for 2 rounds"
        ],
        conditioning: ["Day 6: Walk 30 min", "Day 7: Full rest", "Monitor symmetry and rep quality per side"]
      },
      {
        title: "Weeks 9-10 Detail Phase",
        focus: "Shift to timed rounds for muscular detail and conditioning blend.",
        trainingDays: [
          "Day 1: 40 sec work / 20 sec rest on push-ups, incline push-ups, pike push-ups, plank",
          "Day 2: 40/20 on squats, lunges, glute bridge, wall sit",
          "Day 3: same timed structure for core block",
          "Week 9 uses 6 rounds and Week 10 increases to 7 rounds"
        ],
        conditioning: ["Day 6: Walk 30-35 min", "Day 7: Full rest", "Form quality remains first priority"]
      },
      {
        title: "Weeks 11-12 Peak Aesthetic",
        focus: "Finalize with finishers and denser timed blocks for polished physique output.",
        trainingDays: [
          "Week 11 keeps timed structure and adds finisher: jump squats 12 plus push-ups 12 for 3 rounds",
          "Week 12 moves to 45 sec work / 15 sec rest on upper, lower, and core day formats",
          "Week 12 keeps 7 rounds for main sessions with repeat Day 1 and Day 2 structure",
          "Completion goal is full control at peak timed density"
        ],
        conditioning: ["Day 6: Walk 40 min", "Day 7: Full rest", "Final focus: control, symmetry, and consistency"]
      }
    ],
    safety: [
      "Keep form and control above speed at all times.",
      "Do not rush reps during tempo or timed phases.",
      "Stop sets if technique quality starts to collapse.",
      "Scale round count down when recovery or control drops."
    ]
  },
  "gym-fat-loss-protocol-12w": {
    goal: "Reduce body fat while maintaining muscle mass",
    level: "Beginner to advanced progression",
    equipment: "Full gym required",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Weights and Cardio Foundation",
        focus: "Establish lifting consistency and moderate cardio base.",
        trainingDays: [
          "Day 1 and Day 4: upper body plus cardio (bench press, lat pulldown, shoulder press, plank)",
          "Day 2 and Day 5: lower body plus cardio (leg press, leg curl, leg extension, calf raises)",
          "Day 3 and Day 6: cardio-focused conditioning days",
          "Week 2 increases rep targets and cardio duration while preserving structure"
        ],
        conditioning: ["Treadmill and bike sessions progress from 15 to 18 min", "Day 3 cardio starts at 25 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 3-4 Set and Density Build",
        focus: "Increase total lifting volume and tighten recovery windows.",
        trainingDays: [
          "Week 3 moves primary strength days from 3 to 4 sets",
          "Week 4 keeps 4 sets with reduced rest to 45 sec on key sessions",
          "Upper body and lower body rep targets increase for sustained workload",
          "Core hold and stability time continue to rise"
        ],
        conditioning: ["Cardio increases to 20 min sessions", "Day 3 cardio remains steady and controlled", "Day 7: Full rest"]
      },
      {
        title: "Weeks 5-6 Fat Burn Superset Phase",
        focus: "Elevate calorie demand with weight-to-bodyweight supersets.",
        trainingDays: [
          "Day 1 supersets: bench to push-ups, pulldown to row, shoulder press to lateral raises",
          "Day 2 supersets: leg press to bodyweight squats, leg curl to lunges, calves as high-rep finisher",
          "Week 5 uses 4 sets and Week 6 increases to 5 sets",
          "Rest windows reduced to support metabolic density"
        ],
        conditioning: ["Cardio progresses from 20 to 25 min", "Conditioning stays low-impact on non-lifting days", "Day 7: Full rest"]
      },
      {
        title: "Weeks 7-8 Intensity Up",
        focus: "Increase training stress with higher reps, shorter rest, and finishers.",
        trainingDays: [
          "Week 7 raises rep targets across upper and lower supersets",
          "Rest compresses to 30-40 sec between rounds where safe",
          "Week 8 retains Week 7 volume and adds finisher",
          "Week 8 finisher: burpees 10 reps with 30 sec rest for 3 rounds"
        ],
        conditioning: ["Cardio remains at 25 min baseline", "Session pacing should stay controlled", "Day 7: Full rest"]
      },
      {
        title: "Weeks 9-10 HIIT Phase",
        focus: "Transition conditioning to high-intensity interval format.",
        trainingDays: [
          "Lifting structure resets to quality-focused 4-set blocks",
          "Upper and lower split remains unchanged for muscle retention",
          "HIIT protocol: 30 sec sprint plus 30 sec walk progression",
          "Week 9 uses 12 rounds and Week 10 increases to 14 rounds"
        ],
        conditioning: ["HIIT replaces standard steady-state sessions on key days", "Recovery management becomes critical", "Day 7: Full rest"]
      },
      {
        title: "Weeks 11-12 Peak Cut",
        focus: "Finalize with peak interval volume and high-output finishers.",
        trainingDays: [
          "Week 11 keeps HIIT phase structure and adds finisher: jump squats 12 plus push-ups 12 for 3 rounds",
          "Week 12 upper and lower days increase to 5 sets on key lifts",
          "Week 12 HIIT reaches 15 rounds at 30/30 format",
          "Week 12 includes long cardio day and light cardio support day"
        ],
        conditioning: ["Day 3 cardio increases to 40 min", "Day 6 light cardio set to 30 min", "Day 7: Full rest"]
      }
    ],
    safety: [
      "Use loads that preserve strict technique.",
      "Do not ego lift at any phase of the program.",
      "Stop sets immediately if form breaks under fatigue.",
      "Adjust volume down when recovery markers decline."
    ]
  },
  "shred-and-sweat-gym-plan-12w": {
    goal: "Fast fat loss with stronger conditioning capacity",
    level: "Beginner to advanced progression",
    equipment: "Full gym required",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Circuit Foundation",
        focus: "Establish upper/lower circuits and moderate cardio baseline.",
        trainingDays: [
          "Day 1 and Day 4: upper-body circuit (bench press, lat pulldown, shoulder press, cable row)",
          "Day 2 and Day 5: lower-body circuit (leg press, leg curl, leg extension, calf raises)",
          "Day 3 and Day 6: cardio-focused support sessions",
          "Week 2 raises reps and slightly reduces rest for density gain"
        ],
        conditioning: ["Cardio starts at 15-18 min on lifting days", "Day 3 cardio starts at 25 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 3-4 Set and Density Build",
        focus: "Increase set count and shorten rest to improve work density.",
        trainingDays: [
          "Week 3 scales upper and lower circuits to 4 rounds",
          "Week 4 holds 4 rounds with shorter 30-40 sec recovery windows",
          "Rep progression continues across all primary machine lifts",
          "Technique consistency remains mandatory as fatigue rises"
        ],
        conditioning: ["Cardio standard increases to 20 min", "Day 6 remains cardio support", "Day 7: Full rest"]
      },
      {
        title: "Weeks 5-6 Superset Phase",
        focus: "Shift to paired exercises to increase metabolic output.",
        trainingDays: [
          "Day 1 supersets: bench to push-ups, pulldown to cable row, shoulder press to lateral raises",
          "Day 2 supersets: leg press to squats, leg curl to lunges, calves high-rep finish",
          "Week 5 uses 4 rounds and Week 6 progresses to 5 rounds",
          "Rest shortened to 30 sec in key pairings"
        ],
        conditioning: ["Cardio rises from 20 to 25 min", "Keep cardio quality controlled after lifting", "Day 7: Full rest"]
      },
      {
        title: "Weeks 7-8 High Density",
        focus: "Increase workload intensity with compressed rest and finishers.",
        trainingDays: [
          "Week 7 pushes upper and lower rep targets at 5 rounds",
          "Rest compresses to 20-30 sec where form allows",
          "Week 8 retains week 7 structure and adds finisher block",
          "Week 8 finisher: burpees 10 + jump squats 10 for 3 rounds"
        ],
        conditioning: ["Cardio remains 25 min baseline", "Day 3 cardio continues as active recovery support", "Day 7: Full rest"]
      },
      {
        title: "Weeks 9-10 HIIT Shift",
        focus: "Move from steady cardio into interval-driven conditioning.",
        trainingDays: [
          "Lifting blocks return to quality-focused 4-round structures",
          "Upper and lower split remains intact for muscle retention",
          "HIIT protocol: 30 sec sprint plus 30 sec walk",
          "Week 9 uses 12 rounds and Week 10 increases to 14 rounds"
        ],
        conditioning: ["HIIT replaces standard post-lift cardio on key days", "Recovery and hydration become critical", "Day 7: Full rest"]
      },
      {
        title: "Weeks 11-12 Peak Sweat",
        focus: "Finalize with finishers and highest interval demand.",
        trainingDays: [
          "Week 11 adds finisher: push-ups 15 plus jump squats 12 for 3 rounds",
          "Week 12 raises major lifting days to 5 rounds",
          "Week 12 HIIT reaches 15 rounds at 30/30 format",
          "Program ends with extended cardio day and light-cardio support day"
        ],
        conditioning: ["Day 3 cardio reaches 40 min", "Day 6 light cardio set to 30 min", "Day 7: Full rest"]
      }
    ],
    safety: [
      "Short rest creates high fatigue; keep movement quality strict.",
      "Stop sets when technique starts to break down.",
      "Do not chase pace at the expense of form.",
      "Scale rounds or intervals when recovery falls behind."
    ]
  },
  "cutting-system-gym-12w": {
    goal: "Lose fat while preserving muscle and achieving a lean physique",
    level: "Beginner to advanced progression",
    equipment: "Full gym required",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Structured Cut Foundation",
        focus: "Establish split-based lifting and moderate cardio support.",
        trainingDays: [
          "Day 1 and Day 4: chest-focused strength plus treadmill cardio",
          "Day 2 and Day 5: back-focused strength plus bike cardio",
          "Day 3: leg-focused strength plus moderate walking cardio",
          "Week 2 increases rep targets and cardio duration while preserving structure"
        ],
        conditioning: ["Post-lift cardio starts at 15 min and rises to 18 min", "Day 6 dedicated cardio begins at 25 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 3-4 Set and Rest Progression",
        focus: "Increase lifting volume and tighten rest for better density.",
        trainingDays: [
          "Week 3 raises all key lifting days to 4 sets",
          "Week 4 keeps 4-set structure with reduced rest to 45 sec",
          "Upper-body and lower-body rep targets continue to progress",
          "Core and accessory quality remain strict at rising fatigue"
        ],
        conditioning: ["Cardio sessions standardize around 20 min", "Day 6 cardio remains active-recovery support", "Day 7: Full rest"]
      },
      {
        title: "Weeks 5-6 Cut Phase Supersets",
        focus: "Increase calorie expenditure with paired resistance movements.",
        trainingDays: [
          "Day 1 supersets: bench to push-ups, incline DB to cable fly",
          "Day 2 supersets: pulldown to row, face pull to rear delt raises",
          "Day 3 supersets: leg press to bodyweight squats, leg curl to lunges",
          "Week 5 uses 4 sets and Week 6 progresses to 5 sets"
        ],
        conditioning: ["Cardio increases from 20 to 25 min", "Post-lift conditioning remains controlled and repeatable", "Day 7: Full rest"]
      },
      {
        title: "Weeks 7-8 Hard Cut",
        focus: "Push density and workload under tighter rest constraints.",
        trainingDays: [
          "Week 7 raises reps across chest, back, and legs at 5-set volume",
          "Rest windows narrow to 30-40 sec for selected blocks",
          "Week 8 preserves hard-cut structure and adds finisher",
          "Week 8 finisher: burpees 10 plus jump squats 10 for 3 rounds"
        ],
        conditioning: ["Cardio remains 25 min baseline", "Energy management becomes critical during high-density weeks", "Day 7: Full rest"]
      },
      {
        title: "Weeks 9-10 HIIT Cut",
        focus: "Shift conditioning to interval work while protecting lean tissue.",
        trainingDays: [
          "Lifting resets to cleaner 4-set quality blocks for muscle retention",
          "Main compound patterns stay as anchor movements",
          "HIIT protocol: 30 sec sprint plus 30 sec walk",
          "Week 9 uses 12 rounds and Week 10 rises to 14 rounds"
        ],
        conditioning: ["HIIT replaces standard cardio on key days", "Recovery load increases and must be monitored", "Day 7: Full rest"]
      },
      {
        title: "Weeks 11-12 Peak Cut",
        focus: "Finalize cut with peak interval demand and strict execution.",
        trainingDays: [
          "Week 11 adds finisher: push-ups 15 plus jump squats 12 for 3 rounds",
          "Week 12 raises major upper and back sessions to 5 sets",
          "Week 12 HIIT reaches 15 rounds at 30/30",
          "Program closes with long cardio day and light-cardio support day"
        ],
        conditioning: ["Day 3 cardio reaches 40 min", "Day 6 light cardio set to 30 min", "Day 7: Full rest"]
      }
    ],
    safety: [
      "Cutting phases reduce energy availability; avoid overtraining.",
      "Keep lifting form strict at all times.",
      "Stop sessions if technique fails under fatigue.",
      "Reduce rounds or cardio intervals when recovery quality drops."
    ]
  },
  "lean-machine-program-12w": {
    goal: "Lose fat while building a lean and aesthetic body shape",
    level: "Beginner to advanced progression",
    equipment: "Full gym required",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Lean Shape Foundation",
        focus: "Establish full-body shaping split with moderate cardio support.",
        trainingDays: [
          "Day 1 and Day 5: chest plus shape (bench press, incline DB press, cable fly, push-ups)",
          "Day 2: back plus shape (lat pulldown, seated row, straight-arm pulldown, face pull)",
          "Day 3: legs plus shape (leg press, leg curl, leg extension, calf raises)",
          "Day 4: core plus cardio (knee raises, cable crunch, plank) with rising hold targets"
        ],
        conditioning: ["Post-lift cardio starts at 15-20 min", "Day 6 adds light cardio at 25 min", "Day 7: Full rest"]
      },
      {
        title: "Weeks 3-4 Set and Density Build",
        focus: "Increase set volume and tighten rest for better body composition response.",
        trainingDays: [
          "Week 3 moves all main training days to 4 sets",
          "Week 4 keeps 4 sets and reduces rest to 45 sec where prescribed",
          "Rep targets progress on chest, back, leg, and core sessions",
          "Core hold times increase to strengthen trunk control"
        ],
        conditioning: ["Cardio baseline rises to 20 min", "Day 6 remains active-recovery cardio", "Day 7: Full rest"]
      },
      {
        title: "Weeks 5-6 Shaping Superset Phase",
        focus: "Use supersets to increase density and visual muscle detail.",
        trainingDays: [
          "Day 1 supersets: bench to push-ups and incline DB to cable fly",
          "Day 2 supersets: pulldown to straight-arm pulldown and row to face pull",
          "Day 3 supersets: leg press to bodyweight squats and leg curl to lunges",
          "Day 4 core pairing: knee raises with plank emphasis"
        ],
        conditioning: ["Week 5 cardio at 20 min, Week 6 at 25 min", "Week 6 increases volume to 5 sets", "Day 7: Full rest"]
      },
      {
        title: "Weeks 7-8 Lean Build",
        focus: "Increase rep demand under shortened rest for lean-muscle stimulus.",
        trainingDays: [
          "Week 7 raises upper and lower rep ranges at 5-set workload",
          "Rest compresses to 30-40 sec during key shaping blocks",
          "Core day scales to higher rep and set output",
          "Week 8 adds finisher: jump squats 10 plus push-ups 12 for 3 rounds"
        ],
        conditioning: ["Cardio remains at 25 min baseline", "Day 6 stays as structured light-cardio support", "Day 7: Full rest"]
      },
      {
        title: "Weeks 9-10 Detail Phase",
        focus: "Transition to timed rounds for density and conditioning detail.",
        trainingDays: [
          "Day 1 timed block: bench press, incline DB, cable fly at 40 sec work / 20 sec rest",
          "Day 2 timed block: lat pulldown, row, face pull at 40/20",
          "Day 3 timed block: leg press, lunges, leg curl at 40/20",
          "Day 4 timed core block at 40/20 with controlled technique"
        ],
        conditioning: ["Week 9 uses 6 rounds, Week 10 rises to 7 rounds", "Cardio support remains in place for recovery", "Day 7: Full rest"]
      },
      {
        title: "Weeks 11-12 Peak Aesthetic",
        focus: "Finalize with finishers and highest timed-density blocks.",
        trainingDays: [
          "Week 11 adds finisher: push-ups 15 plus jump squats 12 for 3 rounds",
          "Week 12 shifts key sessions to 45 sec work / 15 sec rest",
          "Week 12 keeps 7 rounds for primary timed blocks",
          "Day 4 remains core plus cardio and Day 6 cardio expands to 40 min"
        ],
        conditioning: ["Peak-week cardio volume supports fat-loss finish", "Form quality remains mandatory at high fatigue", "Day 7: Full rest"]
      }
    ],
    safety: [
      "Keep movement control and form above pace.",
      "Do not rush reps in timed or superset phases.",
      "Stop any set when technique starts to break.",
      "Reduce round count when fatigue compromises quality."
    ]
  },
  "high-intensity-fat-burn-12w": {
    goal: "Maximum fat loss and conditioning improvement",
    level: "High-intensity progression",
    equipment: "Full gym required",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Intensity Foundation",
        focus: "Build tolerance for circuits, intervals, and short-rest execution.",
        trainingDays: [
          "Day 1 and Day 4: full-body circuit (bench, pulldown, leg press, shoulder press, plank)",
          "Day 2 and Day 5: HIIT sprint protocol progression",
          "Day 3: lower-body burn circuit with short recovery windows",
          "Week 2 increases rep targets and sprint-to-walk intensity ratio"
        ],
        conditioning: ["Cardio starts at 15-18 min on circuit days", "Day 6 includes dedicated cardio support", "Day 7: Full rest"]
      },
      {
        title: "Weeks 3-4 Volume and Pace Build",
        focus: "Increase rounds and interval demand while preserving clean movement.",
        trainingDays: [
          "Week 3 increases circuit days to 4 rounds and HIIT to 14 rounds",
          "Week 4 raises lower-body reps and tightens rest to 30-40 sec in key sessions",
          "Sprint intervals progress to 30 sec work and 30 sec walk",
          "Technique remains mandatory under rising density"
        ],
        conditioning: ["Cardio baseline reaches 20 min", "Day 6 cardio remains active recovery", "Day 7: Full rest"]
      },
      {
        title: "Weeks 5-6 High Burn Superset Phase",
        focus: "Drive metabolic stress with supersets and compressed rest.",
        trainingDays: [
          "Day 1 supersets: bench to push-ups, pulldown to row, leg press to squats, shoulder press to lateral raises",
          "Day 3 supersets: leg press to lunges, leg curl to squats",
          "Week 5 uses 4 rounds with 20-30 sec rest",
          "Week 6 increases to 5 rounds and extends HIIT to 18 rounds"
        ],
        conditioning: ["HIIT load increases aggressively", "Cardio support continues on non-HIIT blocks", "Day 7: Full rest"]
      },
      {
        title: "Weeks 7-8 Extreme Density",
        focus: "Push peak density with very short rest and high total workload.",
        trainingDays: [
          "Week 7 increases reps across all primary movement pairs at 5 rounds",
          "Rest drops to 15-25 sec on key circuit transitions",
          "HIIT remains at 18 rounds to maintain conditioning pressure",
          "Week 8 adds finisher: burpees 12 plus jump squats 12 for 3 rounds"
        ],
        conditioning: ["Cardio demand remains high across the full week", "Recovery strategy is critical for completion quality", "Day 7: Full rest"]
      },
      {
        title: "Weeks 9-10 Advanced HIIT",
        focus: "Shift dominant stress to high-round interval conditioning.",
        trainingDays: [
          "Day 1 and Day 3 keep resistance anchor sessions for muscle retention",
          "HIIT protocol remains 30 sec sprint plus 30 sec walk",
          "Week 9 uses 20 HIIT rounds and Week 10 rises to 22 rounds",
          "Day 2 and Day 5 serve as dedicated repeat-HIIT days"
        ],
        conditioning: ["Interval volume becomes primary conditioning driver", "Monitor fatigue closely and adjust if needed", "Day 7: Full rest"]
      },
      {
        title: "Weeks 11-12 Peak Intensity",
        focus: "Finalize with highest interval volume while protecting technique.",
        trainingDays: [
          "Week 11 adds finisher: push-ups 15 plus jump squats 15 for 3 rounds",
          "Week 12 Day 1 and Day 4 resistance anchors move to 5 rounds",
          "Week 12 HIIT peaks at 25 rounds with 30/30 format",
          "Week 12 includes one light-weight technique day to reduce breakdown risk"
        ],
        conditioning: ["Day 6 cardio extends to 40 min", "Recovery quality is mandatory for peak week completion", "Day 7: Full rest"]
      }
    ],
    safety: [
      "This program is very intense and should stop immediately if form breaks.",
      "Do not force reps under technical failure.",
      "Prioritize sleep, hydration, and recovery to sustain output.",
      "Reduce rounds or intervals if fatigue compromises movement control."
    ]
  },
  "gym-mass-builder-12w": {
    goal: "Build maximum muscle size and strength",
    level: "Beginner to advanced progression",
    equipment: "Full gym required",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Compound and Hypertrophy Foundation",
        focus: "Establish split structure and base loading quality across all muscle groups.",
        trainingDays: [
          "Day 1: chest (bench press, incline DB press, cable fly, push-ups)",
          "Day 2: back (lat pulldown, seated row, straight-arm pulldown, face pull)",
          "Day 3: legs (leg press, leg curl, leg extension, calf raises)",
          "Day 4: shoulders (shoulder press, lateral raises, rear delt fly, shrugs)",
          "Day 5: arms (curl, pushdown, hammer curl, overhead tricep extension)"
        ],
        conditioning: ["Day 6: Rest or light walk", "Day 7: Full rest", "Week 2 increases reps while keeping 3-set structure"]
      },
      {
        title: "Weeks 3-4 Volume Base",
        focus: "Increase total training volume and tighten execution discipline.",
        trainingDays: [
          "Week 3 increases all main sessions to 4 sets",
          "Week 4 keeps 4 sets with structured rest around 75 sec on key compound work",
          "Primary lifts stay in moderate-heavy rep ranges for growth and control",
          "Accessory work remains in hypertrophy rep ranges"
        ],
        conditioning: ["Day 6: Rest or light walk", "Day 7: Full rest", "Performance metric: clean reps at stable load"]
      },
      {
        title: "Weeks 5-6 Growth Phase",
        focus: "Introduce intensity techniques and increase set count for muscle gain.",
        trainingDays: [
          "Week 5 applies drop set on the final bench press set",
          "Main split remains chest, back, legs, shoulders, arms",
          "Rep scheme shifts to strength-biased compounds with hypertrophy accessories",
          "Week 6 progresses all sessions to 5 sets"
        ],
        conditioning: ["Day 6: Rest or light walk", "Day 7: Full rest", "Intensity is controlled, not rushed"]
      },
      {
        title: "Weeks 7-8 Heavy Phase",
        focus: "Increase loading with lower rep targets on primary compound lifts.",
        trainingDays: [
          "Week 7 primary compounds move into lower rep strength ranges",
          "Rest increases to about 90 sec for heavy sets",
          "Accessory lifts maintain moderate reps to support hypertrophy",
          "Week 8 adds finisher: push-ups max plus squats max for 2 rounds"
        ],
        conditioning: ["Day 6: Rest or light walk", "Day 7: Full rest", "Technique quality controls loading decisions"]
      },
      {
        title: "Weeks 9-10 Hypertrophy Focus",
        focus: "Shift from heavy emphasis back to high-quality hypertrophy workload.",
        trainingDays: [
          "Week 9 returns to higher hypertrophy rep targets at 5 sets",
          "Split structure remains unchanged to preserve weekly balance",
          "Mind-muscle connection and contraction control become priority",
          "Week 10 increases training sessions to 6 sets"
        ],
        conditioning: ["Day 6: Rest", "Day 7: Rest", "Recovery quality is essential at high set counts"]
      },
      {
        title: "Weeks 11-12 Peak Bulk",
        focus: "Finalize with high-volume growth work and controlled intensity techniques.",
        trainingDays: [
          "Week 11 adds drop sets on the final set of key exercises",
          "Week 12 keeps 6-set structure across chest, back, legs, shoulders, and arms",
          "Primary compounds remain heavy-moderate with strict form standards",
          "Program closes with full recovery days to consolidate gains"
        ],
        conditioning: ["Day 6: Rest", "Day 7: Rest", "No ego lifting during peak volume weeks"]
      }
    ],
    safety: [
      "Lift heavy with strict control and full range quality.",
      "No ego lifting under any phase.",
      "Stop a set when form degrades, even before target reps.",
      "Adjust load and volume based on recovery markers."
    ]
  },
  "hypertrophy-system-12w": {
    goal: "Maximum muscle growth with size and fullness",
    level: "High-volume progression",
    equipment: "Full gym required",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Pump Foundation",
        focus: "Build high-rep hypertrophy base across full split structure.",
        trainingDays: [
          "Day 1: chest pump (bench, incline DB, cable fly, push-ups)",
          "Day 2: back pump (lat pulldown, row, straight-arm pulldown, face pull)",
          "Day 3: leg pump (leg press, leg curl, leg extension, calves)",
          "Day 4: shoulder pump (shoulder press, lateral raise, rear delt, shrugs)",
          "Day 5: arms pump (curl and triceps variations)"
        ],
        conditioning: ["Day 6: Optional light cardio around 20 min", "Day 7: Full rest", "Week 2 increases reps in all major blocks"]
      },
      {
        title: "Weeks 3-4 Volume Build",
        focus: "Increase total workload with controlled rest and pump quality.",
        trainingDays: [
          "Week 3 moves all split days to 4 sets",
          "Week 4 keeps 4 sets with rest kept around 45-60 sec",
          "Primary lift reps remain moderate-high for tension and control",
          "Accessory work stays in higher-rep hypertrophy zones"
        ],
        conditioning: ["Day 6 remains optional low-intensity support", "Day 7: Full rest", "Pump quality and range of motion stay priority"]
      },
      {
        title: "Weeks 5-6 Pump Phase",
        focus: "Introduce supersets to increase metabolic stress and cell swelling.",
        trainingDays: [
          "Day 1 supersets: bench to push-ups, incline DB to cable fly",
          "Day 2 supersets: pulldown to row, straight-arm to face pull",
          "Day 3 supersets: leg press to squats, leg curl to lunges",
          "Week 5 uses 4 sets and Week 6 increases to 5 sets"
        ],
        conditioning: ["Day 6 optional light cardio remains available", "Day 7: Full rest", "Recovery management supports sustained volume output"]
      },
      {
        title: "Weeks 7-8 High Volume",
        focus: "Push set volume and rep density for advanced hypertrophy response.",
        trainingDays: [
          "Week 7 rep targets rise across chest, back, legs, shoulders, and arms",
          "Rest narrows to about 30-45 sec where safe",
          "Week 8 keeps high-volume structure and adds finisher",
          "Week 8 finisher: push-ups max plus lateral raises 20 reps for 2 rounds"
        ],
        conditioning: ["Day 6 remains optional light cardio", "Day 7: Full rest", "Session pacing must remain technically clean"]
      },
      {
        title: "Weeks 9-10 Extreme Pump",
        focus: "Apply drop-set intensity methods while maintaining high volume.",
        trainingDays: [
          "Week 9 introduces drop sets on key chest lifts and extends across split",
          "Back, legs, shoulders, and arms follow the same pump-intensity style",
          "Week 9 uses 5 sets under intensity-technique control",
          "Week 10 progresses to 6 sets across training days"
        ],
        conditioning: ["Day 6 optional recovery movement encouraged", "Day 7: Full rest", "Load selection must preserve full rep quality"]
      },
      {
        title: "Weeks 11-12 Peak Pump",
        focus: "Finalize with maximum hypertrophy volume and advanced drop-set loading.",
        trainingDays: [
          "Week 11 adds double drop sets on final key sets",
          "Week 12 keeps 6-set structure across Day 1 to Day 5 split",
          "Peak week retains high-rep, high-tension execution standards",
          "Optional light pump day remains available on Day 6"
        ],
        conditioning: ["Day 6 optional light pump workout", "Day 7: Full rest", "Objective is full-volume completion with strict control"]
      }
    ],
    safety: [
      "High volume creates fatigue; form must stay strict.",
      "Stop sets when technique quality drops.",
      "Do not force reps with poor joint alignment.",
      "Adjust volume based on recovery and performance markers."
    ]
  },
  "strength-and-size-blueprint-12w": {
    goal: "Build high-level strength and visible muscle size",
    level: "Advanced progression",
    equipment: "Full gym required",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Strength and Size Foundation",
        focus: "Establish heavy compounds with hypertrophy accessories across full split.",
        trainingDays: [
          "Day 1: chest strength plus size (bench, incline DB, cable fly, push-ups)",
          "Day 2: back strength plus size (pulldown, row, straight-arm pulldown, face pull)",
          "Day 3: legs strength plus size (leg press, leg curl, leg extension, calves)",
          "Day 4: shoulders (press, lateral raises, rear delts, shrugs)",
          "Day 5: arms (curl and triceps emphasis)"
        ],
        conditioning: ["Day 6: Rest or light walk", "Day 7: Full rest", "Week 2 increases reps while preserving lift quality"]
      },
      {
        title: "Weeks 3-4 Volume Base",
        focus: "Increase set volume while preserving heavy-lift execution standards.",
        trainingDays: [
          "Week 3 scales split days to 4 sets",
          "Week 4 keeps 4 sets with heavy-lift rest around 90 sec",
          "Compound lifts remain low-to-moderate reps for strength",
          "Accessory lifts stay in hypertrophy ranges for size support"
        ],
        conditioning: ["Day 6: Rest or light walk", "Day 7: Full rest", "Primary KPI is clean reps at heavier loads"]
      },
      {
        title: "Weeks 5-6 Strength Push",
        focus: "Drive compound strength adaptation with heavier rep schemes.",
        trainingDays: [
          "Week 5 main compounds shift toward 5-6 rep strength ranges",
          "Accessory lifts continue in moderate rep hypertrophy zones",
          "Week 5 remains 4 sets with high-quality heavy execution",
          "Week 6 progresses split sessions to 5 sets"
        ],
        conditioning: ["Day 6: Rest or light walk", "Day 7: Full rest", "Load increases only with strict technique"]
      },
      {
        title: "Weeks 7-8 Heavy Phase",
        focus: "Peak strength emphasis before transitioning back to size-biased work.",
        trainingDays: [
          "Week 7 compounds move to 4-5 rep ranges with full control",
          "Rest windows around 120 sec for heavy sets",
          "Accessory work supports joint balance and muscle detail",
          "Week 8 adds finisher: push-ups max plus squats max for 2 rounds"
        ],
        conditioning: ["Day 6: Rest or light walk", "Day 7: Full rest", "Fatigue management is mandatory during heavy loading"]
      },
      {
        title: "Weeks 9-10 Size Shift",
        focus: "Transition from peak strength toward hypertrophy-driven size expansion.",
        trainingDays: [
          "Week 9 compounds return to moderate hypertrophy rep targets",
          "Accessory volumes increase for fuller muscular development",
          "Week 9 uses 5 sets across split days",
          "Week 10 progresses to 6 sets for high-volume growth stimulus"
        ],
        conditioning: ["Day 6: Rest", "Day 7: Rest", "Recovery support is crucial at this volume"]
      },
      {
        title: "Weeks 11-12 Peak Strength and Size",
        focus: "Finalize with advanced intensity methods and peak workload.",
        trainingDays: [
          "Week 11 introduces drop sets on key final sets",
          "Week 12 keeps 6-set structure across Day 1 to Day 5 split",
          "Compound lifts stay controlled with strong technical standards",
          "Program closes with full rest support to consolidate gains"
        ],
        conditioning: ["Day 6: Rest", "Day 7: Rest", "Final objective is quality completion at peak load and volume"]
      }
    ],
    safety: [
      "Heavy weights demand strict form at all times.",
      "Do not rush repetitions under load.",
      "Stop sets when technique quality drops.",
      "Adjust load and set count when recovery is insufficient."
    ]
  },
  "aesthetic-muscle-plan-12w": {
    goal: "Build a balanced, aesthetic physique with symmetry",
    level: "Advanced progression",
    equipment: "Full gym required",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Aesthetic Foundation",
        focus: "Establish balanced split and controlled volume for symmetry.",
        trainingDays: [
          "Day 1: chest plus shape (bench press, incline DB, slow cable fly, push-ups)",
          "Day 2: back plus width (lat pulldown, seated row, straight-arm pulldown, face pull)",
          "Day 3: legs plus shape (leg press, leg curl, leg extension, calf raises)",
          "Day 4: shoulders plus detail (press, lateral raises, rear delts, shrugs)",
          "Day 5: arms plus finish (curl and triceps variations)"
        ],
        conditioning: ["Day 6: Optional cardio around 20 min", "Day 7: Full rest", "Week 2 raises reps for detail stress"]
      },
      {
        title: "Weeks 3-4 Volume Base",
        focus: "Increase total set volume while preserving visual-quality execution.",
        trainingDays: [
          "Week 3 scales split days to 4 sets",
          "Week 4 keeps 4 sets with rests around 60 sec on key movements",
          "Primary compounds remain moderate-load and controlled",
          "Isolation work stays in higher-rep ranges for symmetry detail"
        ],
        conditioning: ["Day 6 remains optional low-intensity support", "Day 7: Full rest", "Performance metric is clean contraction quality"]
      },
      {
        title: "Weeks 5-6 Detail Phase",
        focus: "Introduce supersets to drive detail and shape under controlled fatigue.",
        trainingDays: [
          "Day 1 supersets: bench to push-ups and incline DB to cable fly",
          "Day 2 supersets: pulldown to straight-arm and row to face pull",
          "Day 3 supersets: leg press to squats and leg curl to lunges",
          "Day 4 supersets: shoulder press to lateral raises"
        ],
        conditioning: ["Week 5 uses 4 sets and Week 6 rises to 5 sets", "Optional cardio remains available on Day 6", "Day 7: Full rest"]
      },
      {
        title: "Weeks 7-8 Aesthetic Growth",
        focus: "Increase volume and rep demand to improve fullness and shape.",
        trainingDays: [
          "Week 7 increases chest, back, legs, shoulders, and arms volume at 5 sets",
          "Rest windows tighten to around 45 sec for denser hypertrophy stress",
          "Symmetry control remains mandatory on bilateral and unilateral movements",
          "Week 8 finisher: push-ups max plus lateral raises 20 reps for 2 rounds"
        ],
        conditioning: ["Day 6 optional cardio support continues", "Day 7: Full rest", "Track left-right quality and posture control"]
      },
      {
        title: "Weeks 9-10 Detail Focus",
        focus: "Transition to timed density blocks for high-quality shaping output.",
        trainingDays: [
          "Day 1 uses 40 sec work / 20 sec rest on bench, incline DB, and cable fly",
          "Day 2 to Day 5 use same timed format on their respective muscle groups",
          "Week 9 runs 6 rounds across timed blocks",
          "Week 10 increases to 7 rounds"
        ],
        conditioning: ["Day 6 optional low-intensity recovery remains", "Day 7: Full rest", "Form quality under time pressure is priority"]
      },
      {
        title: "Weeks 11-12 Peak Physique",
        focus: "Finalize with peak timed density and finishers while preserving technique.",
        trainingDays: [
          "Week 11 adds finisher: push-ups 15 plus lateral raises 20 for 3 rounds",
          "Week 12 shifts key blocks to 45 sec work / 15 sec rest",
          "Week 12 maintains 7 rounds across Day 1 to Day 5 structure",
          "Program closes with longer cardio support on Day 6"
        ],
        conditioning: ["Day 6 cardio increases to 40 min", "Day 7: Full rest", "Final objective is polished movement quality at high density"]
      }
    ],
    safety: [
      "Control every rep and prioritize quality over ego.",
      "Do not rush movements during supersets or timed blocks.",
      "Stop sets when posture or joint alignment degrades.",
      "Scale rounds if fatigue compromises technical precision."
    ]
  },
  "keto-shred-diet-12w": {
    goal: "Accelerate fat loss while preserving muscle with keto nutrition",
    level: "Beginner to advanced adherence progression",
    equipment: "Kitchen prep tools and basic cookware",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Keto Adaptation",
        focus: "Establish keto meal discipline, hydration, and electrolyte stability.",
        trainingDays: [
          "Daily calorie range: about 1,800-1,900 kcal with low-carb structure",
          "Meal framework: 3 core meals plus optional controlled snack",
          "Protein anchored meals with eggs, chicken, beef, tuna, and healthy fats",
          "Week 1 recipe execution priority: flavor, consistency, and full compliance"
        ],
        conditioning: ["Water target: 3 to 3.5L daily", "Electrolytes are strongly recommended", "Expected early water-weight drop in first 1-2 weeks"]
      },
      {
        title: "Weeks 3-4 Consistency Block",
        focus: "Lock in repeatable meal prep rhythm and appetite control.",
        trainingDays: [
          "Rotate core protein sources to reduce diet fatigue",
          "Keep carb exposure minimal and controlled through vegetables only",
          "Maintain daily meal timing consistency for better adherence",
          "Use spice system to preserve taste quality and prevent plan drop-off"
        ],
        conditioning: ["Continue hydration target each day", "Track energy, hunger, and digestion patterns", "Adjust seasoning and textures instead of breaking plan"]
      },
      {
        title: "Weeks 5-6 Fat-Loss Momentum",
        focus: "Improve body-composition momentum with strict macro discipline.",
        trainingDays: [
          "Preserve protein intake to protect lean mass",
          "Keep fats strategic and meal portions measured",
          "Use simple repeat meals to remove decision fatigue",
          "Optional whey post-workout when training volume is high"
        ],
        conditioning: ["Monitor sleep quality and recovery markers", "Electrolytes remain important for keto training performance", "Fat-loss visibility typically improves during this block"]
      },
      {
        title: "Weeks 7-8 Precision Control",
        focus: "Refine portions and tighten compliance for visual change.",
        trainingDays: [
          "Use meal prep batching to eliminate missed meals",
          "Keep sauces and hidden carbs strictly controlled",
          "Maintain recipe quality to avoid adherence decline",
          "Protein-first rule on every meal remains non-negotiable"
        ],
        conditioning: ["Hydration and sodium-potassium balance are key", "Optional cardio can be paired with meal timing plan", "Track weekly physique changes and waist metrics"]
      },
      {
        title: "Weeks 9-10 Lean Detail Phase",
        focus: "Maintain ketosis consistency while maximizing lean-out outcome.",
        trainingDays: [
          "Keep daily plan simple, repeatable, and measured",
          "Prioritize whole-food protein and controlled fat portions",
          "Minimize deviations to preserve weekly momentum",
          "Continue snack control (almonds or approved alternatives only)"
        ],
        conditioning: ["Energy should stabilize when adherence stays high", "Adjust meal timing around workouts as needed", "Stay consistent rather than over-restricting"]
      },
      {
        title: "Weeks 11-12 Peak Shred Discipline",
        focus: "Finish the cycle with strict execution and recovery support.",
        trainingDays: [
          "Keep all meals within established keto framework",
          "Maintain recipe quality and macro discipline through final weeks",
          "Avoid introducing new foods that disrupt digestion or adherence",
          "Use final block for precision, not extreme restriction"
        ],
        conditioning: ["Hydration stays at full target", "Continue electrolytes and sleep discipline", "Goal: leaner look with muscle preservation and stable energy"]
      }
    ],
    safety: [
      "If dizziness, extreme fatigue, or unusual symptoms appear, reduce intensity and reassess.",
      "Do not crash diet below sustainable intake.",
      "Maintain strict hydration and electrolyte support during keto adaptation.",
      "Consistency and controlled execution outperform aggressive short-term restriction."
    ]
  },
  "gut-health-fat-loss-diet-12w": {
    goal: "Lose fat while improving digestion and reducing bloating",
    level: "Beginner to advanced adherence progression",
    equipment: "Basic kitchen tools and meal-prep containers",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Digestion Reset Foundation",
        focus: "Establish gut-friendly meals, hydration routine, and anti-bloat consistency.",
        trainingDays: [
          "Daily target: around 1,900 kcal with balanced macros (~130P / 180C / 60F)",
          "Core meal rotation includes probiotic yogurt bowls, lean proteins, rice, vegetables, and fish",
          "Week 1 uses simple recipes to reduce digestive stress while keeping adherence high",
          "Flavor system remains clean with cinnamon, garlic, lemon, and basic spices"
        ],
        conditioning: ["Water target: 3 to 3.5L daily", "Daily digestion check: bloating, appetite, and comfort", "Goal is stable digestion plus early fat-loss momentum"]
      },
      {
        title: "Weeks 3-4 Gut Stability Block",
        focus: "Reinforce low-irritation food structure and regular meal timing.",
        trainingDays: [
          "Keep probiotic food exposure frequent (yogurt, kefir or laban alternatives)",
          "Rotate chicken, tuna, beef, and salmon to maintain protein quality",
          "Maintain fiber from vegetables and controlled oats portions",
          "Avoid sudden high-fat or high-spice deviations that disturb digestion"
        ],
        conditioning: ["Hydration remains fixed daily", "Use cooking methods that keep meals light and digestible", "Track symptom reduction trend weekly"]
      },
      {
        title: "Weeks 5-6 Fat-Loss Consolidation",
        focus: "Maintain digestion progress while tightening fat-loss consistency.",
        trainingDays: [
          "Protein remains anchored at each meal for muscle retention",
          "Carbs stay controlled and performance-supportive from rice, oats, and potatoes",
          "Use repeatable meal prep to reduce missed meals",
          "Prioritize whole foods and low-processing for gut comfort"
        ],
        conditioning: ["Continue bloating and bowel-regularity tracking", "Hydration + sodium balance are key", "Adjust portion sizes only when adherence is strong"]
      },
      {
        title: "Weeks 7-8 Digestive Performance Phase",
        focus: "Improve daily energy and digestive resilience under consistent intake.",
        trainingDays: [
          "Keep breakfast and lunch structures predictable for routine stability",
          "Maintain fish and omega-3 sources to support inflammation control",
          "Use alternatives list only when needed, without changing core macro structure",
          "Meal timing should align with training and sleep quality"
        ],
        conditioning: ["Water target remains unchanged", "Optional probiotics can be used daily", "Recovery quality supports continued fat loss"]
      },
      {
        title: "Weeks 9-10 Lean and Light Block",
        focus: "Preserve gut comfort while leaning out further.",
        trainingDays: [
          "Keep meals simple and familiar to avoid digestive surprises",
          "Continue balanced macro approach rather than extreme restriction",
          "Maintain vegetable variety and steady protein intake",
          "Reduce random snack variability and keep approved snack structure"
        ],
        conditioning: ["Monitor bloating triggers and remove offenders", "Keep meal prep quality high", "Use consistency over aggressive cuts"]
      },
      {
        title: "Weeks 11-12 Peak Gut and Fat-Loss Discipline",
        focus: "Finish with high adherence, low digestive stress, and visible physique improvements.",
        trainingDays: [
          "Execute same proven meal templates with strict consistency",
          "Keep macro control stable through final weeks",
          "Avoid introducing new foods late in the cycle",
          "Focus on digestion quality, energy, and sustainable compliance"
        ],
        conditioning: ["Hydration remains at 3 to 3.5L daily", "Continue optional supplement support", "Outcome target: leaner, healthier, less bloated physique"]
      }
    ],
    safety: [
      "If digestive distress worsens, simplify meals and reassess food triggers.",
      "Do not over-restrict calories below sustainable levels.",
      "Keep hydration and electrolytes consistent to support digestion.",
      "Progress is built through steady adherence, not extreme dieting."
    ]
  },
  "student-fat-loss-diet-12w": {
    goal: "Drive fat loss on a strict budget with high adherence",
    level: "Beginner to advanced adherence progression",
    equipment: "Basic kitchen setup for low-cost meal prep",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Budget Cut Foundation",
        focus: "Build a cheap, repeatable structure with controlled calories and high protein.",
        trainingDays: [
          "Daily target: around 1,700-1,800 kcal (~120-140g protein / ~160g carbs / ~45g fat)",
          "Day 1 core flow: eggs plus bread breakfast, budget chicken-rice lunch, tuna-potato dinner, yogurt snack",
          "Day 2 core flow: oats-milk breakfast, eggs-rice lunch, chicken-bread dinner",
          "Days 3-7 repeat low-cost templates (eggs, chicken, tuna, rice, potatoes, oats, bread, milk)"
        ],
        conditioning: [
          "Water target: 3L daily",
          "Shopping base: eggs, chicken, tuna, rice, potatoes, bread, oats, milk, yogurt",
          "Goal is immediate consistency with affordable food choices"
        ]
      },
      {
        title: "Weeks 3-4 Consistency and Cost Control",
        focus: "Lock in routine and optimize food budget without losing protein targets.",
        trainingDays: [
          "Buy in bulk where possible (eggs, rice, potatoes, oats)",
          "Rotate chicken and tuna based on weekly prices",
          "Use basic spices to keep meals sustainable",
          "Keep each day meal pattern predictable and easy to execute"
        ],
        conditioning: ["Hydration and sleep support appetite control", "Adjust portion size only when weekly adherence is high", "No expensive add-ons required for progress"]
      },
      {
        title: "Weeks 5-6 Fat-Loss Momentum",
        focus: "Improve fat-loss rate through stricter portions and steady meal timing.",
        trainingDays: [
          "Maintain protein range (~120-140g) as the primary anchor",
          "Keep carbs practical from rice, oats, bread, and potatoes",
          "Limit high-calorie extras and keep snack decisions controlled",
          "Use same meal-prep batches to avoid overspending"
        ],
        conditioning: ["Daily water and sodium balance remain important", "Measure consistency by weekly execution, not daily perfection", "Budget control and body-composition progress move together"]
      },
      {
        title: "Weeks 7-8 Discipline Reinforcement",
        focus: "Preserve adherence despite monotony and maintain low-cost structure.",
        trainingDays: [
          "Repeat successful low-cost meal combinations",
          "Use alternatives only when availability or price requires it",
          "Keep protein first at each meal",
          "Stick to core shopping list and avoid impulse foods"
        ],
        conditioning: ["Appetite management improves with stable routine", "Hydration remains fixed at 3L", "Consistency produces visible lean-out by this phase"]
      },
      {
        title: "Weeks 9-10 Leaner Phase",
        focus: "Tighten execution and maintain muscle support on budget.",
        trainingDays: [
          "Continue exact low-cost templates with portion precision",
          "Protect protein intake even when food options are limited",
          "Plan meals ahead to prevent skipped or random eating",
          "Focus on practical sustainability for student schedules"
        ],
        conditioning: ["Monitor energy and study performance", "Adjust meals for schedule without breaking targets", "Steady deficit remains the fat-loss driver"]
      },
      {
        title: "Weeks 11-12 Peak Budget Cut",
        focus: "Finish the cycle with strict low-cost compliance and clear fat-loss outcome.",
        trainingDays: [
          "Keep food choices simple, cheap, and measured",
          "Avoid unnecessary complexity in final weeks",
          "Maintain routine and daily targets to lock in results",
          "Use final block to build long-term discipline habits"
        ],
        conditioning: ["Continue hydration and recovery support", "Optional whey only if budget allows", "Outcome target: leaner body at minimal food cost"]
      }
    ],
    safety: [
      "Do not cut calories too aggressively if energy or concentration crashes.",
      "Keep protein intake adequate to protect muscle mass.",
      "Hydrate consistently, especially with high-protein days.",
      "If fatigue accumulates, adjust portions gradually rather than quitting the plan."
    ]
  },
  "lean-bulk-diet-12w": {
    goal: "Build muscle with minimal fat gain through structured surplus",
    level: "Beginner to advanced adherence progression",
    equipment: "Basic kitchen setup plus meal-prep containers",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Lean Bulk Base",
        focus: "Establish calorie surplus, macro consistency, and meal timing discipline.",
        trainingDays: [
          "Daily target: around 2,600-2,800 kcal (~160P / 320C / 70F)",
          "Day 1 flow: muscle oat bowl breakfast, chicken-rice bulk lunch, beef-potato dinner, yogurt-almond snack",
          "Day 2 flow: eggs-oats breakfast, tuna-rice lunch, chicken-pasta dinner",
          "Days 3-7 repeat rotation to reinforce meal timing and surplus adherence"
        ],
        conditioning: [
          "Water target: 3 to 4L daily",
          "Shopping base: oats, whey, milk, eggs, chicken, beef, tuna, rice, pasta, potatoes, yogurt, almonds, peanut butter",
          "Expected early weight rise is normal in surplus phase"
        ]
      },
      {
        title: "Weeks 3-4 Performance Consistency",
        focus: "Reinforce surplus execution while keeping food quality high.",
        trainingDays: [
          "Maintain high-protein anchor at each meal",
          "Use rice, oats, pasta, and potatoes to sustain training output",
          "Keep fats controlled from olive oil, nuts, and peanut butter",
          "Repeat successful meal templates for easier compliance"
        ],
        conditioning: ["Hydration supports training recovery", "Evaluate gym performance weekly", "Adjust meal timing for training days"]
      },
      {
        title: "Weeks 5-6 Growth Momentum",
        focus: "Drive strength and size progression with stable macro execution.",
        trainingDays: [
          "Preserve calorie range and do not under-eat on hard training days",
          "Use whey strategically to complete protein target",
          "Keep meal prep volume high to avoid missed calories",
          "Prioritize digestible carb sources around workouts"
        ],
        conditioning: ["Creatine can support strength progression", "Sleep quality influences growth response", "Steady intake beats random large spikes"]
      },
      {
        title: "Weeks 7-8 Lean Growth Refinement",
        focus: "Continue muscle gain while minimizing unnecessary fat accumulation.",
        trainingDays: [
          "Keep weekly intake stable and avoid uncontrolled cheat meals",
          "Monitor fullness, energy, and training quality",
          "Use food alternatives without breaking macro structure",
          "Maintain protein consistency even on rest days"
        ],
        conditioning: ["Track waist plus scale trend together", "If fat gain accelerates, reduce surplus slightly", "Recovery markers guide adjustments"]
      },
      {
        title: "Weeks 9-10 Advanced Lean Bulk Control",
        focus: "Optimize nutrient timing and consistency for visible quality mass gain.",
        trainingDays: [
          "Center carbs around pre/post-workout meals",
          "Keep fats moderate to support hormones and appetite",
          "Maintain exact meal structure across busy days",
          "Do not sacrifice meal quality for convenience junk food"
        ],
        conditioning: ["Hydration remains 3 to 4L daily", "Keep strength trend moving upward", "Use disciplined consistency for clean physique changes"]
      },
      {
        title: "Weeks 11-12 Peak Lean Gain Discipline",
        focus: "Finish with stable surplus and strong habit carryover.",
        trainingDays: [
          "Execute proven meal templates with high consistency",
          "Avoid unnecessary food changes in final weeks",
          "Maintain protein, carbs, and recovery support daily",
          "Close cycle with performance and physique quality focus"
        ],
        conditioning: ["Continue supplement support if useful", "Track strength and body composition outcomes", "Target: visible muscle gain with controlled fat increase"]
      }
    ],
    safety: [
      "Do not force rapid weight gain with excessive calorie jumps.",
      "Keep digestion in check by spreading meals through the day.",
      "Monitor body-fat trend and adjust surplus gradually.",
      "Consistent training, sleep, and nutrition are all required for lean growth."
    ]
  },
  "clean-cutting-diet-12w": {
    goal: "Lose fat, preserve muscle, and achieve a defined physique",
    level: "Beginner to advanced adherence progression",
    equipment: "Basic kitchen setup and meal-prep containers",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Clean Cut Foundation",
        focus: "Establish high-protein cutting structure with controlled calories.",
        trainingDays: [
          "Daily target: around 1,800 kcal (~150P / 150C / 50F)",
          "Core meals include protein oats, chicken-rice plates, lean beef with vegetables, and yogurt-almond snack",
          "Week 1 priority is clean execution and repeatable meal timing",
          "Protein-first intake supports muscle retention from day one"
        ],
        conditioning: ["Water target: 3 to 3.5L daily", "Expected early drop and tighter visual look in first 1-2 weeks", "Track morning weight and weekly photos"]
      },
      {
        title: "Weeks 3-4 Consistency Block",
        focus: "Lock in meal-prep rhythm and preserve training energy while cutting.",
        trainingDays: [
          "Rotate chicken, tuna, beef, and fish across lunch and dinner slots",
          "Keep carb sources clean and measured (rice, potatoes, oats, whole-grain bread)",
          "Maintain steady protein distribution across meals",
          "Use simple alternatives without changing total macro structure"
        ],
        conditioning: ["Hydration and sleep quality remain priority", "Maintain consistency before making portion changes", "Keep sodium and meal timing stable"]
      },
      {
        title: "Weeks 5-6 Fat-Loss Momentum",
        focus: "Increase fat-loss consistency while protecting lean mass.",
        trainingDays: [
          "Preserve protein around 150g daily as anchor",
          "Keep carbs performance-supportive, not excessive",
          "Use planned snacks only to avoid random intake",
          "Batch-cook core proteins for higher adherence"
        ],
        conditioning: ["Bodyweight trend should remain downward and controlled", "Recovery markers guide minor macro adjustments", "Avoid extreme calorie cuts"]
      },
      {
        title: "Weeks 7-8 Lean Definition Block",
        focus: "Refine physique with strict clean-food compliance.",
        trainingDays: [
          "Continue meal templates with measured portions",
          "Keep vegetables high for satiety and micronutrients",
          "Prioritize lean proteins in every main meal",
          "Use fish meals to support recovery and inflammation control"
        ],
        conditioning: ["Maintain hydration target daily", "Electrolyte balance supports training output", "Consistency drives visible definition changes"]
      },
      {
        title: "Weeks 9-10 Sharpness Phase",
        focus: "Push final body-fat reduction while maintaining muscle quality.",
        trainingDays: [
          "Reduce meal variability and keep proven structures",
          "Hold protein and meal timing discipline across busy days",
          "Avoid unplanned high-calorie substitutions",
          "Use clean alternatives only when needed"
        ],
        conditioning: ["Monitor strength trend to confirm muscle retention", "Adjust carbs around hard training days", "Stay consistent rather than aggressive"]
      },
      {
        title: "Weeks 11-12 Peak Definition",
        focus: "Finalize cutting cycle with strict high-protein adherence.",
        trainingDays: [
          "Execute established templates with precision through final weeks",
          "Keep macros controlled and predictable day to day",
          "Avoid introducing new foods that disrupt routine or digestion",
          "Close with sustainability mindset for post-cycle maintenance"
        ],
        conditioning: ["Water remains 3 to 3.5L daily", "Optional supplements support recovery and performance", "Outcome target: lean, defined, and stable physique"]
      }
    ],
    safety: [
      "Do not cut calories too low if recovery or performance collapses.",
      "Maintain protein intake to protect muscle while dieting.",
      "Hydrate consistently and keep sleep quality high.",
      "Use gradual adjustments instead of extreme restriction."
    ]
  },
  "hard-cut-athlete-diet-12w": {
    goal: "Reach very low body-fat while preserving muscle and athletic look",
    level: "Advanced cut progression",
    equipment: "Basic kitchen setup and precision meal-prep workflow",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Aggressive Athlete Cut Base",
        focus: "Start a tight calorie deficit with very high protein support.",
        trainingDays: [
          "Daily target: around 1,600-1,700 kcal (~160P / 120C / 40F)",
          "Core meals: egg-white scrambles, lean chicken-rice, tuna-rice bowls, white fish with vegetables",
          "Week 1 emphasizes exact portions and strict adherence",
          "Carbs and fats remain controlled while protein stays high for muscle retention"
        ],
        conditioning: ["Water target: 3.5 to 4L daily", "Expect faster scale drop in first 1-2 weeks", "Electrolyte balance is critical under aggressive deficit"]
      },
      {
        title: "Weeks 3-4 Deficit Stability Block",
        focus: "Sustain low body-fat trajectory while preserving training output.",
        trainingDays: [
          "Keep protein distribution consistent across all meals",
          "Use rice, oats, and sweet potato as measured carb sources",
          "Maintain clean lean proteins: chicken, tuna, white fish, turkey alternatives",
          "Use low-fat cooking methods and minimal added oils"
        ],
        conditioning: ["Hydration remains fixed at 3.5 to 4L", "Monitor fatigue and sleep closely", "Adjust timing, not food quality"]
      },
      {
        title: "Weeks 5-6 Hard Cut Control",
        focus: "Increase adherence precision and hold muscle-supportive intake.",
        trainingDays: [
          "Preserve protein target near 160g each day",
          "Keep meal variability low for easier compliance",
          "Plan meals around workout windows to protect performance",
          "Use Greek yogurt and whey strategically to hit intake targets"
        ],
        conditioning: ["Track weekly bodyweight and training strength", "Prevent under-recovery with sleep discipline", "Consistency remains more important than frequent macro changes"]
      },
      {
        title: "Weeks 7-8 Lean Athletic Phase",
        focus: "Drive visible athletic sharpness while controlling fatigue.",
        trainingDays: [
          "Keep breakfast/lunch structure highly repeatable",
          "Use fish and lean meats to maintain low-fat protein density",
          "Avoid unplanned high-calorie substitutions",
          "Keep food timing aligned with training demand and recovery"
        ],
        conditioning: ["Hydration stays at upper range", "Electrolytes strongly advised", "Watch recovery markers to avoid burnout"]
      },
      {
        title: "Weeks 9-10 Definition Precision Block",
        focus: "Refine final body composition with strict consistency and low noise.",
        trainingDays: [
          "Maintain exact portions on carb and fat sources",
          "Continue protein-first structure at every meal",
          "Use approved alternatives only when necessary",
          "Prioritize predictable routine over dietary complexity"
        ],
        conditioning: ["Assess physique trend weekly", "Keep training quality stable where possible", "Reduce decision fatigue through meal prep batching"]
      },
      {
        title: "Weeks 11-12 Peak Physique Condition",
        focus: "Complete the final cut with disciplined high-protein execution.",
        trainingDays: [
          "Hold established meal templates with no unnecessary changes",
          "Keep deficit controlled and sustainable through final week",
          "Preserve muscle-supportive intake and hydration standards",
          "Finish with routine quality to improve post-cut transition"
        ],
        conditioning: ["Water remains 3.5 to 4L daily", "Continue electrolytes and recovery support", "Outcome target: sharp, athletic, low body-fat physique"]
      }
    ],
    safety: [
      "Aggressive deficits increase fatigue risk; adjust if recovery collapses.",
      "Do not drop protein below target during cut phases.",
      "Maintain hydration and electrolytes to prevent performance crashes.",
      "Stop forcing progression if signs of overreaching appear."
    ]
  },
  "high-calorie-mass-diet-12w": {
    goal: "Gain weight fast and maximize muscle growth",
    level: "Advanced mass-gain progression",
    equipment: "Basic kitchen setup with high-volume meal prep",
    weeklyPhases: [
      {
        title: "Weeks 1-2 High-Calorie Mass Base",
        focus: "Establish a strong calorie surplus with high protein and high carbs.",
        trainingDays: [
          "Daily target: around 3,200-3,500 kcal (~180P / 400C / 100F)",
          "Day 1 flow: mass oat power bowl, chicken double-rice lunch, beef-potato bulk dinner, mass shake snack",
          "Day 2 flow: eggs-oats breakfast, tuna-rice bulk lunch, chicken-pasta dinner",
          "Days 3-7 repeat rotation to reinforce surplus consistency and growth response"
        ],
        conditioning: ["Water target: 3.5 to 4L daily", "Expected fast scale increase in first 1-2 weeks", "High-carb intake supports training output and recovery"]
      },
      {
        title: "Weeks 3-4 Surplus Consistency Block",
        focus: "Lock in repeatable high-calorie intake and stable digestion.",
        trainingDays: [
          "Keep calorie floor high and avoid missed meals",
          "Use dense staples: oats, rice, pasta, potatoes, milk, peanut butter, honey",
          "Maintain protein anchor through chicken, beef, tuna, eggs, and whey",
          "Keep meal timing structured around training windows"
        ],
        conditioning: ["Hydration remains 3.5 to 4L", "Track bodyweight trend and gym performance weekly", "Adjust food volume only when adherence is consistent"]
      },
      {
        title: "Weeks 5-6 Growth Acceleration",
        focus: "Drive size and strength progression through reliable surplus execution.",
        trainingDays: [
          "Preserve high-carb intake to fuel progressive overload",
          "Maintain protein target near 180g per day",
          "Use shakes strategically when appetite drops",
          "Batch-cook high-calorie meals to prevent intake gaps"
        ],
        conditioning: ["Creatine and recovery hygiene can improve output", "Keep sodium and fluids stable", "Growth speed depends on consistency, not randomness"]
      },
      {
        title: "Weeks 7-8 Heavy Gain Reinforcement",
        focus: "Continue aggressive gain while managing food fatigue.",
        trainingDays: [
          "Repeat proven meal templates with minor variation only",
          "Use alternatives without lowering total calories",
          "Prioritize calorie-dense meals earlier in the day if appetite dips",
          "Keep surplus consistent across both training and rest days"
        ],
        conditioning: ["Hydration and digestion quality remain critical", "Monitor waist and performance together", "Aim for mostly productive mass gain"]
      },
      {
        title: "Weeks 9-10 Performance Bulk Block",
        focus: "Sustain strength progression with reliable calorie and carb delivery.",
        trainingDays: [
          "Center most carbs around pre/post-workout windows",
          "Keep fats high enough for hormone and appetite support",
          "Use liquid calories when needed to maintain targets",
          "Avoid long meal gaps that reduce total intake"
        ],
        conditioning: ["Track strength lifts weekly", "If gain stalls, increase intake slightly", "Keep routine stable and measurable"]
      },
      {
        title: "Weeks 11-12 Peak Mass Finish",
        focus: "Finalize the cycle with full adherence and maximal growth carryover.",
        trainingDays: [
          "Maintain high-calorie structure without missing core meals",
          "Keep protein and carb targets consistent through final weeks",
          "Use simple, repeatable high-output meal combinations",
          "Close cycle with performance and scale trend review"
        ],
        conditioning: ["Hydration remains at full target", "Continue optional supplements for support", "Outcome target: clear size increase and stronger gym output"]
      }
    ],
    safety: [
      "Do not rely on low-quality junk calories as primary intake.",
      "Increase food volume gradually if digestion is stressed.",
      "Hydrate consistently to support high-carb and high-protein intake.",
      "Adjust calorie level if body-fat gain becomes excessive."
    ]
  },
  "muscle-gain-athlete-diet-12w": {
    goal: "Build lean athletic muscle and improve performance",
    level: "Advanced athlete progression",
    equipment: "Basic kitchen setup and structured meal prep workflow",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Athlete Lean-Gain Base",
        focus: "Establish a clean performance surplus with high protein and structured carbs.",
        trainingDays: [
          "Daily target: around 2,800-3,000 kcal (~170P / 330C / 75F)",
          "Day 1 flow: athlete power oats, chicken-rice performance bowl, salmon-sweet potato recovery dinner, yogurt-honey-nut snack",
          "Day 2 flow: eggs-oats breakfast, beef-rice athlete bowl, chicken-pasta clean bulk dinner",
          "Days 3-7 repeat rotation to reinforce clean lean-gain consistency"
        ],
        conditioning: ["Water target: 3.5 to 4L daily", "Expected early strength and fullness improvements", "Carb timing supports training output and recovery"]
      },
      {
        title: "Weeks 3-4 Performance Consistency Block",
        focus: "Maintain clean surplus and improve session quality through stable fueling.",
        trainingDays: [
          "Keep meal structure highly repeatable for adherence",
          "Preserve protein anchor with chicken, beef, salmon, eggs, yogurt, and whey",
          "Use carbs strategically from oats, rice, pasta, and sweet potato",
          "Keep healthy-fat sources controlled (olive oil, nuts, salmon)"
        ],
        conditioning: ["Hydration remains 3.5 to 4L daily", "Track strength trends and morning bodyweight", "Adjust food volume only after consistent execution"]
      },
      {
        title: "Weeks 5-6 Athlete Growth Phase",
        focus: "Drive muscle accrual while preserving athletic conditioning quality.",
        trainingDays: [
          "Sustain calorie range without missed meals",
          "Keep protein intake near 170g daily minimum",
          "Use recovery-focused dinner patterns around hard training days",
          "Maintain meal timing windows around workouts"
        ],
        conditioning: ["Creatine can support power and strength gains", "Omega-3 can support recovery", "Growth rate improves with sleep and routine consistency"]
      },
      {
        title: "Weeks 7-8 Lean Performance Reinforcement",
        focus: "Continue lean mass gain while minimizing unnecessary fat gain.",
        trainingDays: [
          "Repeat proven meal templates and avoid random junk calories",
          "Use alternatives only when needed without breaking macro balance",
          "Prioritize whole-food carb sources to maintain performance",
          "Keep snack quality high (yogurt, nuts, controlled honey)"
        ],
        conditioning: ["Monitor waist and strength together", "Hydration and electrolytes remain performance-critical", "Recovery quality guides minor intake adjustments"]
      },
      {
        title: "Weeks 9-10 Athletic Bulk Precision",
        focus: "Refine intake timing for performance and visible lean growth.",
        trainingDays: [
          "Place higher-carb meals around demanding training sessions",
          "Keep protein distributed across breakfast, lunch, dinner, and snack",
          "Maintain meal prep reliability during busy weeks",
          "Do not reduce calories on rest days below recovery needs"
        ],
        conditioning: ["Track weekly lift progression", "If scale stalls, add calories gradually", "Preserve consistency over novelty"]
      },
      {
        title: "Weeks 11-12 Peak Athletic Lean Gain",
        focus: "Finish with stable surplus, stronger performance, and visible lean muscle gain.",
        trainingDays: [
          "Keep all main meals consistent and measured",
          "Preserve clean-food quality through final block",
          "Maintain recovery meal emphasis and hydration",
          "Close cycle with performance and physique review"
        ],
        conditioning: ["Water remains 3.5 to 4L", "Optional supplements continue as needed", "Outcome target: stronger, leaner, more athletic muscular physique"]
      }
    ],
    safety: [
      "Avoid dirty-bulk patterns that spike fat gain.",
      "Increase intake gradually if digestion or appetite becomes unstable.",
      "Maintain hydration and sleep quality to support athlete recovery.",
      "Adjust calories based on performance and body-composition trend together."
    ]
  },
  "student-bulk-diet-12w": {
    goal: "Gain muscle size efficiently on a budget",
    level: "Beginner to advanced adherence progression",
    equipment: "Basic kitchen setup for low-cost bulk prep",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Budget Bulk Foundation",
        focus: "Establish low-cost calorie surplus with simple repeatable meals.",
        trainingDays: [
          "Daily target: around 2,700-3,000 kcal (~140-160P / ~350C / ~70F)",
          "Day 1 flow: budget oat mass bowl, cheap chicken-rice lunch, egg-potato bulk dinner, milk-bread snack",
          "Day 2 flow: eggs-bread breakfast, tuna-rice bulk lunch, chicken-potato dinner",
          "Days 3-7 repeat rotation to lock in affordable surplus consistency"
        ],
        conditioning: ["Water target: 3 to 3.5L daily", "Expected early bodyweight increase in first 1-2 weeks", "Primary target is consistent cheap calorie execution"]
      },
      {
        title: "Weeks 3-4 Consistency and Cost Control",
        focus: "Reinforce mass gain while keeping food costs low and manageable.",
        trainingDays: [
          "Keep staple foods in bulk rotation: oats, eggs, chicken, tuna, rice, potatoes, bread, milk",
          "Prioritize protein anchors in each meal despite limited budget",
          "Use basic spices for adherence without added cost",
          "Maintain predictable meal timing to avoid under-eating"
        ],
        conditioning: ["Hydration remains 3 to 3.5L", "Track scale trend and gym strength weekly", "Adjust portions only after a full week of consistent adherence"]
      },
      {
        title: "Weeks 5-6 Growth Momentum",
        focus: "Drive muscle and strength progress with stable budget surplus.",
        trainingDays: [
          "Sustain calorie intake across all days, including rest days",
          "Keep protein range near upper target when possible",
          "Use milk and bread strategically when appetite is low",
          "Batch-cook rice, potatoes, and chicken to reduce missed meals"
        ],
        conditioning: ["Creatine can provide low-cost performance support", "Recovery and sleep quality remain essential", "Steady execution beats aggressive but inconsistent intake"]
      },
      {
        title: "Weeks 7-8 Budget Gain Reinforcement",
        focus: "Continue size gains while preventing routine breakdown.",
        trainingDays: [
          "Repeat proven meal templates with minimal complexity",
          "Use alternatives only when prices or supply change",
          "Keep calorie-dense meals around training windows",
          "Preserve protein consistency even on constrained days"
        ],
        conditioning: ["Hydration and sodium balance support training quality", "Monitor waist and performance together", "Aim for productive mass gain over random weight gain"]
      },
      {
        title: "Weeks 9-10 Leaner Budget Bulk Control",
        focus: "Refine intake quality while maintaining growth trajectory.",
        trainingDays: [
          "Keep main carb sources measured and consistent",
          "Avoid skipping meals due to schedule pressure",
          "Use simple snacks to close calorie gaps",
          "Maintain practical food structure for long-term compliance"
        ],
        conditioning: ["Track lifts and bodyweight weekly", "Increase intake slightly if progress stalls", "Stay consistent rather than changing foods too often"]
      },
      {
        title: "Weeks 11-12 Peak Student Bulk",
        focus: "Finish with high adherence and clear size outcomes at low cost.",
        trainingDays: [
          "Maintain full meal structure through final phase",
          "Keep protein and carbs stable day to day",
          "Use affordable staples without reducing total intake",
          "Close cycle with performance and body-composition review"
        ],
        conditioning: ["Water remains 3 to 3.5L daily", "Optional low-cost supplements continue if useful", "Outcome target: visible size and strength gains on budget"]
      }
    ],
    safety: [
      "Do not force low-quality junk calories just to hit numbers.",
      "Increase portions gradually if digestion is uncomfortable.",
      "Keep hydration high when increasing carbs and protein.",
      "Adjust intake if fat gain accelerates too quickly."
    ]
  },
  "clean-weight-gain-diet-12w": {
    goal: "Gain lean muscle with minimal fat increase",
    level: "Advanced lean-gain progression",
    equipment: "Basic kitchen setup and structured clean-bulk prep",
    weeklyPhases: [
      {
        title: "Weeks 1-2 Clean Gain Foundation",
        focus: "Establish controlled surplus with clean high-quality foods.",
        trainingDays: [
          "Daily target: around 2,800-3,000 kcal (~170P / ~320C / ~75F)",
          "Day 1 flow: clean muscle oats, clean chicken-rice lunch, salmon-sweet potato dinner, yogurt-nuts-honey snack",
          "Day 2 flow: eggs-oats breakfast, beef-rice clean bulk lunch, chicken-pasta clean meal dinner",
          "Days 3-7 repeat rotation to lock in clean surplus consistency"
        ],
        conditioning: ["Water target: 3.5 to 4L daily", "Expected slight scale increase in first 1-2 weeks", "Goal is lean growth with stable performance"]
      },
      {
        title: "Weeks 3-4 Surplus Quality Block",
        focus: "Maintain clean intake and improve performance output.",
        trainingDays: [
          "Keep protein anchored through chicken, beef, salmon, eggs, yogurt, whey",
          "Use clean carb sources: oats, rice, pasta, sweet potato",
          "Keep fats measured via olive oil, nuts, and fish",
          "Preserve meal timing around workout demand"
        ],
        conditioning: ["Hydration remains 3.5 to 4L", "Track bodyweight and strength trend weekly", "Adjust intake only after consistent adherence"]
      },
      {
        title: "Weeks 5-6 Lean Growth Momentum",
        focus: "Drive strength and muscle gain while limiting unnecessary fat gain.",
        trainingDays: [
          "Sustain calorie floor without missed meals",
          "Keep protein near target daily for recovery support",
          "Use meal prep batching to reduce inconsistency",
          "Prioritize whole-food options over convenience calories"
        ],
        conditioning: ["Creatine and omega-3 can support training quality", "Sleep and hydration are mandatory for lean growth", "Consistency is the main growth lever"]
      },
      {
        title: "Weeks 7-8 Clean Bulk Reinforcement",
        focus: "Maintain growth pace while preserving aesthetic quality.",
        trainingDays: [
          "Repeat proven clean templates with minimal food noise",
          "Use alternatives only when needed and keep macros aligned",
          "Keep carbs centered around high-output sessions",
          "Avoid untracked extras that distort surplus quality"
        ],
        conditioning: ["Monitor waist and mirror changes with scale trend", "Hydration and recovery remain non-negotiable", "Target productive mass rather than random gain"]
      },
      {
        title: "Weeks 9-10 Aesthetic Gain Precision",
        focus: "Refine intake timing and maintain lean growth trend.",
        trainingDays: [
          "Distribute protein across all meals and snack",
          "Keep carbs high enough for performance but structured",
          "Maintain meal prep reliability during busy weeks",
          "Do not reduce recovery intake on rest days"
        ],
        conditioning: ["Track gym progression each week", "Increase calories slightly only if growth stalls", "Preserve clean-food quality standards"]
      },
      {
        title: "Weeks 11-12 Peak Clean Gain",
        focus: "Finish with high adherence and visible lean muscle improvements.",
        trainingDays: [
          "Hold established meal templates through final phase",
          "Keep macros stable and predictable day to day",
          "Preserve recovery meal quality and hydration volume",
          "Close cycle with strength and physique review"
        ],
        conditioning: ["Water remains 3.5 to 4L", "Optional supplements continue as needed", "Outcome target: aesthetic muscle growth with controlled fat gain"]
      }
    ],
    safety: [
      "Avoid dirty-bulk behaviors that raise fat too quickly.",
      "Increase calories gradually if digestion becomes stressed.",
      "Maintain hydration and sleep quality to support recovery.",
      "Adjust intake based on both performance and body-composition trends."
    ]
  }
};

/**
 * Default 12-week blueprint for any program that doesn't have a dedicated entry above.
 * Keeps the PDF from shipping empty when a new program is added without a bespoke plan.
 * Category hints ("strength", "cardio", "nutrition", ...) select a sensible split.
 */
export function buildDefaultBlueprint(args: {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  requiredEquipment: string[];
}): ProgramBlueprint {
  const cat = args.category.toLowerCase();
  const isNutrition = cat === "nutrition";
  const hasGym = args.requiredEquipment.some((e) => /barbell|dumbbell|rack|bench|machine/i.test(e));
  const equipment = isNutrition
    ? "Kitchen basics, a food scale, and a tracking app."
    : hasGym
      ? "Full gym access (barbell, dumbbells, rack, bench)."
      : "Bodyweight or minimal home equipment.";

  if (isNutrition) {
    return {
      goal: `Nutrition execution for ${args.title}`,
      level: args.difficulty,
      equipment,
      weeklyPhases: [
        {
          title: "Weeks 1-2 Baseline",
          focus: "Lock in meal timing, portion control, and a consistent protein anchor at every feeding.",
          trainingDays: [
            "Day 1-7: 3 main meals + 1-2 snacks; hit protein target every feeding (0.8-1.0 g/lb).",
            "Track calories and protein daily — accuracy over perfection.",
            "Water target: 2.5-3.5 L/day. No liquid calories except plain coffee/tea.",
            "Weigh-in Day 1 and Day 7 (same conditions, morning, post-bathroom)."
          ],
          conditioning: [
            "Step target: 7-10k/day to establish movement baseline",
            "Sleep 7-9 h — prioritize consistent bed/wake time",
            "One mobility/walk block on the rest day"
          ]
        },
        {
          title: "Weeks 3-6 Progressive Phase",
          focus: "Adjust calories in 100-200 kcal increments based on weekly trend, not single-day weigh-ins.",
          trainingDays: [
            "Rebalance macros if weight trend misses target for 2 consecutive weeks.",
            "Keep protein fixed; adjust carbs and fats to move weight in desired direction.",
            "Introduce meal-prep day (Sunday) — batch protein, carb sources, and vegetables.",
            "Log hunger/energy 1-10 daily — adjust meal timing if energy dips."
          ],
          conditioning: ["Steps: 8-12k/day", "Strength or cardio 3-4x/week (pair with any training plan)", "One full rest day"]
        },
        {
          title: "Weeks 7-10 Execution Under Pressure",
          focus: "Navigate travel, social events, and training stress without derailing the trend.",
          trainingDays: [
            "Build a 'default order' at the 3 restaurants you visit most.",
            "Use the 80/20 rule: 80% whole foods from a fixed grocery list, 20% flexible.",
            "Carry a protein source (jerky/shake/greek yogurt) for skipped-meal scenarios.",
            "Re-weigh conditions weekly — adjust calories only against 14-day average."
          ],
          conditioning: ["Steps: 10-12k/day", "Maintain training frequency through travel", "Mobility 2x/week"]
        },
        {
          title: "Weeks 11-12 Lock-in and Transition",
          focus: "Cement the habits and plan the next block (maintenance, recomp, or next cut/bulk).",
          trainingDays: [
            "Identify the 3 meals you will keep permanently post-program.",
            "Reverse-diet or maintenance window: add 100-150 kcal/week for 2 weeks if cutting ended.",
            "Photo and measurements Day 84 for a clean before/after record.",
            "Write the next 12-week goal before closing this one."
          ],
          conditioning: ["Steps: 10k/day baseline", "Training stays in place", "Debrief what worked — adjust next block"]
        }
      ],
      safety: [
        "Do not drop below 10-11 kcal/lb without coach oversight.",
        "Stop and reassess if energy, sleep, or mood crash for more than a week.",
        "Medical conditions (diabetes, thyroid, GI) require clinician sign-off on macro splits.",
        "Pregnancy/breastfeeding: follow a clinician-approved plan, not this template."
      ]
    };
  }

  // Training default (strength / cardio / hybrid)
  const isStrength = /strength|hypertrophy|muscle|power|lift|barbell/i.test(`${cat} ${args.title}`);
  const split = hasGym ? "Upper / Lower / Push / Pull / Legs rotation" : "Full-body circuits with push, pull, hinge, squat, core";
  return {
    goal: isStrength ? `Build strength and muscle: ${args.title}` : `Improve capacity and body composition: ${args.title}`,
    level: args.difficulty,
    equipment,
    weeklyPhases: [
      {
        title: "Weeks 1-2 Foundation",
        focus: "Own the movement patterns with moderate load. Technique before intensity.",
        trainingDays: [
          `4 training days/week following ${split}.`,
          isStrength
            ? "Main lifts: 3 sets x 8-10 reps at RPE 6-7, 2-3 min rest. Leave 3-4 reps in reserve."
            : "Compound work: 3 sets x 10-12 reps at a controlled tempo (2-1-1), 60-90 s rest.",
          "Accessory work: 3 sets x 10-12 reps, 60-90 s rest. Target weak links.",
          "Core: 3 sets of plank 30-45 s + dead bug 8/side every session."
        ],
        conditioning: ["2x/week zone-2 cardio 20-30 min", "Daily 7-10k steps", "One full rest day"]
      },
      {
        title: "Weeks 3-5 Volume Block",
        focus: "Add sets and load week over week. Progressive overload is the driver.",
        trainingDays: [
          isStrength
            ? "Main lifts: 4 sets x 6-8 reps at RPE 7-8, 2-3 min rest. Add 2-5% when all reps clear."
            : "Compound work: 4 sets x 8-10 reps, tempo (3-0-1), 75-90 s rest.",
          "Accessory work: 3-4 sets x 8-12 reps with 1-2 reps in reserve.",
          "Add one unilateral movement per session (split squat, single-arm row).",
          "Week 5 deload: drop top sets to 60% load, keep movement pattern."
        ],
        conditioning: ["2-3x/week zone-2 20-30 min", "1x/week threshold work (4x4 min hard)", "Mobility 10 min post-session"]
      },
      {
        title: "Weeks 6-9 Intensification",
        focus: "Higher load, lower reps on main lifts. Accessory volume maintains muscle.",
        trainingDays: [
          isStrength
            ? "Main lifts: 5 sets x 4-6 reps at RPE 8, 3 min rest. Track top set weekly."
            : "Compound work: 4 sets x 6-8 reps heavier, 90-120 s rest. AMRAP set once per session.",
          "Accessory work: 3 sets x 10-12 reps — keep the pump work.",
          "One explosive movement per session (jump, throw, sprint effort 10-20 m).",
          "Week 9: deload week — 50-60% volume, same movements."
        ],
        conditioning: ["2x/week zone-2 30 min", "1x/week intervals (30/30 x 10)", "Sleep discipline — 8 h target"]
      },
      {
        title: "Weeks 10-12 Peak and Test",
        focus: "Express the work. Hit the numbers, then lock in the habits.",
        trainingDays: [
          isStrength
            ? "Main lifts: 3 sets x 3-5 reps at RPE 8-9 with full rest. Week 12 test top single or 3RM."
            : "Compound work: 3-4 hard sets at target weight; Week 12 timed circuit or AMRAP test.",
          "Accessory work: 2-3 sets x 8-10 reps — maintain, don't chase.",
          "Week 12 Day 1: retest baseline from Week 1 (same movements, load, or time).",
          "Log outcomes: numbers, photos, measurements. Plan the next block."
        ],
        conditioning: ["2x/week light zone-2", "1x/week sprint or hill effort", "Week 12: light taper, peak rested"]
      }
    ],
    safety: [
      "Warm up 8-10 min before working sets — raise core temp and rehearse patterns.",
      "Stop a set the moment technique breaks. Leaving a rep is cheaper than leaving a month.",
      "Sharp pain, numbness, or chest symptoms: stop and see a clinician.",
      "Scale loads if sleep is under 6 h two nights running.",
      "Deload weeks are non-negotiable — they cash in the gains you just made."
    ]
  };
}

/**
 * Always returns a usable blueprint — bespoke if one exists, otherwise a category-aware default.
 * Prefer this over `programBlueprints[slug]` in renderers.
 */
export function getOrBuildBlueprint(program: {
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  requiredEquipment: string[];
}): ProgramBlueprint {
  return programBlueprints[program.slug] ?? buildDefaultBlueprint(program);
}
