import type { SupabaseClient } from '@supabase/supabase-js';
import { getTjaiPassAccess } from '@/lib/tjai-pass';
import { getTJAIAccess } from '@/lib/tjai-access';
import { turkeyPeriod } from './intake-validation';
import {isFreeGroqConfigured} from './free-provider';
import {isTjaiWorkerConfigured} from './worker-dispatch';
import {isActiveLegacySubscription} from './legacy-access';

export async function getTjaiServerAccess(client: SupabaseClient, userId: string) {
  const [pass, purchase, sub, profile, draft, plan, replies, jobs] = await Promise.all([
    getTjaiPassAccess(client,userId),
    client.from('tjai_plan_purchases').select('id').eq('user_id',userId).limit(1),
    client.from('user_subscriptions').select('tier,status').eq('user_id',userId).maybeSingle(),
    client.from('profiles').select('role,tjai_credit_balance').eq('id',userId).maybeSingle(),
    client.from('tjai_intake_drafts').select('id,age').eq('user_id',userId).order('created_at',{ascending:false}).limit(1),
    client.from('saved_tjai_plans').select('id,answers_json').eq('user_id',userId).order('created_at',{ascending:false}).limit(1),
    client.from('tjai_reply_receipts').select('id',{count:'exact',head:true}).eq('user_id',userId).eq('period_key',turkeyPeriod()).eq('status','succeeded'),
    client.from('tjai_generation_jobs').select('id,status,kind').eq('user_id',userId).eq('period_key',turkeyPeriod(new Date(),true)).eq('kind','regeneration').in('status',['queued','running','succeeded'])
  ]);
  const isAdmin=profile.data?.role==='admin';
  const legacyPurchase=Boolean(purchase.data?.length);
  const paidSubscription=isActiveLegacySubscription(sub.data);
  const tier=(paidSubscription?sub.data!.tier:'core') as 'core'|'pro'|'apex';
  const base=getTJAIAccess(tier,{hasOneTimePlanPurchase:legacyPurchase,isAdmin});
  const legacy=isAdmin||legacyPurchase||paidSubscription;
  const unlimitedReplies=isAdmin||paidSubscription;
  const credits=Number(profile.data?.tjai_credit_balance??0);
  const hasPlan=Boolean(plan.data?.length);
  const previousAge=Number(plan.data?.[0]?.answers_json?.s1_age);
  const adultsConfirmed=Boolean(draft.data?.[0]?.age>=18 || (previousAge>=18&&previousAge<=100));
  const available=pass.available&&!draft.error&&!replies.error&&!jobs.error&&!purchase.error&&!sub.error&&!profile.error&&!plan.error;
  const hasAccess=pass.hasPass||legacy;
  return {
    ...base,available,providerReady:isFreeGroqConfigured(),workerReady:isTjaiWorkerConfigured(),hasPass:pass.hasPass,hasLegacyAccess:legacy,unlimitedReplies,credits,adultsConfirmed,isAdmin,hasPlan,
    intakeId:draft.data?.[0]?.id??null,
    canAccessHub:true,
    canGeneratePlan:available&&(hasAccess||credits>0)&&(!pass.hasPass||legacy||!hasPlan||!jobs.data?.length),
    canRegeneratePlan:available&&hasPlan&&(legacy||credits>0||(pass.hasPass&&!jobs.data?.length)),
    canUseChat:available&&adultsConfirmed&&hasAccess&&(unlimitedReplies||(replies.count??0)<5),
    canUseMealSwap:false,
    canUseDailyMealEmail:false,
    canRequestCoachReview:false,
    canUseEarlyAccessPerks:false,
    canUseProgress:true,
    canDownloadPdf:hasPlan&&(hasAccess||Boolean(plan.data?.[0]?.id)),
    coreTrialMessagesRemaining:Math.max(0,5-(replies.count??0)),
    dailyRepliesRemaining:unlimitedReplies?null:Math.max(0,5-(replies.count??0)),
    regenerationAvailable:!hasPlan||!jobs.data?.length,
    mode:legacy?'legacy':pass.hasPass?'pass':credits>0?'credit':null
  };
}
