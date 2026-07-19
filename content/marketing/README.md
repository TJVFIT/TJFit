# TJFit Marketing Content — Batch 2026-07

Produced by **AZS Master Plan — Session 4 (TJFit content)**, 2026-07-19.

## What's here

| File | What it is | Consumer |
|---|---|---|
| `social-batch-2026-07.json` | 18 social captions, machine-readable | **Session 5 posting pipeline (Postiz)** |
| `social-batch-2026-07.md` | Same 18 captions, human-readable | Review / manual posting |
| `blog/` | 3 SEO blog posts (EN + TR) | Site blog / CMS |

## Batch at a glance

- **18 social captions** — 9 EN + 9 TR, split across the **transformation** (social proof) and **education** (authority) angles.
- **3 blog posts** — chosen for real search intent (program comparison, protein-for-fat-loss, deadlift form), each EN + TR.
- **Languages:** EN + TR only (the two priority languages). fr / de / ar follow once this batch validates.
- **Platforms:** TikTok, Instagram Reels, YouTube Shorts (video); IG carousel/static (education).

## Grounding — why the content is specific, not generic

Everything is tied to the **live 12-bundle product registry** (`src/lib/bundles.ts`), not invented programs:

- Real phase names (Prime / Strip / Polish, Base / Build / Peak), real protein targets (0.8–1.3 g/lb by goal), real session structure.
- **Two bundles are FREE** (`fat-loss`, `lean-bulk`) — every funnel-entry CTA routes to a free bundle to lower friction. Paid ($10) bundles are the conversion target once someone's in.
- Audience-specific bundles get their own posts: Women's Sculpt, Senior Strength, Home Starter, Beginner Foundations.

## Guardrails carried from the master plan

- ✅ Scheduled posting — intended.
- ❌ Auto-engagement (likes / follows / DMs) — **not** built in.
- 🔒 Anything that spends money or is irreversible stays behind a human-confirm gate.

## Handoff contract for Session 5

Each post in the JSON carries: `id`, `lang`, `angle`, `bundle`, `format`, `platforms[]`, `hook`, `caption`, `hashtags[]`, `cta`, `cta_url`, `notes`. That's caption + hashtag set + suggested platform, ready to schedule.

## Notes for the operator

- **TJAI claims** (posts `en-e-09` / `tr-e-18`) are limited to shipped features — core chat + plan generation run on OpenAI and are live. Do **not** advertise meal-prep / grocery-list / blog-gen AI features: those 8 Anthropic-routed features are still gracefully degraded in production (see status below).
- Visuals (before/after clips, carousel slides) are **not** produced here — captions assume a paired asset. AZS's local image gen (ComfyUI) or real client footage fills that slot.

---

### Step 0 status (informational, per Session 4 brief)

`ANTHROPIC_API_KEY` is **still not configured** in production (`.env.example:34` empty; standing decision 2026-05-09 = "gracefully degrade, do NOT delete"). The 8 Anthropic-dependent features remain degraded. **Not this session's job** — flagged only so marketing copy doesn't promise features that 503.
