import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "src", "app");
const localeDirName = fs.readdirSync(ROOT).find((n) => n === "[locale]");
if (!localeDirName) {
  console.error("missing src/app/[locale]");
  process.exit(1);
}

const LOCALE_ROOT = path.join(ROOT, localeDirName);

const excludeTop = new Set([
  "press",
  "podcast",
  "affiliate",
  "become-a-coach",
  "terms-and-conditions",
  "refund-policy",
  "privacy-policy",
  "pro",
  "start",
  "store",
  "bundles",
  "challenges",
  "membership"
]);

function topSegment(relUnix) {
  const m = relUnix.match(/\[locale\]\/([^/]+)/);
  return m?.[1] ?? "";
}

function pagePathExcluded(relUnix) {
  if (relUnix.endsWith("[locale]/page.tsx")) return true;
  const top = topSegment(relUnix);
  if (top === "legal") return true;
  if (excludeTop.has(top)) return true;
  return false;
}

const pages = [];
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name === "page.tsx") pages.push(p);
  }
}
walk(LOCALE_ROOT);

const targets = [];
for (const abs of pages) {
  const rel = path.relative(process.cwd(), abs).replace(/\\/g, "/");
  if (pagePathExcluded(rel)) continue;
  const segmentDir = path.dirname(abs);
  targets.push({ abs: segmentDir, rel: path.relative(process.cwd(), segmentDir).replace(/\\/g, "/") });
}

/** Dedupe segment dirs */
const uniq = new Map();
for (const t of targets) uniq.set(t.rel, t.abs);
const dirs = [...uniq.entries()].sort((a, b) => a[0].localeCompare(b[0]));

function depthToLocale(segmentDirAbs) {
  const rel = path.relative(LOCALE_ROOT, segmentDirAbs).replace(/\\/g, "/");
  if (!rel || rel === ".") return 0;
  return rel.split("/").filter(Boolean).length;
}

const written = [];

for (const [relDir, absDir] of dirs) {
  const depth = depthToLocale(absDir);
  const prefix = "../".repeat(depth);
  const loadingBody = `export { default } from "${prefix}loading";\n`;
  const errorBody = `"use client";

export { default } from "${prefix}error";
`;

  const loadPath = path.join(absDir, "loading.tsx");
  const errPath = path.join(absDir, "error.tsx");

  fs.writeFileSync(loadPath, loadingBody, "utf8");
  fs.writeFileSync(errPath, errorBody, "utf8");
  written.push(relDir);
}

console.log(JSON.stringify({ segmentFolders: dirs.length, written: written.length, paths: written }, null, 2));
