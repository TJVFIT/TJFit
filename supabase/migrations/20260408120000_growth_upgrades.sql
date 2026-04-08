-- Growth upgrades: newsletter, flash sales, bundle upsell.
-- Safe to run multiple times.

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  source text DEFAULT 'homepage'
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'newsletter_subscribers'
      AND policyname = 'Public can subscribe'
  ) THEN
    CREATE POLICY "Public can subscribe"
      ON public.newsletter_subscribers
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'newsletter_subscribers'
      AND policyname = 'Users manage own subscription'
  ) THEN
    CREATE POLICY "Users manage own subscription"
      ON public.newsletter_subscribers
      FOR UPDATE
      USING (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.flash_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_amount numeric NOT NULL,
  applies_to text NOT NULL DEFAULT 'all',
  specific_item_ids uuid[],
  banner_message text,
  paddle_coupon_code text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_active boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'flash_sales'
      AND policyname = 'Public reads active sales'
  ) THEN
    CREATE POLICY "Public reads active sales"
      ON public.flash_sales
      FOR SELECT
      USING (is_active = true AND ends_at > NOW());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'flash_sales'
      AND policyname = 'Admins manage flash sales'
  ) THEN
    CREATE POLICY "Admins manage flash sales"
      ON public.flash_sales
      FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM public.profiles
          WHERE id = auth.uid()
            AND role = 'admin'
        )
      );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.bundle_upsell_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL,
  suggested_diet_id uuid NOT NULL,
  upsell_discount_eur numeric DEFAULT 5,
  is_active boolean DEFAULT true,
  UNIQUE(program_id)
);

ALTER TABLE public.bundle_upsell_suggestions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bundle_upsell_suggestions'
      AND policyname = 'Public reads upsells'
  ) THEN
    CREATE POLICY "Public reads upsells"
      ON public.bundle_upsell_suggestions
      FOR SELECT
      USING (is_active = true);
  END IF;
END $$;
