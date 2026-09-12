// Run with a temporary @electric-sql/pglite install; no production connection.
// node tests/lemon-database.integration.mjs C:/temp/.../node_modules/@electric-sql/pglite/dist/index.js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
const { PGlite } = await import(pathToFileURL(process.argv[2]).href);
const db = new PGlite();
await db.exec(`create schema auth; create table auth.users(id uuid primary key);
  create role anon; create role authenticated; create role service_role;
  create function auth.uid() returns uuid language sql as 'select null::uuid';`);
await db.exec(await readFile(new URL('../supabase/migrations/20260912000100_lemon_digital_checkout.sql', import.meta.url), 'utf8'));
const user = randomUUID(), otherUser = randomUUID();
await db.query('insert into auth.users(id) values($1),($2)', [user, otherUser]);
let assertions = 0;
function equal(actual, expected) { assertions++; assert.deepEqual(actual, expected); }
async function intent({ mode=false, kind='tjai_pass', owner=user } = {}) {
  const id = randomUUID();
  await db.query(`insert into public.digital_checkout_intents(id,user_id,email,program_slug,product_kind,amount_minor,store_id,product_id,variant_id,test_mode,intake_id,locale)
    values($1,$2,'buyer@example.test',$3,$4,$5,'12','6','8',$6,$7,'en')`,
    [id, owner, kind==='bundle'?'home-starter':'tjai-pass',kind,kind==='bundle'?1000:1999,mode,kind==='bundle'?null:randomUUID()]);
  return id;
}
function event(id, order, changes={}) { return { intentId:id,orderId:String(order),storeId:'12',productId:'6',variantId:'8',email:'buyer@example.test',testMode:false,amountMinor:1999,totalMinor:1999,eventName:'order_created',refunded:false,...changes }; }
async function apply(value, salt='') {
  const hash = createHash('sha256').update(JSON.stringify(value)+salt).digest('hex');
  return (await db.query('select public.apply_lemon_order_event($1::jsonb,$2) as result',[JSON.stringify(value),hash])).rows[0].result;
}
async function count(table, where='true', args=[]) { return Number((await db.query(`select count(*) as count from public.${table} where ${where}`, args)).rows[0].count); }

try {
  const live = await intent(); const paid = event(live,101);
  equal((await apply(paid)).status,'paid');
  equal((await apply(paid)).duplicate,true);
  equal((await apply(paid,'different-delivery')).status,'paid');
  equal(await count('tjai_pass_purchases',"provider_order_id='101' and status='active'"),1);
  equal((await apply({...paid,eventName:'order_refunded',refunded:true})).status,'refunded');
  equal((await apply(paid,'late-sale')).status,'refunded');
  equal(await count('tjai_pass_purchases',"provider_order_id='101' and status='active'"),0);

  const before = await intent();
  equal((await apply(event(before,102,{eventName:'order_refunded',refunded:true}))).status,'refunded');
  equal((await apply(event(before,102))).status,'refunded');
  equal(await count('tjai_pass_purchases',"provider_order_id='102'"),0);
  const test = await intent({mode:true});
  equal((await apply(event(test,101,{testMode:true}))).status,'test_paid');
  equal(await count('tjai_pass_purchases',"intent_id=$1",[test]),0);
  equal(await count('lemon_order_receipts',"provider_order_id='101'"),2);

  for (const changes of [{email:'attacker@example.test'},{storeId:'13'},{productId:'7'},{variantId:'9'},{amountMinor:1},{testMode:true}]) {
    const id = await intent({owner:otherUser});
    equal((await apply(event(id,200+assertions,changes))).status,'review');
    equal(await count('tjai_pass_purchases','intent_id=$1',[id]),0);
  }
  const single = await intent();
  equal((await apply(event(single,301))).status,'paid');
  equal((await apply(event(single,302))).status,'review');
  equal(await count('tjai_pass_purchases','intent_id=$1',[single]),1);
  equal((await apply(event(single,302,{refunded:true,eventName:'order_refunded'}))).status,'review');
  equal(await count('tjai_pass_purchases',"intent_id=$1 and status='active'",[single]),1);

  const bundle = await intent({kind:'bundle'});
  equal((await apply(event(bundle,401,{amountMinor:1000}))).status,'paid');
  equal(await count('digital_bundle_purchases',"intent_id=$1 and user_id=$2 and status='active'",[bundle,user]),1);
  await apply(event(bundle,401,{amountMinor:1000,refunded:true,eventName:'order_refunded'}));
  equal(await count('digital_bundle_purchases',"intent_id=$1 and status='active'",[bundle]),0);

  // An entitlement failure must roll back the receipt and event as well.
  await db.exec(`create function public.test_reject_grant() returns trigger language plpgsql as $$begin raise exception 'test_atomic_failure'; end;$$;
    create trigger test_reject_grant before insert on public.tjai_pass_purchases for each row execute function public.test_reject_grant();`);
  const failure = await intent(); const failEvent = event(failure,501);
  await assert.rejects(() => apply(failEvent), /test_atomic_failure/); assertions++;
  equal(await count('lemon_order_receipts',"provider_order_id='501'"),0);
  equal(await count('lemon_payment_events',"provider_order_id='501'"),0);
  equal((await db.query('select status from public.digital_checkout_intents where id=$1',[failure])).rows[0].status,'pending');
  await db.exec('drop trigger test_reject_grant on public.tjai_pass_purchases');
  equal((await apply(failEvent)).status,'paid');
  equal(await count('tjai_pass_purchases',"provider_order_id='501'"),1);

  await db.exec('set role authenticated');
  await assert.rejects(() => apply(event(failure,999)), /permission denied/); assertions++;
  await assert.rejects(() => db.query(`insert into public.tjai_pass_purchases(provider_order_id,user_id,intent_id,status) values('999',$1,$2,'active')`,[user,randomUUID()]), /permission denied/); assertions++;
  equal(await count('tjai_pass_purchases'),0); // self RLS: auth.uid() is null in this test session
  await db.exec('reset role');
  console.log(`Lemon migration and transactional fulfillment: ${assertions} assertions passed in isolated embedded PostgreSQL.`);
  console.log('Event ordering and rollback tested; PGlite serializes queries, so concurrent independent PostgreSQL connections still require staging validation.');
} finally { await db.close(); }
