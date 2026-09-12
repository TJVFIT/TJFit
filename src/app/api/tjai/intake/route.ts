import {NextRequest,NextResponse} from 'next/server';
import {requireAuth} from '@/lib/require-auth';
import {getSupabaseServerClient} from '@/lib/supabase-server';
import {validateAdultIntake} from '@/lib/tjai/intake-validation';
import {readRequestJson} from '@/lib/read-request-json';
export async function POST(request:NextRequest){
 const auth=await requireAuth();if(!auth.ok)return auth.response;
 const parsed=await readRequestJson(request,65536);if(!parsed.ok)return parsed.response;
 if(!parsed.value||typeof parsed.value!=='object'||Array.isArray(parsed.value))return NextResponse.json({error:'invalid_request'},{status:400});
 const body=parsed.value as Record<string,unknown>;
 const checked=validateAdultIntake(body.answers,body.locale);
 if(!checked.ok)return NextResponse.json({error:checked.error},{status:400});
 if(body.generalFitness!==true||body.aiConsent!==true)return NextResponse.json({error:'consent_required'},{status:400});
 const admin=getSupabaseServerClient();if(!admin)return NextResponse.json({error:'unavailable'},{status:503});
 const result=await admin.from('tjai_intake_drafts').insert({user_id:auth.user.id,answers_json:checked.answers,age:checked.age,locale:checked.locale}).select('id').single();
 if(result.error)return NextResponse.json({error:'intake_save_failed'},{status:503});
 return NextResponse.json({intakeId:result.data.id},{status:201});
}
export async function GET(request:NextRequest){
 const auth=await requireAuth();if(!auth.ok)return auth.response;
 let query=auth.supabase.from('tjai_intake_drafts').select('id,answers_json,age,locale,created_at').eq('user_id',auth.user.id);
 const id=request.nextUrl.searchParams.get('id');if(id)query=query.eq('id',id);
 const result=await query.order('created_at',{ascending:false}).limit(1).maybeSingle();
 if(result.error)return NextResponse.json({error:'intake_load_failed'},{status:503});
 return NextResponse.json({intake:result.data});
}
