# TJAI — 50 feature roadmap

Legend: **Done** shipped in production code · **Partial** exists in another form or stub · **Planned** not built.

| # | Feature | Status | Notes |
|---|---------|--------|--------|
| 1 | AI weekly check-in | **Partial** | `POST/GET /api/tjai/weekly-check-in` + `tjai_weekly_check_ins` table |
| 2 | Body recomposition tracker | Partial | Progress entries + plan metrics; dedicated UX TBD |
| 3 | Smart calorie adjustment | Planned | Tie to checkpoints + regenerate flow |
| 4 | Adaptive workout intensity | Partial | `tjai_adaptive_checkpoints` exists |
| 5 | Injury-aware modifications | Partial | Chat intent mode `injury_recovery` + disclaimers in coach prompt |
| 6 | Gym vs home switch | Planned | Quiz + plan regen UX |
| 7 | Equipment filter | Planned | Quiz + program JSON constraints |
| 8 | Meal swap system | Partial | Existing swap/replace API routes |
| 9 | Grocery list generator | Partial | Existing TJAI grocery API |
| 10 | Macro auto-adjust | Planned | Server-side recompute + diet patch |
| 11 | Plateau detection | Partial | Progressive overload strings in chat context |
| 12 | Refeed suggestions | Partial | Metrics include `refeedWeeks` |
| 13 | Cheat meal optimizer | Planned | Prompt module + diet tool |
| 14 | Hydration tracking | Planned | Logging + nudges |
| 15 | Supplement guidance | Planned | Guardrailed prompt slice only |
| 16 | Sleep impact scoring | Planned | Heuristic + optional wearable later |
| 17 | Stress adjustment | Planned | Context flag in quiz |
| 18 | Travel mode | Planned | Temporary macro/training override |
| 19 | Fasting mode | Planned | Diet agent template |
| 20 | Ramadan mode | Planned | Diet agent template + scheduling |
| 21 | Bulking phases | Planned | Phase field in generator |
| 22 | Cutting phases | Planned | Same |
| 23 | Maintenance mode | Planned | Same |
| 24 | Athlete mode | Planned | Intensity + recovery rules |
| 25 | Tall-body optimization | Planned | Anthropometry in intake |
| 26 | Fat distribution targeting | Planned | Avoid pseudo-science; copy review |
| 27 | Progressive overload tracking | Partial | Chat + logs |
| 28 | Visual progress summaries | Partial | Progress API + charts TBD |
| 29 | AI habit builder | Planned | Separate agent + reminders |
| 30 | Reminder system | Planned | Push/email infra |
| 31 | Coach personality modes | Planned | Prompt variant + user setting |
| 32 | Multilingual output | Partial | Locale on chat; plan language TBD |
| 33 | Instant plan regeneration | Partial | New version insert on generate |
| 34 | Calorie deficit safety check | Partial | Strict validation flag + science caps |
| 35 | Metabolic adaptation handling | Partial | Science layer + copy |
| 36 | Injury recovery mode | Partial | Chat intent + medical guardrails |
| 37 | Beginner onboarding wizard | Partial | Start funnel / quiz |
| 38 | Advanced athlete tuning | Planned | Intake + prompt branch |
| 39 | Strength progression tracking | Partial | Workout logs |
| 40 | PR tracking | Planned | Derived from logs |
| 41 | Form tips generator | Planned | Tool + exercise library |
| 42 | Workout timer integration | Planned | Client feature |
| 43 | Session logging | Partial | `workout_logs` |
| 44 | Macro scanner (future) | Planned | Mobile / vision |
| 45 | Meal speed mode | Planned | Diet agent |
| 46 | Budget mode diet | Planned | Diet agent + grocery |
| 47 | Premium elite coaching mode | Planned | Tier-gated prompt depth |
| 48 | Daily motivation messages | Planned | Cron + notification |
| 49 | AI chat memory | Partial | `tjai_chat_messages` + structured memory snapshot |
| 50 | Long-term transformation planning | Partial | 12-week plan + versioning |

**How to use this file:** pick a row, link a PR, flip status. Avoid “vapor features” — each **Done** should have user-visible behavior or a documented API contract.
