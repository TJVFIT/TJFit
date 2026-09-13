import {NextResponse} from 'next/server';
import {requireAuth} from '@/lib/require-auth';
import {buildUnicodeTjaiPdf} from '@/lib/tjai/unicode-pdf';
import {rateLimit} from '@/lib/rate-limit';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function POST(request:Request){
 const auth=await requireAuth();if(!auth.ok)return auth.response;
 const limit=await rateLimit({key:'tjai-pdf:'+auth.user.id,limit:10,windowMs:60000});if(!limit.success)return NextResponse.json({error:'rate_limit'},{status:429});
 const body=await request.json().catch(()=>({}));
 let query=auth.supabase.from('saved_tjai_plans').select('plan_json,metrics_json,answers_json,created_at').eq('user_id',auth.user.id);
 if(typeof body.planId==='string')query=query.eq('id',body.planId);
 const saved=await query.order('created_at',{ascending:false}).limit(1).maybeSingle();
 if(saved.error)return NextResponse.json({error:'plan_load_failed'},{status:503});
 if(!saved.data)return NextResponse.json({error:'plan_not_found'},{status:404});
 try{
  const row=saved.data;
  const locale=['en','tr','ar','es','fr'].includes(body.locale)?body.locale:'en';
  const pdf=buildUnicodeTjaiPdf({plan:row.plan_json,metrics:row.metrics_json,createdAt:row.created_at,locale});
  const bytes=new Uint8Array(pdf.output('arraybuffer'));
  return new Response(bytes,{headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="tjai-plan-'+locale+'.pdf"','Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({error:'pdf_failed'},{status:503});}
}
