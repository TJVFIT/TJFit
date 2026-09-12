import {redirect} from 'next/navigation';
import {TJAIHub} from '@/components/tjai/tjai-hub';
import {createServerSupabaseClient} from '@/lib/supabase/server';
import {requireLocaleParam} from '@/lib/require-locale';
import {TJAIShell} from '@/components/tjai/tjai-shell';
import {aiReturnPath,isPublicAssessmentRequest,type AiSearchParams} from '@/lib/tjai/assessment-route';
import {classifyAuthSessionFailure} from '@/lib/auth-session-failure';
import {getAuthCopy} from '@/lib/launch-copy';
import {getTjaiFlowCopy} from '@/lib/tjai/flow-copy';
export const dynamic='force-dynamic';
export default async function AiPage(props:{params:Promise<{locale:string}>;searchParams?:Promise<AiSearchParams>}){
 const locale=requireLocaleParam((await props.params).locale);
 const search=await props.searchParams??{};
 if(isPublicAssessmentRequest(search))return <TJAIShell locale={locale} publicAssessment/>;
 const returnPath=aiReturnPath(locale,search);
 const loginPath='/'+locale+'/login?redirect='+encodeURIComponent(returnPath);
 const unavailable=()=> <section className="mx-auto max-w-xl space-y-5 px-4 py-16">
  <p role="alert" className="text-base leading-relaxed text-white">{getAuthCopy(locale).sessionCheckFailed}</p>
  <a href={returnPath} className="inline-flex min-h-[44px] items-center rounded-full border border-purple-300/40 px-5 py-2 text-sm font-semibold text-purple-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-300">{getTjaiFlowCopy(locale).retry}</a>
 </section>;
 let result:Awaited<ReturnType<Awaited<ReturnType<typeof createServerSupabaseClient>>['auth']['getUser']>>;
 try{
  const supabase=await createServerSupabaseClient();
  result=await supabase.auth.getUser();
 }catch(error){
  if(classifyAuthSessionFailure(error)==='signed_out')redirect(loginPath);
  return unavailable();
 }
 const {data:{user},error}=result;
 if(error){
  if(classifyAuthSessionFailure(error)==='signed_out')redirect(loginPath);
  return unavailable();
 }
 if(!user)redirect(loginPath);
 return <TJAIHub locale={locale}/>;
}
