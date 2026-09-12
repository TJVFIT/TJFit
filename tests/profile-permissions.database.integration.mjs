// Actual SQL permissions regression, isolated embedded PostgreSQL only.
// node tests/profile-permissions.database.integration.mjs <absolute @electric-sql/pglite/dist/index.js>
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';

const { PGlite } = await import(pathToFileURL(process.argv[2]).href);
const db = new PGlite();
const migration = await readFile(new URL('../supabase/migrations/20260912213000_profile_write_permissions.sql', import.meta.url), 'utf8');
const usernameSql = await readFile(new URL('../supabase/migrations/20260331200000_profile_foundation_username_constraints.sql', import.meta.url), 'utf8');
const signupSql = await readFile(new URL('../supabase/migrations/20260331180000_profile_v1_is_private_inbox_read.sql', import.meta.url), 'utf8');
const creditSql = await readFile(new URL('../supabase/migrations/20260503100000_v5_payment_automation.sql', import.meta.url), 'utf8');
const user = randomUUID(), otherUser = randomUUID();
let assertions = 0;
function equal(actual, expected) { assertions++; assert.deepEqual(actual, expected); }
async function denied(sql, args = []) {
  assertions++;
  await assert.rejects(db.query(sql, args), error => error.code === '42501');
}
const profile = async () => (await db.query('select * from public.profiles where id=$1', [user])).rows[0];

try {
  await db.exec(`
    create schema auth;
    create role anon; create role authenticated; create role service_role bypassrls;
    create table auth.users(id uuid primary key,email text);
    create function auth.uid() returns uuid language sql stable as
      'select nullif(current_setting(''request.jwt.claim.sub'',true),'''')::uuid';
    grant usage on schema public,auth to anon,authenticated,service_role;
    create table public.profiles(
      id uuid primary key references auth.users(id),email text,role text default 'user',
      username text,username_normalized text,display_name text,avatar_url text,bio text,
      is_private boolean default false,is_searchable boolean default true,message_privacy text default 'everyone',
      privacy_settings jsonb,banner_color text,display_badge_key text,
      subscription_tier text default 'core',tjai_credit_balance int default 0,is_verified boolean default false,
      tjxp int default 0,level int default 1,current_streak int default 0,longest_streak int default 0,
      last_activity_date date,referral_code text,
      created_at timestamptz default now(),updated_at timestamptz default now(),
      unknown_sensitive_field integer default 0,
      check(username_normalized=lower(username))
    );
    create table public.tjai_credit_transactions(id uuid default gen_random_uuid(),user_id uuid,amount int,balance_after int,reason text,metadata jsonb);
    alter table public.profiles enable row level security;
    create policy profile_read on public.profiles for select using(true);
    create policy profile_edit on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
    grant all on public.profiles to public,anon,authenticated,service_role;
    grant update(role,tjai_credit_balance) on public.profiles to public,anon,authenticated;
    grant all on public.tjai_credit_transactions to service_role;
  `);
  // Exercise actual repository normalization, signup and legacy credit function bodies.
  await db.exec(usernameSql.slice(usernameSql.indexOf('create or replace function public.profiles_username_enforce()'), usernameSql.indexOf('-- Profile card:')));
  await db.exec(signupSql.slice(signupSql.indexOf('create or replace function public.handle_new_auth_user_profile()')));
  await db.exec(`create trigger auth_profile after insert on auth.users for each row execute function public.handle_new_auth_user_profile();
    create function public.test_profile_touch() returns trigger language plpgsql as $$begin new.updated_at=now(); return new; end$$;
    create trigger profiles_updated_at before update on public.profiles for each row execute function public.test_profile_touch();`);
  await db.exec(creditSql.slice(creditSql.indexOf('create or replace function consume_tjai_credit('), creditSql.indexOf('-- 4. Commission system')));
  await db.query('insert into auth.users(id,email) values($1,$2),($3,$4)', [user,'buyer@example.test',otherUser,'other@example.test']);
  await db.query("update public.profiles set referral_code='TJ-LEGACY' where id=$1", [user]);

  // Reproduce vulnerable grants using fixtures, never a live account.
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [user]);
  await db.exec('set role authenticated');
  await db.query("update public.profiles set role='admin',tjai_credit_balance=9999 where id=$1", [user]);
  equal((await profile()).role,'admin');
  await db.exec('reset role');
  await db.query("update public.profiles set role='user',tjai_credit_balance=0 where id=$1", [user]);

  await db.exec(migration);
  await db.exec(migration); // Repeat is safe and removes stale regrants consistently.
  equal((await profile()).referral_code,'TJ-LEGACY');
  equal((await db.query('select referral_code from public.profiles where id=$1',[otherUser])).rows[0].referral_code,null);
  await db.exec('set role authenticated');
  const protectedChanges = [
    "role='admin'", "subscription_tier='apex'", 'tjai_credit_balance=9999', 'is_verified=true',
    'tjxp=999999', 'level=100', 'current_streak=999', 'longest_streak=999',
    "last_activity_date='2030-01-01'", "referral_code='ATTACKER'", "email='admin@example.test'",
    "created_at='2000-01-01'", "updated_at='2030-01-01'", "username_normalized='admin'",
    `id='${randomUUID()}'`, 'unknown_sensitive_field=1'
  ];
  for (const change of protectedChanges) await denied(`update public.profiles set ${change} where id=$1`, [user]);
  await denied("update public.profiles set display_name='Mixed attack',role='admin' where id=$1", [user]);
  await denied("insert into public.profiles(id,role) values($1,'admin')", [randomUUID()]);
  await denied('delete from public.profiles where id=$1', [user]);
  await denied('truncate public.profiles');
  await denied("select public.grant_tjai_credit($1,100,'forged',null)", [user]);
  await denied("select public.consume_tjai_credit($1,1,'forged',null)", [otherUser]);

  await db.query(`update public.profiles set username='Buyer_Edit',display_name='Buyer Name',bio='Hello',avatar_url='https://example.test/avatar.png',
    is_private=true,is_searchable=false,message_privacy='nobody',privacy_settings='{"show_streak":false}',banner_color='#111215',display_badge_key=null where id=$1`, [user]);
  const edited = await profile();
  equal(edited.display_name,'Buyer Name'); equal(edited.username_normalized,'buyer_edit');
  equal(edited.role,'user'); equal(edited.tjai_credit_balance,0); equal(edited.is_private,true);
  equal(edited.unknown_sensitive_field,0);
  equal((await db.query("update public.profiles set display_name='Cross user' where id=$1 returning id", [otherUser])).rows.length,0);
  await db.exec('reset role; set role anon');
  await denied("update public.profiles set display_name='Anon' where id=$1", [user]);
  await denied("select public.grant_tjai_credit($1,100,'forged',null)", [user]);
  await db.exec('reset role');

  // New columns never inherit an authenticated/public table-wide write grant.
  await db.exec('alter table public.profiles add column future_admin_flag boolean default false; set role authenticated');
  await denied('update public.profiles set future_admin_flag=true where id=$1', [user]);
  await db.exec('reset role; set role service_role');
  await db.query("update public.profiles set role='coach',subscription_tier='pro',is_verified=true,tjxp=250,level=2 where id=$1", [user]);
  equal((await db.query("select * from public.grant_tjai_credit($1,20,'historical_purchase',null)", [user])).rows[0].ok,true);
  equal((await db.query("select * from public.consume_tjai_credit($1,3,'historical_usage',null)", [user])).rows[0].ok,true);
  equal((await profile()).tjai_credit_balance,17); equal((await profile()).role,'coach');
  await db.exec('reset role');

  const newUser = randomUUID();
  await db.query('insert into auth.users(id,email) values($1,$2)', [newUser,'new@example.test']);
  const newProfile = (await db.query('select * from public.profiles where id=$1', [newUser])).rows[0];
  equal(newProfile.role,'user'); equal(newProfile.username_normalized,newProfile.username.toLowerCase());
  equal(newProfile.referral_code.startsWith('TJ-'),true);
  console.log(`PASS ${assertions} profile permission SQL assertions (isolated PGlite; no production connection).`);
} finally { await db.close(); }
