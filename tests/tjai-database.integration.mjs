// Isolated PostgreSQL/WASM test; pass the temporary PGlite module path as argv[2].
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const {PGlite}=await import(pathToFileURL(process.argv[2]).href);
const db=new PGlite();let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
await db.exec(`create schema auth;create table auth.users(id uuid primary key);create role anon;create role authenticated;create role service_role;
create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create table profiles(id uuid primary key,tjai_credit_balance int default 2,role text default 'customer');
create table tjai_pass_purchases(user_id uuid,provider text default 'lemonsqueezy',status text default 'active',test_mode boolean default false);
create table tjai_plan_purchases(user_id uuid);
create table user_subscriptions(user_id uuid,tier text,status text);
create table saved_tjai_plans(id uuid primary key default gen_random_uuid(),user_id uuid,version_number int,answers_json jsonb,metrics_json jsonb,plan_json jsonb,goal text,daily_calories int,protein_g int,carbs_g int,fat_g int,training_days_per_week int,training_location text,created_at timestamptz default now());
alter table saved_tjai_plans enable row level security;
create table tjai_chat_messages(id uuid primary key default gen_random_uuid(),user_id uuid,conversation_id uuid,role text,content text);
create table workout_logs(id uuid primary key);
create function consume_tjai_credit(u uuid,n integer,r text,m jsonb) returns table(balance_after int,ok boolean,reason text) language plpgsql as $$ begin update profiles set tjai_credit_balance=tjai_credit_balance-n where id=u and tjai_credit_balance>=n;return query select tjai_credit_balance,found,'ok'::text from profiles where id=u;end $$;
create function grant_tjai_credit(u uuid,n integer,r text,m jsonb) returns table(balance_after int,ok boolean) language plpgsql as $$ begin update profiles set tjai_credit_balance=tjai_credit_balance+n where id=u;return query select tjai_credit_balance,true from profiles where id=u;end $$;`);
for(const file of ['20260912190000_tjai_durable_jobs.sql','20260912191000_tjai_reply_finalization.sql','20260912200000_tjai_logging.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
const user=randomUUID(),other=randomUUID();await db.query('insert into auth.users values($1),($2)',[user,other]);await db.query('insert into profiles(id) values($1),($2)',[user,other]);
await db.query('insert into tjai_pass_purchases(user_id) values($1),($2)',[user,other]);
async function scalar(sql,args=[]){return (await db.query(sql,args)).rows[0].v;}
async function draft(u=user){return scalar("insert into tjai_intake_drafts(user_id,answers_json,age,locale) values($1,'{\"s1_age\":29,\"s5_days\":3}',29,'en') returning id as v",[u]);}
async function enqueue(intake,mode='pass',u=user,key=randomUUID()){return scalar('select tjai_enqueue_job($1,$2,$3,$4) as v',[u,intake,key,mode]);}
const metrics={calorieTarget:2000,protein:130,carbs:220,fat:60},plan={summary:metrics};
async function finish(j,error=null,retry=0){return scalar('select tjai_finish_job($1,$2,$3,$4,$5,$6) as v',[j.id,j.lease_token,JSON.stringify(plan),JSON.stringify(metrics),error,retry]);}
async function claim(){return scalar('select tjai_claim_job() as v');}
try{
 const d=await draft(),key=randomUUID(),j=await enqueue(d,'pass',user,key);
 eq(j.kind,'initial');eq((await enqueue(d,'pass',user,key)).id,j.id);
 eq((await enqueue(await draft())).id,j.id);
 eq((await enqueue(d,'pass',other)).error,'invalid_intake');
 const claimed=await claim();eq(claimed.attempts,1);eq(await claim(),null);
 eq((await finish({...claimed,lease_token:randomUUID()})).error,'lease_lost');
 eq((await finish({...claimed,lease_token:null})).error,'lease_lost');
 eq((await finish(claimed)).status,'succeeded');
 eq((await finish(claimed)).status,'succeeded');
 eq(Number(await scalar('select count(*) as v from saved_tjai_plans')),1);
 const regen=await enqueue(await draft());eq(regen.kind,'regeneration');
 await db.query("update tjai_generation_jobs set period_key='2000-01' where id=$1",[regen.id]);
 const regenFinished=await finish(await claim());eq(regenFinished.status,'succeeded');
 eq(regenFinished.period_key,await scalar("select to_char(now() at time zone 'Europe/Istanbul','YYYY-MM') as v"));
 eq((await enqueue(await draft())).error,'monthly_limit');
 await db.query("update tjai_generation_jobs set period_key='2000-01' where id=$1",[regen.id]);
 eq((await enqueue(await draft())).kind,'regeneration');
 const retryJob=await claim();eq((await finish(retryJob,'provider_capacity',65)).status,'queued');eq(await claim(),null);
 await db.query("update tjai_generation_jobs set available_at=now()-interval '1 second' where id=$1",[retryJob.id]);
 const again=await claim();eq(again.attempts,2);eq((await finish(again,'invalid_plan')).status,'failed');
 const credit=await enqueue(await draft(other),'credit',other);eq(await scalar('select tjai_credit_balance as v from profiles where id=$1',[other]),1);
 const creditClaim=await claim();eq((await finish(creditClaim,'invalid_plan')).status,'failed');eq(await scalar('select tjai_credit_balance as v from profiles where id=$1',[other]),2);
 await finish(creditClaim,'invalid_plan');eq(await scalar('select tjai_credit_balance as v from profiles where id=$1',[other]),2);
 const timed=await enqueue(await draft(other),'credit',other);await claim();await db.query("update tjai_generation_jobs set lease_until=now()-interval '1 second',attempts=3 where id=$1",[timed.id]);eq((await claim()).status,'failed');eq(await scalar('select tjai_credit_balance as v from profiles where id=$1',[other]),2);
 let completed;
 for(let i=0;i<5;i++){
  const id=randomUUID(),r=await scalar('select tjai_reserve_reply($1,$2,false,5) as v',[id,user]);
  eq(r.status,'reserved');
  eq((await scalar('select tjai_finish_reply($1,$2,null,$3,$4,$5) as v',[id,user,randomUUID(),'hi','reply'])).error,'reservation_expired');
  eq((await scalar('select tjai_finish_reply($1,$2,$3,$4,$5,$6) as v',[id,user,randomUUID(),randomUUID(),'hi','reply'])).error,'reservation_expired');
  completed=await scalar('select tjai_finish_reply($1,$2,$3,$4,$5,$6) as v',[id,user,r.reservation_token,randomUUID(),'hi','reply']);eq(completed.status,'succeeded');
 }
 eq((await scalar('select tjai_reserve_reply($1,$2,false,5) as v',[randomUUID(),user])).error,'daily_limit');
 eq((await scalar('select tjai_reserve_reply($1,$2,false,5) as v',[completed.id,user])).status,'succeeded');
 eq(Number(await scalar('select count(*) as v from tjai_chat_messages')),10);
 const failedId=randomUUID(),reserved=await scalar('select tjai_reserve_reply($1,$2,false,5) as v',[failedId,other]);
 eq((await scalar('select tjai_finish_reply($1,$2,$3,$4,$5,null) as v',[failedId,other,reserved.reservation_token,randomUUID(),'hi'])).status,'failed');
 eq((await scalar('select tjai_reserve_reply($1,$2,false,5) as v',[failedId,other])).status,'reserved');
 // A refund arriving during provider work cannot finalize a new result.
 const revokedJob=await enqueue(await draft(other),'pass',other),revokedClaim=await claim();
 const revokedReplyId=randomUUID(),revokedReply=await scalar('select tjai_reserve_reply($1,$2,false,5) as v',[revokedReplyId,other]);
 await db.query("update tjai_pass_purchases set status='refunded' where user_id=$1",[other]);
 eq((await finish(revokedClaim)).error_code,'access_revoked');
 eq(Number(await scalar('select count(*) as v from saved_tjai_plans where generation_job_id=$1',[revokedJob.id])),0);
 eq((await scalar('select tjai_finish_reply($1,$2,$3,$4,$5,$6) as v',[revokedReplyId,other,revokedReply.reservation_token,randomUUID(),'hi','reply'])).error,'access_revoked');
 eq((await enqueue(await draft(other),'pass',other)).error,'access_denied');
 // Historical rights are distinct from a new pass and rechecked when finalizing.
 eq((await enqueue(await draft(),'legacy')).error,'access_denied');
 await db.query('insert into tjai_plan_purchases(user_id) values($1)',[other]);
 eq((await enqueue(await draft(other),'legacy',other)).kind,'legacy');const oldPurchaseClaim=await claim();
 await db.query('delete from tjai_plan_purchases where user_id=$1',[other]);eq((await finish(oldPurchaseClaim)).error_code,'access_revoked');
 await db.query('insert into tjai_plan_purchases(user_id) values($1)',[other]);await db.query("insert into user_subscriptions(user_id,tier,status) values($1,'pro','active')",[other]);
 await enqueue(await draft(other),'legacy',other);const alternateClaim=await claim();await db.query('delete from tjai_plan_purchases where user_id=$1',[other]);eq((await finish(alternateClaim)).status,'succeeded');
 eq((await enqueue(await draft(other),'legacy',other)).kind,'legacy');const canceledClaim=await claim();await db.query("update user_subscriptions set status='canceled' where user_id=$1",[other]);eq((await finish(canceledClaim)).error_code,'access_revoked');
 eq((await enqueue(await draft(other),'legacy',other)).error,'access_denied');
 eq(await scalar('select tjai_reserve_provider_tokens(5000) as v'),true);eq(await scalar('select tjai_reserve_provider_tokens(3000) as v'),false);
 eq(await scalar('select has_function_privilege(\'authenticated\',\'public.tjai_enqueue_job(uuid,uuid,uuid,text)\',\'execute\') as v'),false);
 eq(await scalar('select has_function_privilege(\'authenticated\',\'public.grant_tjai_credit(uuid,integer,text,jsonb)\',\'execute\') as v'),false);
 // Exercise owner policies with a real authenticated SQL role and two user identities.
 await db.exec('grant usage on schema auth to authenticated; grant select,insert,update,delete on tjai_intake_drafts,tjai_generation_jobs,tjai_reply_receipts,saved_tjai_plans to authenticated');
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);await db.exec('set role authenticated');
 eq(Number(await scalar('select count(*) as v from tjai_intake_drafts where user_id=$1',[other])),0);
 eq(Number(await scalar('select count(*) as v from tjai_intake_drafts where user_id=$1',[user]))>0,true);
 eq(Number(await scalar('select count(*) as v from tjai_generation_jobs where user_id=$1',[other])),0);
 eq(Number(await scalar('select count(*) as v from tjai_reply_receipts where user_id=$1',[other])),0);
 eq((await db.query("update saved_tjai_plans set goal='tampered' where user_id=$1 returning id",[user])).rows.length,0);
 let intakeWriteBlocked=false;try{await draft(user);}catch{intakeWriteBlocked=true;}eq(intakeWriteBlocked,true);
 await db.exec('reset role');
 console.log('TJAI database assertions passed: '+checks);
}finally{await db.close();}
