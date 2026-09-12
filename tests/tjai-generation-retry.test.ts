import {beforeEach,describe,expect,it,vi} from 'vitest';
import {NextRequest} from 'next/server';
import {readFileSync} from 'node:fs';
import {completedIntakePlan,createGenerationRetryController} from '@/lib/tjai/generation-retry';

const mocks=vi.hoisted(()=>({rpc:vi.fn(),mode:'pass'}));
vi.mock('@/lib/require-auth',()=>({requireAuth:async()=>({ok:true,user:{id:'owner'},supabase:{}})}));
vi.mock('@/lib/supabase-server',()=>({getSupabaseServerClient:()=>({rpc:mocks.rpc,from:()=>({select(){return this;},eq(){return this;},maybeSingle:async()=>({data:null,error:null})})})}));
vi.mock('@/lib/tjai/server-access',()=>({getTjaiServerAccess:async()=>({available:true,providerReady:true,workerReady:true,mode:mocks.mode})}));
vi.mock('@/lib/tjai/worker-dispatch',()=>({dispatchTjaiWorker:async()=>true}));
import {POST} from '@/app/api/tjai/jobs/route';

beforeEach(()=>{vi.clearAllMocks();mocks.mode='pass';});
describe('generation retry intent identity',()=>{
 it('uses the existing intake key for the original generation',()=>{
  const keys=createGenerationRetryController();
  expect(keys.requestFor('intake')).toBe('intake');expect(keys.requestFor('intake',null)).toBe('intake');
 });
 it('keeps the exact retry key through transport failure and repeated clicks',()=>{
  const keys=createGenerationRetryController();
  const request=keys.requestFor('intake','failed-job');
  expect(request).toBe('failed-job');expect(keys.requestFor('intake','failed-job')).toBe(request);expect(keys.requestFor('intake','failed-job')).toBe(request);
 });
 it('selects a new key only for a newly observed failed job or distinct initial intake',()=>{
  const keys=createGenerationRetryController(),previous=keys.requestFor('intake','failed-job');
  const next=keys.requestFor('intake','retry-job-now-failed');expect(next).not.toBe(previous);
  const other=keys.requestFor('other-intake','other-failed-job');expect(other).not.toBe(previous);
  expect(keys.requestFor('new-intake')).not.toBe(keys.requestFor('intake'));
  // A late read/retry of the old intent must not erase either newer identity.
  expect(keys.requestFor('intake','failed-job')).toBe(previous);
  expect(keys.requestFor('intake','retry-job-now-failed')).toBe(next);
  expect(keys.requestFor('other-intake','other-failed-job')).toBe(other);
 });
 it('reuses the server-issued failed-job UUID across independent reload and tab instances',()=>{
  const intakeId=crypto.randomUUID(),failedJobId=crypto.randomUUID();
  const original=createGenerationRetryController(),reloaded=createGenerationRetryController(),newTab=createGenerationRetryController();
  expect(original.requestFor(intakeId)).toBe(intakeId);
  const retry=original.requestFor(intakeId,failedJobId);
  expect(retry).toBe(failedJobId);expect(retry).not.toBe(intakeId);
  expect(reloaded.requestFor(intakeId,failedJobId)).toBe(retry);
  expect(newTab.requestFor(intakeId,failedJobId)).toBe(retry);
 });
 it.each(['pass','credit'])('replays a completed %s retry after lost enqueue acknowledgement without another generation',async(mode)=>{
  mocks.mode=mode;
  const keys=createGenerationRetryController(),intakeId=crypto.randomUUID(),failedJobId=crypto.randomUUID();
  const receipts=new Map<string,{id:string;user_id:string;intake_id:string;status:string;kind:string}>();let created=0,regenerations=0,debits=0;
  // Model the already-tested enqueue RPC contract: same key returns its receipt
  // even after success; a different key creates another job when none is active.
  mocks.rpc.mockImplementation(async(_name:string,args:{p_request:string;p_mode:string})=>{
   let receipt=receipts.get(args.p_request);
   if(!receipt){
    const kind=args.p_mode==='credit'?'credit':created===0?'initial':'regeneration';
    if(kind==='regeneration')regenerations++;if(kind==='credit')debits++;
    created++;receipt={id:crypto.randomUUID(),user_id:'owner',intake_id:intakeId,status:'succeeded',kind};receipts.set(args.p_request,receipt);
   }
   return {error:null,data:receipt};
  });
  const send=(instance:ReturnType<typeof createGenerationRetryController>)=>POST(new NextRequest('https://preview.example/api/tjai/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({intakeId,requestId:instance.requestFor(intakeId,failedJobId)})}));
  const committed=await send(keys);expect(committed.status).toBe(202);
  // Drop the acknowledgement: the browser still displays failedJobId. The
  // worker has completed before the user clicks Retry for a second time.
  const recovered=await send(createGenerationRetryController()),body=await recovered.json();expect(body.job.status).toBe('succeeded');
  expect(mocks.rpc.mock.calls[0][1].p_request).toBe(mocks.rpc.mock.calls[1][1].p_request);
  expect(created).toBe(1);expect(regenerations).toBe(0);expect(debits).toBe(mode==='credit'?1:0);
 });
 it('wires the stable key to the intake and observed terminal job in the shell',()=>{
  const source=readFileSync('src/components/tjai/tjai-shell.tsx','utf8');
  expect(source).toContain('useState(createGenerationRetryController)');
  expect(source).toContain("generationRequests.requestFor(intakeId,job?.status==='failed'&&job.intake_id===intakeId?job.id:null)");
  expect(source).toContain('JSON.stringify({intakeId,requestId})');
  expect(source).not.toContain("job?.status==='failed'?crypto.randomUUID():intakeId");
  expect(source).toContain("returnedIntake?'?intakeId='+encodeURIComponent(returnedIntake)");
  expect(source).toContain('completedIntakePlan<Saved>(returnedIntake,jobData?.job,jobData?.plan)');
 });
});

describe('completed intake return recovery',()=>{
 const plan={id:'owned-plan',plan_json:{summary:'Persisted result'}};
 it('restores the exact completed result when credit/access state has changed',()=>{
  expect(completedIntakePlan('intake',{intake_id:'intake',status:'succeeded',plan_id:plan.id},plan)).toBe(plan);
 });
 it.each([
  {intake_id:'unrelated-latest-intake',status:'succeeded',plan_id:plan.id},
  {intake_id:'intake',status:'failed',plan_id:plan.id},
  {intake_id:'intake',status:'running',plan_id:plan.id},
  {intake_id:'intake',status:'succeeded',plan_id:'another-plan'}
 ])('does not attach an unrelated or incomplete result %j',job=>{
  expect(completedIntakePlan('intake',job,plan)).toBeNull();
 });
 it('does not invent a completed plan from a missing receipt or result',()=>{
  expect(completedIntakePlan('intake',null,plan)).toBeNull();
  expect(completedIntakePlan('intake',{intake_id:'intake',status:'succeeded',plan_id:plan.id},null)).toBeNull();
 });
});
