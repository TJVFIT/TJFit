import {NextRequest,NextResponse} from 'next/server';
import {requireAuth} from '@/lib/require-auth';
import {readRequestJson} from '@/lib/read-request-json';
import {logHandlers,logNumber,validLogDate} from '@/lib/progress/logging';
import {rateLimit} from '@/lib/rate-limit';
function validate(body:Record<string,unknown>){
 if(typeof body.name!=='string'||!body.name.trim()||body.name.length>200)throw new Error('meal_required');
 const calories=logNumber(body.calories,0,10000),protein=logNumber(body.protein_g,0,1000),carbs=logNumber(body.carbs_g,0,2000),fat=logNumber(body.fat_g,0,1000);
 if([calories,protein,carbs,fat].some(n=>n===null))throw new Error('macros_required');
 return {entry_date:validLogDate(body.entry_date),name:body.name.trim(),calories,protein_g:protein,carbs_g:carbs,fat_g:fat,source:'manual',plan_id:null};
}
const handlers=logHandlers('nutrition_logs','meals','entry_date',validate);
export const GET=handlers.GET,DELETE=handlers.DELETE,PATCH=handlers.PATCH;
export async function POST(request:NextRequest){
 const parsed=await readRequestJson(request,8192);if(!parsed.ok)return parsed.response;
 const body=parsed.value as Record<string,any>;
 if(!body?.planId)return handlers.POST(new NextRequest(request.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
 const auth=await requireAuth();if(!auth.ok)return auth.response;
 const limit=await rateLimit({key:'fitness-log:'+auth.user.id,limit:60,windowMs:60000});if(!limit.success)return NextResponse.json({error:'rate_limit'},{status:429});
 const indices=[body.weekIndex,body.dayIndex,body.mealIndex];if(indices.some(i=>!Number.isInteger(i)||i<0||i>100))return NextResponse.json({error:'invalid_meal'},{status:400});
 const plan=await auth.supabase.from('saved_tjai_plans').select('plan_json').eq('id',body.planId).eq('user_id',auth.user.id).single();
 if(plan.error)return NextResponse.json({error:'plan_not_found'},{status:404});
 const meal=plan.data.plan_json?.diet?.weeks?.[body.weekIndex]?.days?.[body.dayIndex]?.meals?.[body.mealIndex];
 if(!meal)return NextResponse.json({error:'meal_not_found'},{status:404});
 try{
  const payload=validate({entry_date:body.entry_date,name:meal.name,calories:meal.calories,protein_g:meal.protein,carbs_g:meal.carbs,fat_g:meal.fat});
  const result=await auth.supabase.from('nutrition_logs').insert({...payload,user_id:auth.user.id,source:'plan_estimate',plan_id:body.planId}).select('*').single();
  return result.error?NextResponse.json({error:'save_failed'},{status:503}):NextResponse.json({meal:result.data},{status:201});
 }catch{return NextResponse.json({error:'invalid_meal'},{status:400});}
}
