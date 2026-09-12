import {beforeEach,describe,expect,it,vi} from 'vitest';
import {NextRequest} from 'next/server';

const mocks=vi.hoisted(()=>({lookup:vi.fn(),rpc:vi.fn(),access:vi.fn(),dispatch:vi.fn(),eq:vi.fn(),jobRead:vi.fn(),planRead:vi.fn()}));
const owner='11111111-1111-4111-8111-111111111111',intake='22222222-2222-4222-8222-222222222222',requestId='33333333-3333-4333-8333-333333333333',jobId='44444444-4444-4444-8444-444444444444',otherIntake='55555555-5555-4555-8555-555555555555';
const chain=(terminal:typeof mocks.lookup)=>({select(){return this;},eq(...args:unknown[]){mocks.eq(...args);return this;},order(){return this;},limit(){return this;},maybeSingle:terminal,single:terminal});
vi.mock('@/lib/require-auth',()=>({requireAuth:async()=>({ok:true,user:{id:owner},supabase:{from:(table:string)=>chain(table==='tjai_generation_jobs'?mocks.jobRead:mocks.planRead)}})}));
vi.mock('@/lib/supabase-server',()=>({getSupabaseServerClient:()=>({rpc:mocks.rpc,from:()=>chain(mocks.lookup)})}));
vi.mock('@/lib/tjai/server-access',()=>({getTjaiServerAccess:mocks.access}));
vi.mock('@/lib/tjai/worker-dispatch',()=>({dispatchTjaiWorker:mocks.dispatch}));
import {GET,POST} from '@/app/api/tjai/jobs/route';

function receipt(overrides:Record<string,unknown>={}){return {id:jobId,user_id:owner,intake_id:intake,request_key:requestId,status:'succeeded',kind:'credit',attempts:1,available_at:'2026-09-13T00:00:00Z',error_code:null,plan_id:'66666666-6666-4666-8666-666666666666',created_at:'2026-09-13T00:00:00Z',updated_at:'2026-09-13T00:00:00Z',lease_token:null,lease_until:null,...overrides};}
const post=(intakeId=intake)=>POST(new NextRequest('https://preview.example/api/tjai/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({intakeId,requestId})}));
beforeEach(()=>{vi.clearAllMocks();mocks.lookup.mockResolvedValue({data:null,error:null});mocks.access.mockResolvedValue({available:true,providerReady:true,workerReady:true,mode:'pass'});mocks.dispatch.mockResolvedValue(true);});

describe('owner-scoped generation receipt replay',()=>{
 it.each(['queued','running','succeeded','failed'])('returns an existing %s receipt without new admission or worker dispatch',async(status)=>{
  mocks.lookup.mockResolvedValue({data:receipt({status}),error:null});
  mocks.access.mockResolvedValue({available:true,providerReady:false,workerReady:false,mode:null});
  const response=await post(),body=await response.json();
  expect(response.status).toBe(202);expect(body.job).toMatchObject({id:jobId,intake_id:intake,status});
  expect(body.job).not.toHaveProperty('lease_token');expect(body.job).not.toHaveProperty('lease_until');expect(body.job).not.toHaveProperty('request_key');expect(body.job).not.toHaveProperty('user_id');
  expect(mocks.eq).toHaveBeenCalledWith('user_id',owner);expect(mocks.eq).toHaveBeenCalledWith('request_key',requestId);
  expect(mocks.access).not.toHaveBeenCalled();expect(mocks.rpc).not.toHaveBeenCalled();expect(mocks.dispatch).not.toHaveBeenCalled();
 });
 it('recovers a last-credit job completed before its enqueue acknowledgement was lost',async()=>{
  mocks.access.mockResolvedValueOnce({available:true,providerReady:true,workerReady:true,mode:'credit'});
  mocks.rpc.mockResolvedValueOnce({data:receipt({status:'queued',plan_id:null}),error:null});
  expect((await post()).status).toBe(202); // Client loses this acknowledgement.
  mocks.lookup.mockResolvedValue({data:receipt(),error:null});
  mocks.access.mockResolvedValue({available:true,providerReady:false,workerReady:false,mode:null});
  expect((await (await post()).json()).job.status).toBe('succeeded');
  expect(mocks.rpc).toHaveBeenCalledOnce();expect(mocks.dispatch).toHaveBeenCalledOnce();expect(mocks.access).toHaveBeenCalledOnce();
 });
 it('rejects reuse of an owned key for another intake before admission',async()=>{
  mocks.lookup.mockResolvedValue({data:receipt(),error:null});expect((await post(otherIntake)).status).toBe(409);expect(mocks.rpc).not.toHaveBeenCalled();expect(mocks.access).not.toHaveBeenCalled();
 });
 it('fails closed when receipt lookup is unavailable',async()=>{
  mocks.lookup.mockResolvedValue({data:null,error:{code:'outage'}});expect((await post()).status).toBe(503);expect(mocks.rpc).not.toHaveBeenCalled();expect(mocks.access).not.toHaveBeenCalled();
 });
 it.each([
  [{available:false,providerReady:true,workerReady:true,mode:'pass'},503],
  [{available:true,providerReady:false,workerReady:true,mode:'pass'},503],
  [{available:true,providerReady:true,workerReady:false,mode:'pass'},503],
  [{available:true,providerReady:true,workerReady:true,mode:null},402]
 ])('still gates a fresh admission with %j',async(access,status)=>{
  mocks.access.mockResolvedValue(access);expect((await post()).status).toBe(status);expect(mocks.rpc).not.toHaveBeenCalled();expect(mocks.dispatch).not.toHaveBeenCalled();
 });
 it.each([{intake_id:otherIntake},{user_id:'another-owner'},{id:'invalid-id'}])('rejects an RPC identity race %j without dispatch',async(change)=>{
  mocks.rpc.mockResolvedValue({data:receipt({status:'queued',...change}),error:null});expect((await post()).status).toBe(409);expect(mocks.dispatch).not.toHaveBeenCalled();
 });
 it('does not dispatch a completed receipt returned by concurrent enqueue',async()=>{
  mocks.rpc.mockResolvedValue({data:receipt(),error:null});const result=await post();expect(result.status).toBe(202);expect((await result.json()).job).not.toHaveProperty('request_key');expect(mocks.dispatch).not.toHaveBeenCalled();
 });
});

describe('intake-specific job reload',()=>{
 it('filters jobs by both owner and requested intake and loads the exact owned result',async()=>{
  const job=receipt(),plan={id:job.plan_id,plan_json:{summary:'Persisted'},answers_json:{s1_age:29},metrics_json:{},created_at:job.created_at};
  mocks.jobRead.mockResolvedValue({data:job,error:null});mocks.planRead.mockResolvedValue({data:plan,error:null});
  const response=await GET(new NextRequest('https://preview.example/api/tjai/jobs?intakeId='+intake)),body=await response.json();
  expect(response.status).toBe(200);expect(body.plan).toEqual(plan);expect(mocks.eq).toHaveBeenCalledWith('intake_id',intake);expect(mocks.eq).toHaveBeenCalledWith('id',job.plan_id);expect(mocks.eq.mock.calls.filter(c=>c[0]==='user_id'&&c[1]===owner)).toHaveLength(2);
 });
 it('does not fall back to the latest unrelated job when the requested intake has none',async()=>{
  mocks.jobRead.mockResolvedValue({data:null,error:null});const response=await GET(new NextRequest('https://preview.example/api/tjai/jobs?intakeId='+intake));expect(await response.json()).toEqual({job:null,plan:null});expect(mocks.eq).toHaveBeenCalledWith('intake_id',intake);expect(mocks.planRead).not.toHaveBeenCalled();
 });
 it('rejects malformed intake filters before reading rows',async()=>{
  expect((await GET(new NextRequest('https://preview.example/api/tjai/jobs?intakeId=invalid'))).status).toBe(400);expect(mocks.jobRead).not.toHaveBeenCalled();
 });
});
