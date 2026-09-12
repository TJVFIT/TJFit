import {NextResponse} from 'next/server';
import {requireAuth} from '@/lib/require-auth';
export async function GET(){
 const auth=await requireAuth();if(!auth.ok)return auth.response;
 const result=await auth.supabase.from('progress_entries').select('entry_date,weight_kg').eq('user_id',auth.user.id).not('weight_kg','is',null).order('entry_date',{ascending:false}).order('created_at',{ascending:false}).limit(30);
 if(result.error)return NextResponse.json({error:'progress_load_failed'},{status:503});
 const rows=result.data??[],first=rows[rows.length-1],last=rows[0],days=first&&last?(Date.parse(last.entry_date)-Date.parse(first.entry_date))/86400000:0;
 return NextResponse.json({hasEnoughData:days>=14,evaluation:null,actualWeeklyChange:days>=14?Number(((Number(last.weight_kg)-Number(first.weight_kg))*7/days).toFixed(2)):null,observedDays:days,source:'logged_bodyweight',autoRegeneration:false});
}
