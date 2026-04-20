# Catalog expansion — 30 programs + 30 diets (sale-ready)

## Reality check

TJFit today ships a **large static catalog** in `src/lib/content.ts` (programs include many nutrition-forward items). “30 unique programs + 30 unique diets” is a **content + commerce** project, not a single codegen button.

Goals:

- **Unique** slugs and titles vs existing `programs[].slug`
- **Premium structure** aligned with `Program` type (assets, pricing, coach)
- **Legal / medical** safe descriptions
- **Database** if checkout expects rows — today many flows read static slugs; confirm `program_orders` / checkout paths before moving catalog-only to DB.

## Recommended pipeline

1. **Inventory** — export all `slug` + `title` from `content.ts` to a CSV.
2. **Authoring** — human + AI-assisted drafts in a spreadsheet with columns matching `Program`.
3. **Dedup** — script fails CI if any new `slug` or normalized `title` collides with CSV.
4. **Review** — coach + legal pass on claims (“guaranteed”, medical language, etc.).
5. **Import** — append to `content.ts` *or* migrate to `catalog_products` table + sync layer for search (fix `search` route diets source when ready).
6. **QA** — program detail pages, checkout, PDFs if applicable.

## Uniqueness check (sketch)

```bash
# Example direction — implement when executing expansion
node scripts/check-catalog-unique.mjs
```

Script should normalize titles (lowercase, strip punctuation) and assert **no collisions**.

## Why not auto-insert 60 rows here

Blind generation risks **duplicate positioning**, **unsafe copy**, and **checkout mismatch**. This doc is the contract for a controlled content sprint.
