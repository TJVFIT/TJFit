import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe,expect,it,vi} from 'vitest';
import {locales} from '@/lib/i18n';
import {getTjaiCopy} from '@/lib/tjai-copy';
import {scanSource} from '../scripts/i18n/check-hardcoded-ui';
vi.mock('@/components/auth-provider',()=>({useAuth:()=>({user:null,loading:false})}));
vi.mock('next/navigation',()=>({usePathname:()=>'/ar/ai',useRouter:()=>({}),useSearchParams:()=>new URLSearchParams()}));
vi.mock('@/components/tjai/tjai-chat-standalone',()=>({TJAIChatStandalone:()=>null}));
vi.mock('@/components/tjai/tjai-my-plan-tab',()=>({TJAIMyPlanTab:()=>null}));
vi.mock('@/components/tjai/tjai-progress-tab',()=>({TJAIProgressTab:()=>null}));
vi.mock('@/components/tjai/what-if-panel',()=>({WhatIfPanel:()=>null}));
vi.mock('@/components/3d/hero-stage',()=>({TJHeroStage:()=>null}));
import {DASHBOARD_ACTION_COPY,QuickLogWidget,saveDashboardWorkout} from '@/components/user-dashboard-view';
import {PageRecovery,RECOVERY_COPY,recoveryLocale} from '@/components/main-error-boundary';
import {QUIZ_RECOVERY_COPY,TJAIQuiz} from '@/components/tjai/tjai-quiz';
import {HUB_ACTION_COPY,TJAIHub} from '@/components/tjai/tjai-hub';

function escaped(text:string){return renderToStaticMarkup(createElement('span',null,text)).slice(6,-7);}
describe('active customer recovery and save localization',()=>{
 it.each(locales)('%s renders accessible workout labels and save controls',(locale)=>{
  const t=DASHBOARD_ACTION_COPY[locale],html=renderToStaticMarkup(createElement(QuickLogWidget,{locale}));
  for(const key of ['workoutTitle','save','fullLog'] as const)expect(html).toContain(escaped(t[key]));
  for(const key of ['exercise','sets','reps','weight'] as const)expect(html).toContain(`aria-label="${escaped(t[key])}"`);
  expect(html).toContain('aria-expanded="false"');expect(Object.keys(t)).toEqual(Object.keys(DASHBOARD_ACTION_COPY.en));
 });
 it.each(locales)('%s offers a real localized retry with the correct reading direction',(locale)=>{
  const t=RECOVERY_COPY[locale],retry=vi.fn(),node=PageRecovery({locale,retry}),html=renderToStaticMarkup(node);
  expect(recoveryLocale(`/${locale}/ai`)).toBe(locale);expect(html).toContain(`dir="${locale==='ar'?'rtl':'ltr'}"`);
  for(const key of ['title','message','reload'] as const)expect(html).toContain(escaped(t[key]));
  node.props.children[2].props.onClick();expect(retry).toHaveBeenCalledOnce();
 });
 it.each(locales)('%s localizes missing quiz options and gives a usable recovery action',(locale)=>{
  const t=QUIZ_RECOVERY_COPY[locale],html=renderToStaticMarkup(createElement(TJAIQuiz,{locale,copy:getTjaiCopy(locale),steps:[{id:'empty-options',section:'Synthetic section',sectionNumber:1,totalSections:1,question:'Synthetic question',type:'single',options:[],required:true}],direction:locale==='ar'?'rtl':'ltr',onSubmit:()=>{}}));
  expect(html).toContain('role="alert"');expect(html).toContain(escaped(t.options));expect(html).toContain(escaped(t.reload));expect(html).toContain(`1 ${t.of} 1`);expect(html).not.toContain('Please tap Continue');
 });
 it.each(locales)('%s localizes the empty quiz load state and hub access action',(locale)=>{
  const quiz=renderToStaticMarkup(createElement(TJAIQuiz,{locale,copy:getTjaiCopy(locale),steps:[],direction:locale==='ar'?'rtl':'ltr',onSubmit:()=>{}}));
  expect(quiz).toContain(escaped(QUIZ_RECOVERY_COPY[locale].loading));expect(quiz).toContain(escaped(QUIZ_RECOVERY_COPY[locale].reload));
  const hub=renderToStaticMarkup(createElement(TJAIHub,{locale}));expect(hub).toContain(escaped(HUB_ACTION_COPY[locale].upgrade));expect(hub).not.toContain('Upgrade →');
 });
 it('uses a safe recovery locale when there is no valid route context',()=>{expect(recoveryLocale(null)).toBe('en');expect(recoveryLocale('/api/private')).toBe('en');expect(recoveryLocale('/not-a-locale')).toBe('en');});
 it.each(['src/components/user-dashboard-view.tsx','src/components/main-error-boundary.tsx','src/app/global-error.tsx','src/components/tjai/tjai-quiz.tsx','src/components/tjai/tjai-hub.tsx'])('%s has no untranslated direct copy sinks',(file)=>{expect(scanSource(readFileSync(file,'utf8'),file)).toEqual([]);});
});
describe('dashboard workout confirmation',()=>{
 const payload={exercise:'Squat',sets:3,reps:8,weight_kg:0};
 it('confirms only a successful response containing the persisted workout ID',async()=>{
  const fetcher=vi.fn().mockResolvedValue(new Response(JSON.stringify({workout:{id:'workout-a',...payload}}),{status:201}));
  await expect(saveDashboardWorkout(payload,fetcher)).resolves.toMatchObject({id:'workout-a',weight_kg:0});
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual(payload);expect(fetcher.mock.calls[0][1].credentials).toBe('include');
 });
 it.each([400,401,429,503])('does not report saved for HTTP %s',async(status)=>{
  const fetcher=vi.fn().mockResolvedValue(new Response(JSON.stringify({error:'synthetic'}),{status}));
  await expect(saveDashboardWorkout(payload,fetcher)).rejects.toThrow('workout_save_failed');expect(payload).toEqual({exercise:'Squat',sets:3,reps:8,weight_kg:0});
 });
 it('rejects missing persistence receipts and network errors',async()=>{
  await expect(saveDashboardWorkout(payload,vi.fn().mockResolvedValue(new Response('{}',{status:200})))).rejects.toThrow('workout_save_unconfirmed');
  await expect(saveDashboardWorkout(payload,vi.fn().mockRejectedValue(new Error('network')))).rejects.toThrow('network');
 });
});
