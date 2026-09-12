-- Server-owned intake, generation receipts and successful-reply allowances.
create table if not exists public.tjai_intake_drafts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 answers_json jsonb not null, age integer not null check(age between 18 and 100),
 locale text not null check(locale in ('en','tr','ar','es','fr')), created_at timestamptz not null default now(),
 consent_version text not null default '2026-09-12',consented_at timestamptz not null default now()
);
create index if not exists tjai_intake_user on public.tjai_intake_drafts(user_id,created_at desc);
alter table public.tjai_intake_drafts enable row level security;
create policy tjai_intake_read_self on public.tjai_intake_drafts for select using(auth.uid()=user_id);

create table if not exists public.tjai_generation_jobs (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 intake_id uuid not null references public.tjai_intake_drafts(id), request_key uuid not null,
 kind text not null check(kind in ('initial','regeneration','legacy','credit')),
 period_key text not null, status text not null default 'queued' check(status in ('queued','running','succeeded','failed')),
 attempts integer not null default 0, lease_token uuid, lease_until timestamptz,
 available_at timestamptz not null default now(), error_code text, plan_id uuid,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,request_key)
);
create index tjai_jobs_queue on public.tjai_generation_jobs(status,available_at);
alter table public.tjai_generation_jobs enable row level security;
create policy tjai_jobs_read_self on public.tjai_generation_jobs for select using(auth.uid()=user_id);
alter table public.saved_tjai_plans add column if not exists generation_job_id uuid references public.tjai_generation_jobs(id);
create unique index if not exists tjai_saved_generation_job on public.saved_tjai_plans(generation_job_id) where generation_job_id is not null;

-- Preserve the old generation backend contract, separate from the new pass allowance.
create or replace function public.tjai_lock_legacy_access(p_user uuid)
returns boolean language plpgsql security definer set search_path=public as $$
begin
 perform 1 from profiles where id=p_user and role='admin' for share;
 if found then return true; end if;
 perform 1 from tjai_plan_purchases where user_id=p_user for share;
 if found then return true; end if;
 perform 1 from user_subscriptions where user_id=p_user and tier in ('pro','apex') and status in ('active','trialing') for share;
 return found;
end $$;
revoke all on function public.tjai_lock_legacy_access(uuid) from public,anon,authenticated;
grant execute on function public.tjai_lock_legacy_access(uuid) to service_role;
-- Hold an entitlement row through finalization so a concurrent refund is serialized.
create or replace function public.tjai_lock_current_access(p_user uuid,p_pass_only boolean default false)
returns boolean language plpgsql security definer set search_path=public as $$
begin
 perform 1 from tjai_pass_purchases where user_id=p_user and status='active' and test_mode=false and provider='lemonsqueezy' for share;
 if found then return true; end if;
 return not p_pass_only and tjai_lock_legacy_access(p_user);
end $$;
revoke all on function public.tjai_lock_current_access(uuid,boolean) from public,anon,authenticated;
grant execute on function public.tjai_lock_current_access(uuid,boolean) to service_role;

create or replace function public.tjai_enqueue_job(p_user uuid,p_intake uuid,p_request uuid,p_mode text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare j public.tjai_generation_jobs; k text; period text:=to_char(now() at time zone 'Europe/Istanbul','YYYY-MM'); c record;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,71));
 if not exists(select 1 from tjai_intake_drafts where id=p_intake and user_id=p_user and age>=18) then return jsonb_build_object('error','invalid_intake'); end if;
 select * into j from tjai_generation_jobs where user_id=p_user and request_key=p_request;
 if found then return to_jsonb(j); end if;
 select * into j from tjai_generation_jobs where user_id=p_user and status in ('queued','running') order by created_at desc limit 1;
 if found then return to_jsonb(j); end if;
 if p_mode='pass' then
  if not tjai_lock_current_access(p_user,true) then return jsonb_build_object('error','access_denied'); end if;
  k:=case when exists(select 1 from saved_tjai_plans where user_id=p_user) then 'regeneration' else 'initial' end;
  if k='regeneration' and exists(select 1 from tjai_generation_jobs where user_id=p_user and kind='regeneration' and period_key=period and status='succeeded') then return jsonb_build_object('error','monthly_limit'); end if;
 elsif p_mode='legacy' then
  if not tjai_lock_legacy_access(p_user) then return jsonb_build_object('error','access_denied'); end if;
  k:='legacy';
 elsif p_mode='credit' then k:='credit';
 else return jsonb_build_object('error','access_denied'); end if;
 if k='credit' then
  select * into c from consume_tjai_credit(p_user,1,'generation',jsonb_build_object('request_key',p_request));
  if not c.ok then return jsonb_build_object('error','insufficient_credits'); end if;
 end if;
 insert into tjai_generation_jobs(user_id,intake_id,request_key,kind,period_key) values(p_user,p_intake,p_request,k,period) returning * into j;
 return to_jsonb(j);
end $$;

create or replace function public.tjai_claim_job() returns jsonb language plpgsql security definer set search_path=public as $$
declare j public.tjai_generation_jobs;
begin
 select * into j from tjai_generation_jobs where (status='queued' and available_at<=now()) or (status='running' and lease_until<now()) order by created_at for update skip locked limit 1;
 if not found then return null; end if;
 if j.attempts>=3 then
  update tjai_generation_jobs set status='failed',error_code='worker_timeout',updated_at=now() where id=j.id;
  if j.kind='credit' then perform grant_tjai_credit(j.user_id,1,'refund',jsonb_build_object('job_id',j.id)); end if;
  return jsonb_build_object('id',j.id,'status','failed');
 end if;
 update tjai_generation_jobs set status='running',attempts=attempts+1,lease_token=gen_random_uuid(),lease_until=now()+interval '120 seconds',updated_at=now() where id=j.id returning * into j;
 return to_jsonb(j);
end $$;

create or replace function public.tjai_finish_job(p_job uuid,p_lease uuid,p_plan jsonb,p_metrics jsonb,p_error text default null,p_retry_seconds integer default 0)
returns jsonb language plpgsql security definer set search_path=public as $$
declare j public.tjai_generation_jobs; d public.tjai_intake_drafts; saved uuid; v integer; period text:=to_char(now() at time zone 'Europe/Istanbul','YYYY-MM');
begin
 select * into j from tjai_generation_jobs where id=p_job for update;
 if not found then return jsonb_build_object('error','not_found'); end if;
 if j.status='succeeded' then return to_jsonb(j); end if;
 if j.status<>'running' or p_lease is null or j.lease_token is distinct from p_lease or j.lease_until is null or j.lease_until<now() then return jsonb_build_object('error','lease_lost'); end if;
 if p_error is not null then
  if p_retry_seconds>0 and j.attempts<3 then
   update tjai_generation_jobs set status='queued',available_at=now()+make_interval(secs=>least(3600,p_retry_seconds)),lease_token=null,lease_until=null,error_code=p_error,updated_at=now() where id=p_job returning * into j;
  else
   update tjai_generation_jobs set status='failed',error_code=p_error,lease_token=null,lease_until=null,updated_at=now() where id=p_job returning * into j;
   if j.kind='credit' then perform grant_tjai_credit(j.user_id,1,'refund',jsonb_build_object('job_id',j.id)); end if;
  end if;
  return to_jsonb(j);
 end if;
 if p_plan is null or p_metrics is null then raise exception 'Missing validated result'; end if;
 perform pg_advisory_xact_lock(hashtextextended(j.user_id::text,71));
 if j.kind in ('initial','regeneration') and not tjai_lock_current_access(j.user_id,true) then
  update tjai_generation_jobs set status='failed',error_code='access_revoked',lease_token=null,lease_until=null,updated_at=now() where id=j.id returning * into j;
  return to_jsonb(j);
 end if;
 if j.kind='legacy' and not tjai_lock_legacy_access(j.user_id) then
  update tjai_generation_jobs set status='failed',error_code='access_revoked',lease_token=null,lease_until=null,updated_at=now() where id=j.id returning * into j;
  return to_jsonb(j);
 end if;
 if j.kind='regeneration' and exists(select 1 from tjai_generation_jobs where user_id=j.user_id and kind='regeneration' and period_key=period and status='succeeded') then
  update tjai_generation_jobs set status='failed',error_code='monthly_limit',lease_token=null,lease_until=null,updated_at=now() where id=j.id returning * into j;
  return to_jsonb(j);
 end if;
 select * into d from tjai_intake_drafts where id=j.intake_id;
 select coalesce(max(version_number),0)+1 into v from saved_tjai_plans where user_id=j.user_id;
 insert into saved_tjai_plans(user_id,version_number,answers_json,metrics_json,plan_json,goal,daily_calories,protein_g,carbs_g,fat_g,training_days_per_week,training_location,generation_job_id)
 values(j.user_id,v,d.answers_json,p_metrics,p_plan,d.answers_json->>'s2_goal',(p_metrics->>'calorieTarget')::numeric,(p_metrics->>'protein')::numeric,(p_metrics->>'carbs')::numeric,(p_metrics->>'fat')::numeric,coalesce((d.answers_json->>'s5_days')::integer,3),d.answers_json->>'s5_type',j.id) returning id into saved;
 update tjai_generation_jobs set status='succeeded',period_key=period,plan_id=saved,error_code=null,lease_token=null,lease_until=null,updated_at=now() where id=j.id returning * into j;
 return to_jsonb(j);
end $$;

create table public.tjai_reply_receipts (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade, period_key text not null,
 status text not null check(status in ('reserved','succeeded','failed')), reply text, conversation_id text, reservation_token uuid not null default gen_random_uuid(), allowance_limit integer not null default 5,
 expires_at timestamptz not null, created_at timestamptz not null default now()
);
alter table public.tjai_reply_receipts enable row level security;
create policy tjai_replies_read_self on public.tjai_reply_receipts for select using(auth.uid()=user_id);
create index tjai_replies_user_period on public.tjai_reply_receipts(user_id,period_key,status);
create or replace function public.tjai_reserve_reply(p_id uuid,p_user uuid,p_trial boolean,p_limit integer) returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.tjai_reply_receipts; p text:=case when p_trial then 'trial' else to_char(now() at time zone 'Europe/Istanbul','YYYY-MM-DD') end;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,72));
 select * into r from tjai_reply_receipts where id=p_id;
 if found then
  if r.user_id<>p_user then return jsonb_build_object('error','access_denied'); end if;
  if r.status='succeeded' then return to_jsonb(r); end if;
  if r.status='reserved' and r.expires_at>now() then return jsonb_build_object('error','in_progress'); end if;
 end if;
 update tjai_reply_receipts set status='failed' where user_id=p_user and status='reserved' and expires_at<now();
 if (select count(*) from tjai_reply_receipts where user_id=p_user and period_key=p and status in ('reserved','succeeded'))>=p_limit then return jsonb_build_object('error','daily_limit'); end if;
 insert into tjai_reply_receipts(id,user_id,period_key,status,expires_at,allowance_limit) values(p_id,p_user,p,'reserved',now()+interval '70 seconds',p_limit)
 on conflict(id) do update set status='reserved',expires_at=excluded.expires_at,period_key=excluded.period_key,reservation_token=excluded.reservation_token,allowance_limit=excluded.allowance_limit
 where tjai_reply_receipts.user_id=p_user returning * into r;
 if not found then return jsonb_build_object('error','access_denied'); end if;
 return to_jsonb(r);
end $$;

-- Distributed token admission. Reservations conservatively consume capacity even on an upstream failure.
create table public.tjai_provider_budget (bucket text primary key,tokens integer not null);
alter table public.tjai_provider_budget enable row level security;
create or replace function public.tjai_reserve_provider_tokens(p_tokens integer) returns boolean language plpgsql security definer set search_path=public as $$
declare m text:='m:'||to_char(now() at time zone 'UTC','YYYY-MM-DD HH24:MI'); d text:='d:'||to_char(now() at time zone 'UTC','YYYY-MM-DD');
begin
 if p_tokens<1 or p_tokens>7000 then return false; end if;
 perform pg_advisory_xact_lock(737172);
 insert into tjai_provider_budget values(m,0),(d,0) on conflict do nothing;
 if (select tokens from tjai_provider_budget where bucket=m)+p_tokens>7000 or (select tokens from tjai_provider_budget where bucket=d)+p_tokens>180000 then return false; end if;
 update tjai_provider_budget set tokens=tokens+p_tokens where bucket in (m,d);
 delete from tjai_provider_budget where substring(bucket from 3 for 10)<to_char(now()-interval '2 days','YYYY-MM-DD');
 return true;
end $$;
revoke all on function public.tjai_enqueue_job(uuid,uuid,uuid,text),public.tjai_claim_job(),public.tjai_finish_job(uuid,uuid,jsonb,jsonb,text,integer),public.tjai_reserve_reply(uuid,uuid,boolean,integer),public.tjai_reserve_provider_tokens(integer) from public,anon,authenticated;
grant execute on function public.tjai_enqueue_job(uuid,uuid,uuid,text),public.tjai_claim_job(),public.tjai_finish_job(uuid,uuid,jsonb,jsonb,text,integer),public.tjai_reserve_reply(uuid,uuid,boolean,integer),public.tjai_reserve_provider_tokens(integer) to service_role;
