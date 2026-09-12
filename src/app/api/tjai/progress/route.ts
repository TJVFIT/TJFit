import {NextResponse} from 'next/server';
import {requireAuth} from '@/lib/require-auth';
import {turkeyPeriod} from '@/lib/tjai/intake-validation';
export async function GET(){
 const auth=await requireAuth();if(!auth.ok)return auth.response;
 const since=new Date(Date.now()-6*86400000),start=turkeyPeriod(since),today=turkeyPeriod();
 const [weights,workouts,nutrition,plan]=await Promise.all([
  auth.supabase.from('progress_entries').select('entry_date,weight_kg').eq('user_id',auth.user.id).not('weight_kg','is',null).order('entry_date',{ascending:false}).order('created_at',{ascending:false}).limit(200),
  auth.supabase.from('workout_logs').select('id,workout_date,exercise,sets,reps,weight_kg,sets_data').eq('user_id',auth.user.id).order('workout_date',{ascending:false}).limit(300),
  auth.supabase.from('nutrition_logs').select('entry_date,calories,protein_g,source').eq('user_id',auth.user.id).gte('entry_date',start).lte('entry_date',today),
  auth.supabase.from('saved_tjai_plans').select('created_at,plan_json,training_days_per_week').eq('user_id',auth.user.id).order('created_at',{ascending:false}).limit(1).maybeSingle()
 ]);
 if([weights,workouts,nutrition,plan].some(r=>r.error))return NextResponse.json({error:'progress_load_failed'},{status:503});
 const points=Array.from(new Map((weights.data??[]).map(r=>[r.entry_date,r] as const).reverse()).values()).sort((a,b)=>a.entry_date.localeCompare(b.entry_date));
 const first=points[0]?.weight_kg??null,last=points[points.length-1]?.weight_kg??null;
 const uniqueDays=new Set((workouts.data??[]).filter(r=>r.workout_date>=start&&r.workout_date<=today).map(r=>r.workout_date));
 const summary=plan.data?.plan_json?.summary;
 const days=new Map<string,{calories:number;protein:number}>();
 for(const m of nutrition.data??[]){const d=days.get(m.entry_date)??{calories:0,protein:0};d.calories+=Number(m.calories);d.protein+=Number(m.protein_g);days.set(m.entry_date,d);}
 const observed=[...days.values()],proteinHit=summary?.protein?observed.filter(d=>d.protein>=summary.protein*0.9).length:null,calHit=summary?.calorieTarget?observed.filter(d=>Math.abs(d.calories-summary.calorieTarget)<=summary.calorieTarget*0.1).length:null;
 const age=plan.data?Math.max(0,(Date.now()-Date.parse(plan.data.created_at))/86400000):0,week=Math.min(12,Math.floor(age/7)+1);
 const targetDays=Number(plan.data?.training_days_per_week??0);
 return NextResponse.json({completion:{current_week:week,total_weeks:12,percent:targetDays?Math.min(100,Math.round(new Set((workouts.data??[]).filter(r=>r.workout_date>=plan.data!.created_at.slice(0,10)).map(r=>r.workout_date)).size/(targetDays*12)*100)):0,logged_days_this_week:uniqueDays.size},body_metrics:{starting_weight:first,current_weight:last,change_kg:first!==null&&last!==null?Number((last-first).toFixed(2)):null,sparkline:points.map(r=>Number(r.weight_kg))},macro_adherence:{observed_days:observed.length,protein_hit_percent:observed.length&&proteinHit!==null?Math.round(proteinHit/observed.length*100):null,calorie_hit_percent:observed.length&&calHit!==null?Math.round(calHit/observed.length*100):null,estimated:true},weekly_insight:'',next_workouts:plan.data?.plan_json?.program?.weeks?.[0]?.days?.slice(0,3)??[],current_streak:0,recent_logs:workouts.data??[]},{headers:{'Cache-Control':'no-store'}});
}
