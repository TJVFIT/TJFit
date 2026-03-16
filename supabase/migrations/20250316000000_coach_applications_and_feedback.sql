-- Coach applications table (submissions from Become a Coach form)
create table if not exists coach_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  age int not null,
  full_name text not null,
  specialty text not null,
  languages text not null,
  country text not null,
  certifications_and_style text not null,
  locale text
);

-- Feedback & Support submissions
create table if not exists feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  type text not null check (type in ('complaint', 'suggestion', 'feedback', 'help_request', 'refund_request')),
  subject text,
  message text not null,
  order_reference text,
  email text,
  locale text
);

-- Enable RLS (optional - allows anon insert if policy permits)
alter table coach_applications enable row level security;
alter table feedback_submissions enable row level security;

-- Allow anonymous insert for coach applications (public form)
create policy "Allow anonymous insert coach_applications"
  on coach_applications for insert
  with check (true);

-- Allow anonymous insert for feedback (public form)
create policy "Allow anonymous insert feedback_submissions"
  on feedback_submissions for insert
  with check (true);

-- Select: only service role can read (API routes use SUPABASE_SERVICE_ROLE_KEY)
-- No select policy for anon = deny. Service role bypasses RLS.
