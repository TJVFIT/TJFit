================================================================================
TJFIT — CLAUDE DESIGN LAUNCH OVERHAUL MEGA-PROMPT
================================================================================
Target session: a fresh Claude Design instance with ZERO TJFit memory.
Read this file end-to-end before touching any code. This file is the entire
brief. There are no follow-up questions. Pick a default if a section gives
options, then ship.

Repo:        C:\Users\yousi\TJFit
Branch:      design/launch-overhaul-prompt (worktree at
             C:\Users\yousi\TJFit\.claude\worktrees\pedantic-easley-d69f1e)
Stack:       Next.js 14 App Router, TypeScript, Tailwind, Supabase, Paddle.
Production:  https://tjfit.org (NOT .com — Vercel project `tjfitmain`,
             auto-deploys from `main`).
Locales:     en, tr, ar, es, fr (5). RTL = ar.

================================================================================
SECTION A — IDENTITY AND CONTEXT
================================================================================

A1. Who you are for this task
You are the visual / UX engineer for the TJFit pre-launch design overhaul.
You do NOT write backend, API routes, DB migrations, payment logic, auth
gates, TJAI prompt internals, or i18n translations. You write components,
tokens, copy in en only, layout. You stop at the API boundary.

A2. Who TJFit is
TJFit is a premium multilingual fitness coaching platform. Owner is Joseph,
an 18-year-old Ankara entrepreneur who messages in 5-word bursts and ships
fast. The product is three things stacked:
  1. A catalog of 51 training programs and 32 diet systems (12-week,
     periodized, with weekly structure). See `src/lib/content.ts:137`.
  2. TJAI — an adaptive intake quiz that generates a 12-week training +
     nutrition + supplement plan. Free preview, paid full unlock ($10).
  3. A coach marketplace + community + leaderboard + TJCOIN economy.

A3. The owner's voice — match it
Direct. Decisive. Opinionated. Never apologetic. Never hedge. Never write
"perhaps" or "we could explore". Write "we ship X. We do not ship Y."
Examples of the voice:
  - "We don't sell your email. Unsubscribe anytime."
  - "Solutions for your goals" — banned.
  - "Start Training" — preferred.
  - "Premium Tier" — banking-flavored, banned.
  - "Apex" — preferred (it's already a tier name).

A4. Launch-day stakes
This is the pre-launch overhaul. Every page on tjfit.org has to read like a
fitness platform within 0.5 seconds of loading. If a stranger lands on the
homepage and could mistake it for a fintech dashboard, a CRM landing page,
or an AI SaaS template — we have failed. The 0.5-second fitness test is the
verdict.

A5. The 0.5-second fitness test — LOCK
Open any page in the site. Cover the logo with a hand. Within 500ms a
stranger must KNOW this is fitness. Not "tech." Not "AI." Fitness.
Signals that pass the test:
  - A barbell, dumbbell, kettlebell, body silhouette, or training rack
    visible above the fold.
  - Athletic photography (real lifters, real sweat, not stock office).
  - Heavy display weight (700-900) on at least one verb that is itself
    a fitness verb: TRAIN, LIFT, BUILD, CUT, SHRED, SCALE, FORGE, GRIND.
  - Cyan accent (#22D3EE) on motion that suggests reps, breath, or pulse.
Signals that FAIL the test (LANDMINE list):
  - A grid of equal-sized icon cards with Lucide line icons reading like
    a SaaS feature matrix.
  - A blurred mesh-gradient hero with no human, no equipment, no weight.
  - A monochrome graphite UI with one rounded "Get Started" button and
    no fitness signal at all.
  - The word "platform" or "solutions" above the fold.

A6. Scope ceiling
You do NOT touch:
  - `src/app/api/**` (backend routes, auth, payments, webhooks)
  - `src/lib/supabase/**`, `src/lib/paddle/**`, `src/lib/gumroad/**`
  - `src/app/[locale]/admin/**` (admin UI is internal)
  - Turkish, Arabic, Spanish, French copy strings — Joseph owns those.
    Edit `en` only inside `*-copy.ts` files.
  - The intro animation (`src/components/home/homepage-intro-gate.tsx`,
    `src/components/logo-intro.tsx`) — already shipped, locked.
  - DB schema, RPC names, anything inside `supabase/migrations/**`.
  - The TJAI prompt internals or rate limiter.

================================================================================
SECTION B — THE CURRENT STATE
================================================================================

B1. Annotated route map (every public route)
All locale routes live under `src/app/[locale]/`. Locales: en, tr, ar, es, fr.

  /                                     `src/app/[locale]/page.tsx`
                                        Renders <ImmersiveHome> via
                                        `src/components/immersive-home.tsx`,
                                        wrapped by HomepageIntroGate.
  /programs                             `src/app/[locale]/programs/page.tsx`
                                        Catalog — header + filter chips,
                                        renders <ProgramsCatalogClient>.
  /programs/[slug]                      `src/app/[locale]/programs/[slug]/page.tsx`
                                        Detail page for one program; sticky
                                        purchase rail desktop, mobile CTA bar.
  /diets                                `src/app/[locale]/diets/page.tsx`
                                        Diet catalog. AmbientBackground variant
                                        cyan + breathing diet cards.
  /diets/[slug]                         `src/app/[locale]/diets/[slug]/page.tsx`
                                        Diet detail — single 12-week plan view.
  /tjai                                 `src/app/[locale]/tjai/page.tsx`
                                        Public landing for TJAI; redirects to
                                        /ai when authenticated.
                                        Component: `src/components/tjai-public-landing.tsx`
  /ai                                   `src/app/[locale]/ai/page.tsx`
                                        TJAI shell — quiz + chat + plan.
  /coaches                              `src/app/[locale]/coaches/page.tsx`
                                        REDIRECTS to `/{locale}#coaches`. The
                                        actual coach grid is the homepage
                                        `<HomeCoachCta>` section.
  /coaches/[slug]                       `src/app/[locale]/coaches/[slug]/page.tsx`
                                        Coach profile.
  /community                            `src/app/[locale]/community/page.tsx`
                                        REDIRECTS to `/{locale}#community`.
  /membership                           `src/app/[locale]/membership/page.tsx`
                                        Membership pricing, three tiers
                                        (Core/Pro/Apex). Hero uses TJHeroStage
                                        3D scarab.
  /leaderboard                          `src/app/[locale]/leaderboard/page.tsx`
                                        TJCOIN rankings; tabs:
                                        coins/streaks/blog/coaches/programs.
                                        Uses canvas-confetti.
  /coins                                `src/app/[locale]/coins/page.tsx`
                                        TJCOIN wallet, earn methods, redeem.
  /calculator                           `src/app/[locale]/calculator/page.tsx`
                                        Free TDEE + macros calculator.
  /signup                               `src/app/[locale]/signup/page.tsx`
                                        Two-step signup. Step 1 email/password.
                                        Step 2 username/avatar/goal pick.
  /login                                `src/app/[locale]/login/page.tsx`
  /forgot-password                      `src/app/[locale]/forgot-password/page.tsx`
  /verify-email                         `src/app/[locale]/verify-email/page.tsx`
  /dashboard                            `src/app/[locale]/dashboard/page.tsx`
                                        DashboardRoleRouter splits user vs coach.
  /profile/[username]                   `src/app/[locale]/profile/[username]/page.tsx`
  /profile/edit                         `src/app/[locale]/profile/edit/page.tsx`
  /profile/search                       `src/app/[locale]/profile/search/page.tsx`
  /people/[username]                    `src/app/[locale]/people/[username]/page.tsx`
  /people/search                        `src/app/[locale]/people/search/page.tsx`
  /messages                             `src/app/[locale]/messages/page.tsx`
  /messages/[conversationId]            `src/app/[locale]/messages/[conversationId]/page.tsx`
  /settings                             `src/app/[locale]/settings/page.tsx`
  /settings/profile                     `src/app/[locale]/settings/profile/page.tsx`
  /settings/messaging                   `src/app/[locale]/settings/messaging/page.tsx`
  /settings/subscription                `src/app/[locale]/settings/subscription/page.tsx`
  /legal                                `src/app/[locale]/legal/page.tsx`
                                        Legal hub: FAQ + user terms + coach
                                        terms + privacy.
  /legal/coach-agreement                `src/app/[locale]/legal/coach-agreement/page.tsx`
  /legal/cookies                        `src/app/[locale]/legal/cookies/page.tsx`
  /legal/health-disclaimer              `src/app/[locale]/legal/health-disclaimer/page.tsx`
  /privacy-policy                       `src/app/[locale]/privacy-policy/page.tsx`
  /terms-and-conditions                 `src/app/[locale]/terms-and-conditions/page.tsx`
  /refund-policy                        `src/app/[locale]/refund-policy/page.tsx`
  /become-a-coach                       `src/app/[locale]/become-a-coach/page.tsx`
                                        Coach application funnel + form.
  /store                                `src/app/[locale]/store/page.tsx`
                                        Currently a `<ComingSoonLaunchPage>`
                                        placeholder — equipment store is OUT
                                        of scope per Joseph.
  /equipment                            `src/app/[locale]/equipment/page.tsx`
                                        Equipment landing.
  /transformations                      `src/app/[locale]/transformations/page.tsx`
                                        Member transformations grid.
  /transformations/[slug]               `src/app/[locale]/transformations/[slug]/page.tsx`
  /community  → redirects               (see above)
  /coaches    → redirects               (see above)
  /challenges                           `src/app/[locale]/challenges/page.tsx`
  /blog                                 `src/app/[locale]/blog/page.tsx`
  /blog/[slug]                          `src/app/[locale]/blog/[slug]/page.tsx`
  /blog/write                           `src/app/[locale]/blog/write/page.tsx`
  /feed                                 `src/app/[locale]/feed/page.tsx`
  /live                                 `src/app/[locale]/live/page.tsx`
  /podcast                              `src/app/[locale]/podcast/page.tsx`
  /press                                `src/app/[locale]/press/page.tsx`
  /search                               `src/app/[locale]/search/page.tsx`
  /support                              `src/app/[locale]/support/page.tsx`
  /feedback                             `src/app/[locale]/feedback/page.tsx`
  /suggestions                          `src/app/[locale]/suggestions/page.tsx`
  /progress                             `src/app/[locale]/progress/page.tsx`
  /records                              `src/app/[locale]/records/page.tsx`
  /pro                                  `src/app/[locale]/pro/page.tsx`
  /bundles                              `src/app/[locale]/bundles/page.tsx`
  /start                                `src/app/[locale]/start/page.tsx`
                                        Start funnel quiz.
  /affiliate                            `src/app/[locale]/affiliate/page.tsx`
  /coming-soon                          `src/app/coming-soon/page.tsx`
                                        Pre-launch gate; admins bypass.

There are also unlocalized stubs at `src/app/page.tsx`, `src/app/programs/page.tsx`,
`src/app/privacy-policy/page.tsx`, `src/app/terms-and-conditions/page.tsx`,
`src/app/refund-policy/page.tsx`. These exist for SEO + non-locale fallbacks.
LANDMINE: do not delete them. The `src/app/page.tsx` file redirects to `/en`
or the user's preferred locale.

B2. Verbatim current homepage hero copy (en)
Source: `src/lib/home-luxury-copy.ts:115-131`.

    badge:               "TJFit"
    eyebrow:             "PREMIUM FITNESS TRANSFORMATION"
    headline:            "World-class coaching."
    headlineLine2:       "Built for a body you keep."
    headlineLine2Accent: "Transform"
    headlineLine2Rest:   "."
    sub:                 "Elite 12-week programs, realistic nutrition systems,
                          and TJAI that anchors to your real data — a
                          transformation you can sustain."
    ctaPrimary:          "Start your transformation"
    ctaSecondary:        "View Programs"
    ctaBrowsePrograms:   "Browse programs"
    trust:               ["Clear plans", "Vetted coaches", "5 languages"]
    trustLine:           "Free to start · No card · 20+ flagship programs"
    heroGradientTagline: "AI precision · Human intent · Measurable weeks"

LANDMINE: `home-luxury-copy.ts:127` says `"5 languages"` but the trustLine
on line 128 says `"20+ flagship programs"`. The actual program count from
`docs/audits/PROGRAMS_GAP.md:11` is **51 training + 32 diets**. Owner has
already noted launch language count drift in commit `de6f730`. Update the
en strings to reflect 51 programs and 32 diets. Do not invent prices.

B3. Verbatim current programs catalog header (en)
Source: `src/app/[locale]/programs/page.tsx:99-120`.

    eyebrow:    "Catalog"
    title:      "Programs built like products."
    sub:        "Each program is a complete training system: progressive
                 phases, weekly structure, recovery, and execution playbooks."
    helpHeader: "Not sure which fits?"
    helpBody:   "TJAI picks a program in two minutes from your goal,
                 equipment, and history."
    helpCta:    "Open TJAI"

LANDMINE: the header includes the word "products". Read it twice — it works,
because programs ARE products here, but it sails close to SaaS-speak.
Acceptable. Don't escalate it to "platform".

B4. Verbatim current TJAI homepage section
Source: `src/components/immersive-home.tsx:317-339`.

    eyebrow:  "TJAI"
    title:    "Your AI coach, built for your body."
    body:     "Answer 25 questions — TJAI generates a full 12-week training
               plan, diet, and supplement stack tuned to your goals,
               equipment and time. Preview it free; unlock the full plan
               when you're ready."
    cta:      "Try TJAI →"

Inside the immersive-home file (line 510), the kinetic TJAI section has:

    eyebrow:  "AI transformation engine"
    h2:       "Meet TJAI."
    body:     "Complete an adaptive intake and get a complete 12-week plan
               in minutes — training blocks, meals, macros, and progression
               tuned to your metabolism, schedule, and feedback."
    cta_primary:   "Build my plan — free preview"
    cta_secondary: "See a sample plan"
    pricing_link:  "Core (Free) · TJAI unlock $10 · Pro $6/mo · Apex $10/mo"

B5. Verbatim membership tier card copy (en)
Source: `src/lib/membership-tier-copy.ts:21-62`.

    page title:  "Choose your TJFit tier"
    sub:         "Standalone TJAI plan generation is a separate $10 unlock.
                  Pro and Apex add ongoing coaching and premium member value."
    Core:        "Free" — "Current free tier"
                 features: 2 free programs · 2 free diet starters · Community
                 + messaging · TJCOIN earning + leaderboards · TDEE
                 calculator · TJAI quiz + metrics preview
    Pro:         badge "Most Popular" — cta "Get Pro"
                 features: Everything in Core · Unlimited TJAI chat · Monthly
                 discount code · Early access · Daily meal-of-the-day email
                 (early access) · +30 TJCOIN monthly bonus
    Apex:        badge "Best Value" — cta "Get Apex"
                 features: Everything in Pro · Advanced meal swaps · Full
                 plan regeneration · Priority adaptive updates · Premium
                 progress adaptation · +75 TJCOIN monthly bonus + Apex badge

LANDMINE: The standalone TJAI unlock at `$10` is a one-shot payment, not a
subscription. Pro is `$6/mo`, Apex is `$10/mo`. Membership page hero copy at
`src/app/[locale]/membership/page.tsx:9-14` says "Choose Your TJFit Plan"
and "Unlock AI coaching, full programs, and expert support." The hero uses
a 3D R3F scarab via `<TJHeroStage variant="scarab">`. Check whether the
3D scarab passes the 0.5-second fitness test on this page — the page says
"Membership", and a scarab is luxury-jewelry-flavored, not athletic. Replace
the 3D scarab with the kinetic-frame hero treatment described in D4.

B6. Verbatim current legal hub copy
Source: `src/lib/legal-hub-copy.ts:200-218`.

    heroEyebrow:           "SUPPORT & LEGAL"
    heroHeadlineBefore:    "Questions & "
    heroHeadlineGradient:  "Terms."
    heroSub:               "Everything you need to know about TJFit."

11-question FAQ; 6-clause user terms; 5-paragraph privacy summary. All
present and reasonable. Visual layout is the only thing to upgrade.

B7. File:line evidence of "banking website" symptoms
The internal design audit at `docs/design-audit-2026.md:5-13` already calls
these out. Treat it as confirmed prior art. Specific evidence:

  - Equal-sized cyan-on-graphite feature grid:
    `src/components/immersive-home.tsx:368-376` (the .grid-cols-1 md:grid-cols-2
    "Built like training software" feature block). Six cards. Tiny Lucide
    line icons (Brain, Dumbbell, Apple, Users, Trophy, Globe). Reads as
    "B2B SaaS" not "fitness".

  - Generic Lucide icons doing fitness work:
    `src/components/immersive-home.tsx:7-9` imports
    `Dumbbell, Brain, Users, Trophy, Apple, Globe, ArrowRight, Zap,
     Sparkles, Calendar, RefreshCw, Utensils`.
    `Apple` for nutrition is a literal apple icon. Fine for a SaaS, weak for
    fitness. Replace with custom SVG silhouettes (see D4).

  - Generic CTA verbs:
    `src/components/immersive-home.tsx:565`     "See a sample plan"
    `src/components/immersive-home.tsx:705-708` "Browse Programs"
    `src/lib/launch-copy.ts:734`                 "Find a Coach"
    `src/lib/home-luxury-copy.ts:125`            "Start your transformation"
    "Browse" and "Find" are catalog verbs. "Start your transformation" is
    OK. CTA library in Section H lists the preferred verbs.

  - Mesh-gradient hero with no human / equipment:
    `src/app/globals.css:1799-1807` (.hero-mesh) is pure cyan/sky radial
    gradients on #09090b. No fitness signal until you scroll.
    `src/app/globals.css:277-280` (`--gradient-hero`) is also pure radial
    gradient. The actual hero photo lives at
    `/public/assets/hero/hero-programs-bg.png`,
    `/public/assets/hero/hero-tjai-core.png`,
    `/public/assets/hero/hero-nexus.png`. The design audit at
    `docs/design-audit-2026.md:7,17` says these still contain visible
    generator artifacts (`TJfit.org` text, generator star marks). Plan to
    replace with procedural surfaces (already partially built —
    `src/app/globals.css:3454-3507` `.tj-procedural-programs`,
    `.tj-procedural-tjai`, `.tj-procedural-nexus`).

  - Typography too thin/neutral:
    `src/app/layout.tsx:13-26` loads Outfit (display) + Manrope (body) via
    next/font. The display weight imported is up to 800. But most headings
    in code are written `font-semibold` (600) or `font-medium` (500). For
    a fitness identity at least the hero h1 should be `font-extrabold`
    (800) or `font-black` (900) on the verb word.

  - Cyan/sky/violet competing accents:
    `tailwind.config.ts:85-91` defines `accent` (#22D3EE), `accent-muted`
    (#67E8F9), `accent-sky` (#0EA5E9), `accent-violet` (#94A3B8 — actually
    slate, mislabeled), `premium` (#A78BFA — true purple).
    `docs/design-audit-2026.md:9` calls this out. Lock cyan as the only
    brand accent. Slate (`#94A3B8`) becomes a neutral. Violet
    (`#A78BFA`) is reserved for `Apex` / premium-only badges. Sky
    (`#0EA5E9`) is the cyan→sky gradient stop, not a standalone token.

  - Sci-fi glow over-application:
    Globals defines `glow-cyan`, `glow-cyan-strong`, `crown-glow-accent`,
    `stat-number-glow`, `podium-accent`, `tj-card-aura`, `tj-cursor-glow`,
    `tj-grain`, plus a 800px cursor wash (`.spotlight`,
    `src/app/globals.css:1890-1898`) that runs site-wide. Audit calls this
    "loses hierarchy" (`docs/design-audit-2026.md:5`). Strip glow from any
    element that is NOT: hero verb, primary CTA, active nav state, TJAI
    pulse, or stat hero number.

B8. What is already good — DO NOT lose
  - The `Outfit` + `Manrope` pairing (layout.tsx:13-26). Keep.
  - Cyan #22D3EE as the brand accent. Keep, just stop overusing it.
  - The card-breathing system in `src/app/globals.css:9-41` (.tj-breathe).
    It's subtle, pleasant, respects prefers-reduced-motion. Keep.
  - The reduced-motion guard rails throughout globals.css (every keyframe
    has a `@media (prefers-reduced-motion: reduce)` companion). Keep.
  - The intro animation gate (`HomepageIntroGate` +
    `src/app/globals.css:3687-3804` `.tj-intro-*` rules). Already shipped,
    locked.
  - `src/components/program-card.tsx:23-31` shell with breathing + 3D tilt
    + cyan inset border. The card is good. Keep.
  - `src/lib/launch-copy.ts` auth strings (lines 201-244). Tight. Keep.
  - The token surface system: `tj-surface-card`, `tj-surface-panel`,
    `tj-surface-shell`, `tj-empty-state` (`globals.css:787-828`). Reuse.
  - Sidebar life utilities (`globals.css:60-154`) — staggered link entrance.
    Keep.
  - The fluid type scale `--tj-text-xs` … `--tj-text-7xl`
    (`globals.css:256-266`). Keep — hero treatments use them.
  - `Button.tsx` at `src/components/ui/Button.tsx` — five variants, three
    sizes, magnetic primary. Wire all CTAs through it.

================================================================================
SECTION C — DESIGN SYSTEM LOCK
================================================================================

C1. Color tokens — the canonical source — LOCK
The single source of truth is `tailwind.config.ts:71-97`. CSS variables in
`src/app/globals.css:226-332` mirror them. Any hex literal you write in a
component is a violation unless it explicitly references a brand-only
gradient stop. List of allowed hex literals:

    #0A0A0B   bg                  background           tailwind: bg-background
    #08080A   bg deep             surface 0            programs page only
    #0E0F12   surface 2 / card    surface-2            tailwind: bg-surface-2
    #111215   surface             surface              tailwind: bg-surface
    #15171A   surface elevated    surface.elevated     tailwind: bg-surface-elevated
    #1E2126   surface 3 (sticky)  surface.3            tailwind: bg-surface-3
    #1E2028   divider             divider              tailwind: border-divider
    #FFFFFF   text primary        text                 tailwind: text-white
    #D4D4D8   text bright         bright               tailwind: text-bright
    #A1A1AA   text muted          muted                tailwind: text-muted
    #71717A   text faint          faint                tailwind: text-faint
    #52525B   text dim            dim                  tailwind: text-dim
    #22D3EE   brand accent        accent               tailwind: text-accent
    #67E8F9   accent muted        accent-muted         (gradient stop only)
    #0EA5E9   accent sky          accent-sky           (gradient stop only)
    #94A3B8   slate (neutral)     accent-violet*       *legacy name; treat as
                                                       neutral, NOT brand
    #A78BFA   premium violet      premium              Apex badge ONLY
    #22C55E   success             success
    #F87171   danger              danger
    #F59E0B   warning             warning

LOCK: cyan is the brand. Slate (#94A3B8) reads as the dimmest near-neutral
content color. Violet (#A78BFA) is RESERVED for Apex tier badges. Champagne
/ gold are NOT in the brand. If you find any champagne, gold, or warm-cream
hex (anything in the #E6D... or #F6F3ED range), replace with white at a
reduced opacity.

LANDMINE: `src/app/globals.css:1418-1426` has `rgba(246, 243, 237, 0.7)` in
the `.tj-card-aura` keyframe — that warm cream is forbidden. Replace with
`rgba(34,211,238,0.5)`.

LANDMINE: `src/app/globals.css:3473-3506` (procedural surfaces) uses
`rgba(246, 243, 237, ...)` repeatedly. Replace with white at the same
opacity.

C2. Typography scale — LOCK
Display:   `Outfit`, var(--font-display). Layout.tsx:13-20.
Body:      `Manrope`, var(--font-sans). Layout.tsx:22-26.
Per-locale fallbacks already defined in globals.css:519-540. Keep.

Fluid scale (use these tokens, do not hardcode `text-[42px]` etc.):

    --tj-text-xs    clamp(0.75,  +0.25vw, 0.875)
    --tj-text-sm    clamp(0.875, +0.375vw, 1)
    --tj-text-base  clamp(1,     +0.5vw,  1.125)
    --tj-text-lg    clamp(1.125, +0.625vw, 1.25)
    --tj-text-xl    clamp(1.25,  +0.75vw, 1.5)
    --tj-text-2xl   clamp(1.5,   +1.25vw, 1.875)
    --tj-text-3xl   clamp(1.875, +1.875vw, 2.5)
    --tj-text-4xl   clamp(2.5,   +3.125vw, 3.5)
    --tj-text-5xl   clamp(3.5,   +5vw,    5)
    --tj-text-6xl   clamp(5,     +7.5vw,  7.5)
    --tj-text-7xl   clamp(7.5,   +12.5vw, 11)

Weights — display heads:
    Hero verb:        font-black (900) — single word only ("TRAIN", "FORGE")
    Hero remainder:   font-extrabold (800)
    Section h2:       font-extrabold (800)
    Card title:       font-semibold (600)
    Body:             font-medium (500)

Letter-spacing:
    Display heads:    tracking-[-0.03em] for h1 hero, -0.02em otherwise.
                      (Globals.css:534, 706 already does this.)
    Eyebrow caps:     tracking-[0.22em] (or 0.28em for the largest).
    Body:             tracking-[0.01em] (already on Button.tsx:13).

C3. Spacing grid — LOCK
Use Tailwind spacing tokens. Section padding tokens defined in globals.css:

    --tj-space-1 .. 12 (0.25rem to 3rem). Use these via the existing
    `--tj-space-N` vars where you need a CSS variable; otherwise use
    Tailwind's px-/py-/space-y- utilities.

Section vertical rhythm:
    Section between major content:    py-24 lg:py-32
    Section between minor content:    py-16 lg:py-20
    Section dense:                    py-10 lg:py-14
    `.section-y` utility already encodes 5.5rem / 8rem in
    `src/app/globals.css:925-935`. Use it for top-level page sections.

C4. Border radii — LOCK
    Tiny chip / pill:   rounded-full (9999px)
    Inputs / small btn: rounded-[10px] (Button secondary)
    Cards:              rounded-xl (~12px) — program-card.tsx:25
    Large cards:        rounded-2xl (~16px) — calculator section
    Hero shells:        rounded-shell (1.75rem ≈ 28px) — tailwind.config.ts:67-69

C5. Shadows / elevation — LOCK
Tiered elevation via `--tj-elev-rest`, `--tj-elev-hover`, `--tj-elev-pressed`
(`globals.css:329-331`). Compose with `.tj-card-tier` (globals.css:3292-3322).

    Rest:     0 8px 28px rgba(0,0,0,0.38)
    Hover:    0 18px 48px rgba(0,0,0,0.48), 0 0 0 1px rgba(34,211,238,0.12)
    Pressed:  0 6px 20px rgba(0,0,0,0.55), inset 0 2px 8px rgba(0,0,0,0.45)

Premium card glow (cyan accent on hover) — `--glow-cyan-box`,
`--glow-cyan-border` (globals.css:556-561). Reserve for primary surfaces.

C6. Animation easings + durations — LOCK
Easing tokens (tailwind.config.ts:8-15):
    ease-premium  cubic-bezier(0.2, 0.8, 0.2, 1)   default UI easing
    ease-spring   cubic-bezier(0.34, 1.56, 0.64, 1) playful entrance
    ease-out-soft cubic-bezier(0.16, 1, 0.3, 1)    gentle settle

Duration tokens (tailwind.config.ts:17-26):
    120ms hover micro
    180ms small UI transitions
    240ms card / panel
    280ms toast / popover
    320ms drawer
    480ms section
    720ms hero entrance
    1000ms cinematic

Motion vars (globals.css:282-292):
    --tj-motion-fast   220ms  (hover)
    --tj-motion-medium 480ms  (section reveal)
    --tj-motion-slow   880ms  (large reveal)
    --tj-motion-hero   1040ms (hero stagger)

C7. Z-index layers — LOCK
    Page content:                z-0..10
    Sticky/fixed nav:            z-40
    Mobile drawer overlay:       z-50
    Toast / dynamic island:      z-60
    Modal backdrop:              z-70
    Modal content:               z-80
    Cookie banner:               z-90
    Cursor glow:                 z-1 fixed (globals.css:3404)
    Grain overlay:               z-9999 fixed (globals.css:3275)

C8. Breakpoints — LOCK
Tailwind defaults — sm 640, md 768, lg 1024, xl 1280, 2xl 1536. The site
mostly designs for 375 mobile, 768 tablet, 1024 desktop. Hover-aware
treatments must wrap in `@media (hover: hover) and (pointer: fine)` (the
`tj-card-cinematic-hover` rule at globals.css:3055 already does this).

C9. Iconography rules — LOCK
Allowed icon sources, in priority order:
    1. Custom SVG silhouettes embedded inline in the component for fitness
       category icons (barbell, dumbbell, kettlebell, body, plate, sneaker,
       runner, jumper, kettlebell-swing, deadlift bar). See D4 for the
       allowed silhouette set and rough geometry.
    2. Lucide-react icons for utility (arrow, check, x, info, settings,
       lock, eye). Per-icon imports only — never bulk import.
    3. NO Lucide for fitness category labels. `Apple` for nutrition is a
       literal apple. Replace with a barbell-on-plate or fork-and-knife
       custom SVG.

C10. Surface elevation grammar — LOCK
    Level 0: page background (#0A0A0B / #08080A)
    Level 1: section panel — `.tj-surface-panel` (globals.css:795-802)
    Level 2: card resting — `.tj-surface-card` (globals.css:787-793)
    Level 3: card hover — `.tj-card-tier:hover` shadow + 1px cyan border
    Level 4: hero shell — `.tj-surface-shell` (globals.css:804-811)
    Level 5: modal — `lux-glass` + `.tj-card-aura` running

================================================================================
SECTION D — THE FITNESS IDENTITY OVERLAY
================================================================================

D1. The translation
"Banking website" means: equal feature grid, monochrome graphite, neutral
verbs, line icons, no human, no weight, soft mesh-gradient hero, generic
"Get Started" CTA, decorative numbers like "10x faster".

"Fitness platform" means: dominant athletic photography or silhouette,
heavy display weight on a fitness verb, equipment/anatomy-aware iconography,
visceral verbs ("LIFT", "FORGE", "CUT"), measured numbers with units
("12 weeks", "78 kg", "100 reps"), motion that suggests breath / pulse /
reps / barbell oscillation.

D2. Allowed visual ingredients — use freely
  - Heavy-weight verbs in display type (Outfit Black 900) at hero scale.
  - Cyan accent #22D3EE on motion or active states. Subtle inner glow OK.
  - Athletic silhouettes — barbell, kettlebell, runner, deadlift figure,
    push-up plank, squat. Stroke-based, single-color SVG paths only.
  - Real numbers with units: "51 programs", "12 weeks", "10 languages",
    "32 diet systems".
  - High-contrast section dividers (globals.css:1213-1218 `.tj-gradient-divider`).
  - Procedural mesh+grid backgrounds (globals.css:3454-3507) — already brand.
  - Stat counters that count up on scroll (immersive-home.tsx:63-91).
  - Card breathing — already shipped.
  - The cyan→sky gradient on primary CTA only (globals.css:295,937-967).

D3. Forbidden visual ingredients — strip on sight
  - Champagne / gold / warm cream (#F6F3ED, #E6D5A8, anything > #E0 warm).
  - Lucide `Apple` for nutrition. Lucide `Heart` for cardio. Lucide
    `Globe` for languages — replace `Globe` with a stylized rotating
    earth on the language pill.
  - Equal grids of 4+ feature cards with line icons. Cap at 3 cards in any
    feature row, or stagger sizes (asymmetric grid).
  - "Solutions" "Platform" "Empower" "Unlock your potential" "Premium tier"
    "Industry-leading". These are banking words.
  - Cursor-follow spotlights site-wide. Already in
    `globals.css:1890-1898` — reduce to homepage hero only, behind a
    `data-spotlight` opt-in.
  - Glow on every accent border. Audit `[class*="border-cyan"]` rule at
    globals.css:590-594 — that's a global-selector cyan glow on every
    cyan-bordered element. Wrap in a class instead so it's opt-in.

D4. Hero formula — homepage — LOCK
The current `<HeroSection>` lives at `src/components/home/hero-section.tsx`
(referenced from immersive-home.tsx:295-309). Replace its visual core with:

    [LEFT 55% column]
    Eyebrow:     "TJFIT · 12-WEEK SYSTEMS" (caps, tracking-[0.28em])
    H1 line 1:   "Build the body" (font-extrabold 800)
    H1 line 2:   "you keep." (with the verb "Build" rendered Outfit 900 in
                              cyan #22D3EE, breathing animation 3.8s)
    Sub:         "51 programs. 32 diets. TJAI builds yours. 12 weeks at
                  a time."
    Primary CTA: "Start training — Free" (Button variant=primary, size=lg)
    Secondary:   "Try TJAI free" (Button variant=secondary, size=lg)
    Trust line:  "No card · 5 languages · Cancel anytime"

    [RIGHT 45% column]
    A stacked athletic kinetic frame:
      - Behind: tj-hero-depth-grid (globals.css:3547-3557) — already
                a perspective grid, fitness-flavored.
      - Mid:    a 320×420 stylized barbell silhouette SVG (see D5 for
                pseudo-paths) breathing slowly.
      - Front:  three floating glass readouts (tj-hero-readout,
                globals.css:3589-3602) showing live metrics:
                • "WEEK 04 / 12"
                • "VOLUME +18%"
                • "STREAK 23 days"
                These read as a training dashboard, not a stock chart.

LANDMINE: do not put a 3D R3F canvas in the hero on mobile (currently
`<TJHeroStage>` runs on /membership at sm breakpoints). Three.js + R3F
adds 200kb+ of JS and lags on Android. Replace with the SVG silhouette +
CSS depth grid.

D5. Barbell silhouette — pseudo-SVG (use as starting paths)
Single 720×420 viewBox. Stroke-based, no fills.

    <svg viewBox="0 0 720 420" stroke="#22D3EE" fill="none" stroke-linecap="round">
      <!-- Bar -->
      <line x1="80" y1="210" x2="640" y2="210" stroke-width="6"/>
      <!-- Knurl detail -->
      <line x1="240" y1="200" x2="240" y2="220" stroke-width="2"/>
      <line x1="260" y1="200" x2="260" y2="220" stroke-width="2"/>
      <line x1="460" y1="200" x2="460" y2="220" stroke-width="2"/>
      <line x1="480" y1="200" x2="480" y2="220" stroke-width="2"/>
      <!-- Left plates (45 / 25 / 10) -->
      <rect x="60"  y="80"  width="20" height="260" rx="4" stroke-width="3"/>
      <rect x="40"  y="120" width="20" height="180" rx="4" stroke-width="2.5"/>
      <rect x="20"  y="160" width="20" height="100" rx="4" stroke-width="2"/>
      <!-- Right plates mirrored -->
      <rect x="640" y="80"  width="20" height="260" rx="4" stroke-width="3"/>
      <rect x="660" y="120" width="20" height="180" rx="4" stroke-width="2.5"/>
      <rect x="680" y="160" width="20" height="100" rx="4" stroke-width="2"/>
    </svg>

This is the hero silhouette. Animate `transform: translateY(0 → -4px)` on
the entire group at 3.8s ease-in-out infinite (the `breathe` keyframe
already in tailwind.config.ts:49-52). Cyan stroke glow opacity 0.35.

D6. Program card formula — per category — LOCK
The card shell (`src/components/program-card.tsx:23-31`) is already strong.
Don't rebuild — extend. Add a category-specific corner mark in the top-left
of every card, 24×24 SVG, stroke #22D3EE (default) or accent for category:

    Category               Corner mark        Color override
    -------------------------------------------------------------------
    Fat Loss               flame              #F87171 dim → cyan default
    Muscle Gain            barbell mini       #22D3EE
    Strength               kettlebell mini    #22D3EE
    Performance            sneaker silhouette #67E8F9
    Nutrition (diets)      fork+knife         #94A3B8 (slate as neutral)

The corner mark sits absolutely positioned at top-3 left-3, 16x16 stroke
SVG. Do not animate. Static.

D7. Section divider grammar — LOCK
Three allowed dividers:
    1. `.tj-gradient-divider` — 1px, cyan radial in middle. Default.
       Source: globals.css:1213-1218.
    2. `.lux-section-crest::before` — same, fades into a dot. For section
       intros. Source: globals.css:758-778.
    3. Hairline border-divider line, no glow. For dense list separation.

Forbidden:
    - Wave dividers (SaaS marketing pattern).
    - Diagonal banner dividers.
    - Decorative emoji dividers (✨, 🔥, 💪 in plain h2s — banned in EN
       headlines, allowed only as inline accents in body if Joseph picks).

D8. Stat counter pattern — LOCK
The CountUp component at `src/components/immersive-home.tsx:63-91` is the
canonical stat counter. Reuse for any stats display. Do NOT use it for
inflated marketing claims. Allowed labels:

    51    "Training programs"
    32    "Diet systems"
    12    "Weeks per plan"
    10    "Languages live" — (NOTE: actual locales = 5; the hero claim of
                              "10 languages" predates the prune. Update to
                              "5 languages" in en copy. LANDMINE.)
    25    "TJAI questions"
    24/7  "Train on your clock"

LANDMINE: `src/lib/home-luxury-copy.ts:170` says
`{ value: "10", label: "Languages live" }`. That is wrong — repo only
loads en/tr/ar/es/fr (5). Fix the en string to 5. Joseph owns tr/ar/es/fr.

D9. Motion language — fitness-flavored
Allowed: breath, pulse, rep-curl swing, barbell oscillation, scroll cue
bounce, count-up tick, scan-line sweep on hero only.
Forbidden: parallax-on-everything, marquee tickers (already removed in
favor of editorial rail at immersive-home.tsx:341-352 — keep that), site-wide
cursor follow with > 6% opacity (current site uses 6% — push to 4%),
infinite rotating 3D logos (`.tj-logo-3d` at globals.css:1809-1813 spins
forever — kill it on mobile).

================================================================================
SECTION E — PAGE-BY-PAGE BRIEFS
================================================================================

(Order: homepage → programs index → program detail → diets → diet detail →
TJAI → coaches → membership → community → leaderboard → coins → calculator →
auth → legal → dashboard → profile → become-a-coach → equipment-store-stub.
Every page has at minimum 12 lines.)

E1. Homepage — `src/app/[locale]/page.tsx` → `src/components/immersive-home.tsx`
Current state: ambitious cinematic homepage with 11 sections — hero, 3D act,
TJAI overview, editorial rail, platform spec grid (6 cards), how-it-works,
transformations, Spline showcase, stats, programs (parallax bg), TJAI kinetic
section, diets, testimonials, logo showcase, coach CTA, newsletter, final
CTA with animated SVG node network. Audit at docs/design-audit-2026.md:5-13
flags it as over-glowy and lacking hierarchy.

Target state: cut to 8 sections max, all reading as fitness within 0.5s.
Lead with the kinetic-frame hero (D4), then a single fitness-credibility
strip ("51 programs · 32 diets · 12-week systems · 5 languages"), then
programs, then TJAI, then diets, then coaches, then testimonials, then
final CTA. Kill the 6-cell platform spec grid. Kill the Spline showcase
(`src/components/home/spline-showcase.tsx`) on mobile — Spline is 1.5MB+ JS
and we don't need it for fitness identity. Keep on desktop only,
behind `(prefers-reduced-motion: no-preference) and (min-width: 1024px)`.

Specific visual changes:
  - Replace the 6-card platform spec grid (immersive-home.tsx:355-376) with
    a 3-column "What you get" row using fitness silhouette icons:
    [Programs] [TJAI] [Coaches]. Each cell: silhouette SVG + 2-line copy +
    text-link "Explore →". Asymmetric spacing — TJAI cell 1.4× width of
    side cells.
  - Replace `Apple` in `Full Diet Systems` (line 256) with a fork-and-knife
    SVG.
  - Replace `Globe` (line 259) with a stylized earth SVG outline.
  - Strip the `<Cinematic3DAct>` (immersive-home.tsx:313) on mobile.
  - Trim the editorial rail (line 341-352) to 4 items max:
    "12-week systems · TJAI plans · Coach-led training · 5 languages".

Copy changes (en only):
  Current:  hero headline "World-class coaching." / line2 "Built for a body you keep."
  Target:   line 1 "Build the body" / line 2 "you keep."
            (verb "Build" cyan + breathing)
  Current:  sub "Elite 12-week programs, realistic nutrition systems, and
                TJAI that anchors to your real data — a transformation you
                can sustain."
  Target:   "51 programs. 32 diets. TJAI builds yours. 12 weeks at a time."
  Current:  trustLine "Free to start · No card · 20+ flagship programs"
  Target:   "Free to start · No card · 51 programs · 32 diets"
  Current:  CTA primary "Start your transformation"
  Target:   "Start training — free"
  Current:  CTA secondary "View Programs"
  Target:   "Browse 51 programs"
  Update    `src/lib/home-luxury-copy.ts:170` `value: "10"` → `value: "5"`.

Component changes:
  - `src/components/home/hero-section.tsx` — full rewrite of the visual
    column to the kinetic frame (D4).
  - `src/components/immersive-home.tsx:253-260` features array — replace
    the 6 features with 3 (drop Coach Marketplace into TJAI section,
    drop Leaderboards / 10 Languages into the credibility strip).

Mobile (375px) considerations:
  - Hero stacks vertical (silhouette below text). Trim silhouette to
    180px tall.
  - Float readouts collapse into a horizontal scroll-snap row of three
    cards beneath silhouette.
  - All "ghost text" (immersive-home.tsx:416, 470, 585) reduced to
    opacity 0.02 (already done at globals.css:3027-3030).

Empty / loading: HomeLuxurySkeleton at page.tsx:19-34 is fine — keep, just
match the new section count (5 skeleton blocks instead of 4).

Conversion goal: signup OR /programs click. Track with the existing
trackMarketingEvent("program_view"...) call.

E2. Programs catalog — `src/app/[locale]/programs/page.tsx`
Current state: header eyebrow "Catalog" / title "Programs built like
products." with a subtle filter chip row showing training/nutrition counts.
Below, `<ProgramsCatalogClient>` renders the filterable grid.

Target state: same skeleton, sharper visual identity. Add a sticky filter
bar (Goal · Location · Equipment · Level · Duration) under the header on
desktop. Show training and diet items in two clearly labeled bands rather
than mixed. Add a "TJAI picks for me" CTA that opens TJAI quiz.

Specific visual changes:
  - The page background is `#08080A` with a top-down cyan radial wash
    (page.tsx:247). Strong. Keep.
  - The filter chip row at line 261-273 currently shows two pills with
    counts (Training 51 / Nutrition 32). Convert to a horizontal scroll
    bar at sm, sticky-top at lg.
  - Add a `Sort by` dropdown (Most popular / New / Difficulty / Duration).
    Default: Most popular.
  - Hero badge — add a small barbell icon next to "Catalog".

Copy changes:
  Current:  helpHeader "Not sure which fits?" / helpBody "TJAI picks a
            program in two minutes from your goal, equipment, and history."
  Target:   keep — this is good copy, fitness-flavored, conversational.
  Current:  emptyTitle "No programs match those filters."
  Target:   "Nothing matches yet. Loosen a filter."

Component changes:
  - `src/components/programs/programs-catalog-client.tsx` — add a sticky
    filter bar with cyan active-state pill.
  - Empty state uses `.tj-empty-state` (globals.css:813-819) — already
    fine, just upgrade icon to a dumbbell SVG.

Mobile: the filter bar collapses into a single "Filters (3)" button that
opens a bottom-sheet drawer with the filter form. Use existing dynamic-
island bubble pattern (globals.css:3324-3360) for the drawer animation.

Empty state — present.
Loading state — wrap in Suspense + skeleton card grid (8 cards).
Conversion goal: program detail click or TJAI open.

E3. Program detail — `src/app/[locale]/programs/[slug]/page.tsx`
Current state: detail page already has a sticky desktop purchase rail
(commit `b738d8b`) and mobile bottom CTA bar (commit `b738d8b`). Hero is
`<ProgramDetailHero>` at `src/components/program-detail-hero.tsx`. The
Elite system card (`src/components/program-elite-system-card.tsx`) renders
the multi-phase weekly structure.

Target state: the hero needs a fitness identity overhaul. Currently
shows program meta (badges, price, duration). Add: a category silhouette
(D6 corner mark scaled up to 96px), a "What you'll get" 4-bullet list
under the title, a "Sample week" preview accordion below the fold.

Specific visual changes:
  - Hero left column: cyan eyebrow ("FAT LOSS · 12 WEEKS · GYM") + h1
    program title (Outfit 800 at 5xl) + body description + meta row with
    days/week, sessions, equipment.
  - Hero right column: category silhouette (96px) + price + primary CTA
    "Get full 12 weeks — $X" (use the formatProgramPrice function from
    `src/lib/program-localization.ts`).
  - Sticky purchase rail on desktop ≥ lg — already shipped, keep.
  - Below hero: weekly accordion with phase 1 / 2 / 3 of the 12 weeks.

Copy changes: per-program copy lives in `src/lib/content.ts` (programs
array) and is owned by Joseph. Do NOT rewrite program titles or
descriptions. Only adjust generic UI labels (the "Get full 12 weeks"
verb-driven CTA and similar).

Component changes:
  - `src/components/program-detail-hero.tsx` — add silhouette + 4-bullet
    list, but only edit visual structure, not Joseph's copy.
  - `src/components/mobile-cta-bar.tsx` — already exists, verify cyan
    accent pulse on the price.

Mobile: bottom CTA bar at 56px sticky. Keep.
Empty/error: handled by parent <ClientErrorBoundary>. Keep.
Conversion goal: checkout → purchase.

E4. Diets index — `src/app/[locale]/diets/page.tsx`
Current state: 5-line header + grid of 32 diet cards using `.tj-breathe-diet`.
Each card: category eyebrow, goal title, who-it's-for body, weeks + price.

Target state: same skeleton, fitness-flavored upgrade. Add filter pills
(Cutting / Bulking / Recomp · Vegan / Halal / Standard). Add a "Compare 2
diets" toggle (later; flag as TODO if scope tight). Sub-eyebrow under hero
"32 systems · macros + meals + grocery + alternates".

Specific visual changes:
  - Replace generic AmbientBackground with the procedural diet surface
    (build a new `.tj-procedural-diet` rule with a stylized fork-and-knife
    motif).
  - Diet card: add a small fork-and-knife icon (16×16) in the top-left.
  - Price line: bold price in white, small slate "from" prefix.

Copy changes:
  Current sub: "Real food, real macros, real lives. Pick a plan that fits
                the way you actually eat."
  Target:      keep — this is decisive and fitness-flavored.
  Current COMING_SOON: "Catalog launches with the v4 content sprint. The
                first one is below — preview the structure."
  Target:      DELETE this line — the catalog is here. Replace with
                "32 plans. Cutting, bulking, recomp. Halal, vegan, standard."

Component changes:
  - Update the page to remove the COMING_SOON paragraph (page.tsx:62).
  - Add filter chip bar above the grid.

Mobile: 1-col grid (already responsive grid-cols-1 sm:grid-cols-2 lg:grid-cols-3).
Empty: implement empty state when no filters match.
Conversion goal: diet detail click.

E5. Diet detail — `src/app/[locale]/diets/[slug]/page.tsx`
Current state: structure currently mirrors program detail.

Target state: identical visual grammar to program detail (E3) but with the
fork-and-knife silhouette in the hero. "Sample day" accordion under the
fold showing breakfast/lunch/dinner/snack with macros.

Copy changes: do not rewrite content. Adjust only generic UI labels.

E6. TJAI public landing — `src/app/[locale]/tjai/page.tsx` →
    `src/components/tjai-public-landing.tsx`
Current state: hero polish already shipped (commit `aefabff` letter
stagger, scan-line preview, pricing diff). Pricing section shows free
preview vs $10 unlock vs Pro vs Apex.

Target state: keep the letter-stagger hero. Strengthen the fitness signal
by adding a "What TJAI builds for you" 4-step illustrated flow underneath:
[Quiz 25Q] → [Calc TDEE + macros] → [Build 12-week split] → [Deliver plan].
Each step gets a stroke-SVG icon (clipboard, scale, calendar grid, dumbbell).
Keep the typing/cursor blink animation in the preview.

Copy changes:
  Current: hero headline patterns owned by tjai-public-landing component.
  Target:  ensure the verb "Build" is used over "Generate".
           "TJAI builds your 12 weeks." > "TJAI generates your plan."

Component changes:
  - `src/components/tjai-public-landing.tsx` — add the 4-step illustrated
    flow.
  - The pricing tier diff already exists; verify the violet badge for Apex
    is the only purple hex on the page.

Mobile: hero stacks; 4-step flow becomes vertical timeline.
Empty/error: signed-in users redirect to /ai (page.tsx:56-64, keep).
Conversion goal: start quiz.

E7. /ai (TJAI shell) — `src/app/[locale]/ai/page.tsx`
Current state: TJAI app shell — quiz, then chat, then plan view.
Quiz uses the `tjai-question` slide animations (globals.css:386-398, 2054-2073).

Target state: keep functional. Apply visual polish only:
  - Quiz progress bar: add subtle cyan pulse at the active step.
  - Chat composer (commit `06186ac`): already premium — verify cyan accent
    pulse on send button only.
  - Calculating screen (commit `64f89e3`): keep "honest progress with
    finalizing state" — this is a good, fitness-credible loader.

Copy changes: do not edit. The TJAI prompts are owned by autonomy work.
Component changes: visual only.
Mobile: chat composer sticks to bottom (already done in commit `ecf01a6`).
Conversion goal: complete quiz → unlock $10 plan.

E8. Coaches grid + detail — `src/app/[locale]/coaches/page.tsx` (redirect)
    `src/app/[locale]/coaches/[slug]/page.tsx` (detail)
Current state: `/coaches` redirects to `/{locale}#coaches` (the homepage
section). The actual coach grid lives at `<HomeCoachCta>` in
`src/components/home-coach-cta.tsx`. Coach detail at coach-profile-view.tsx.

Target state: split — keep the redirect, BUT add a real `/coaches` route
post-launch. For NOW, upgrade `<HomeCoachCta>`:
  - Hero eyebrow: "TJFIT COACHES"
  - h2: "Coaches we'd train with."
  - 4-card coach grid: avatar + name + specialty + rating stars + cyan CTA
    "Train with [name] →".
  - Empty state if zero coaches (already in copy at home-luxury-copy.ts:235):
    "Coach roster is opening soon" — keep.

Coach detail page — apply the section-y rhythm. Hero: avatar 160×160 with
cyan ring + name + specialty + verified pill (cyan). Body: bio + program
list + testimonials + book CTA.

Copy changes:
  Current heading: "Coaches"
  Target:          "Coaches" with eyebrow "Train with the best".
Mobile: 1-col grid.
Conversion goal: book / message coach.

E9. Membership — `src/app/[locale]/membership/page.tsx`
Current state: hero "Choose Your TJFit Plan" with a 3D R3F scarab
(`<TJHeroStage variant="scarab">`). Below, three pricing cards.

Target state:
  - REPLACE the 3D scarab with the kinetic-frame barbell hero (D4 mini
    version, ~280px tall). The scarab is luxury-jewelry-flavored, fails
    the 0.5-second fitness test.
  - Hero h1: "Membership for what you train for."
  - Sub: "Core is free. Pro adds unlimited TJAI chat. Apex adds full plan
    regeneration."
  - Three pricing cards (Core / Pro / Apex) — cyan border on Pro
    (Most Popular), violet border on Apex.
  - Below cards: feature comparison table (already in
    membership-tier-copy.ts:51-60).

Copy changes:
  Current sub copy `"Standalone TJAI plan generation is a separate $10 unlock.
    Pro and Apex add ongoing coaching and premium member value."` — keep,
  it's clear and decisive.
  Hero sub current: "Unlock AI coaching, full programs, and expert support."
  Target:          "Core is free. Pro adds unlimited TJAI chat. Apex adds
                    full plan regeneration."
  LANDMINE: do not invent prices beyond what's in membership-tier-copy.ts.
            The $10 / $6/mo / $10/mo are real.

Component changes:
  - `src/app/[locale]/membership/page.tsx:34` — remove `<TJHeroStage>`.
  - `src/components/membership/membership-pricing.tsx` — verify Apex card
    uses the `premium` token (#A78BFA) only on the badge, not the body.

Mobile: cards stack vertically; comparison table converts to a stacked
per-tier list.
Empty/error: checkoutError string at line 61.
Conversion goal: subscribe.

E10. Community — `src/app/[locale]/community/page.tsx` (redirect)
Current state: redirects to `/{locale}#community` (homepage section).

Target state: keep redirect for now. Upgrade the homepage `#community`
section: add a "Latest threads" preview (3 thread cards), a "Active
challenges" preview (2 chips), a "Member transformations" 4-card row.

Copy changes:
  Source `src/lib/launch-copy.ts:530-532`:
    badge "Community" / title "Community" / subtitle "Discussions,
    challenges, and wins — together in one calm space."
  Keep — it's calm and clear.

E11. Leaderboard — `src/app/[locale]/leaderboard/page.tsx`
Current state: tab bar (TJCOIN / Streaks / Blog / Coaches / Programs);
each tab shows a podium for top 3 + ranked list below. Confetti on top-1
visibility (already shipped via canvas-confetti).

Target state: visual polish.
  - Hero h1: "Top of the board."
  - Sub: "Compete on TJCOIN, training streaks, and program completions."
  - Podium: gold / silver / bronze metals → replace with cyan / cyan-muted
    / slate (NO gold — it's banking-flavored).
  - Top-1 row: cyan crown icon + cyan-pulse glow (existing
    `crown-glow-accent` at globals.css:683-686 — repoint from gold to cyan).
  - Empty state per tab is already great copy (page.tsx:31-52).

Copy changes:
  Existing empty messages (page.tsx:31-52) are good — keep.
Component changes: re-color podium tiers.
Mobile: tabs scroll horizontally. Already responsive.
Conversion goal: engagement / view profile.

E12. Coins — `src/app/[locale]/coins/page.tsx`
Current state: TJCOIN wallet — balance, lifetime earned/spent, ledger,
redeem offers, earning methods. Lucide Coins icon.

Target state:
  - Hero: large balance number (Outfit 900) with `stat-number-glow`
    treatment (globals.css:689-691). Coin icon as a custom SVG (a stylized
    "TJ" inside a cyan ring) — replace Lucide Coins.
  - Earning methods: 6-card grid with fitness verb leading each ("Train",
    "Buy", "Post", "Refer", "Streak", "Complete").
  - Ledger: timeline list with cyan dot indicator.

Copy changes:
  Current earning methods are functional. Keep structure but rephrase
  "Buy a program" → "Buy any program — earn 50".

Mobile: wallet hero stacks; ledger compresses.
Empty: "No coins yet. Train to earn."
Conversion goal: redeem / engage.

E13. Calculator — `src/app/[locale]/calculator/page.tsx`
Current state: clean form — age / gender / height / weight / activity / goal,
with TDEE + macro + water output below.

Target state:
  - Hero h1 currently "Free TDEE Calculator". Upgrade to:
    "Know your numbers." (Outfit 900 hero scale)
  - Sub: "Daily calories, protein, carbs, fat, water. Built on Mifflin-
    St Jeor. Free."
  - Form: each field gets a small fitness icon (silhouette of the field's
    concept — scale icon for weight, ruler for height, flame for activity,
    target for goal).
  - Result panel: stat counters animate up on submit. Each stat in a
    cyan-bordered card.
  - Footer note: "Use these as a starting point. Adjust weekly. TJAI tunes
    these for you."

Copy changes: full English rewrite of the page — Joseph owns no other
locale here yet (this page is en-only currently). Acceptable to fully
rewrite the en strings.

Component changes: extend the page with stat-counter animations on
submit. Use the existing CountUp.
Mobile: form stacks vertically; results below.
Conversion goal: TJAI open after results.

E14. Auth — login / signup / forgot-password / verify-email
Current files: `src/app/[locale]/login/page.tsx`,
`src/app/[locale]/signup/page.tsx`, etc. Wrap in `<AuthPageFrame>`.

Current state: clean centered card on dark BG. Logo on top. Lux-badge
("Sign in" / "Join"). Display heading + subtitle. Form fields with
input.focus glow (globals.css:618-628). Magnetic primary button.

Target state: keep clean, just fitness-flavor:
  - Subtle barbell silhouette at 8% opacity behind the card on desktop ≥ lg.
  - Primary CTA verb-first: "Sign in" / "Create account" — both already
    used in launch-copy.ts:220-237. Keep.
  - Trust line under signup: "Free forever. 51 programs. No card."

Copy changes: source `src/lib/launch-copy.ts:201-244` — already tight.
Adjust signupTitle "Join TJFit" → keep. Adjust signupSubtitle "Book
coaching, buy programs, track progress, and message your coach — in one
place." → keep, decisive.

Mobile: form fills screen; logo sticks top.
Empty/error: copy.loginFailed, copy.authNotConfigured already defined.
Conversion goal: complete signup.

E15. Legal hub + sub-pages — `src/app/[locale]/legal/page.tsx`,
     `/legal/coach-agreement`, `/legal/cookies`, `/legal/health-disclaimer`,
     `/privacy-policy`, `/terms-and-conditions`, `/refund-policy`.
Current state: legal hub uses `<CinematicListingHeader>` + sticky side nav
+ FAQ accordion + 3 sections (user terms, coach terms, privacy).

Target state: keep functional layout. Visual polish:
  - Hero: keep "Questions & Terms." Apply Outfit 800.
  - Side nav: pill nav becomes a left rail on desktop with a cyan dot
    active indicator (the `tj-sidebar-link` pattern at
    globals.css:93-132 — reuse).
  - FAQ: keep `legal-faq-details` smooth-height accordion (globals.css:489-503).
  - Body paragraphs: line-height 1.8, max-width 65ch, slate text.

Copy: source `src/lib/legal-hub-copy.ts:200-218`. Keep all 11 FAQ entries.
Mobile: side nav becomes horizontal scroll chip bar at top. Already done.

E16. Dashboard — `src/app/[locale]/dashboard/page.tsx`
Current state: protected route. `<DashboardRoleRouter>` splits into user
or coach dashboard. Skeleton loading shipped.

Target state: visual polish only.
  - Greeting hero: "Welcome back, [name]" — h1 in Outfit 700, no glow.
  - 3 stat tiles below greeting: Active program · Streak · TJCOIN balance.
  - Quick actions: "Continue training" / "Open TJAI" / "Message coach".
  - Recent activity timeline.

Copy: source `src/lib/user-dashboard-copy.ts`. Keep.
Mobile: stats stack 1-col; quick actions 2-col grid.
Conversion goal: continue program.

E17. Profile — `src/app/[locale]/profile/[username]/page.tsx` and edit
Current state: profile view with avatar, bio, stats (programs done, blog
posts, streaks).

Target state: a tighter "athlete card" hero — avatar 120×120 with cyan
ring, username, verified pill, bio. Stat row of 3 (programs / streak /
TJCOIN). Below: tabs (Programs · Blogs · Transformations).

Mobile: stats compress to 2-row grid.
Conversion: message / follow.

E18. Become a coach — `src/app/[locale]/become-a-coach/page.tsx`
Current state: extensive marketing page with hero, 3 benefits, "How It
Works" 4-step, "What You Can Create" 2-cards, requirements, application
form, FAQ. Currently uses 🌍 📈 💰 🏋️ 🥗 emoji in headings.

Target state: KEEP the structure — it converts well. Replace emoji with
fitness-flavored stroke SVG icons:
  - 🌍 → globe outline (still acceptable for the language pillar)
  - 📈 → upward bar chart minimal stroke
  - 💰 → coin SVG (reuse the TJCOIN coin)
  - 🏋️ → barbell silhouette (D5)
  - 🥗 → fork-and-knife (D6)

Copy changes: keep the en strings — they're decisive.
  Current hero: "Turn Your Expertise Into Income."
  Target:       keep — fitness verb "Turn" works.

Mobile: stack everything; form full-width.
Conversion: application submit.

E19. Equipment store coming-soon — `src/app/[locale]/store/page.tsx`
Current state: renders `<ComingSoonLaunchPage page="store">`.

Target state: do NOT build the store. Just polish the coming-soon page:
  - Hero: "Equipment store — coming soon."
  - Sub: "Curated barbells, plates, kettlebells, sleeves. Joseph picks
    every item."
  - A single "Notify me" email capture form (lead-capture-form already
    exists at `src/components/marketing/lead-capture-form.tsx`).
  - Background: stylized barbell silhouette at 10% opacity.

LANDMINE: per Joseph's scope guard, do NOT touch Shopify or build store
flows. Coming-soon polish only.

E20. Other pages quick pass
  - /transformations — grid of before/after cards. Already partially built.
    Each card: split-image (before left, after right), name, weeks,
    program. Cyan ring on hover. Keep skeleton.
  - /challenges — challenge cards with prize / start date / participants.
    Keep.
  - /blog — list of blog posts; cyan accent on featured post.
  - /podcast, /press, /live — coming-soon variants. Same treatment as E19.
  - /support, /feedback, /suggestions — form pages, single column, simple.
  - /search — global search modal/page; keep functional.
  - /start — start funnel quiz at `/start`. Already polished.

================================================================================
SECTION F — COMPONENT LIBRARY UPGRADES
================================================================================

F1. Buttons — `src/components/ui/Button.tsx`
The five variants are already defined (primary / secondary / ghost / danger
/ link) at lines 15-25. Sizes sm/md/lg at lines 27-31. Magnetic primary
on link via useMagneticButton(0.3) at line 46.

Add to this file:
  - A 6th variant "cyan-outline" — transparent bg + 1px #22D3EE border,
    text-accent, hover fills with rgba(34,211,238,0.06). Use for tertiary
    cyan-flavored CTAs that aren't the primary gradient.
  - Loading state: `loading?: boolean` prop. When true, swaps children for
    a 16×16 cyan spinner using the existing `.tj-inline-spinner`
    (globals.css:1604-1619). Width must be preserved (no layout shift) —
    use min-width based on the children's measured width on first render.
  - Icon prop: `icon?: ReactNode` and `iconPosition?: 'leading' | 'trailing'`.
    Trailing default for primary CTAs ("Start training →").

Replace every loose `<button className="...">` and `<Link className="lux-btn-primary">`
across the codebase with `<Button variant="primary" href="...">`. Search
for raw `lux-btn-primary` and `lux-btn-secondary` class usages — those are
the targets.

F2. Cards
  - Program card — `src/components/program-card.tsx`. Done. Add corner
    silhouette per D6.
  - Diet card — currently inline in `src/app/[locale]/diets/page.tsx:65-87`.
    Extract into `src/components/diet-card.tsx`. Add fork-and-knife corner.
  - Coach card — `src/components/coach-card.tsx`. Verify cyan ring on
    avatar.
  - Membership tier card — inside
    `src/components/membership/membership-pricing.tsx`. Three variants:
    Core (slate accent) / Pro (cyan accent + Most Popular pill) / Apex
    (violet accent + Best Value pill).
  - Blog card — extract from /blog page if not already a component.
  - Testimonial card — `src/components/home-testimonials.tsx` already
    exists; verify cyan quote mark.

Each card variant supports props: `interactive?: boolean` (adds hover
lift), `size?: 'sm' | 'md' | 'lg'`, `accentColor?: 'cyan' | 'slate' | 'violet'`.

F3. Forms
Field components — extract to `src/components/ui/Field.tsx`:
  - Input (text, email, password, number)
  - Textarea
  - Select
  - Checkbox / Radio (custom-styled with cyan check)
  - File upload (avatar + image)
  - Field group (label + input + helper text + error message)

Reuse the `.input` styles already in globals.css:1104-1135. The cyan focus
ring is already correct.

States required: idle, focus, filled, error, disabled, loading.

F4. Navigation
  - Top nav — already exists in `src/components/site-shell.tsx` (referenced
    from layout.tsx:5). Verify it has a sticky scroll-shrink behavior.
    The hover-reveal submenu at globals.css:161-224 is good — keep.
  - Side overlay — sidebar life utilities at globals.css:60-154. Good.
  - Mobile drawer — `nav-drawer-panel` at globals.css:1086-1095. Good.
  - Footer — verify all 11 links from `getFooterCopy(locale)` render
    (`src/lib/launch-copy.ts:725-826`).

F5. Feedback components
  - Toast — `src/components/ui/dynamic-island.tsx` already exists. Verify
    cyan accent, 3.5s default lifetime, dismiss on click.
  - Modal — locate `lux-glass` users. Wire through a single Modal
    component if not already centralized.
  - Drawer (bottom sheet for mobile) — extract pattern from
    `src/components/messages-layout-shell.tsx` if it has one; otherwise
    new component.
  - Popover — Radix popover wrapper.
  - Tooltip — `tj-collapsed-sidebar-tip` style (globals.css:1399-1404).
  - Skeleton — `.tj-skeleton` at globals.css:1597-1602. Good.
  - Empty state — `.tj-empty-state` at globals.css:813-828. Good.
  - Error state — `.tj-api-error-block` at globals.css:1621-1629. Good.
  - Success state — green-tinted variant of error block.

F6. Data display
  - Stat counter — CountUp at `src/components/immersive-home.tsx:63-91`.
    Extract to `src/components/ui/StatCounter.tsx`. Reuse on /coins, /leaderboard,
    /calculator results, /dashboard.
  - Progress bar — for TJAI quiz, program week tracker. Reuse the
    `.tjai-progress-fill` pattern at globals.css:380-383.
  - Badge — `.lux-badge` at globals.css:742-756 (eyebrow style) and
    `.badge` at globals.css:1632-1635 (chip style). Two distinct purposes,
    keep both.
  - Avatar — extract from `src/components/animated-avatar.tsx` if not
    already a clean primitive. Sizes: xs (24), sm (32), md (40), lg (64),
    xl (120), athlete (160).
  - Leaderboard row — sticky podium row + ranked list rows. Already in
    leaderboard/page.tsx. Verify cyan crown.
  - Transformation split — split-image card with before/after labels +
    week count. New component `src/components/transformation-split.tsx`.
  - Tabs — for TJAI sections, profile tabs, leaderboard tabs. Use Radix
    tabs or build a wrapper.

F7. Composition tokens
Each component file MUST import from `@/lib/utils` (cn helper) and from
the canonical tokens. Do not add new colors as raw hex inside component
files unless they're brand gradient stops listed in C1.

================================================================================
SECTION G — MOTION AND MICRO-INTERACTIONS
================================================================================

G1. Page transitions
Existing component: `src/components/transitions/PageTransition.tsx` (referenced
from layout.tsx:7). Verify it uses fade-up at 280ms ease-premium.

G2. Scroll entrance
Use `<MotionReveal>` from `src/components/home/motion-reveal.tsx` for
section-by-section entrances. Reuses `.reveal-section` (globals.css:2093-2104)
under the hood. Stagger child reveals via `delayMs` prop in 60-100ms steps.

G3. Hover lifts
Cards lift -2px on hover with cyan border ring (`.tj-card-tier:hover`,
globals.css:3299-3304). Buttons lift -1px (Button variant primary).
Disable both on `(hover: none)` and `(prefers-reduced-motion: reduce)`.

G4. Hero silhouette breathing
Apply `.tj-breathe` to the SVG group. 3.8s ease-premium infinite. Already
defined at tailwind.config.ts:49-52. Reduced-motion guard is in
globals.css:46-57.

G5. Stat counter count-up
1400ms ease-out cubic. Triggered on first viewport entry via useInView with
`once: true`. Already implemented in immersive-home.tsx:67-79.

G6. Cyan accent pulse
Rare. Reserve for: TJAI pulse badge (`.tjai-pulse-badge`,
globals.css:1339-1346), active leaderboard top-1, send button on chat
composer, primary CTA hover (`.tj-cta-glow-hover`, globals.css:2802-2814).

G7. Forbidden motion
  - Site-wide cursor follow at > 4% opacity. Reduce `.spotlight` peak from
    rgba(34,211,238,0.06) to 0.04 in globals.css:1892.
  - Infinite logo rotation. Kill `.tj-logo-3d` animation on mobile —
    already gated at globals.css:1916-1923 for `(hover: none)` but verify.
  - Mesh-shift on the hero (mesh-shift keyframe, globals.css:1784-1797).
    Cap to desktop only.
  - Auto-playing video bg (none currently exist — keep that way).
  - Confetti on every action. Currently only top-1 leaderboard reveal —
    keep, do not add elsewhere.

G8. Reduced motion
Every keyframe in globals.css already has a `@media (prefers-reduced-motion: reduce)`
companion. There is also a global safety net at globals.css:3512-3521 that
clamps animation-duration to 0.01ms. Keep both layers.

G9. Touch device
Use `@media (hover: none)` to disable hover transforms (already done in
several places: globals.css:1562-1570, 1738-1756, 3063-3067, 3317-3322).
Verify every hover transform has this guard.

================================================================================
SECTION H — COPY DIRECTION
================================================================================

H1. Voice
Direct. Decisive. Verb-first. Numbered. Owner-flavored.
   YES: "Build the body you keep."
   NO:  "Discover your potential."
   YES: "51 programs. 32 diets. Free preview."
   NO:  "Comprehensive fitness solutions."
   YES: "Coaches we'd train with."
   NO:  "Best-in-class certified professionals."

H2. Hero copy LOCK
Final homepage hero text in en — `src/lib/home-luxury-copy.ts:115-131`:
    eyebrow:             "TJFIT · 12-WEEK SYSTEMS"
    headline:            "Build the body"
    headlineLine2:       "you keep."
    headlineLine2Accent: "Build"
    sub:                 "51 programs. 32 diets. TJAI builds yours.
                          12 weeks at a time."
    ctaPrimary:          "Start training — free"
    ctaSecondary:        "Browse 51 programs"
    trustLine:           "Free to start · No card · 51 programs · 32 diets"
    heroGradientTagline: "AI precision · 12-week systems · Real coaches"

LOCK: edit ONLY the `en` block in `home-luxury-copy.ts`. Joseph owns
`tr / ar / es / fr`.

H3. CTA verb library — preferred
    Start training        Build my plan         Lift today
    Get the full 12       Try TJAI free         Start the cut
    Train with [name]     Open the catalog      See the system
    Notify me             Sign in               Create account

H4. CTA verbs — banned
    Get Started           Learn More            Submit
    Submit Now            Continue              Click Here
    Discover              Unlock potential      Empower
    Discover the platform Solutions             Industry-leading

H5. Section headline pattern
    Eyebrow caps:    "TRANSFORMATION SYSTEMS" / "AI TRANSFORMATION ENGINE"
    H2 verb-first:   "Train smarter. Build harder." / "Meet TJAI."
    Sub:             one short sentence ≤ 16 words. Stat-anchored where
                     possible.

H6. Empty / error / loading copy patterns
    Empty:    [Subject] [verb-negation]. [Action verb suggestion].
              "No coins yet. Train to earn."
    Error:    [What went wrong]. [Action].
              "Couldn't sign you in. Try again."
    Loading:  [Verb-ing]…
              "Signing in…" / "Building your plan…"

H7. Locale handling
LOCK: do NOT translate copy into tr / ar / es / fr. If you change a key
in the en block of any *-copy.ts file, the same key already exists in
tr/ar/es/fr — leave the other locales' values UNCHANGED. Joseph translates
in a separate pass.

If a key is brand-new in en (you added it), still leave tr/ar/es/fr
fallback to the en value. The site already falls back to en if a locale
key is missing (see `getHomeLuxuryCopy`, home-luxury-copy.ts:720-722).

================================================================================
SECTION I — ACCESSIBILITY AND PERFORMANCE FLOORS
================================================================================

I1. Contrast — LOCK
WCAG AA minimum: text 4.5:1, large text 3:1, non-text UI 3:1.
The current cyan accent #22D3EE on #0A0A0B background passes 14.6:1 — good.
The faint text #71717A on #0A0A0B is 5.6:1 — passes. Dim text #52525B on
#0A0A0B is 3.2:1 — fails for body. Restrict #52525B to eyebrow/caps text
only (≤ 12px / >= 700 weight).

I2. Focus rings
Current global rule at globals.css:3367-3374: 2px solid cyan-60% outline,
4px offset, 4px border-radius. Good. Keep.

I3. Keyboard nav
Every interactive must be reachable via Tab. Modals trap focus. Drawers
trap focus and ESC closes. Custom dropdowns expose listbox role.

I4. ARIA
  - Eyebrow / decorative SVG: aria-hidden.
  - Stat counter: aria-live="polite" on the value cell.
  - Modal: role="dialog", aria-modal="true", aria-labelledby.
  - Toast: role="status" or "alert" (alert for errors).
  - Carousel/scroll-snap: role="region", aria-label.
  - Tabs: role="tablist" + role="tab" + role="tabpanel".

I5. Reduced motion
All motion gated. Already comprehensive. Maintain when adding new motion.

I6. RTL for Arabic
Use logical CSS properties: `inset-inline-start`, `padding-inline-end`,
`margin-inline`, `border-start-end-radius`. Avoid `left/right`, `ml-/mr-`
when in directional contexts. The body already sets `dir` from
`getDirection(locale)`. Most `[dir="rtl"]` overrides at globals.css:1930-2020
are already in place.

I7. Image weights / formats
  - All hero images: AVIF + WebP fallback, lazy below the fold, eager on
    hero. < 200kb per image at 1920px width.
  - Avatars: WebP, < 30kb.
  - Replace remaining .png hero assets at /public/assets/hero/*.png with
    procedural SVG surfaces (already partially done — finish the migration
    per design audit recommendation).

I8. Font loading
Outfit + Manrope already loaded via next/font (layout.tsx:13-26) with
`display: 'swap'`. Subsets latin + latin-ext. Keep.

I9. Bundle
  - Lucide: per-icon imports (`import { Brain } from "lucide-react"`).
    Verify no `import * as Icons from "lucide-react"` exists.
  - Framer Motion: only on pages that need complex stagger. Currently the
    repo uses CSS animations for most things — keep that. If you import
    framer-motion, code-split via `next/dynamic`.
  - canvas-confetti: already imported on /leaderboard. Don't add elsewhere.
  - Three.js / R3F: kill on mobile. Currently in `src/components/3d/*` and
    `src/components/luxury/luxury-hero-3d*`. Lazy-load on desktop only.

I10. Performance floors — LOCK
    Lighthouse Performance ≥ 90 on /
    Lighthouse A11y ≥ 95
    Lighthouse Best Practices ≥ 95
    Lighthouse SEO ≥ 95
    LCP ≤ 2.5s on 4G slow
    CLS ≤ 0.05
    INP ≤ 200ms

================================================================================
SECTION J — DELIVERY EXPECTATIONS
================================================================================

J1. Work in chunks
Each chunk = one logical scope. After every chunk:
    npm run build
    npm run typecheck
    npm run lint
    Manual smoke test in dev server.
All four must be green. No warnings escalating to errors.

J2. Forbidden during this pass
    - New features (anything not visual / copy / token / component).
    - New routes (you're polishing existing routes).
    - New DB fields, RPCs, or migrations.
    - Payment flow changes (Paddle / Gumroad code is locked).
    - Auth flow changes (login / signup logic is locked, ONLY visual edits).
    - New top-level dependencies beyond what's already in package.json.

J3. Allowed dependencies if needed
    - framer-motion (already used in some places)
    - class-variance-authority (cva) — for Button/Card variant systems

If you reach for anything else, write the rationale in
`docs/design/handoff-to-backend.md` and pick a no-dep path instead.

J4. Stop conditions
    - You hit a backend gate (auth required, DB query, payment flow):
      STOP. Write the gate to `docs/design/handoff-to-backend.md` with
      file:line and required action. Skip and move to the next chunk.
    - You hit ambiguous copy where two equally defensible choices exist:
      STOP. Write the question to `docs/design/copy-questions.md` AND pick
      the more decisive option (the one that says less, more directly).
      Don't block — ship the pick.
    - You hit a token violation (a hex literal not in C1): STOP. Replace
      with the canonical token. Note the violation source location in
      `docs/design/token-violations.md`.

J5. Commit hygiene
Conventional commits. Scope by area:
    feat(home): kinetic frame hero + barbell silhouette
    feat(programs): sticky filter bar + sort dropdown
    feat(membership): replace 3D scarab with kinetic hero
    fix(tokens): purge champagne hex from globals.css
    chore(copy): tighten en hero strings (51 programs / 32 diets)
    refactor(button): add cyan-outline variant + loading state

Never `--no-verify`. Never amend. New commit per logical scope.

J6. PR cadence
One PR per top-level chunk (Section K below). Maximum 5 PRs total.
Each PR must include: description of visual changes, before/after
screenshots (manually captured), and a checklist mapping to Section L.

================================================================================
SECTION K — ORDER OF EXECUTION
================================================================================

Numbered. Do NOT skip steps. Each step ships before the next begins.

  1. Token lock-in pass.
     - Audit every hex in globals.css and components/.
     - Replace champagne / warm-cream with white-at-opacity.
     - Move global cyan-border glow rule (globals.css:590-594) to opt-in
       class.
     - Verify --color-* and tailwind theme parity.
     - Build green. Commit `chore(tokens): canonical color lock`.

  2. Component library upgrade.
     - Button: add cyan-outline variant + loading prop + icon prop.
     - Extract DietCard, StatCounter, TransformationSplit, Field, Modal.
     - Replace raw lux-btn-primary / lux-btn-secondary usages with <Button>.
     - Build green. Commit `feat(ui): button variants + extract diet card`.

  3. Homepage hero — kinetic frame.
     - Replace HeroSection visual column with barbell silhouette + readouts.
     - Update en home-luxury-copy.ts hero strings (H2).
     - Trim platform-spec grid from 6 cards to 3.
     - Lazy-load Cinematic3DAct on desktop ≥ lg only.
     - Lazy-load SplineShowcase on desktop ≥ lg only.
     - Mobile (375): silhouette stacks below text at 180px.
     - Build green. Commit `feat(home): kinetic frame hero + tightened sections`.

  4. Homepage below-the-fold.
     - Trim editorial rail to 4 items.
     - Repoint stats to "51 / 32 / 12 / 5" (programs / diets / weeks / langs).
     - Replace generic Lucide icons (Apple, Globe) in features array
       with custom SVG.
     - Final CTA: tighten language, ensure cyan→sky gradient on primary.
     - Build green. Commit `feat(home): below-the-fold polish`.

  5. Programs catalog + detail.
     - Sticky filter bar + sort dropdown on /programs.
     - Empty state copy update.
     - Detail hero: category silhouette + "What you'll get" 4-bullet.
     - Build green. Commit `feat(programs): catalog filter bar + detail hero`.

  6. TJAI public landing + /ai shell visual polish.
     - 4-step illustrated flow on /tjai.
     - Visual polish on quiz progress bar.
     - Verify chat composer cyan accent on send only.
     - Build green. Commit `feat(tjai): four-step flow + composer polish`.

  7. Membership.
     - Replace 3D scarab with kinetic frame mini-hero.
     - Pricing card visual polish (cyan/violet accents).
     - Comparison table styling.
     - Build green. Commit `feat(membership): kinetic hero + pricing polish`.

  8. Coaches (homepage section + detail).
     - Upgrade HomeCoachCta hero copy + 4-card grid.
     - Coach detail page visual polish.
     - Build green. Commit `feat(coaches): grid + detail polish`.

  9. Auth (login / signup / forgot / verify).
     - Add subtle barbell silhouette behind card on lg+.
     - Trust line under signup.
     - Build green. Commit `feat(auth): fitness silhouette + trust line`.

  10. Secondary pages (community / leaderboard / coins / calculator).
      - Leaderboard: cyan podium + crown.
      - Coins: TJ-coin SVG replacing Lucide.
      - Calculator: full en hero rewrite + result stat counters.
      - Build green. Commit `feat(misc): leaderboard / coins / calc polish`.

  11. Equipment store coming-soon.
      - Polish ComingSoonLaunchPage with barbell silhouette + email capture.
      - Build green. Commit `feat(store): coming-soon polish`.

  12. Become-a-coach.
      - Replace emoji icons with stroke SVGs.
      - Build green. Commit `feat(become-a-coach): replace emoji with svg`.

  13. Mobile final pass (375px).
      - Walk every page on iPhone SE viewport. Check every hero stacks,
        every grid collapses, every CTA reachable, every form usable.
      - Build green. Commit `fix(mobile): 375px polish`.

  14. Polish + verification.
      - Run Section L checklist.
      - Lighthouse on / and /programs and /tjai.
      - Manual RTL check on Arabic locale.
      - Manual reduced-motion check.
      - Build green. Commit `chore(qa): launch readiness verification`.

================================================================================
SECTION L — FINAL CHECKLIST
================================================================================

Run this before declaring done. Every line must be a yes.

  [ ] 0.5-second fitness test passes on / (homepage).
  [ ] 0.5-second fitness test passes on /programs.
  [ ] 0.5-second fitness test passes on /tjai.
  [ ] 0.5-second fitness test passes on /membership.
  [ ] No banking-website symptoms (B7) remain on any public page.
  [ ] No champagne / gold / warm-cream hex anywhere in src/.
  [ ] All accent colors map to canonical tokens (C1).
  [ ] Cyan #22D3EE is the only brand accent. Slate is neutral. Violet is
      Apex-only.
  [ ] Every page tested at 375px viewport (iPhone SE).
  [ ] Every page tested at 768px (iPad portrait).
  [ ] Every page tested at 1280px (small desktop).
  [ ] RTL Arabic layout verified — no broken icon directions, no left/right
      hard-coded values that should be inline-start/inline-end.
  [ ] prefers-reduced-motion verified — all animation suspended.
  [ ] prefers-color-scheme — site is dark-only by design (LOCK), no light
      mode work needed.
  [ ] Lighthouse Performance ≥ 90 on / (mobile + desktop).
  [ ] Lighthouse A11y ≥ 95.
  [ ] Lighthouse Best Practices ≥ 95.
  [ ] Lighthouse SEO ≥ 95.
  [ ] LCP ≤ 2.5s on 4G slow throttle.
  [ ] CLS ≤ 0.05.
  [ ] No console errors in dev or prod build.
  [ ] No console warnings except known-acceptable Next.js warnings.
  [ ] Every CTA in en uses a verb from H3, none from H4.
  [ ] Every hero on every page has a fitness signal above the fold.
  [ ] All 11 footer links resolve (no 404).
  [ ] Auth pages (login/signup/forgot/verify) all render cleanly.
  [ ] Empty states exist and use H6 copy patterns.
  [ ] Loading states exist and use H6 copy patterns.
  [ ] Error states exist and use H6 copy patterns.
  [ ] Every interactive element ≥ 44×44 hit target.
  [ ] Focus rings visible on every interactive (cyan 2px / 4px offset).
  [ ] No `import * as Icons` — all Lucide imports per-icon.
  [ ] No raw hex colors in component files except gradient stops in C1.
  [ ] No `min-h-screen` legacy — use `min-h-[100dvh]`.
  [ ] No `100vh` literals — use `100dvh` or `100svh`.
  [ ] Build green. Typecheck green. Lint green.
  [ ] Conventional commits applied across the entire branch.
  [ ] All commits signed off by Claude. No `--no-verify`. No amends.
  [ ] No backend / API / DB / auth file modified.
  [ ] No tr / ar / es / fr copy edited.
  [ ] No new dependency outside framer-motion + cva.
  [ ] `docs/design/handoff-to-backend.md` exists if any gate hit.
  [ ] `docs/design/copy-questions.md` exists if any ambiguity hit.
  [ ] PR description for each chunk includes before/after screenshots.

================================================================================
END OF MEGA-PROMPT.
Take the brief. Execute Section K in order. Pass Section L before declaring
done. The owner is watching the ship.
================================================================================
