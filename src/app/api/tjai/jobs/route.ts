import {NextRequest,NextResponse} from 'next/server';
import {requireAuth} from '@/lib/require-auth';
import {getSupabaseServerClient} from '@/lib/supabase-server';
import {getTjaiServerAccess} from '@/lib/tjai/server-access';
import {readRequestJson} from '@/lib/read-request-json';
import {dispatchTjaiWorker} from '@/lib/tjai/worker-dispatch';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const publicJobFields=['id','intake_id','status','kind','attempts','available_at','error_code','plan_id','created_at','updated_at'] as const;
function publicJob(job:Record<string,unknown>){return Object.fromEntries(publicJobFields.map(key=>[key,job[key]]));}
export async function POST(request:NextRequest){
 const auth=await requireAuth();if(!auth.ok)return auth.response;
 const parsed=await readRequestJson(request,2048);if(!parsed.ok)return parsed.response;
 if(!parsed.value||typeof parsed.value!=='object'||Array.isArray(parsed.value))return NextResponse.json({error:'invalid_request'},{status:400});
 const body=parsed.value as Record<string,unknown>;
 if(!uuid.test(String(body.intakeId))||!uuid.test(String(body.requestId)))return NextResponse.json({error:'invalid_request'},{status:400});
 const admin=getSupabaseServerClient();if(!admin)return NextResponse.json({error:'unavailable'},{status:503});
 // Recover an owned receipt before new-admission gates. Its last credit may
 // already be reserved, or provider/worker configuration may now be disabled.
 const existing=await admin.from('tjai_generation_jobs').select('user_id,id,intake_id,status,kind,attempts,available_at,error_code,plan_id,created_at,updated_at').eq('user_id',auth.user.id).eq('request_key',body.requestId).maybeSingle();
 if(existing.error)return NextResponse.json({error:'job_load_failed'},{status:503});
 if(existing.data){
  if(existing.data.user_id!==auth.user.id||existing.data.intake_id!==body.intakeId||!uuid.test(String(existing.data.id)))return NextResponse.json({error:'job_intake_mismatch'},{status:409});
  return NextResponse.json({job:publicJob(existing.data)},{status:202,headers:{'Cache-Control':'private, no-store'}});
 }
 const access=await getTjaiServerAccess(admin,auth.user.id);
 if(!access.available)return NextResponse.json({error:'access_unavailable'},{status:503});
 if(!access.providerReady)return NextResponse.json({error:'provider_unavailable'},{status:503});
 if(!access.workerReady)return NextResponse.json({error:'worker_unavailable'},{status:503});
 if(!access.mode)return NextResponse.json({error:'pass_required'},{status:402});
 const result=await admin.rpc('tjai_enqueue_job',{p_user:auth.user.id,p_intake:body.intakeId,p_request:body.requestId,p_mode:access.mode});
 if(result.error)return NextResponse.json({error:'queue_unavailable'},{status:503});
 if(result.data?.error)return NextResponse.json({error:result.data.error},{status:409});
 // The same key may have been admitted concurrently for another intake, or
 // enqueue may return an already-active job. Do not attach it to this intake.
 if(!result.data||result.data.user_id!==auth.user.id||result.data.intake_id!==body.intakeId||!uuid.test(String(result.data.id)))return NextResponse.json({error:'job_intake_mismatch'},{status:409});
 if(result.data.status==='queued')await dispatchTjaiWorker();
 return NextResponse.json({job:publicJob(result.data)},{status:202,headers:{'Cache-Control':'private, no-store'}});
}
export async function GET(request:NextRequest){
 const auth=await requireAuth();if(!auth.ok)return auth.response;
 let query=auth.supabase.from('tjai_generation_jobs').select('id,intake_id,status,kind,attempts,available_at,error_code,plan_id,created_at,updated_at').eq('user_id',auth.user.id);
 const id=request.nextUrl.searchParams.get('id');if(id){if(!uuid.test(id))return NextResponse.json({error:'invalid_id'},{status:400});query=query.eq('id',id);}
 const intakeId=request.nextUrl.searchParams.get('intakeId');if(intakeId){if(!uuid.test(intakeId))return NextResponse.json({error:'invalid_intake'},{status:400});query=query.eq('intake_id',intakeId);}
 const result=await query.order('created_at',{ascending:false}).limit(1).maybeSingle();
 if(result.error)return NextResponse.json({error:'job_load_failed'},{status:503});
 let plan=null;
 if(result.data?.status==='succeeded'){
  const saved=await auth.supabase.from('saved_tjai_plans').select('id,plan_json,metrics_json,answers_json,created_at').eq('id',result.data.plan_id).eq('user_id',auth.user.id).single();
  if(saved.error)return NextResponse.json({error:'plan_load_failed'},{status:503});
  plan=saved.data;
 }
 return NextResponse.json({job:result.data,plan},{headers:{'Cache-Control':'no-store'}});
}
