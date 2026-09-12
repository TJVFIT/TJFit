import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BLOG_CATEGORIES, BLOG_EDITOR_COPY } from "@/lib/blog-editor-copy";
import { scanSource } from "../scripts/i18n/check-hardcoded-ui";

describe("localized blog editor", () => {
  it.each(["en", "tr", "ar", "es", "fr"] as const)("%s supplies every label while preserving API category values", (locale) => {
    const copy = BLOG_EDITOR_COPY[locale];
    expect(Object.keys(copy).sort()).toEqual(Object.keys(BLOG_EDITOR_COPY.en).sort());
    expect(Object.keys(copy.categories)).toEqual([...BLOG_CATEGORIES]);
    for (const value of Object.values(copy)) {
      if (typeof value === "string") expect(value.trim()).not.toBe("");
    }
    if (locale !== "en") {
      expect(copy.tags).not.toBe(BLOG_EDITOR_COPY.en.tags);
      expect(copy.failed).not.toBe(BLOG_EDITOR_COPY.en.failed);
    }
  });

  it("renders all editor copy through its locale map", () => {
    const source = readFileSync("src/app/[locale]/blog/write/page.tsx", "utf8");
    expect(scanSource(source)).toEqual([]);
    expect(source).toContain("value={value}>{copy.categories[value]}");
  });
});
