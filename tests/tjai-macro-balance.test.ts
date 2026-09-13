import {describe,expect,it} from 'vitest';
import {validateAdultIntake} from '../src/lib/tjai/intake-validation';
import {normalizeQuizAnswers,buildTjaiUserProfile} from '../src/lib/tjai-intake';
import {calculateTJAIMetrics} from '../src/lib/tjai-science';
import {allowedFoods} from '../src/lib/tjai/food-catalog';
import {balanceMeal,FOOD_PORTION_BOUNDS,MAX_MEAL_GRAMS,MAX_PROTEIN_FOOD_GRAMS,nutritionMatches,preflightNutrition,totalPortions} from '../src/lib/tjai/macro-balance';
import {compactContext,expandCompactPlan} from '../src/lib/tjai/compact-plan';
const base={s1_age:29,s1_height:175,s1_weight:80,s5_days:4,s5_type:'home',s5_equipment:['bodyweight'],s5_duration:45};
const setup=(extra:Record<string,unknown>={})=>{const answers=normalizeQuizAnswers({...base,...extra,locale:'en'}),profile=buildTjaiUserProfile(answers),metrics=calculateTJAIMetrics(answers);return {answers,profile,metrics};};
function assertPortions(portions:NonNullable<ReturnType<typeof balanceMeal>>,proteinIds:string[]){
 expect(portions.reduce((sum,p)=>sum+p.grams,0)).toBeLessThanOrEqual(MAX_MEAL_GRAMS);
 expect(portions.filter(p=>proteinIds.includes(p.id)).reduce((sum,p)=>sum+p.grams,0)).toBeLessThanOrEqual(MAX_PROTEIN_FOOD_GRAMS);
 for(const p of portions){expect(Number.isInteger(p.grams)).toBe(true);if(p.id==='apple'||p.id==='carrot')expect(p.grams).toBe(100);else{expect(p.grams).toBeGreaterThanOrEqual(FOOD_PORTION_BOUNDS[p.id][0]);expect(p.grams).toBeLessThanOrEqual(FOOD_PORTION_BOUNDS[p.id][1]);}}
}
describe('bounded macro balancing',()=>{
 it.each(['balanced','vegetarian','vegan','high_protein','low_carb','halal'].flatMap(diet=>[3,4,5].map(meals=>({diet,meals}))))('matches all four daily targets for $diet / $meals meals',({diet,meals})=>{
  const {profile,metrics}=setup({s12_diet_style:diet,s11_meals:meals});expect(preflightNutrition(profile,metrics)).toBe(true);
  const allowed=allowedFoods(profile),portions=Array.from({length:meals},(_,i)=>balanceMeal(profile,metrics,meals,i));expect(portions.every(Boolean)).toBe(true);
  for(const p of portions)assertPortions(p!,allowed.protein);
  const totals=totalPortions(portions.flatMap(p=>p!));
  for(const [key,target] of Object.entries({calories:metrics.calorieTarget,protein:metrics.protein,carbs:metrics.carbs,fat:metrics.fat}))expect(Math.abs(totals[key as keyof typeof totals]-target)/target).toBeLessThanOrEqual(0.05);
 });
 it.each(['balanced','vegetarian','vegan'])('all permitted model pairings stay in tolerance for %s',(diet)=>{
  const {answers,profile,metrics}=setup({s12_diet_style:diet}),allowed=allowedFoods(profile),context=compactContext(answers);
  for(const protein of allowed.protein)for(const carbs of allowed.carbs){const {plan}=expandCompactPlan({days:Array.from({length:profile.trainingDays},()=>context.allowed.slice(0,4)),meals:Array.from({length:profile.mealsPerDay},()=>({protein,carbs}))},answers);expect(nutritionMatches(plan.diet.weeks[0].days[0].totals,metrics),protein+'/'+carbs).toBe(true);}
 });
 it('corrects the old eggs/potato regression without 40 percent extra fat',()=>{
  const {profile,metrics}=setup(),portions=Array.from({length:4},(_,i)=>balanceMeal(profile,metrics,4,i,{protein:'eggs',carbs:'potato'}));
  expect(portions.every(p=>p?.some(f=>f.id==='eggs'))).toBe(true);expect(portions.some(p=>p?.some(f=>f.id!=='eggs'&&allowedFoods(profile).protein.includes(f.id)))).toBe(true);
  const totals=totalPortions(portions.flatMap(p=>p!));expect(totals.fat).toBeGreaterThan(76);expect(totals.fat).toBeLessThan(84);expect(totals.protein).toBeGreaterThan(167.2);
 });
 it('respects combined dairy/egg/seafood/gluten/nut exclusions when supplementing',()=>{
  const {profile,metrics}=setup({s13_allergies:['dairy_free','gluten_free','nut_free','halal'],s12_foods_avoid:['dairy','eggs','seafood']}),allowed=allowedFoods(profile);
  for(let i=0;i<4;i++){const portions=balanceMeal(profile,metrics,4,i);expect(portions).not.toBeNull();expect(portions!.some(p=>['yogurt','eggs','fish','oats'].includes(p.id))).toBe(false);assertPortions(portions!,allowed.protein);}
 });
 it('honors explicitly accepted plant proteins and rejects unsupported source-only intakes',()=>{
  const {profile}=setup({s12_diet_style:'vegan',s12_plant_protein:['legumes']});expect(allowedFoods(profile).protein).toEqual(['lentils']);
  expect(validateAdultIntake({...base,s12_diet_style:'vegan',s12_plant_protein:['seitan']},'en')).toEqual({ok:false,error:'nutrition_targets_unsupported'});
 });
 it.each([{weight:45,height:150},{weight:120,height:190}])('validates feasible size extremes $weight kg within the same food bounds',({weight,height})=>{
  const {profile,metrics}=setup({s1_weight:weight,s1_height:height,s11_meals:5});expect(preflightNutrition(profile,metrics)).toBe(true);
  for(let i=0;i<5;i++)assertPortions(balanceMeal(profile,metrics,5,i)!,allowedFoods(profile).protein);
 });
 it('rejects extreme or non-finite targets instead of inventing huge portions',()=>{
  const {profile}=setup();expect(preflightNutrition(profile,{calorieTarget:10000,protein:800,carbs:1000,fat:300})).toBe(false);expect(balanceMeal(profile,{calorieTarget:NaN,protein:100,carbs:100,fat:50},4,0)).toBeNull();
  expect(validateAdultIntake({...base,s1_weight:300,s1_height:220},'en')).toEqual({ok:false,error:'nutrition_targets_unsupported'});
 });
 it('refuses infeasible saved answers during expansion before a plan can be persisted',()=>{
  const {answers,profile}=setup({s1_weight:300,s1_height:220}),context=compactContext(answers);
  expect(()=>expandCompactPlan({days:Array.from({length:profile.trainingDays},()=>context.allowed.slice(0,4)),meals:Array.from({length:profile.mealsPerDay},()=>({protein:'chicken',carbs:'rice'}))},answers)).toThrow('nutrition_targets_unsupported');
 });
});
