import type {Locale} from '@/lib/i18n';
import type {QuizAnswers} from '@/lib/tjai-types';
import {validateAdultIntake} from './intake-validation';
export const ASSESSMENT_DRAFT_KEY='tjai_pending_assessment_v1';
export const ASSESSMENT_DRAFT_TTL_MS=2*60*60*1000;
type DraftStorage=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export type PendingAssessment={version:1;locale:Locale;answers:QuizAnswers;generalFitness:true;aiConsent:true;savedAt:number};
export function clearPendingAssessment(storage:DraftStorage){try{storage.removeItem(ASSESSMENT_DRAFT_KEY);}catch{/* A blocked storage surface must not expose or log the draft. */}}
export function savePendingAssessment(storage:DraftStorage,answers:QuizAnswers,locale:Locale,generalFitness:boolean,aiConsent:boolean,now=Date.now()):PendingAssessment{
 const checked=validateAdultIntake(answers,locale);if(!checked.ok)throw new Error(checked.error);
 if(!generalFitness||!aiConsent)throw new Error('consent_required');
 const draft:PendingAssessment={version:1,locale,answers:checked.answers,generalFitness:true,aiConsent:true,savedAt:now};
 storage.setItem(ASSESSMENT_DRAFT_KEY,JSON.stringify(draft));return draft;
}
export function readPendingAssessment(storage:DraftStorage,locale:Locale,now=Date.now()):PendingAssessment|null{
 try{
  const raw=storage.getItem(ASSESSMENT_DRAFT_KEY);if(!raw)return null;if(raw.length>24000)throw new Error('invalid_draft');
  const draft=JSON.parse(raw) as PendingAssessment;
  if(draft.version!==1||draft.locale!==locale||draft.generalFitness!==true||draft.aiConsent!==true||!Number.isFinite(draft.savedAt)||draft.savedAt>now+60000||now-draft.savedAt>ASSESSMENT_DRAFT_TTL_MS)throw new Error('invalid_draft');
  const checked=validateAdultIntake(draft.answers,locale);if(!checked.ok)throw new Error('invalid_draft');
  return {...draft,answers:checked.answers};
 }catch{clearPendingAssessment(storage);return null;}
}
