# TJFit design audit and execution plan

## Current audit

- The homepage has ambition, but the visual system is over-indexed on cyan/violet glow. Because glow is applied globally to accent text and borders, the interface loses hierarchy and starts to feel like a sci-fi template instead of a premium fitness platform.
- Several public hero assets contain visible generator artifacts, including `TJfit.org` text and a generator star mark. These should not appear in the main marketing surface.
- The raster logo is high-energy but hard to use in compact UI. It has heavy glow, awkward cropping, and loses crispness in the navbar and footer.
- Motion exists throughout the site, but the stack mixes cursor-follow effects, scroll listeners, 3D canvas, reveal sections, pulsing glows, and drifting full-bleed images. The result risks feeling busy and can cost performance on mobile.
- The top-level brand palette has more than one accent: cyan, sky, violet, green, and red all compete. Cyan should remain the signature; the rest should be functional only.
- Typography is good but not distinctive enough for the brand. The previous Sora/DM Sans pairing was clean, but it leaned generic tech.
- UX foundations are mostly present: skip-style focus rings, legal pages, metadata, not-found pages, loading skeletons, and localized routing exist. The bigger UX issue is prioritization: too many sections shout at once.
- Code health is mixed. The app is well organized, but there is CSS duplication, mojibake in comments and some string literals, broad global selectors, and a few legacy `min-h-screen`/`100vh` patterns.

## Execution plan

1. Establish a sharper brand base: vector logo lockup, Outfit/Manrope type, one signature cyan accent, warmer graphite surfaces.
2. Remove watermarked/generated-image dependency from the homepage. Replace visible full-bleed campaign art with procedural, brand-owned surfaces until final bespoke assets are produced.
3. Reduce global glow and reserve luminous effects for hero, active states, and primary CTAs.
4. Tighten the homepage experience: hero first, product proof second, fewer equal card grids, stronger section rhythm.
5. Make motion feel intentional: keep transform/opacity animation, remove cursor-follow decoration, keep reduced-motion support, avoid animation stacking.
6. After the homepage pass, roll the same tokens into programs, TJAI, membership, auth, and dashboard pages.
7. Follow-up brand asset work: replace favicon, OG image, app icons, and any remaining generator-backed imagery with clean exported assets.
