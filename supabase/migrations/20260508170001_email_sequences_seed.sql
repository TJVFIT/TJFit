insert into email_sequences (name, trigger_event, is_active)
values
  ('onboarding', 'signup', true),
  ('trial_expiry', 'trial_start', true),
  ('reengagement', 'inactive_7_days', true)
on conflict (name) do update
set trigger_event = excluded.trigger_event,
    is_active = excluded.is_active;

with seq as (
  select id, name from email_sequences where name in ('onboarding', 'trial_expiry', 'reengagement')
),
steps(sequence_name, step_order, delay_hours, template_key, subject_key) as (
  values
    ('onboarding', 1, 0, 'welcome', 'welcome'),
    ('onboarding', 2, 24, 'first_program_nudge', 'first_program_nudge'),
    ('onboarding', 3, 72, 'tip_progressive_overload', 'tip_progressive_overload'),
    ('onboarding', 4, 168, 'week_one_check_in', 'week_one_check_in'),
    ('onboarding', 5, 336, 'tjai_intro', 'tjai_intro'),
    ('onboarding', 6, 720, 'one_month_progress', 'one_month_progress'),
    ('trial_expiry', 1, 0, 'trial_started', 'trial_started'),
    ('trial_expiry', 2, 12, 'trial_value_reminder', 'trial_value_reminder'),
    ('trial_expiry', 3, 22, 'trial_expires_soon', 'trial_expires_soon'),
    ('trial_expiry', 4, 24, 'trial_expired', 'trial_expired'),
    ('reengagement', 1, 0, 'we_miss_you', 'we_miss_you'),
    ('reengagement', 2, 168, 'streak_at_risk', 'streak_at_risk'),
    ('reengagement', 3, 336, 'last_chance_offer', 'last_chance_offer')
)
insert into email_sequence_steps (sequence_id, step_order, delay_hours, template_key, subject_key, is_active)
select seq.id, steps.step_order, steps.delay_hours, steps.template_key, steps.subject_key, true
from steps
join seq on seq.name = steps.sequence_name
on conflict (sequence_id, step_order) do update
set delay_hours = excluded.delay_hours,
    template_key = excluded.template_key,
    subject_key = excluded.subject_key,
    is_active = excluded.is_active;
