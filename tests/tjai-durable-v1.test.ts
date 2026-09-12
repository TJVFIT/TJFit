import {afterEach,describe,expect,it,vi} from 'vitest';
import {validateAdultIntake,turkeyPeriod} from '../src/lib/tjai/intake-validation';
import {compactContext,compactPrompt,expandCompactPlan} from '../src/lib/tjai/compact-plan';
import {reserveTokenEstimate,isFreeGroqConfigured,callFreeGroq} from '../src/lib/tjai/free-provider';
import {isTaskAvailable,resolveTaskProvider} from '../src/lib/tjai/provider-policy';
import {validLogDate,validateBodyEntry,validateWorkout} from '../src/lib/progress/logging';
import {workoutForCoach} from '../src/lib/tjai/workout-context';
import {nutritionMatches} from '../src/lib/tjai/macro-balance';
vi.mock('@/lib/supabase-server',()=>({getSupabaseServerClient:()=>({rpc:vi.fn().mockResolvedValue({data:true,error:null})})}));
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
const intake={s1_age:29,s1_height:175,s1_weight:80,s5_days:4,s5_type:'home',s5_equipment:['bodyweight'],s5_duration:45,s12_diet_style:'balanced'};
function valid(locale='en'){const v=validateAdultIntake(intake,locale);if(!v.ok)throw new Error(v.error);return v.answers;}
function fixture(answers=valid()){const {profile,allowed}=compactContext(answers);const options=[{protein:'chicken',carbs:'rice'},{protein:'fish',carbs:'potato'},{protein:'eggs',carbs:'oats'}];return {days:Array.from({length:profile.trainingDays},()=>allowed.slice(0,4)),meals:Array.from({length:Math.max(3,Math.min(5,profile.mealsPerDay))},(_,i)=>options[i%3])};}
describe('adult intake and calendar boundaries',()=>{
 it('rejects minors and invalid required measurements',()=>{expect(validateAdultIntake({...intake,s1_age:17},'en').ok).toBe(false);expect(validateAdultIntake({...intake,s1_weight:NaN},'en').ok).toBe(false);expect(validateAdultIntake({...intake,s1_height:0},'en').ok).toBe(false);});
 it('rejects unsupported clinical scope before payment',()=>{expect(validateAdultIntake({...intake,s17_injuries:['chronic_condition']},'en')).toMatchObject({ok:false,error:'general_fitness_scope'});expect(validateAdultIntake({...intake,s13_restriction_notes:'severe custom allergy'},'en').ok).toBe(false);});
 it('uses Türkiye midnight/month instead of UTC',()=>{expect(turkeyPeriod(new Date('2026-09-30T20:59:59Z'))).toBe('2026-09-30');expect(turkeyPeriod(new Date('2026-09-30T21:00:00Z'))).toBe('2026-10-01');expect(turkeyPeriod(new Date('2026-09-30T21:00:00Z'),true)).toBe('2026-10');});
});
describe('bounded plan expansion',()=>{
 it.each(['en','tr','ar','es','fr'])('creates a complete persisted-plan shape in %s with correct totals',(locale)=>{const a=valid(locale),{plan,metrics}=expandCompactPlan(fixture(a),a);expect(plan.program.weeks).toHaveLength(6);expect(plan.program.weeks[0].days).toHaveLength(4);expect(plan.diet.weeks[0].days).toHaveLength(7);const day=plan.diet.weeks[0].days[0];expect(day.totals.calories).toBe(day.meals.reduce((sum,m)=>sum+m.calories,0));expect(nutritionMatches(day.totals,metrics)).toBe(true);expect(plan.program.weeks[1].isDeload).toBe(true);});
 it('rejects unknown exercise IDs and wrong session counts',()=>{expect(()=>expandCompactPlan({...fixture(),days:[['invented']]},valid())).toThrow();const c=fixture();c.days[0][0]='machine-not-owned';expect(()=>expandCompactPlan(c,valid())).toThrow('invalid_exercises');});
 it('rejects forbidden food for a vegan profile',()=>{const a=valid();a.s12_diet_style='vegan';expect(()=>expandCompactPlan(fixture(),a)).toThrow('invalid_food');});
 it('reserves a compact bounded request, including multilingual profiles',()=>{for(const locale of ['en','tr','ar','es','fr']){const prompt=compactPrompt(valid(locale));expect(reserveTokenEstimate([{content:prompt.system},{content:prompt.user}],1600)).toBeLessThan(7000);}});
});
describe('free-only provider boundary',()=>{
 it('never falls back to legacy paid keys',()=>{vi.stubEnv('TJAI_PROVIDER_ENABLED','false');vi.stubEnv('OPENAI_API_KEY','unused');vi.stubEnv('ANTHROPIC_API_KEY','unused');expect(resolveTaskProvider('plan_generate')).toBe('none');expect(isTaskAvailable('meal_swap')).toBe(false);});
 it('requires all account gates and rejects non-Groq presets',()=>{vi.stubEnv('TJAI_PROVIDER_ENABLED','true');vi.stubEnv('TJAI_GROQ_ZDR_CONFIRMED','true');vi.stubEnv('TJAI_LLM_API_KEY','test-only');vi.stubEnv('TJAI_LLM_PRESET','groq');expect(isFreeGroqConfigured()).toBe(true);vi.stubEnv('TJAI_LLM_PRESET','openrouter');expect(isFreeGroqConfigured()).toBe(false);});
 it('uses only the fixed Groq host/model and exposes overload as retriable',async()=>{vi.stubEnv('TJAI_PROVIDER_ENABLED','true');vi.stubEnv('TJAI_GROQ_ZDR_CONFIRMED','true');vi.stubEnv('TJAI_LLM_API_KEY','test-only');vi.stubEnv('TJAI_LLM_PRESET','groq');vi.stubEnv('TJAI_LLM_BASE_URL','https://paid.invalid');const fetcher=vi.fn().mockResolvedValue(new Response('{}',{status:429,headers:{'retry-after':'30'}}));vi.stubGlobal('fetch',fetcher);await expect(callFreeGroq({system:'test',user:'test'})).rejects.toMatchObject({code:'provider_capacity',retrySeconds:30});expect(fetcher.mock.calls[0][0]).toBe('https://api.groq.com/openai/v1/chat/completions');expect(JSON.parse(fetcher.mock.calls[0][1].body).model).toBe('openai/gpt-oss-120b');});
});
describe('canonical logs',()=>{
 it('summarizes differing actual sets instead of repeating the first set',()=>{expect(workoutForCoach({workout_date:'2026-09-12',exercise:'Squat',sets:2,reps:12,weight_kg:100,sets_data:[{reps:12,weight_kg:100},{reps:8,weight_kg:80}]})).toEqual({date:'2026-09-12',exercise:'Squat',setCount:2,totalReps:20,volumeKg:1840,maxLoadKg:100});});
 it('permits editing legacy workouts with a null per-set column',()=>{expect(validateWorkout({exercise:'Squat',sets:2,reps:10,weight_kg:50,sets_data:null})).toMatchObject({sets:2,reps:10,weight_kg:50,sets_data:null});});
 it('rejects impossible dates and invalid numbers instead of saving null',()=>{expect(()=>validLogDate('2026-02-30')).toThrow();expect(()=>validateBodyEntry({weight_kg:-10})).toThrow();expect(()=>validateBodyEntry({})).toThrow();expect(()=>validateWorkout({exercise:'Squat',sets_data:[{reps:2.5,weight_kg:20}]})).toThrow();});
 it('preserves each set independently and permits zero external load',()=>{const r=validateWorkout({exercise:'Push-up',sets_data:[{reps:12,weight_kg:0},{reps:8,weight_kg:5}]});expect(r.sets).toBe(2);expect(r.sets_data?.[1]).toEqual({reps:8,weight_kg:5});});
});
