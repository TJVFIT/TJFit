# TJFIT IMMERSIVE REDESIGN — MASTER CURSOR AGENT PROMPT

You are working on **TJFit** (tjfit.org), a premium AI fitness platform built with:
- **Next.js 14 App Router**, TypeScript strict mode, Tailwind CSS (utility-only)
- **Three.js** + `@react-three/fiber` + `@react-three/drei` (already installed — use these for all 3D)
- Design tokens in `src/app/globals.css`: bg `#09090B`, surface `#111215`, border `#1E2028`, cyan `#22D3EE`, violet `#A78BFA`
- Locales: `en`, `tr`, `ar`, `es`, `fr` — Arabic uses RTL layout (`dir="rtl"`)
- Logo component: `src/components/ui/Logo.tsx` which renders PNG brand assets from `/public/brand/`
- Homepage entry: `src/app/[locale]/page.tsx` → renders `ImmersiveHome` → which renders `LuxuryHome` from `src/components/luxury/luxury-home.tsx`
- Existing 3D hero canvas: `src/components/luxury/luxury-hero-3d-canvas.tsx`

You have been given **6 attached images**. Here is their exact mapping:

| Attachment | Description | Used in |
|---|---|---|
| **Image 1** | Cyan anatomical/xray human figure running — "ELEVATE YOUR PERFORMANCE. WITH AI PRECISION." | Hero entrance animation reference |
| **Image 2** | Floating 3D program cards in a grid — "ENDLESS, ORGANIZED DATA STREAM." | Programs section parallax background |
| **Image 3** | Rotating geometric prisms around a glowing cyan heart — "INTELLIGENCE. KINETIC. CORE." | TJAI AI section visual |
| **Image 4** | T-shaped cyan human node network — "NEXUS" | Community / Footer CTA background |
| **Image 5** | Luminous cyan low-poly figure doing bicep curls with dumbbells | Hero right-column visual asset |
| **Image 6** | 3D glowing TJFIT logo — cyan neon letters "TJFIT" with TJ icon above it, polygon mesh background | New logo — replaces all existing SVG logos |

---

## STEP 0 — Asset setup (do this first)

1. Save all 6 attached images to `/public/assets/hero/` as:
   - `hero-anatomy.webp` (Image 1)
   - `hero-programs-bg.webp` (Image 2)
   - `hero-tjai-core.webp` (Image 3)
   - `hero-nexus.webp` (Image 4)
   - `hero-bicep-curl.webp` (Image 5)
   - `brand/logo-main.png` (Image 6)

   If saving as `.webp` is not possible, use `.png` with the same base names.

2. Add these keyframe animations to `src/app/globals.css` (append at the end):

```css
/* ── Redesign animations ─────────────────────────────── */

@keyframes scanline {
  0%   { transform: translateY(-100%); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}

@keyframes neuralPulse {
  0%, 100% { opacity: 0.4; filter: brightness(1); }
  50%       { opacity: 1;   filter: brightness(1.6) drop-shadow(0 0 12px rgba(34,211,238,0.8)); }
}

@keyframes floatY {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-14px); }
}

@keyframes floatYSlow {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}

@keyframes prismRotateCW {
  from { transform: rotateY(0deg) rotateZ(0deg); }
  to   { transform: rotateY(360deg) rotateZ(15deg); }
}

@keyframes prismRotateCCW {
  from { transform: rotateY(360deg) rotateZ(-15deg); }
  to   { transform: rotateY(0deg) rotateZ(0deg); }
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 20px rgba(34,211,238,0.5)); }
  15%       { transform: scale(1.08); filter: drop-shadow(0 0 40px rgba(34,211,238,0.9)); }
  30%       { transform: scale(0.97); }
  45%       { transform: scale(1.04); filter: drop-shadow(0 0 30px rgba(34,211,238,0.7)); }
}

@keyframes heartbeatFast {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 20px rgba(34,211,238,0.5)); }
  10%       { transform: scale(1.12); filter: drop-shadow(0 0 50px rgba(34,211,238,1)); }
  20%       { transform: scale(0.95); }
  30%       { transform: scale(1.06); filter: drop-shadow(0 0 38px rgba(34,211,238,0.85)); }
}

@keyframes nodeTravel {
  0%   { stroke-dashoffset: 1000; opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 0; }
}

@keyframes materialise {
  0%   { opacity: 0; clip-path: inset(100% 0 0 0); filter: brightness(2); }
  60%  { filter: brightness(1.3); }
  100% { opacity: 1; clip-path: inset(0% 0 0 0); filter: brightness(1); }
}

@keyframes glitchIn {
  0%   { opacity: 0; transform: translateX(-4px) skewX(-2deg); }
  20%  { opacity: 1; transform: translateX(3px) skewX(1deg); }
  40%  { transform: translateX(-2px); }
  60%  { transform: translateX(1px); }
  80%  { transform: translateX(-1px); }
  100% { opacity: 1; transform: translateX(0) skewX(0); }
}

@keyframes cyberLineExpand {
  from { width: 0; opacity: 0; }
  to   { width: 100%; opacity: 1; }
}

@keyframes logoReveal {
  0%   { opacity: 0; transform: scale(0.85) translateY(8px); filter: blur(8px) brightness(2); }
  60%  { filter: blur(0px) brightness(1.5); }
  100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0px) brightness(1); }
}

.animate-scanline       { animation: scanline 1.8s ease-in-out forwards; }
.animate-neural-pulse   { animation: neuralPulse 3s ease-in-out infinite; }
.animate-float          { animation: floatY 6s ease-in-out infinite; }
.animate-float-slow     { animation: floatYSlow 9s ease-in-out infinite; }
.animate-heartbeat      { animation: heartbeat 2.4s ease-in-out infinite; }
.animate-heartbeat-fast { animation: heartbeatFast 1.2s ease-in-out infinite; }
.animate-materialise    { animation: materialise 1.4s cubic-bezier(0.16,1,0.3,1) forwards; }
.animate-glitch-in      { animation: glitchIn 0.7s ease-out forwards; }
.animate-logo-reveal    { animation: logoReveal 1.1s cubic-bezier(0.16,1,0.3,1) forwards; }
```

---

## TASK 1 — New Logo with Entrance Animation

**Files:** `src/components/ui/Logo.tsx`, `src/components/site-nav.tsx`

### 1A — Update Logo component

Replace the existing Logo component to use the canonical PNG logo from `/public/brand/`:

```tsx
// In Logo.tsx — use the canonical brand asset:
const SRC = {
  icon: "/brand/logo-mark.png",
  full: "/brand/logo-main.png"
} as const;
```

Add a `animated` prop (boolean, default `false`). When `animated` is true and `variant === "3d"`, wrap the image in a `<span>` that applies `animate-logo-reveal` class on mount using a `useState` + `useEffect` (set after a 100ms delay to allow the DOM to settle).

The animation: the logo fades in from slightly scaled down and blurred, with a cyan `drop-shadow` glow that settles — matching the cinematic brand feel.

### 1B — Update site-nav.tsx

Find the Logo usage in the navbar. Change the `variant` prop to `"3d"` and add `animated={true}` only for the **first render** (use a sessionStorage flag so the entrance animation only plays on the very first page load per session, not on every navigation).

Keep all existing sizing props (`size="navbar"` etc.) unchanged — the new PNG scales exactly like the old SVGs.

---

## TASK 2 — Hero Section Redesign

**File:** `src/components/luxury/luxury-home.tsx`

### Goal
Transform the hero into a **Split Hero** — text on the LEFT, the luminous bicep curl figure (Image 5) on the RIGHT — with a cinematic entrance sequence.

### 2A — Hero layout

Locate the hero section in `luxury-home.tsx`. Restructure it as a CSS Grid with `lg:grid-cols-[1fr_1fr]`. On mobile: single column, text on top, image below at 80% width centered.

**Left column (text block):**
- Keep the existing headline and subtitle copy from the `HomeLuxuryCopy` i18n object — do NOT change the copy, just the layout.
- Add a thin `<div>` separator line below the headline that animates in using `animate-cyberLineExpand` (CSS keyframe defined above, 0.6s ease-out, 0.8s delay).
- The headline should have `animate-glitch-in` applied (0.7s, forwards).
- The CTA buttons stay exactly as-is.

**Right column (visual block):**
```tsx
<div className="relative flex items-center justify-center">
  {/* Ambient glow behind the figure */}
  <div
    className="pointer-events-none absolute inset-0 rounded-full opacity-30"
    style={{ background: "radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 70%)" }}
    aria-hidden
  />
  {/* The luminous figure — Image 5 */}
  <Image
    src="/assets/hero/hero-bicep-curl.webp"
    alt="TJFit AI Performance"
    width={600}
    height={600}
    priority
    className="relative z-10 w-full max-w-[500px] animate-materialise animate-float"
    style={{ filter: "drop-shadow(0 0 40px rgba(34,211,238,0.35))" }}
  />
</div>
```

Gate the `animate-float` on `!prefersReducedMotion` (use the existing `usePrefersReducedMotion` hook already in the file).

### 2B — Scanline entrance overlay

On first viewport mount (use `useInView` on the section ref), render a one-time scanline overlay over the **entire hero section**:

```tsx
{heroInView && !hasScanned && (
  <div
    className="pointer-events-none absolute inset-0 z-50 overflow-hidden"
    aria-hidden
    onAnimationEnd={() => setHasScanned(true)}
  >
    <div
      className="animate-scanline absolute left-0 h-[3px] w-full"
      style={{ background: "linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.8) 50%, transparent 100%)" }}
    />
  </div>
)}
```

`hasScanned` is a `useState(false)` that gates this so it only fires once.

---

## TASK 3 — Programs Section: Parallax Background

**File:** `src/components/luxury/luxury-home.tsx`

Locate the programs/marketplace section. Add Image 2 (`hero-programs-bg.webp`) as a **parallax background layer** behind the program cards.

### 3A — Parallax implementation

Use a `useRef` + `useEffect` with a scroll listener to compute `parallaxY`:

```tsx
const programsSectionRef = useRef<HTMLDivElement>(null);
const [parallaxY, setParallaxY] = useState(0);

useEffect(() => {
  const handler = () => {
    if (!programsSectionRef.current) return;
    const rect = programsSectionRef.current.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height / 2;
    const viewportCenter = window.innerHeight / 2;
    setParallaxY((sectionCenter - viewportCenter) * 0.18);
  };
  window.addEventListener("scroll", handler, { passive: true });
  return () => window.removeEventListener("scroll", handler);
}, []);
```

Apply to the background image:
```tsx
<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
  <Image
    src="/assets/hero/hero-programs-bg.webp"
    alt=""
    fill
    className="object-cover object-center opacity-[0.12]"
    style={{ transform: `translateY(${parallaxY}px)`, transition: "transform 0.1s linear" }}
  />
  {/* Dark gradient to blend the bg with the section */}
  <div className="absolute inset-0 bg-gradient-to-b from-[#09090B] via-transparent to-[#09090B]" />
</div>
```

Wrap the entire section in `ref={programsSectionRef}` and add `position: relative; overflow: hidden`.

### 3B — Card hover tilt effect

For each program card in the grid, wrap with this interactive tilt handler (no library — pure JS):

```tsx
function useTiltCard() {
  const ref = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) scale(1.02)`;
  };
  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
  };
  return { ref, handleMouseMove, handleMouseLeave };
}
```

Apply to each card: `ref`, `onMouseMove`, `onMouseLeave`. Add `transition: transform 0.2s ease-out` via inline style. Skip on touch devices (check `window.matchMedia("(hover: none)")`).

Also enhance card borders on hover: add `hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]` Tailwind classes to the card wrapper, with `transition-[border-color,box-shadow] duration-300`.

---

## TASK 4 — TJAI Section: Kinetic Heart Core

**File:** `src/components/luxury/luxury-home.tsx` (or wherever the TJAI feature section lives — check for any section that describes the AI coaching feature)

Find or create a section that highlights TJAI AI. If one already exists, enhance it. If not, add it between the programs section and the community section.

### Layout

Two-column on desktop (lg+), single column on mobile:
- **Left**: Image 3 (`hero-tjai-core.webp`) — the rotating prism heart visual
- **Right**: Text — headline, subtitle, feature list, CTA

### Visual implementation

```tsx
<div className="relative flex items-center justify-center">
  {/* Outer slow-rotating ring overlay */}
  <div
    className="pointer-events-none absolute h-[420px] w-[420px] rounded-full border border-cyan-400/10 opacity-60"
    style={{ animation: "prismRotateCW 20s linear infinite" }}
    aria-hidden
  />
  <div
    className="pointer-events-none absolute h-[320px] w-[320px] rounded-full border border-violet-400/10 opacity-40"
    style={{ animation: "prismRotateCCW 14s linear infinite" }}
    aria-hidden
  />
  {/* The core heart image */}
  <Image
    src="/assets/hero/hero-tjai-core.webp"
    alt="TJAI Intelligence Core"
    width={500}
    height={500}
    className={cn(
      "relative z-10 w-full max-w-[420px]",
      isAiTyping ? "animate-heartbeat-fast" : "animate-heartbeat"
    )}
    style={{ filter: "drop-shadow(0 0 30px rgba(34,211,238,0.4))" }}
  />
</div>
```

`isAiTyping` should be a prop or context value — if you have access to the TJAI chat state, wire it up. Otherwise default to `false` (the normal heartbeat).

The `prismRotateCW` and `prismRotateCCW` keyframes are defined in globals.css above.

### Text block

Use the existing TJAI copy from the i18n system. If no dedicated TJAI section copy exists, add minimal copy directly (no new i18n keys needed):
- Label: `"TJAI • AI COACHING ENGINE"`
- Headline: From existing `copy.aiTitle` or `copy.heroTitle` — whatever maps to the AI section
- Feature list: 3 items with cyan checkmarks
- CTA: Link to `/{locale}/ai`

---

## TASK 5 — Nexus Section: Community CTA with Node Particles

**File:** `src/components/luxury/luxury-home.tsx`

Find the community CTA section near the bottom of the homepage (the "Join the community" / "Find coaches" block). Enhance it with Image 4 as background and an SVG node-travel particle effect.

### Background

```tsx
<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
  <Image
    src="/assets/hero/hero-nexus.webp"
    alt=""
    fill
    className="object-cover object-center opacity-[0.10]"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-[#09090B]" />
</div>
```

### SVG Particle network (pure CSS, no library)

Below the background image, add a hidden SVG overlay that animates 4–6 "node lines" using `stroke-dashoffset` animation:

```tsx
<svg
  className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
  aria-hidden
  preserveAspectRatio="xMidYMid slice"
  viewBox="0 0 1200 600"
>
  {/* Example node paths — adjust d values to approximate the T-network shape */}
  {[
    "M 600 550 L 600 300 L 300 100",
    "M 600 300 L 900 100",
    "M 600 300 L 200 200",
    "M 600 300 L 1000 200",
    "M 600 550 L 400 480",
    "M 600 550 L 800 480",
  ].map((d, i) => (
    <path
      key={i}
      d={d}
      fill="none"
      stroke="#22D3EE"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeDasharray="1000"
      strokeDashoffset="1000"
      style={{
        animation: `nodeTravel ${3 + i * 0.7}s ease-in-out ${i * 0.5}s infinite`,
      }}
    />
  ))}
  {/* Node dots */}
  {[
    [600, 550], [600, 300], [300, 100], [900, 100],
    [200, 200], [1000, 200], [400, 480], [800, 480]
  ].map(([cx, cy], i) => (
    <circle
      key={i}
      cx={cx}
      cy={cy}
      r="4"
      fill="#22D3EE"
      opacity="0.6"
      style={{ animation: `neuralPulse ${2 + i * 0.3}s ease-in-out ${i * 0.2}s infinite` }}
    />
  ))}
</svg>
```

Trigger this SVG only when the section is in view (use `useInView` with `threshold: 0.2`).

---

## TASK 6 — Logo Entrance Animation in Navbar

**File:** `src/components/site-nav.tsx`

The navbar already uses the `<Logo>` component. After updating Logo.tsx in Task 1, ensure:

1. On the **homepage only** (check `usePathname()` — if it ends with the locale slug e.g. `/en`, `/tr`), the logo in the navbar plays `animate-logo-reveal` once.
2. On all other pages, show the logo without animation (instant, no flash).
3. The animated version adds a brief cyan glow ring that fades: wrap the logo in a `<span className="relative">` and add a sibling `<span>` that starts with `opacity-60 ring-2 ring-cyan-400/40 rounded-full scale-110` and transitions to `opacity-0 scale-125` over 1.5s using CSS `transition`.

Also: remove any hardcoded references to legacy logo files from the navbar — the canonical brand PNG should be the only logo shown at `size="navbar"`.

---

## TASK 7 — Mobile Responsiveness

Across all sections modified above:

- Hero split: on `< lg` screens, stack vertically. Image comes **below** the text, max-width 80% centered.
- Tilt effect on program cards: disabled on touch devices.
- Scanline overlay: also runs on mobile.
- TJAI core visual: on mobile, the image is centered, max-width 300px.
- Nexus SVG particles: on mobile, scale the SVG viewBox to be visible (use `preserveAspectRatio="xMidYMid slice"`).
- Logo animation: plays on all screen sizes.
- Parallax on programs: disable on mobile (skip the scroll listener if `window.innerWidth < 768`).

---

## TASK 8 — Performance

1. All new `<Image>` tags must use `next/image` (not `<img>`).
2. Add `priority` only to the hero images (Image 1 and Image 5). All others use default lazy loading.
3. Wrap all new animation-heavy sections in a check: `if (prefersReducedMotion)` → skip float/tilt/parallax, show static layout with the images still visible.
4. All new scroll/mouse event listeners must be registered with `{ passive: true }` and cleaned up in the `useEffect` return.
5. Intersection Observer triggers: use the existing `useInView` hook already in the codebase (`src/hooks/useInView.ts`).

---

## General rules — DO NOT violate

- **Never** use `select("*")` in any Supabase queries you might touch.
- **Never** add new Supabase tables or migrations.
- **Never** break RTL layout — all flex/grid directions must respect `dir="rtl"` for Arabic locale.
- **Never** add external CSS frameworks or CDN links — Tailwind utility classes + `globals.css` keyframes only.
- **TypeScript strict** — no implicit `any`, no unused imports.
- The background color for all new sections must be `#09090B` or `var(--color-bg)` — no white, no light grays.
- Run `npx tsc --noEmit` after all changes — must compile with zero errors.
- Start with Task 0 (asset setup + CSS keyframes), then Task 1 (logo), then Tasks 2–6 in order, then Task 7 (mobile pass), then Task 8 (performance pass).
