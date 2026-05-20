#!/usr/bin/env node
/**
 * Generates 12 SVG bundle hero placeholders into /public/bundles/.
 * On-brand cyan/blue/black gradients with a faded watermark numeral
 * and goal label. ~1KB per file.
 *
 * Run: node scripts/generate-bundle-heroes.mjs
 * Owner can swap any .svg for a real .webp later — bundles.ts will pick
 * up whichever filename the heroImage field points at.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "bundles");
mkdirSync(OUT_DIR, { recursive: true });

/**
 * Each hero is the same template with a unique gradient angle (so the cards
 * read as a family but each card has its own light direction) and a unique
 * watermark numeral 01–12.
 */
const BUNDLES = [
  { n: "01", slug: "fat-loss", label: "FAT LOSS", angle: 25 },
  { n: "02", slug: "lean-bulk", label: "LEAN BULK", angle: 60 },
  { n: "03", slug: "home-starter", label: "HOME STARTER", angle: 95 },
  { n: "04", slug: "definition", label: "DEFINITION", angle: 130 },
  { n: "05", slug: "recomp", label: "RECOMP", angle: 165 },
  { n: "06", slug: "powerbuilding", label: "POWERBUILDING", angle: 200 },
  { n: "07", slug: "calisthenics", label: "CALISTHENICS", angle: 235 },
  { n: "08", slug: "athlete-conditioning", label: "CONDITIONING", angle: 270 },
  { n: "09", slug: "beginner-foundations", label: "FOUNDATIONS", angle: 305 },
  { n: "10", slug: "womens-sculpt", label: "SCULPT", angle: 340 },
  { n: "11", slug: "senior-strength", label: "LIFELONG", angle: 15 },
  { n: "12", slug: "cutting-peak", label: "PEAK", angle: 50 }
];

function svg({ n, label, angle }) {
  const a = (angle * Math.PI) / 180;
  const x1 = 0.5 - 0.5 * Math.cos(a);
  const y1 = 0.5 - 0.5 * Math.sin(a);
  const x2 = 0.5 + 0.5 * Math.cos(a);
  const y2 = 0.5 + 0.5 * Math.sin(a);
  // Stagger each bundle's beam sweep so a grid of cards doesn't pulse in lockstep.
  const beamDelay = (parseInt(n, 10) % 6) * 0.9;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
  <style>
    @keyframes tj-bundle-beam { 0% { transform: translateX(-1100px); } 100% { transform: translateX(2200px); } }
    @keyframes tj-bundle-numeral { 0%, 100% { opacity: 0.13; } 50% { opacity: 0.20; } }
    .tj-beam { animation: tj-bundle-beam 9s linear ${beamDelay}s infinite; }
    .tj-numeral { animation: tj-bundle-numeral 4.5s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) {
      .tj-beam, .tj-numeral { animation: none; }
      .tj-beam { display: none; }
    }
  </style>
  <defs>
    <linearGradient id="g" x1="${x1.toFixed(3)}" y1="${y1.toFixed(3)}" x2="${x2.toFixed(3)}" y2="${y2.toFixed(3)}">
      <stop offset="0" stop-color="#080809"/>
      <stop offset="0.55" stop-color="#0c2730"/>
      <stop offset="1" stop-color="#0e7490"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.8" cy="0.2" r="0.7">
      <stop offset="0" stop-color="rgba(34,211,238,0.18)"/>
      <stop offset="1" stop-color="rgba(34,211,238,0)"/>
    </radialGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="rgba(34,211,238,0)"/>
      <stop offset="0.4" stop-color="rgba(34,211,238,0.22)"/>
      <stop offset="0.5" stop-color="rgba(165,243,252,0.42)"/>
      <stop offset="0.6" stop-color="rgba(34,211,238,0.22)"/>
      <stop offset="1" stop-color="rgba(34,211,238,0)"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.035)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="800" height="500" fill="url(#g)"/>
  <rect width="800" height="500" fill="url(#glow)"/>
  <rect width="800" height="500" fill="url(#grid)"/>
  <g class="tj-beam" transform="skewX(-12)">
    <rect x="-50" y="0" width="200" height="500" fill="url(#beam)" />
  </g>
  <text class="tj-numeral" x="40" y="380" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="280" fill="rgba(34,211,238,0.13)" letter-spacing="-12">${n}</text>
  <text x="44" y="448" font-family="system-ui,-apple-system,sans-serif" font-weight="700" font-size="20" fill="rgba(255,255,255,0.72)" letter-spacing="6">${label}</text>
  <text x="44" y="472" font-family="system-ui,-apple-system,sans-serif" font-weight="500" font-size="11" fill="rgba(165,243,252,0.55)" letter-spacing="3">TJFIT · BUNDLE</text>
</svg>`;
}

for (const b of BUNDLES) {
  const path = join(OUT_DIR, `${b.slug}.svg`);
  writeFileSync(path, svg(b), "utf8");
  console.log(`wrote ${b.slug}.svg`);
}

console.log(`\n✓ ${BUNDLES.length} bundle heroes generated → public/bundles/`);
