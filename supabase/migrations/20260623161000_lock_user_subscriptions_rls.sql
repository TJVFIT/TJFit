-- Security fix: user_subscriptions.tier is THE entitlement source for the paid
-- Pro/Apex tiers — src/lib/tjai-access.ts derives isPro/isApex from it and gates
-- chat, meal-swap, plan regeneration, coach review, daily meal email, etc.
--
-- The "Users own subscriptions" policy (FOR ALL, auth.uid() = user_id) let any
-- authenticated user upsert their own row to tier='apex', status='active' via
-- the public REST API — self-granting the top paid tier for free.
--
-- A separate SELECT policy ("user_subscriptions_read_own") already covers the
-- legitimate read (the /ai page reads tier via the user client). All writes are
-- service-role (Gumroad webhook, trial routes via adminClient) and bypass RLS.
-- So dropping the ALL policy closes the exploit and breaks nothing.

drop policy if exists "Users own subscriptions" on public.user_subscriptions;
