import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "src");
const TARGET_DIRS = [path.join(ROOT, "app"), path.join(ROOT, "components")];
const FILE_EXTENSIONS = new Set([".tsx", ".ts"]);

const allowPatterns: RegExp[] = [
  /^use client$/,
  /^use server$/,
  /^https?:\/\//,
  /^\/[a-z\-\/\[\]]*$/i,
  /^[A-Z0-9_:-]+$/,
  /^[a-z0-9_\-:/.]+$/,
  /^#[0-9a-f]{3,8}$/i,
  /^([A-Z][a-z]+){1,}$/,
  /^[@{}()[\].,;:+\-*/\\|&!?<>=~`'"]+$/,
  /^$/
];

const literalRegex = /"([^"\n]{3,})"|'([^'\n]{3,})'/g;
const suspiciousAlphaRegex = /[A-Za-z]{3,}/;

function walk(dir: string, out: string[]) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const filePath = path.join(dir, item.name);
    if (item.isDirectory()) {
      walk(filePath, out);
      continue;
    }
    if (FILE_EXTENSIONS.has(path.extname(item.name))) {
      out.push(filePath);
    }
  }
}

function shouldIgnoreLiteral(value: string) {
  const trimmed = value.trim();
  if (!suspiciousAlphaRegex.test(trimmed)) return true;
  return allowPatterns.some((re) => re.test(trimmed));
}

function isLikelyUIContext(line: string) {
  return (
    line.includes("<") ||
    line.includes("placeholder=") ||
    line.includes("title=") ||
    line.includes("aria-label=") ||
    line.includes("setError(") ||
    line.includes("toast") ||
    line.includes("label")
  );
}

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const hits: Array<{ line: number; text: string }> = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!isLikelyUIContext(line)) continue;

    for (const match of line.matchAll(literalRegex)) {
      const raw = (match[1] ?? match[2] ?? "").trim();
      const start = match.index ?? 0;
      const prefix = line.slice(Math.max(0, start - 24), start);
      if (
        prefix.includes("className=") ||
        prefix.includes("href=") ||
        prefix.includes("src=") ||
        prefix.includes("import ") ||
        prefix.includes("from ")
      ) {
        continue;
      }
      if (!raw || shouldIgnoreLiteral(raw)) continue;
      hits.push({ line: i + 1, text: raw });
    }
  }

  return hits;
}

function main() {
  const files: string[] = [];
  for (const dir of TARGET_DIRS) {
    if (fs.existsSync(dir)) walk(dir, files);
  }

  const violations: Array<{ file: string; line: number; text: string }> = [];

  for (const file of files) {
    const hits = scanFile(file);
    for (const hit of hits) {
      violations.push({
        file: path.relative(process.cwd(), file),
        line: hit.line,
        text: hit.text
      });
    }
  }

  if (violations.length === 0) {
    console.log("i18n hardcoded UI scan passed.");
    return;
  }

  console.error("Found potential hardcoded UI strings:");
  for (const v of violations) {
    console.error(`- ${v.file}:${v.line} -> "${v.text}"`);
  }
  process.exitCode = 1;
}

main();

