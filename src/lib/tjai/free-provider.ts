import { getSupabaseServerClient } from '@/lib/supabase-server';

export class TjaiProviderError extends Error {
  constructor(public code:string,public retrySeconds=0){super(code);}
}
export function isFreeGroqConfigured(){
  return process.env.TJAI_PROVIDER_ENABLED==='true' && process.env.TJAI_GROQ_ZDR_CONFIRMED==='true' && Boolean(process.env.TJAI_LLM_API_KEY?.trim()) && (!process.env.TJAI_LLM_PRESET||process.env.TJAI_LLM_PRESET==='groq');
}
export function reserveTokenEstimate(messages:Array<{content:string}>,maxTokens:number){
  return messages.reduce((sum,m)=>sum+new TextEncoder().encode(m.content).length+32,128)+maxTokens;
}
export async function callFreeGroq(input:{system:string;user?:string;messages?:Array<{role:'user'|'assistant';content:string}>;maxTokens?:number;jsonMode?:boolean}){
  if(!isFreeGroqConfigured())throw new TjaiProviderError('provider_unavailable');
  const maxTokens=Math.min(3200,Math.max(100,input.maxTokens??800));
  const messages=[{role:'system',content:input.system},...(input.messages??[]),...(input.user?[{role:'user',content:input.user}]:[])];
  const estimate=reserveTokenEstimate(messages,maxTokens);
  if(estimate>7000)throw new TjaiProviderError('context_too_large');
  const admin=getSupabaseServerClient();
  if(!admin)throw new TjaiProviderError('provider_unavailable');
  const admission=await admin.rpc('tjai_reserve_provider_tokens',{p_tokens:estimate});
  if(admission.error)throw new TjaiProviderError('provider_accounting_unavailable');
  if(!admission.data)throw new TjaiProviderError('provider_capacity',65);
  const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{
    method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+process.env.TJAI_LLM_API_KEY},
    signal:AbortSignal.timeout(45000),
    body:JSON.stringify({model:'openai/gpt-oss-120b',messages,max_completion_tokens:maxTokens,reasoning_effort:'low',temperature:input.jsonMode?0.2:0.6,...(input.jsonMode?{response_format:{type:'json_object'}}:{})})
  });
  if(!response.ok){
    const retry=Math.min(3600,Math.max(10,Number(response.headers.get('retry-after'))||65));
    throw new TjaiProviderError(response.status===429?'provider_capacity':'provider_unavailable',[429,500,502,503].includes(response.status)?retry:0);
  }
  const data=await response.json();
  const text=data?.choices?.[0]?.message?.content;
  if(typeof text!=='string'||!text.trim()||data?.choices?.[0]?.finish_reason==='length')throw new TjaiProviderError('incomplete_response');
  return text;
}
