"use client";
import {useEffect,useMemo,useState,useCallback} from 'react';
import {useSearchParams} from 'next/navigation';
import {TJAIQuiz} from './tjai-quiz';
import {TJAIResult} from './tjai-result';
import {getDirection,type Locale} from '@/lib/i18n';
import {getTjaiCopy,getTjaiSteps} from '@/lib/tjai-copy';
import {getTjaiFlowCopy} from '@/lib/tjai/flow-copy';
import {getAssessmentCopy} from '@/lib/tjai/assessment-copy';
import {completedIntakePlan,createGenerationRetryController} from '@/lib/tjai/generation-retry';
import {clearPendingAssessment,readPendingAssessment,savePendingAssessment} from '@/lib/tjai/assessment-draft';
import type {QuizAnswers,TJAIPlan,TJAIMetrics} from '@/lib/tjai-types';
type Phase='quiz'|'approach'|'calculating'|'compare'|'result';
type Saved={id:string;plan_json:TJAIPlan;answers_json:QuizAnswers;metrics_json:TJAIMetrics;created_at:string};
type Access={available:boolean;canGeneratePlan:boolean;hasPass:boolean;hasLegacyAccess:boolean;mode:string|null;regenerationAvailable:boolean};
type Job={id:string;intake_id:string;status:string;error_code?:string;available_at:string};
export function TJAIShell({locale,initialAnswers,initialPhase='quiz',publicAssessment=false}:{locale:Locale;initialAnswers?:QuizAnswers;initialPhase?:Phase;publicAssessment?:boolean}){
 const t=getTjaiFlowCopy(locale),assessment=getAssessmentCopy(locale),query=useSearchParams();
 const [phase,setPhase]=useState<'loading'|'intro'|'quiz'|'review'|'waiting'|'result'|'signin'|'save-intake'>('loading');
 const [answers,setAnswers]=useState<QuizAnswers>(initialAnswers??{});
 const [saved,setSaved]=useState<Saved|null>(null),[job,setJob]=useState<Job|null>(null),[access,setAccess]=useState<Access|null>(null);
 const [intakeId,setIntakeId]=useState<string|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [adult,setAdult]=useState(false),[consent,setConsent]=useState(false);
 const [generationRequests]=useState(createGenerationRetryController);
 const copy=useMemo(()=>getTjaiCopy(locale),[locale]),steps=useMemo(()=>getTjaiSteps(locale).map(step=>step.id==='s1_age'?{...step,min:18}:step),[locale]);
 const load=useCallback(async()=>{
  setError('');
  try{
   if(publicAssessment||query.get('resume')==='1'){
    const pending=readPendingAssessment(window.sessionStorage,locale);
    if(pending){setAnswers(pending.answers);setAdult(true);setConsent(true);setPhase(publicAssessment?'signin':'save-intake');return;}
    if(!publicAssessment)setError(assessment.expired);
    setPhase('intro');return;
   }
   const returnedIntake=query.get('intake');
   const jobsUrl='/api/tjai/jobs'+(returnedIntake?'?intakeId='+encodeURIComponent(returnedIntake):'');
   const [planResponse,jobResponse,accessResponse]=await Promise.all([fetch('/api/tjai/save',{cache:'no-store'}),fetch(jobsUrl,{cache:'no-store'}),fetch('/api/tjai/access',{cache:'no-store'})]);
   if(!planResponse.ok)throw new Error('load');
   const planData=await planResponse.json();setSaved(planData.plan??null);
   const accessData=await accessResponse.json();setAccess(accessResponse.ok?accessData:null);
   if(!jobResponse.ok)throw new Error('load');
   const jobData=await jobResponse.json();
   if(returnedIntake&&jobData?.job&&jobData.job.intake_id!==returnedIntake)throw new Error('job_intake_mismatch');
   const completed=completedIntakePlan<Saved>(returnedIntake,jobData?.job,jobData?.plan);
   if(completed){setSaved(completed);setJob(jobData.job);setIntakeId(returnedIntake);setPhase('result');return;}
   const resumedJob=jobData?.job&&(['queued','running'].includes(jobData.job.status)||(jobData.job.status==='failed'&&(returnedIntake||query.get('start')!=='1')))?jobData.job:null;
   const restoreIntake=resumedJob?.intake_id??returnedIntake;
   if(restoreIntake){
    const d=await fetch('/api/tjai/intake?id='+encodeURIComponent(restoreIntake));if(!d.ok)throw new Error('load');
    const draft=await d.json();if(!draft.intake)throw new Error('load');
    setAnswers(draft.intake.answers_json);setIntakeId(restoreIntake);setAdult(true);setConsent(true);
    if(resumedJob){setJob(resumedJob);setPhase(resumedJob.status==='failed'?'review':'waiting');if(resumedJob.status==='failed')setError(resumedJob.error_code==='nutrition_targets_unsupported'?t.nutrition:t.failed);}else setPhase('review');
    return;
   }
   if(query.get('start')==='1'||!planData.plan){setPhase('intro');return;}
   setPhase('result');
  }catch{setError(t.error);setPhase('intro');}
 },[query,t.error,t.failed,t.nutrition,locale,publicAssessment,assessment.expired]);
 useEffect(()=>{void load();},[load]);
 const pollingJobId=job?.id;
 useEffect(()=>{
  if(phase!=='waiting'||!pollingJobId)return;
  let stopped=false;
  const poll=async()=>{try{
   const response=await fetch('/api/tjai/jobs?id='+pollingJobId,{cache:'no-store'});if(!response.ok)throw new Error('load');
   const data=await response.json();if(stopped)return;setJob(data.job);
   if(data.job?.status==='succeeded'&&data.plan){setSaved(data.plan);setPhase('result');setError('');}
   else if(data.job?.status==='failed'){setPhase('review');setIntakeId(data.job.intake_id);setError(data.job.error_code==='nutrition_targets_unsupported'?t.nutrition:t.failed);}
  }catch{if(!stopped)setError(t.error);}};
  void poll();const timer=setInterval(()=>void poll(),4000);return()=>{stopped=true;clearInterval(timer);};
 },[phase,pollingJobId,t.error,t.failed,t.nutrition]);
 const submit=async(value:QuizAnswers)=>{
 setBusy(true);setError('');
  try{
   const pending=savePendingAssessment(window.sessionStorage,value,locale,adult,consent);setAnswers(pending.answers);
   const response=await fetch('/api/tjai/intake',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({answers:pending.answers,locale,generalFitness:adult,aiConsent:consent})});
   if(response.status===401){setPhase('signin');return;}
   const data=await response.json();if(!response.ok)throw new Error(data.error);
   clearPendingAssessment(window.sessionStorage);
   window.location.assign('/'+locale+'/ai?tab=my-plan&intake='+encodeURIComponent(data.intakeId));
  }catch(e){setError(e instanceof Error&&e.message==='nutrition_targets_unsupported'?t.nutrition:e instanceof Error&&e.message==='general_fitness_scope'?t.scope:e instanceof Error&&['adults_only','invalid_measurements'].includes(e.message)?t.adults:t.error);}finally{setBusy(false);}
 };
 const generate=async()=>{
  if(!intakeId)return;setBusy(true);setError('');
  try{
   const requestId=generationRequests.requestFor(intakeId,job?.status==='failed'&&job.intake_id===intakeId?job.id:null);
   const response=await fetch('/api/tjai/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({intakeId,requestId})});
   const data=await response.json();
   if(response.status===402){window.location.href='/'+locale+'/tjai/checkout?intake='+intakeId;return;}
   if(!response.ok)throw new Error(data.error);
   setJob(data.job);setPhase('waiting');
  }catch(e){setError(e instanceof Error&&e.message==='monthly_limit'?t.limit:t.error);}finally{setBusy(false);}
 };
 const button='rounded-xl bg-accent px-5 py-3 font-semibold text-white disabled:opacity-40';
 const resumePath='/'+locale+'/ai?tab=my-plan&start=1&resume=1';
 return <section dir={getDirection(locale)} className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
  <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold text-white">{t.title}</h1>{saved&&phase!=='result'&&<button className="text-accent" onClick={()=>setPhase('result')}>{t.back}</button>}</div>
  {error&&<div role="alert" className="rounded-xl border border-amber-400/40 p-4 text-amber-200">{error} <button className="underline" onClick={()=>void load()}>{t.retry}</button></div>}
  {phase==='loading'&&<p role="status">{t.loading}</p>}
  {phase==='intro'&&<div className="space-y-5 rounded-2xl border border-divider bg-card p-6"><p>{t.terms}</p><label className="flex gap-3"><input type="checkbox" checked={adult} onChange={e=>setAdult(e.target.checked)}/>{t.adult}</label><label className="flex gap-3"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>{t.consent}</label><button className={button} disabled={!adult||!consent} onClick={()=>setPhase('quiz')}>{t.continue}</button></div>}
  {phase==='quiz'&&<><TJAIQuiz initialAnswers={answers} locale={locale} copy={copy} steps={steps} direction={getDirection(locale)} onAnswersChange={setAnswers} onSubmit={submit}/>{busy&&<p role="status">{t.loading}</p>}</>}
  {(phase==='signin'||phase==='save-intake')&&<div className="space-y-5 rounded-2xl border border-divider bg-card p-6"><h2 className="text-xl font-semibold">{t.review}</h2><p>{String(answers.s1_age)} · {String(answers.s1_height)} cm · {String(answers.s1_weight)} kg · {String(answers.s5_days)} / 7</p><p>{assessment.temporary}</p>{phase==='signin'?<div className="flex flex-wrap items-center gap-4"><a className={button} href={'/'+locale+'/login?redirect='+encodeURIComponent(resumePath)}>{assessment.signin}</a><a className="text-accent underline" href={'/'+locale+'/signup?redirect='+encodeURIComponent(resumePath)}>{assessment.signup}</a></div>:<button className={button} disabled={busy} onClick={()=>void submit(answers)}>{busy?t.loading:assessment.save}</button>}<button disabled={busy} className="text-accent disabled:opacity-40" onClick={()=>setPhase('quiz')}>{t.review}</button></div>}
  {phase==='review'&&<div className="space-y-5 rounded-2xl border border-divider bg-card p-6"><h2 className="text-xl font-semibold">{t.review}</h2><p>{String(answers.s1_age)} · {String(answers.s1_height)} cm · {String(answers.s1_weight)} kg · {String(answers.s5_days??4)} / 7</p><p>{t.terms}</p>{!access&&<p role="alert">{t.error}</p>}<button className={button} disabled={busy||!access} onClick={()=>access?.mode?void generate():window.location.assign('/'+locale+'/tjai/checkout?intake='+intakeId)}>{busy?t.loading:access?.mode?t.generate:t.buy}</button><button className="ml-4 text-accent" onClick={()=>setPhase('quiz')}>{t.review}</button></div>}
  {phase==='waiting'&&<div className="space-y-4 rounded-2xl border border-divider bg-card p-6"><p role="status">{t.queued}</p><p className="text-sm text-muted">{t.recovery}</p></div>}
  {phase==='result'&&saved&&<><p className="text-sm text-emerald-300">{t.saved} · {new Date(saved.created_at).toLocaleDateString(locale)}</p><TJAIResult locale={locale} copy={copy} plan={saved.plan_json} answers={saved.answers_json} metrics={saved.metrics_json} generatedAt={saved.created_at} isSaving={false} onSave={async()=>{const r=await fetch('/api/tjai/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({planId:saved.id})});if(!r.ok)throw new Error(t.error);}} onStartOver={()=>{if(access&&!access.canGeneratePlan){setError(t.limit);return;}setJob(null);setPhase('intro');}}/></>}
 </section>;
}

