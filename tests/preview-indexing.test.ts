import type { NextConfig } from "next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import robots from "@/app/robots";

vi.mock("@sentry/nextjs", () => ({
  withSentryConfig: (config: NextConfig) => config
}));

// @ts-expect-error Next's ESM build config intentionally has no TypeScript declaration.
import nextConfig from "../next.config.mjs";

const config = nextConfig as NextConfig;

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("CONTEXT", undefined);
  vi.stubEnv("VERCEL_ENV", undefined);
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://tjfit.org");
});

afterEach(() => vi.unstubAllEnvs());

async function siteHeaders() {
  const rules = await config.headers!();
  const rule = rules.find((entry) => entry.source === "/:path*");
  expect(rule).toBeDefined();
  return rule!.headers;
}

describe("preview indexing protection", () => {
  it.each([
    ["Netlify branch deploy", "CONTEXT", "branch-deploy"],
    ["Netlify deploy preview", "CONTEXT", "deploy-preview"],
    ["Vercel preview", "VERCEL_ENV", "preview"]
  ])("prevents indexing every response for %s", async (_label, key, value) => {
    vi.stubEnv(key, value);
    const headers = await siteHeaders();
    expect(headers).toContainEqual({ key: "X-Robots-Tag", value: "noindex, nofollow" });
    expect(headers).toContainEqual({ key: "X-Content-Type-Options", value: "nosniff" });
    // Allow crawling so engines can see noindex, without publishing a preview sitemap.
    expect(robots()).toEqual({ rules: { userAgent: "*", allow: "/" } });
  });

  it.each([
    ["Netlify production", "CONTEXT", "production"],
    ["Vercel production", "VERCEL_ENV", "production"],
    ["ordinary production build", "CONTEXT", undefined],
    ["local development context", "CONTEXT", "dev"]
  ])("preserves production indexing for %s", async (_label, key, value) => {
    vi.stubEnv(key, value);
    expect((await siteHeaders()).some((header) => header.key === "X-Robots-Tag")).toBe(false);
    const output = robots();
    expect(output.sitemap).toBe("https://tjfit.org/sitemap.xml");
    expect(output.rules).toMatchObject({ allow: "/" });
    expect(output.rules).toMatchObject({ disallow: expect.arrayContaining(["/api/", "/*/checkout"]) });
  });

  it("keeps a Netlify preview blocked when copied Vercel metadata says production", async () => {
    vi.stubEnv("CONTEXT", "branch-deploy");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(await siteHeaders()).toContainEqual({ key: "X-Robots-Tag", value: "noindex, nofollow" });
    expect(robots().sitemap).toBeUndefined();
  });
});
