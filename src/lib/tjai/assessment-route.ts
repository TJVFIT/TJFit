import type {Locale} from '@/lib/i18n';
export type AiSearchParams=Record<string,string|string[]|undefined>;
/** Only the assessment is public. Private hub tabs and saved intake returns keep their auth guard. */
export function isPublicAssessmentRequest(params:AiSearchParams):boolean{
 return params.start==='1'&&(params.tab===undefined||params.tab==='my-plan')&&!params.intake&&!params.resume&&!params.job;
}
export function aiReturnPath(locale:Locale,params:AiSearchParams):string{
 const query=new URLSearchParams();for(const [key,value] of Object.entries(params)){for(const item of Array.isArray(value)?value:value===undefined?[]:[value])query.append(key,item);}
 return '/'+locale+'/ai'+(query.size?'?'+query.toString():'');
}
