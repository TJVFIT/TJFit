# TJFit Reels (Remotion)

Code-driven promo video that renders a real **1080×1920 / 30fps / 11s MP4**, reusing the live
site's violet brand tokens (gradient headline, power-on bloom, count-ups). Self-contained — does
**not** touch the Next.js app or its dependencies.

## Render the MP4 (on your machine — needs ~1 min install + Chrome download)

```bash
cd remotion
npm install          # pulls remotion + a headless Chromium (one-time, a few hundred MB)
npm run render       # → remotion/out/tjfit-reel.mp4
```

- **Preview/edit live:** `npm run studio` (opens Remotion Studio at localhost:3000 — scrub,
  tweak timing, change copy, then re-render).
- **Cover image:** `npm run still` → `out/cover.png` (use as the thumbnail).

> Rendering was **not** run in the build sandbox (no ffmpeg, and Remotion's headless-Chrome
> render is heavy/unreliable there). The composition is complete and tested-by-types; the two
> commands above produce the MP4 locally.

## What's in the reel (matches docs/MARKETING_REELS_2026-06-23.md → Reel 1)

| Scene | Frames | Beat |
|---|---|---|
| 1 | 0–72 (0–2.4s) | Hook: "This isn't another fitness app." over a violet bloom |
| 2 | 72–180 (2.4–6s) | "TJAI computes your plan" + count-ups: 25 signals · 12wk · 10 languages |
| 3 | 180–261 (6–8.7s) | Value: gradient "Programs from $10. AI plans from $8." |
| 4 | 261–330 (8.7–11s) | Lockup: TJFIT → TJFIT.ORG |

## Add the other reels
Duplicate `src/TJFitReel.tsx` → `Reel2.tsx`/`Reel3.tsx` (scripts in the marketing doc), register
each in `src/Root.tsx` with its own `<Composition id="...">`, then
`remotion render Reel2 out/reel2.mp4`.

## Audio
Remotion renders silent by default. Add a track with `<Audio src={staticFile('track.mp3')} />`
inside the composition (drop the file in `remotion/public/`), or layer audio in post.

## Brand fidelity
Tokens (`VIOLET #A855F7`, `LAVENDER #EDE9FE`, the `cubic-bezier(0.16,1,0.3,1)` easing, the
gradient-text treatment) are copied from the site so the video matches the product 1:1.
