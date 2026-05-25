-- Persist the user's chosen locale on each program order so post-purchase
-- delivery (PDF, emails) can honor it even after the Gumroad round-trip.
alter table program_orders add column if not exists locale text not null default 'en';
