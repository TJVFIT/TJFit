import {NextResponse} from 'next/server';
import {requireAuth} from '@/lib/require-auth';
export const dynamic='force-dynamic';
export async function GET(){
 const auth=await requireAuth();if(!auth.ok)return auth.response;
 const result=await auth.supabase.from('saved_tjai_plans').select('*').eq('user_id',auth.user.id).order('version_number',{ascending:false}).order('created_at',{ascending:false}).limit(1).maybeSingle();
 if(result.error)return NextResponse.json({error:'plan_load_failed'},{status:503});
 return NextResponse.json({plan:result.data,plans:result.data?[result.data]:[]},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(request:Request){
 const auth=await requireAuth();if(!auth.ok)return auth.response;
 const body=await request.json().catch(()=>null);
 if(typeof body?.planId!=='string')return NextResponse.json({error:'server_generated_plans_only'},{status:400});
 const result=await auth.supabase.from('saved_tjai_plans').select('id').eq('id',body.planId).eq('user_id',auth.user.id).single();
 if(result.error)return NextResponse.json({error:'plan_not_found'},{status:404});
 return NextResponse.json({ok:true,planId:result.data.id});
}

