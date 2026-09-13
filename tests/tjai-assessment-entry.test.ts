import {beforeEach,describe,expect,it,vi} from 'vitest';
import {aiReturnPath,isPublicAssessmentRequest} from '@/lib/tjai/assessment-route';
import {ASSESSMENT_DRAFT_KEY,ASSESSMENT_DRAFT_TTL_MS,clearPendingAssessment,readPendingAssessment,savePendingAssessment} from '@/lib/tjai/assessment-draft';
import type {Locale} from '@/lib/i18n';
import {renderToStaticMarkup} from 'react-dom/server';
import {getAuthCopy} from '@/lib/launch-copy';
import {getTjaiFlowCopy} from '@/lib/tjai/flow-copy';

const mocks=vi.hoisted(()=>({client:vi.fn(),user:vi.fn(),redirect:vi.fn((path:string)=>{throw new Error('REDIRECT:'+path);})}));
vi.mock('@/lib/supabase/server',()=>({createServerSupabaseClient:mocks.client}));
vi.mock('next/navigation',()=>({redirect:mocks.redirect}));
vi.mock('@/components/tjai/tjai-hub',()=>({TJAIHub:()=>null}));
vi.mock('@/components/tjai/tjai-shell',()=>({TJAIShell:()=>null}));
import AiPage from '@/app/[locale]/ai/page';
import {TJAIHub} from '@/components/tjai/tjai-hub';
import {TJAIShell} from '@/components/tjai/tjai-shell';

const answers={s1_age:29,s1_height:175,s1_weight:80,s5_days:4,s5_type:'home',s5_equipment:['bodyweight'],s5_duration:45,s12_diet_style:'balanced'};
const locales:Locale[]=['en','tr','ar','es','fr'];
function storage(){const values=new Map<string,string>();return {getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);},removeItem:(key:string)=>{values.delete(key);}};}
beforeEach(()=>{vi.clearAllMocks();mocks.user.mockResolvedValue({data:{user:null},error:null});mocks.client.mockResolvedValue({auth:{getUser:mocks.user}});});

describe('public assessment and private hub boundary',()=>{
 it.each(locales)('renders the %s assessment without private hub or server auth',async(locale)=>{
  const view=await AiPage({params:Promise.resolve({locale}),searchParams:Promise.resolve({tab:'my-plan',start:'1'})});
  expect(view.type).toBe(TJAIShell);expect(view.props).toMatchObject({locale,publicAssessment:true});expect(mocks.client).not.toHaveBeenCalled();expect(mocks.redirect).not.toHaveBeenCalled();
 });
 it.each([{tab:'chat',start:'1'},{tab:'progress',start:'1'},{tab:'my-plan',intake:'owned-draft',start:'1'},{tab:'my-plan',start:'1',resume:'1'},{tab:'my-plan',start:'1',job:'private-job'},{start:['1','1']},{}])('keeps private or ambiguous request %j authenticated',async(search)=>{
  expect(isPublicAssessmentRequest(search)).toBe(false);
  const path=aiReturnPath('en',search);
  await expect(AiPage({params:Promise.resolve({locale:'en'}),searchParams:Promise.resolve(search)})).rejects.toThrow('REDIRECT:/en/login?redirect='+encodeURIComponent(path));
  expect(mocks.user).toHaveBeenCalledOnce();
 });
 it('preserves intake, start, resume and repeated query values in the login return path',()=>{
  expect(aiReturnPath('ar',{tab:'my-plan',start:'1',resume:'1',intake:'draft-id',tag:['a','b']})).toBe('/ar/ai?tab=my-plan&start=1&resume=1&intake=draft-id&tag=a&tag=b');
 });
 it('returns the authenticated private hub for the explicit save-resume path',async()=>{
  mocks.user.mockResolvedValue({data:{user:{id:'user-a'}},error:null});
  const view=await AiPage({params:Promise.resolve({locale:'tr'}),searchParams:Promise.resolve({tab:'my-plan',start:'1',resume:'1'})});
  expect(view.type).toBe(TJAIHub);expect(view.props).toEqual({locale:'tr'});expect(mocks.redirect).not.toHaveBeenCalled();
 });
 it.each(locales)('shows a private-session outage with a safe %s retry path and no hub',async(locale)=>{
  mocks.user.mockResolvedValue({data:{user:null},error:{status:402,message:'private-provider-detail'}});
  const search={tab:'my-plan',intake:'draft-id',resume:'1'};
  const view=await AiPage({params:Promise.resolve({locale}),searchParams:Promise.resolve(search)});
  const html=renderToStaticMarkup(view);
  expect(view.type).not.toBe(TJAIHub);expect(view.type).not.toBe(TJAIShell);expect(mocks.redirect).not.toHaveBeenCalled();
  expect(html).toContain(getAuthCopy(locale).sessionCheckFailed);expect(html).toContain(getTjaiFlowCopy(locale).retry);
  expect(html).toContain('href="'+aiReturnPath(locale,search).replaceAll('&','&amp;')+'"');expect(html).not.toContain('private-provider-detail');
 });
 it.each(['configuration','network','unexpected'])('keeps the private hub closed on %s exceptions',async(kind)=>{
  if(kind==='configuration')mocks.client.mockRejectedValue(new Error('private-provider-detail'));
  else if(kind==='network')mocks.user.mockRejectedValue(new TypeError('private-provider-detail'));
  else mocks.user.mockResolvedValue({data:{user:null},error:{code:'unexpected_failure'}});
  const view=await AiPage({params:Promise.resolve({locale:'en'})});
  expect(view.type).not.toBe(TJAIHub);expect(renderToStaticMarkup(view)).toContain(getAuthCopy('en').sessionCheckFailed);expect(mocks.redirect).not.toHaveBeenCalled();
 });
 it('still redirects a known invalid session to sign-in',async()=>{
  mocks.user.mockResolvedValue({data:{user:null},error:{status:401,code:'bad_jwt'}});
  await expect(AiPage({params:Promise.resolve({locale:'en'})})).rejects.toThrow('REDIRECT:/en/login?redirect=%2Fen%2Fai');
 });
 it('does not query an unavailable identity service for the public assessment',async()=>{
  mocks.client.mockRejectedValue(new Error('unavailable'));
  const view=await AiPage({params:Promise.resolve({locale:'en'}),searchParams:Promise.resolve({start:'1',tab:'my-plan'})});
  expect(view.type).toBe(TJAIShell);expect(mocks.client).not.toHaveBeenCalled();
 });
});

describe('completed assessment through sign-in',()=>{
 it.each(locales)('stores and restores validated %s answers and both consents in tab storage',(locale)=>{
  const tab=storage(),draft=savePendingAssessment(tab,answers,locale,true,true,1000);
  expect(readPendingAssessment(tab,locale,2000)).toEqual(draft);
  expect(draft.answers).toMatchObject(answers);expect(draft).toMatchObject({generalFitness:true,aiConsent:true});
  clearPendingAssessment(tab);expect(readPendingAssessment(tab,locale,2000)).toBeNull();
 });
 it('does not store unsupported intake or missing consent',()=>{
  const tab=storage();
  expect(()=>savePendingAssessment(tab,{...answers,s1_age:17},'en',true,true)).toThrow('adults_only');
  expect(()=>savePendingAssessment(tab,answers,'en',true,false)).toThrow('consent_required');
  expect(tab.getItem(ASSESSMENT_DRAFT_KEY)).toBeNull();
 });
 it('expires completed answers and removes them rather than using stale consent',()=>{
  const tab=storage();savePendingAssessment(tab,answers,'en',true,true,1000);
  expect(readPendingAssessment(tab,'en',1001+ASSESSMENT_DRAFT_TTL_MS)).toBeNull();expect(tab.getItem(ASSESSMENT_DRAFT_KEY)).toBeNull();
 });
 it('rejects locale mismatch, malformed or future drafts and revalidates stored answers',()=>{
  const tab=storage();savePendingAssessment(tab,answers,'en',true,true,1000);expect(readPendingAssessment(tab,'tr',1000)).toBeNull();
  tab.setItem(ASSESSMENT_DRAFT_KEY,'{');expect(readPendingAssessment(tab,'en',1000)).toBeNull();
  const draft=savePendingAssessment(tab,answers,'en',true,true,1000);
  tab.setItem(ASSESSMENT_DRAFT_KEY,JSON.stringify({...draft,answers:{...draft.answers,s1_age:15}}));expect(readPendingAssessment(tab,'en',1000)).toBeNull();
  savePendingAssessment(tab,answers,'en',true,true,100000);expect(readPendingAssessment(tab,'en',1000)).toBeNull();
 });
});
