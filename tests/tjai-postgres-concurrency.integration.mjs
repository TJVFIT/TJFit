// Install embedded-postgres only in a temporary directory; pass that directory as argv[2].
// This harness launches its own Windows process hidden on loopback, never a persistent service.
import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {join,resolve,sep} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
const runtime=resolve(process.argv[2]??'');
if(!process.argv[2])throw new Error('Temporary runtime directory required');
const {initdb,postgres,pg_ctl}=await import(pathToFileURL(join(runtime,'node_modules/@embedded-postgres/windows-x64/dist/index.js')).href);
const {default:pg}=await import(pathToFileURL(join(runtime,'node_modules/pg/lib/index.js')).href);
const cluster=await mkdtemp(join(runtime,'tjai-cluster-')),data=join(cluster,'data'),passwordFile=join(cluster,'password');
const password=randomBytes(24).toString('hex');
const port=await new Promise((ok,bad)=>{const s=createServer();s.on('error',bad);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>ok(p));});});
const clients=[];let server,checks=0;
const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
const run=(file,args)=>new Promise((ok,bad)=>{const p=spawn(file,args,{windowsHide:true,stdio:['ignore','pipe','pipe']});let output='';p.stdout.on('data',b=>output+=b);p.stderr.on('data',b=>output+=b);p.on('error',bad);p.on('exit',code=>code===0?ok(output):bad(new Error('Local PostgreSQL command failed: '+output)));});
const scalar=async(c,sql,args=[])=>{const r=await c.query(sql,args);return r.rows[0]?.v;};
async function blocked(observer,pid){for(let i=0;i<40;i++){if(await scalar(observer,"select wait_event_type='Lock' as v from pg_stat_activity where pid=$1",[pid]))return true;await new Promise(r=>setTimeout(r,25));}return false;}
try{
 await writeFile(passwordFile,password+'\n');
 await run(initdb,['-D',data,'-U','postgres','--auth=scram-sha-256','--pwfile='+passwordFile,'--locale=C','--encoding=UTF8']);
 await rm(passwordFile);
 await new Promise((ok,bad)=>{server=spawn(postgres,['-D',data,'-h','127.0.0.1','-p',String(port),'-c','max_connections=30'],{windowsHide:true,stdio:['ignore','ignore','pipe']});let output='';const timer=setTimeout(()=>bad(new Error('Local PostgreSQL startup timeout')),20000);server.on('error',e=>{clearTimeout(timer);bad(e);});server.stderr.on('data',b=>{output+=b;if(output.includes('database system is ready to accept connections')){clearTimeout(timer);ok();}});server.on('exit',code=>{clearTimeout(timer);if(code!==0)bad(new Error('Local PostgreSQL exited '+code));});});
 for(let i=0;i<12;i++){const c=new pg.Client({host:'127.0.0.1',port,user:'postgres',password,database:'postgres'});await c.connect();await c.query("set statement_timeout='8s';set lock_timeout='6s'");clients.push(c);}
 const [a,b,observer]=clients;const pids=await Promise.all(clients.map(c=>scalar(c,'select pg_backend_pid() as v')));eq(new Set(pids).size,12);
 // Reuse canonical fixture DDL from the retained single-connection migration harness.
 const fixtureSource=await readFile(new URL('./tjai-database.integration.mjs',import.meta.url),'utf8');
 const ddl=fixtureSource.match(/await db\.exec\(`([\s\S]*?)`\);/)?.[1];if(!ddl)throw new Error('Canonical fixture DDL not found');await a.query(ddl);
 for(const name of ['20260912190000_tjai_durable_jobs.sql','20260912191000_tjai_reply_finalization.sql','20260912200000_tjai_logging.sql'])await a.query(await readFile(new URL('../supabase/migrations/'+name,import.meta.url),'utf8'));
 const users=Array.from({length:6},()=>randomUUID()),drafts=[];
 for(const u of users){await a.query('insert into auth.users values($1);',[u]);await a.query('insert into profiles(id) values($1)',[u]);await a.query('insert into tjai_pass_purchases(user_id) values($1)',[u]);drafts.push(await scalar(a,"insert into tjai_intake_drafts(user_id,answers_json,age,locale) values($1,'{\"s1_age\":29,\"s5_days\":3}',29,'en') returning id as v",[u]));}
 const enqueue=(c,i,mode='pass')=>scalar(c,'select tjai_enqueue_job($1,$2,$3,$4) as v',[users[i],drafts[i],randomUUID(),mode]);
 const claim=c=>scalar(c,'select tjai_claim_job() as v');
 const metrics=JSON.stringify({calorieTarget:2000,protein:130,carbs:220,fat:60});
 const finish=(c,j,error=null)=>scalar(c,'select tjai_finish_job($1,$2,$3,$4,$5,0) as v',[j.id,j.lease_token,'{"summary":{}}',metrics,error]);
 const reserve=(c,i,id=randomUUID())=>scalar(c,'select tjai_reserve_reply($1,$2,false,5) as v',[id,users[i]]);
 const reply=(c,i,r)=>scalar(c,'select tjai_finish_reply($1,$2,$3,$4,$5,$6) as v',[r.id,users[i],r.reservation_token,randomUUID(),'hello','complete reply']);
 const creditJobs=await Promise.all(clients.map(c=>enqueue(c,0,'credit')));eq(new Set(creditJobs.map(j=>j.id)).size,1);eq(await scalar(a,'select tjai_credit_balance as v from profiles where id=$1',[users[0]]),1);
 const claims=await Promise.all(clients.map(claim));eq(claims.filter(Boolean).length,1);
 const refunds=await Promise.all(clients.map(c=>finish(c,claims.find(Boolean),'provider_failed')));eq(refunds.filter(r=>r.status==='failed').length,1);eq(await scalar(a,'select tjai_credit_balance as v from profiles where id=$1',[users[0]]),2);
 const initial=await Promise.all(clients.map(c=>enqueue(c,1)));eq(new Set(initial.map(j=>j.id)).size,1);const initialClaim=await claim(a);
 const successful=await Promise.all(clients.map(c=>finish(c,initialClaim)));eq(successful.every(j=>j.status==='succeeded'),true);eq(Number(await scalar(a,'select count(*) as v from saved_tjai_plans where user_id=$1',[users[1]])),1);
 const regeneration=await Promise.all(clients.map(c=>enqueue(c,1)));eq(new Set(regeneration.map(j=>j.id)).size,1);eq((await finish(a,await claim(a))).status,'succeeded');eq((await Promise.all(clients.map(c=>enqueue(c,1)))).every(j=>j.error==='monthly_limit'),true);
 const reservations=await Promise.all(clients.map(c=>reserve(c,1)));const accepted=reservations.filter(r=>r.status==='reserved');eq(accepted.length,5);eq(reservations.filter(r=>r.error==='daily_limit').length,7);
 eq((await Promise.all(clients.map(c=>reply(c,1,accepted[0])))).every(r=>r.status==='succeeded'),true);
 await Promise.all(accepted.slice(1).map((r,i)=>reply(clients[i],1,r)));eq(Number(await scalar(a,'select count(*) as v from tjai_chat_messages where user_id=$1',[users[1]])),10);
 const budgets=await Promise.all(clients.map(c=>scalar(c,'select tjai_reserve_provider_tokens(1000) as v')));eq(budgets.filter(Boolean).length,7);await a.query("update tjai_provider_budget set tokens=case when bucket like 'd:%' then 179000 else 0 end");eq((await Promise.all(clients.map(c=>scalar(c,'select tjai_reserve_provider_tokens(1000) as v')))).filter(Boolean).length,1);
 // A pending refund must block finalization, then make it fail without a saved result.
 await enqueue(a,2);const revokeClaim=await claim(a);await a.query('begin');await a.query("update tjai_pass_purchases set status='refunded' where user_id=$1",[users[2]]);
 const finalizing=finish(b,revokeClaim);eq(await blocked(observer,pids[1]),true);await a.query('commit');eq((await finalizing).error_code,'access_revoked');eq(Number(await scalar(a,'select count(*) as v from saved_tjai_plans where user_id=$1',[users[2]])),0);
 // A result transaction that already acquired the entitlement lock precedes its refund.
 await enqueue(a,3);const beforeRefund=await claim(a);await b.query('begin');eq((await finish(b,beforeRefund)).status,'succeeded');
 const refundAfter=a.query("update tjai_pass_purchases set status='refunded' where user_id=$1",[users[3]]);eq(await blocked(observer,pids[0]),true);await b.query('commit');await refundAfter;eq(Number(await scalar(a,'select count(*) as v from saved_tjai_plans where user_id=$1',[users[3]])),1);
 const pendingReply=await reserve(a,4);await a.query('begin');await a.query("update tjai_pass_purchases set status='refunded' where user_id=$1",[users[4]]);const replying=reply(b,4,pendingReply);eq(await blocked(observer,pids[1]),true);await a.query('commit');eq((await replying).error,'access_revoked');eq(Number(await scalar(a,'select count(*) as v from tjai_chat_messages where user_id=$1',[users[4]])),0);
 // Force a same-id, different-owner insert race across independent transactions.
 const collision=randomUUID();await a.query('begin');const original=await reserve(a,0,collision);const colliding=reserve(b,5,collision);eq(await blocked(observer,pids[1]),true);await a.query('commit');eq((await colliding).error,'access_denied');eq(await scalar(a,'select reservation_token as v from tjai_reply_receipts where id=$1',[collision]),original.reservation_token);
 // A new pass cannot select legacy, and removal of an old purchase serializes with legacy saving.
 eq((await Promise.all(clients.map(c=>enqueue(c,5,'legacy')))).every(j=>j.error==='access_denied'),true);
 await a.query('insert into tjai_plan_purchases(user_id) values($1)',[users[5]]);await enqueue(a,5,'legacy');const legacyClaim=await claim(a);
 await a.query('begin');await a.query('delete from tjai_plan_purchases where user_id=$1',[users[5]]);const finishingLegacy=finish(b,legacyClaim);eq(await blocked(observer,pids[1]),true);await a.query('commit');eq((await finishingLegacy).error_code,'access_revoked');eq(Number(await scalar(a,'select count(*) as v from saved_tjai_plans where user_id=$1',[users[5]])),0);
 console.log(JSON.stringify({result:'passed',assertions:checks,independentConnections:pids.length,postgresVersion:await scalar(a,'select version() as v'),listenAddress:'127.0.0.1',port}));
}finally{
 for(const c of clients)await c.query('rollback').catch(()=>{});
 await Promise.allSettled(clients.map(c=>c.end()));
 if(server){await run(pg_ctl,['-D',data,'-m','fast','-w','stop']).catch(()=>{});}
 // Refuse a computed recursive deletion outside the explicitly created temporary runtime.
 if(resolve(cluster).startsWith(runtime+sep)&&(!server||server.exitCode!==null))await rm(cluster,{recursive:true,force:true});
}
