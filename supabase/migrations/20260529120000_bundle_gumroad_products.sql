-- Bundle → Gumroad product mapping, managed from the admin dashboard
-- (/api/admin/bundles/gumroad). Replaces the env-only GUMROAD_PRODUCT_<SLUG>
-- approach so the owner can link products without a redeploy.
--
-- Applied to prod 2026-05-29 via Supabase MCP.

CREATE TABLE IF NOT EXISTS bundle_gumroad_products (
  slug         text PRIMARY KEY,
  product_id   text,
  short_url    text NOT NULL,
  price_cents  integer,
  published    boolean NOT NULL DEFAULT false,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bundle_gumroad_products ENABLE ROW LEVEL SECURITY;

-- No policy: read/written only by service-role server code (checkout URL
-- resolver + admin API). Service role bypasses RLS; the anon/authenticated
-- client is denied by default. Customers never read this table.
COMMENT ON TABLE bundle_gumroad_products IS 'Maps bundle slug -> Gumroad product short_url. Managed via /api/admin/bundles/gumroad. Service-role only.';
