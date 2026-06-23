# TJFit — Reel / TikTok Production Pack (2026-06-23)

Three ready-to-shoot short-form scripts introducing TJFit, plus how to turn them into real
MP4s. Brand: premium, black + violet, "AI precision · human intent." Vertical 1080×1920, 9:16.
Hook must land in **<2s** (the scroll-stop). Captions always on. CTA: **tjfit.org**.

> **Honest note on "render":** I can produce these as actual MP4s via **Remotion** (code-driven
> video — see §4), or you can screen-record the live site (the new 3D hero/whirl is already
> camera-ready). I cannot drive CapCut/Premiere. Voiceover = ElevenLabs/CapCut TTS or your own.

---

## Reel 1 — "Your AI coach, built for your body" (22s, product intro)

| t | Visual | On-screen text | VO / caption |
|---|---|---|---|
| 0.0–2.0 | Hard cut to the violet 3D hero spinning, headline snapping in | **"This isn't another fitness app."** | "Most fitness apps guess. This one computes." |
| 2.0–6.0 | Screen-rec: TJAI intake — answering goal/equipment/time | "25 signals →" | "You answer 25 questions…" |
| 6.0–11.0 | The plan table builds row by row (Mon Push, Tue Pull…) | "…a full 12-week plan" | "…and TJAI builds a 12-week training + nutrition plan tuned to *you*." |
| 11.0–16.0 | Macros/BMR/TDEE numbers count up; meal swap tapped | "Macros. Meals. Adapts weekly." | "Real macros. Real meals. It adapts every week." |
| 16.0–20.0 | Whirl-reveal of bundle cards, then the violet logo | "Programs from $10 · TJAI from $8" | "Start with a $10 program or let the AI build it." |
| 20.0–22.0 | Logo lockup + URL on black with violet bloom | **"TJFIT.ORG"** | "TJFit. Train smarter." |

**Audio:** dark trap/phonk build, beat drop at 0.0 and 16.0. **Hashtags:** #fitnessai #gymtok
#workoutplan #fitnesstransformation #aitrainer #tjfit. **CTA pin:** "Link in bio → tjfit.org"

## Reel 2 — "POV: you stopped guessing" (15s, relatable hook)

| t | Visual | On-screen text | VO / caption |
|---|---|---|---|
| 0.0–2.0 | Fast montage: random YouTube workouts, conflicting advice | **"POV: every app gave you a different answer."** | — |
| 2.0–4.0 | Hard cut to black → violet hero ignites (intro bloom) | "So we built one that does the math." | "So we built one that does the math." |
| 4.0–9.0 | TJAI generating: BMR → TDEE → macros → plan | "BMR · TDEE · macros · 12 weeks" | "BMR, TDEE, macros — calculated for your body, not a template." |
| 9.0–13.0 | Whirl through 3 bundle covers (Fat Loss, Recomp, Powerbuild) | "10 programs. 5 languages." | "Ten 12-week programs. Five languages. One system." |
| 13.0–15.0 | Logo + URL | **"TJFIT.ORG"** | "Stop guessing." |

**Audio:** trending sound + hard cut on beat. **Hook variant A/B:** "POV: you stopped guessing"
vs "I let an AI plan my next 12 weeks. Here's what it built." (test both.)

## Reel 3 — "$8 vs a $200 coach" (18s, value/price anchor)

| t | Visual | On-screen text | VO / caption |
|---|---|---|---|
| 0.0–2.5 | Split screen: "$200/mo coach" vs "TJAI" | **"A coach is $200/mo. This is $8."** | "A personal coach runs $200 a month." |
| 2.5–7.0 | TJAI builds the same deliverables (plan, macros, meals) | "Same plan. Same science." | "TJAI gives you the plan, the macros, the meals…" |
| 7.0–12.0 | Adaptive check-in + meal swap demoed | "Adapts weekly. Swaps meals." | "…and it adapts every week. For eight dollars." |
| 12.0–16.0 | Credit packs: $8 / $35 / $65 with "save" badges | "1 plan $8 · 10 plans $65" | "One plan or ten. Halal, vegan, budget — covered." |
| 16.0–18.0 | Logo + URL | **"TJFIT.ORG"** | "TJFit." |

**Audio:** confident, minimal. **Note:** keep price claims truthful — credit packs go live once
the Gumroad products are linked (Phase 0). Until then, soften to "from $8" or hold this one.

---

## §4 — How to render these as real MP4s

**Option A — Remotion (code-driven, on-brand, repeatable):** scaffold a `remotion/` project
(`npx create-video@latest`), build one `<Composition>` per reel at 1080×1920/30fps. Reuse the
site's exact tokens (violet `#A855F7`, the gradient headline, the whirl easing) so the videos
match the product. Animate on-screen text with the same `cubic-bezier(0.16,1,0.3,1)`. Render:
`npx remotion render Reel1 out/reel1.mp4`. I can build these compositions in upcoming iterations.

**Option B — Screen-record the live site:** the homepage hero, the TJAI plan table, the whirl
reveals, and the credits storefront are already cinematic. Record at 60fps, crop 9:16, drop the
on-screen text + audio above in CapCut. Fastest path to v1.

**Frames / thumbnails:** I can generate on-brand cover frames + thumbnails via image-gen (violet
hero stills, "before/after" templates) on request.

**Shot list for screen-rec (have ready):** (1) homepage hero load, (2) scroll to "computed in
real time" icosahedron, (3) a whirl section spiraling in, (4) `/tjai` plan table tab-switch,
(5) `/tjai/credits` cards, (6) `/bundles` grid + a bundle detail.

## Posting cadence (first 2 weeks)
Reel 2 (hook) → day 1. Reel 1 (product) → day 3. Reel 3 (value) → day 5. Then 1 variant/day
testing hooks. Repurpose the same MP4 to TikTok, Reels, Shorts, and X. Pin the best performer.
