import {NextRequest,NextResponse} from 'next/server';
import {requireAuth} from '@/lib/require-auth';
import {readRequestJson} from '@/lib/read-request-json';
import {turkeyPeriod} from '@/lib/tjai/intake-validation';
import {rateLimit} from '@/lib/rate-limit';

export function validLogDate(value:unknown):string{
 const day=value===undefined?turkeyPeriod():String(value);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(Date.parse(day))||new Date(day).toISOString().slice(0,10)!==day)throw new Error('invalid_date');
 return day;
}
export function logNumber(value:unknown,min:number,max:number,integer=false):number|null{
 if(value===null||value===undefined||value==='')return null;
 if(typeof value!=='number'&&typeof value!=='string')throw new Error('invalid_number');
 const n=Number(value);if(!Number.isFinite(n)||n<min||n>max||(integer&&!Number.isInteger(n)))throw new Error('invalid_number');
 return n;
}
export function validateWorkout(body:Record<string,unknown>){
 if(typeof body.exercise!=='string'||!body.exercise.trim()||body.exercise.length>200)throw new Error('exercise_required');
 let setsData:null|Array<{reps:number;weight_kg:number}>=null;
 if(body.sets_data!==undefined&&body.sets_data!==null){
  if(!Array.isArray(body.sets_data)||body.sets_data.length<1||body.sets_data.length>30)throw new Error('invalid_sets');
  setsData=body.sets_data.map(s=>{if(!s||typeof s!=='object')throw new Error('invalid_sets');const reps=logNumber(s.reps,1,1000,true),weight=logNumber(s.weight_kg,0,2000);if(reps===null||weight===null)throw new Error('invalid_sets');return {reps,weight_kg:weight};});
 }
 return {workout_date:validLogDate(body.workout_date),exercise:body.exercise.trim(),sets:setsData?.length??logNumber(body.sets,1,100,true),reps:setsData?setsData[0].reps:logNumber(body.reps,1,1000,true),weight_kg:setsData?setsData[0].weight_kg:logNumber(body.weight_kg,0,2000),sets_data:setsData,duration_minutes:logNumber(body.duration_minutes,1,1440,true),notes:typeof body.notes==='string'?body.notes.trim().slice(0,2000):null};
}
export function validateBodyEntry(body:Record<string,unknown>){
 const row={entry_date:validLogDate(body.entry_date),weight_kg:logNumber(body.weight_kg,1,700),body_fat_percent:logNumber(body.body_fat_percent,1,70),waist_cm:logNumber(body.waist_cm,1,300),chest_cm:logNumber(body.chest_cm,1,300),hips_cm:logNumber(body.hips_cm,1,300),notes:typeof body.notes==='string'?body.notes.trim().slice(0,2000):null};
 if([row.weight_kg,row.body_fat_percent,row.waist_cm,row.chest_cm,row.hips_cm].every(v=>v===null))throw new Error('measurement_required');return row;
}
type Table='progress_entries'|'workout_logs'|'nutrition_logs';
export function logHandlers(table:Table,key:string,date:string,validate:(body:Record<string,unknown>)=>Record<string,unknown>){
 const GET=async()=>{const auth=await requireAuth();if(!auth.ok)return auth.response;const r=await auth.supabase.from(table).select('*').eq('user_id',auth.user.id).order(date,{ascending:false}).order('created_at',{ascending:false}).limit(300);return r.error?NextResponse.json({error:'load_failed'},{status:503}):NextResponse.json({[key]:r.data??[]},{headers:{'Cache-Control':'no-store'}});};
 const write=async(request:NextRequest,update=false)=>{
  const auth=await requireAuth();if(!auth.ok)return auth.response;
  const limit=await rateLimit({key:'fitness-log:'+auth.user.id,limit:60,windowMs:60000});if(!limit.success)return NextResponse.json({error:'rate_limit'},{status:429});
  const parsed=await readRequestJson(request,8192);if(!parsed.ok)return parsed.response;const body=parsed.value as Record<string,unknown>;
  try{if(update&&typeof body.id!=='string')throw new Error('id_required');
   let previous:Record<string,unknown>={};
   if(update){const existing=await auth.supabase.from(table).select('*').eq('id',body.id).eq('user_id',auth.user.id).single();if(existing.error)return NextResponse.json({error:'not_found'},{status:404});previous=existing.data;}
   const payload=validate({...previous,...body});
   const query=update?auth.supabase.from(table).update(payload).eq('id',body.id).eq('user_id',auth.user.id):auth.supabase.from(table).insert({...payload,user_id:auth.user.id});
   const r=await query.select('*').single();if(r.error)return NextResponse.json({error:'save_failed'},{status:503});return NextResponse.json({[key==='entries'?'entry':key==='workouts'?'workout':'meal']:r.data},{status:update?200:201});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'invalid_log'},{status:400});}
 };
 const DELETE=async(request:NextRequest)=>{const auth=await requireAuth();if(!auth.ok)return auth.response;const id=request.nextUrl.searchParams.get('id');if(!id)return NextResponse.json({error:'id_required'},{status:400});const r=await auth.supabase.from(table).delete().eq('id',id).eq('user_id',auth.user.id).select('id').maybeSingle();return r.error?NextResponse.json({error:'delete_failed'},{status:503}):r.data?NextResponse.json({ok:true}):NextResponse.json({error:'not_found'},{status:404});};
 return {GET,POST:(r:NextRequest)=>write(r),PATCH:(r:NextRequest)=>write(r,true),DELETE};
}
