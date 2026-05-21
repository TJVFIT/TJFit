-- Seed the preset community groups once via migration.
--
-- The /api/community/groups GET endpoint previously called
-- `upsert(PRESET_GROUPS)` on every request — 11 row writes per page load.
-- Moving the seed to a migration runs it once at deploy and lets the
-- route stay read-only.

insert into community_groups (slug, name, description)
values
  ('fat-loss-gang',     'Fat Loss Gang',     'Goal-focused fat loss group.'),
  ('bulk-season',       'Bulk Season',       'Muscle gain accountability group.'),
  ('home-warriors',     'Home Warriors',     'Home training members.'),
  ('gym-rats',          'Gym Rats',          'Gym-focused athletes.'),
  ('beginners',         'Beginners',         'Starter-friendly progress group.'),
  ('advanced-athletes', 'Advanced Athletes', 'Experienced training group.'),
  ('en-community',      'EN Community',      'English community feed.'),
  ('tr-community',      'TR Community',      'Turkish community feed.'),
  ('ar-community',      'AR Community',      'Arabic community feed.'),
  ('es-community',      'ES Community',      'Spanish community feed.'),
  ('fr-community',      'FR Community',      'French community feed.')
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description;
