# TJFit — SEO Report (2026-06-10)

## Verified healthy (live + code)

| Area | State |
|---|---|
| `metadataBase` | Set in `src/app/layout.tsx` with `https://tjfit.org` fallback — canonical/OG URLs resolve absolutely |
| OpenGraph + Twitter cards | Wired site-wide with `/og-image.jpg`; social sharing previews work |
| robots.txt | 200 live; `allow: /`, sensible disallows (`/coming-soon`, app-internal areas), sitemap reference — no deindex risk |
| sitemap.xml | 200 live; all public routes × 5 locales + bundle detail pages |
| Structured data | Organization JSON-LD (`brand-organization-json-ld.tsx`) |
| Locale routing | Root `/` 308 → `/en`; 5 locales (en/tr/ar/es/fr) with parity-checked dictionaries; RTL handled for `ar` |
| Security/trust signals | HTTPS + HSTS, no mixed content (image hosts pinned) |
| Coming-soon sections | `/live`, `/store` robots-disallowed — won't index placeholder content |
| Hreflang + canonicals | **Verified in code** (`[locale]/layout.tsx:51-69`): per-locale self-referencing canonical, `alternates.languages` for all 5 locales + `x-default → /en`; bundle pages emit their own per-page alternates |

## Recommendations (ranked)

1. **Schema depth (Medium):** add `Product` (bundles), `FAQPage` (support),
   and `Article` (blog) JSON-LD once prices are real — Product schema with a
   $0 price would do more harm than good today, so sequence it after pricing.
2. **Internal linking (Medium):** programs ↔ bundles ↔ TJAI cross-links exist;
   add blog → program contextual links as content grows (largest organic
   compounding loop).
3. **Search Console (Owner, 10 min):** verify property + submit sitemap if not
   already done; needed to monitor the locale rollout.
4. **AI-search readiness (Low):** content is server-rendered and crawlable —
   no blocker; revisit after launch content push.

No critical SEO defects found.
