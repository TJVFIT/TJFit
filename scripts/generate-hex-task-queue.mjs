import fs from "node:fs";
import path from "node:path";

const HEX = /#[0-9a-fA-F]{3,8}\b/;
const SRC = path.join(process.cwd(), "src");

const files = [];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules") continue;
      walk(p);
    } else if (/\.(tsx|ts|css)$/.test(ent.name)) {
      try {
        const t = fs.readFileSync(p, "utf8");
        if (HEX.test(t)) files.push(p);
      } catch {
        /* skip */
      }
    }
  }
}
walk(SRC);

const rel = (abs) => path.relative(process.cwd(), abs).replace(/\\/g, "/");

const all = files.map(rel).sort();

const skipCursor = (f) => f.startsWith("src/app/api/");
const libTask = (f) => f.startsWith("src/lib/");

const libFiles = all.filter(libTask);
const apiFiles = all.filter(skipCursor);

/** Group by component/app family: first two segments under src/components/X or src/app/... */
function clusterKey(p) {
  if (p.startsWith("src/components/")) {
    const parts = p.split("/");
    const top = parts[2] ?? "misc";
    const sub = parts[3] && !parts[3].endsWith(".tsx") && !parts[3].endsWith(".ts") ? parts[3] : "";
    return sub ? `components/${top}/${sub}` : `components/${top}`;
  }
  if (p.startsWith("src/app/")) {
    const parts = p.split("/");
    return `app/${parts.slice(2, 5).join("/")}`;
  }
  return "src-other";
}

const cursorFiles = all.filter((f) => !skipCursor(f) && !libTask(f) && f !== "src/components/home/hero-section.tsx");

const byCluster = new Map();
for (const f of cursorFiles) {
  const k = clusterKey(f);
  if (!byCluster.has(k)) byCluster.set(k, []);
  byCluster.get(k).push(f);
}
for (const v of byCluster.values()) v.sort();

/** Flatten: clusters ordered alphabetically; within cluster, alphabetical */
const ordered = [];
for (const k of [...byCluster.keys()].sort()) {
  ordered.push(...byCluster.get(k));
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const CLUSTER_SIZE = 5;
const chunks = chunk(ordered, CLUSTER_SIZE);

let n = 3;
const written = [];

for (const group of chunks) {
  const num = String(n).padStart(4, "0");
  const slugHint = group[0]
    .replace(/^src\//, "")
    .replace(/\.(tsx|ts|css)$/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 56);
  const slug = `${num}-hex-${slugHint}`;

  const title = `${num} — Remove arbitrary hex (${slugHint})`;
  const body = `# ${title}

## Problem

Audit pass 2 lists raw \`#RRGGBB\` / hex literals in bundled UI. Replace with Tailwind theme tokens, shared palette (\`TJ_PALETTE\`), or a single-line exception for non-brand mask colors.

## Allowlist (max ${CLUSTER_SIZE} paths)

${group.map((p) => `- \`${p}\``).join("\n")}

## Acceptance criteria

- [ ] No remaining arbitrary hex in allowlisted paths (project token rules). Mask \`#000\` gradients may remain with brief comment.
- [ ] \`npm run build\` and \`npm run lint\` pass.

## Report

(Filled when done: branch, PR link, commit SHA, notes)
`;

  const fn = path.join(process.cwd(), "ai-tasks", "cursor", "inbox", `${slug}.md`);
  fs.mkdirSync(path.dirname(fn), { recursive: true });
  fs.writeFileSync(fn, body, "utf8");
  written.push(fn);
  n += 1;
}

const pass2 = `# AUDIT PASS 2 — Hex literal snapshot

Date: 2026-05-08

Branch context: \`auto/cursor/audit-pass2-queue\` (continues from 0001).

## Definition of “clean” (steady state)

Every hex finding has a **destination**: open PR, inbox task, Codex task, or documented exception. The audit is steady when the queue fully lists findings—not when every line is already tokenized.

## Summary

- **Total \`src\` files matching hex pattern:** ${all.length}
- **Cursor inbox tasks generated (≤5 paths each, cluster-grouped):** ${chunks.length} (numbered from \`0003\`)
- **Excluded from this queue:** \`hero-section\` (0001; mask \`#000\`), \`src/lib/*\`, \`src/app/api/*\`

## Exceptions / referrals

- \`src/components/home/hero-section.tsx\` — 0001 report; mask \`#000\` only.
- **Lib (${libFiles.length}):** ${libFiles.map((f) => `\`${f}\``).join(", ") || "_none_"}
- **API (${apiFiles.length}):** ${apiFiles.map((f) => `\`${f}\``).join(", ") || "_none_"}

## Task index

${written.map((f) => `- \`${path.relative(process.cwd(), f).replace(/\\/g, "/")}\``).join("\n")}
`;

const pass2Path = path.join(process.cwd(), "ai-tasks", "cursor", "done", `AUDIT-PASS-2-hex-snapshot.md`);
fs.mkdirSync(path.dirname(pass2Path), { recursive: true });
fs.writeFileSync(pass2Path, pass2, "utf8");

console.log(JSON.stringify({ cursorTasks: written.length, pass2Path, totalHexFiles: all.length }, null, 2));
