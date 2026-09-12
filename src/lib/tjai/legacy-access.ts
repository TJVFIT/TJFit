import type {SupabaseClient} from '@supabase/supabase-js';
export function isActiveLegacySubscription(subscription:{tier:string;status:string}|null|undefined):boolean{
 return Boolean(subscription&&['pro','apex'].includes(subscription.tier)&&['active','trialing'].includes(subscription.status));
}
/** Preserve the historical generation backend contract; a new TJAI pass alone is never legacy. */
export async function getTjaiLegacyAccess(client:SupabaseClient,userId:string):Promise<{hasAccess:boolean;available:boolean}>{
 const [purchase,subscription,profile]=await Promise.all([
  client.from('tjai_plan_purchases').select('id').eq('user_id',userId).limit(1),
  client.from('user_subscriptions').select('tier,status').eq('user_id',userId).maybeSingle(),
  client.from('profiles').select('role').eq('id',userId).maybeSingle()
 ]);
 const available=!purchase.error&&!subscription.error&&!profile.error;
 return {available,hasAccess:available&&(Boolean(purchase.data?.length)||profile.data?.role==='admin'||isActiveLegacySubscription(subscription.data))};
}
