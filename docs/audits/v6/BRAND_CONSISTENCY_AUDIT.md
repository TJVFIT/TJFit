# TJFit Brand Consistency Audit — v6 Prep

> **SUPERSEDED (2026-06-10):** This audit predates the 2026-06-01 rebrand to
> purple/violet/black (Space Grotesk display font). All cyan/champagne findings
> below are obsolete — cyan and champagne are now off-brand. Kept for history.

**Audit Date:** May 3, 2026  
**Scope:** Next.js 14 App Router, Tailwind, Supabase, 5 locales  
**Auditor:** Claude Code  

---

## 1. Logo Usage

### Canonical Logo Component
- **Component:** src/components/ui/Logo.tsx
- **Source Files:** BRAND.logoFull → /brand/logo-main.png + cache buster ?v=2026041902
- **Variants:**
  - ariant="icon" — Mark only (monogram)
  - ariant="full" — Full lockup with wordmark
  - ariant="3d" — Placeholder only (not implemented)
- **Sizes:** navbar (30px), navFull (38px), sidebar (30px), mobile (25px), hero (58px), footer (42px), auth (44px), card (22px), mini (18px)

### Logo SVG Definition (Inline)
- **Colors:** Gradient stroke #F6F3ED → #67E8F9 → #22D3EE
- **Secondary Stroke:** Cyan shadow gba(34,211,238,0.24) at opacity 0.42
- **Wordmark:** #F6F3ED (champagne) in ont-display
- **Tagline:** #67E8F9 (cyan dim)

### Logo Placement
- ✅ src/app/coming-soon/page.tsx — Auth icon variant
- ✅ src/app/[locale]/login/page.tsx — Auth icon variant, priority
- ✅ src/app/[locale]/signup/page.tsx — Auth icon variant
- ✅ src/components/home/logo-showcase.tsx — Full variant, cache-busted
- ✅ Error/notfound pages — LogoMark() custom fallback

### Logo Assets
- Favicon: /icons/icon-192.png, /icons/icon-512.png, /apple-touch-icon.png
- OG Image: /og-image.jpg
- JSON-LD: src/components/brand-organization-json-ld.tsx

---

## 2. Photography & Visual Assets

### Hero Assets (Original/Illustration)
- /public/assets/hero/hero-bicep-curl.png (product shot)
- /public/assets/hero/hero-bicep-curl-clean.png (product shot variant)
- /public/assets/hero/hero-anatomy.png (anatomical illustration)
- /public/assets/hero/hero-programs-bg.png (background)
- /public/assets/hero/hero-tjai-core.png (AI visualization)
- /public/assets/hero/hero-nexus.png (tech illustration)

### User-Supplied Photography
- **Avatars:** vatar_url in animated-avatar, coach-card, chat-thread-view, etc.
- **Blog/Community:** post.image_url in home-blogs-preview, community-hub
- **Handling:** Next/Image with fill + object-cover ✅

### 3D/Canvas Elements
- src/components/hero-tjai-brain-deco.tsx — Holographic brain (canvas rAF)
- src/components/home/animated-image-wrapper.tsx — Motion wrapper

---

## 3. Iconography

### Icon Library
- **Primary:** lucide-react only (40+ imports)
- **No Mixed Libraries:** ✅ No react-icons, heroicons, or custom SVG

### Lucide Icon Usage
- **Navigation:** ChevronDown, ChevronLeft, X, Menu
- **Fitness:** Dumbbell, Activity, Timer, Repeat, Target, Utensils
- **Commerce:** ShoppingBag, Coins, Check
- **Social:** Users, Crown, Trophy
- **Inputs:** Eye, EyeOff, Upload, Camera
- **Features:** Sparkles, Zap, Lightbulb, Search

### Color Discipline
- ✅ Icons inherit text color (white)
- ✅ Accent variants use 	ext-accent (cyan) or 	ext-accent-violet

---

## 4. Typography

### Font Stack (Actual)

**Display Font:** Outfit (spec called for Fraunces)
`
variable: "--font-display"
`

**Body Font:** Manrope (spec called for Geist Sans)
`
variable: "--font-sans"
`

**Fallback Stacks:**
- Body: Manrope, Segoe UI, Noto Sans, Noto Sans Arabic, Noto Sans Devanagari, SF Pro, system-ui
- Display: Outfit, Segoe UI, Noto Sans variants, ui-sans-serif

**Language Tuning:**
- Arabic: letter-spacing: 0
- Hindi: line-height: 1.65
- Russian: ont-feature-settings: normal

### ⚠️ FONT DISCREPANCY
- **Spec:** Geist Sans (body), Fraunces (display), Geist Mono (numbers), Cairo/Tajawal (Arabic)
- **Actual:** Manrope (body), Outfit (display)
- **Action:** Clarify if intentional for v6

---

## 5. Color Tokens

### Canonical Palette (globals.css)

**Background & Surface:**
- --color-bg: #0A0A0B ✅
- --color-surface: #111215 ✅
- --color-surface-2: #18191E ✅
- --color-surface-3: #1E2126 ✅

**Accent Colors:**
- --color-accent-cyan: #22D3EE ✅
- --color-accent-cyan-dim: rgba(34, 211, 238, 0.12) ✅
- --color-accent-cyan-glow: rgba(34, 211, 238, 0.35) ✅
- --color-accent-violet: #94A3B8 ⚠️ (SPEC IS #A78BFA)
- --color-premium: #A78BFA ✅

**Text & Utilities:**
- --color-text-primary: #FFFFFF ✅
- --color-text-secondary: #A1A1AA ✅
- --color-text-muted: #52525B ✅

### Champagne Color (#F6F3ED)
- **Logo Stroke Start:** #F6F3ED (SVG gradient)
- **Wordmark Text:** #F6F3ED
- **Language Switcher:** #F6F3ED
- **Intro Animation:** #F6F3ED
- **Not in Tokens:** ⚠️ Add --color-accent-champagne: #F6F3ED

### 🚨 CRITICAL: Accent-Violet Mismatch
- **Tailwind ccent-violet:** #94A3B8 (slate-400)
- **Spec Purple:** #A78BFA (violet-400)
- **Affected:**
  - src/app/[locale]/records.tsx:40 — Timer icon 	ext-accent-violet
  - src/app/[locale]/leaderboard.tsx:37 — Chart includes #A78BFA but text uses wrong color
- **Fix:** 	ailwind.config.ts line 86 → change to #A78BFA

---

## 6. CTA Color Discipline

### Primary Action Button (Cyan)
**Class:** .gradient-button
`css
background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 52%, #94a3b8 100%);
`
- ✅ 20+ uses: Login, signup, checkout, progress
- ✅ Consistent cyan-forward gradient

### 🚨 VIOLATION: Premium CTA Mixed Gradient
**File:** src/components/membership/membership-pricing.tsx:230
`	sx
<Button className="mt-4 w-full bg-gradient-to-r from-violet-500 to-cyan-500" />
`
- **Tier:** Apex (premium)
- **Issue:** Mixes purple AND cyan; should be purple-only
- **Severity:** HIGH
- **Fix:** Change to rom-violet-500 to-violet-600

### Secondary Buttons
- ✅ g-accent/10 + 	ext-accent (cyan)
- ✅ order-cyan-400/30 (cyan borders)

### Premium UI (Purple)
- ✅ Apex card badge 	ext-violet-200
- ✅ Community premium order-violet-400/25

---

## 7. Key Findings

### ✅ Compliant
1. Logo consistency (auth, nav, hero)
2. Cyan CTAs (except Apex button)
3. Icon library unified
4. Background/surface tokens aligned
5. Image optimization via Next/Image
6. Glow effects cyan-only

### ⚠️ Pre-v6 Fixes Required

| Issue | File | Severity | Fix |
|-------|------|----------|-----|
| Accent-violet color | 	ailwind.config.ts:86 | HIGH | #94A3B8 → #A78BFA |
| Premium CTA gradient | membership-pricing.tsx:230 | HIGH | Purple-only gradient |
| Champagne token | globals.css | MEDIUM | Add --color-accent-champagne |
| Font spec mismatch | layout.tsx | MEDIUM | Confirm Outfit/Manrope vs spec |

### 🚫 Not Found
- Oklch champagne variant
- Rogue hex codes outside palette
- Icon library mixing
- Logo inconsistencies

---

## Files Scanned
- src/app/layout.tsx, src/app/globals.css, 	ailwind.config.ts
- src/lib/brand-assets.ts, src/components/ui/Logo.tsx
- 40+ component files with lucide imports
- All Image component files
- src/components/membership/membership-pricing.tsx

**Date:** May 3, 2026
