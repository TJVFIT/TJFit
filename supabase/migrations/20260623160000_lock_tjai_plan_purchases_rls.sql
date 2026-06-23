-- Security fix: tjai_plan_purchases is the entitlement gate for paid TJAI
-- features (the /ai app, chat, PDF export, meal-prep, swap-meal, grocery-list,
-- TTS all check "does a row exist for this user").
--
-- The previous policy ("Users own purchases", FOR ALL, WITH CHECK
-- auth.uid() = user_id) let any authenticated user INSERT their own row via
-- the public REST API, self-granting paid access without paying.
--
-- All legitimate writes go through the service role (Gumroad webhook,
-- generate-pdf update) or the SECURITY DEFINER credit-consume RPC — none use
-- the user's RLS-bound client — so restricting users to SELECT-only breaks
-- nothing. The /ai page reads own purchases via the user client, so SELECT
-- must remain.

drop policy if exists "Users own purchases" on public.tjai_plan_purchases;

create policy "Users read own purchases"
  on public.tjai_plan_purchases
  for select
  to public
  using (auth.uid() = user_id);
