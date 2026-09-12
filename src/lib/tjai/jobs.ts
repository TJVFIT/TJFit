import type { SupabaseClient } from '@supabase/supabase-js';
import { callFreeGroq,TjaiProviderError } from './free-provider';
import { compactPrompt,expandCompactPlan } from './compact-plan';
import {getTjaiPassAccess} from '@/lib/tjai-pass';
import {validateAdultIntake} from './intake-validation';
import {getTjaiLegacyAccess} from './legacy-access';

export async function processNextTjaiJob(admin:SupabaseClient,_workerId:string):Promise<{processed:boolean;jobId?:string;status?:string}>{
 const claimed=await admin.rpc('tjai_claim_job');
 if(claimed.error)throw new Error('job_claim_failed');
 const job=claimed.data;
 if(!job)return {processed:false};
 if(job.status==='failed')return {processed:true,jobId:job.id,status:'failed'};
 try{
   if(job.kind==='initial'||job.kind==='regeneration'){
    const access=await getTjaiPassAccess(admin,job.user_id);
    if(!access.available)throw new TjaiProviderError('access_unavailable',65);
    if(!access.hasPass)throw new TjaiProviderError('access_revoked');
   }
   if(job.kind==='legacy'){
    const access=await getTjaiLegacyAccess(admin,job.user_id);
    if(!access.available)throw new TjaiProviderError('access_unavailable',65);
    if(!access.hasAccess)throw new TjaiProviderError('access_revoked');
   }
   const draft=await admin.from('tjai_intake_drafts').select('answers_json').eq('id',job.intake_id).eq('user_id',job.user_id).single();
   if(draft.error||!draft.data)throw new Error('intake_unavailable');
   const checked=validateAdultIntake(draft.data.answers_json,draft.data.answers_json.locale);
   if(!checked.ok)throw new TjaiProviderError(checked.error);
   const prompt=compactPrompt(draft.data.answers_json);
   const output=await callFreeGroq({...prompt,jsonMode:true,maxTokens:1600});
   const {plan,metrics}=expandCompactPlan(JSON.parse(output),draft.data.answers_json);
   const finish=await admin.rpc('tjai_finish_job',{p_job:job.id,p_lease:job.lease_token,p_plan:plan,p_metrics:metrics});
   if(finish.error||finish.data?.error)throw new Error('plan_save_failed');
   return {processed:true,jobId:job.id,status:finish.data?.status??'succeeded'};
 }catch(error){
   const code=error instanceof TjaiProviderError?error.code:error instanceof SyntaxError?'invalid_plan':error instanceof Error?error.message:'generation_failed';
   const retry=error instanceof TjaiProviderError?error.retrySeconds:['intake_unavailable','nutrition_targets_unsupported'].includes(code)?0:65;
   const finish=await admin.rpc('tjai_finish_job',{p_job:job.id,p_lease:job.lease_token,p_plan:null,p_metrics:null,p_error:code,p_retry_seconds:retry});
   if(finish.error||finish.data?.error)throw new Error('job_recovery_pending');
   return {processed:true,jobId:job.id,status:finish.data?.status??'failed'};
 }
}
