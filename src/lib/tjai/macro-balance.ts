import type {TjaiUserProfile} from '@/lib/tjai-types';
import {allowedFoods,foodCatalog} from './food-catalog';

export type NutrientTotals={calories:number;protein:number;carbs:number;fat:number};
export type NutritionTargets={calorieTarget:number;protein:number;carbs:number;fat:number};
export type FoodPortion={id:string;grams:number};
// Grams per meal. Oats are dry; the other starches/proteins are cooked/ready to eat.
export const FOOD_PORTION_BOUNDS:Record<string,readonly[number,number]>={chicken:[50,220],fish:[60,260],eggs:[50,150],tofu:[60,250],lentils:[80,250],yogurt:[100,300],rice:[30,300],potato:[50,350],oats:[15,80],oil:[0,20]};
export const MAX_MEAL_GRAMS=750,MAX_PROTEIN_FOOD_GRAMS=400;
export const NUTRIENT_TOLERANCES={calories:{relative:0.05,absolute:0},protein:{relative:0.05,absolute:0},carbs:{relative:0.05,absolute:0},fat:{relative:0.05,absolute:0}} as const;
export function totalPortions(portions:FoodPortion[]):NutrientTotals{
 const v=portions.reduce((s,p)=>s.map((n,i)=>n+foodCatalog[p.id].macros[i]*p.grams/100),[0,0,0,0]);
 return {calories:v[0],protein:v[1],carbs:v[2],fat:v[3]};
}
export function nutritionMatches(totals:NutrientTotals,target:NutritionTargets):boolean{
 return (['calories','protein','carbs','fat'] as const).every(k=>{const expected=k==='calories'?target.calorieTarget:target[k],t=NUTRIENT_TOLERANCES[k];return Number.isFinite(totals[k])&&Number.isFinite(expected)&&expected>0&&Math.abs(totals[k]-expected)<=Math.max(t.absolute,expected*t.relative);});
}
function solve3(matrix:number[][],values:number[]):number[]|null{
 const a=matrix.map((row,i)=>[...row,values[i]]);
 for(let col=0;col<3;col++){
  let pivot=col;for(let row=col+1;row<3;row++)if(Math.abs(a[row][col])>Math.abs(a[pivot][col]))pivot=row;
  if(Math.abs(a[pivot][col])<1e-10)return null;
  [a[col],a[pivot]]=[a[pivot],a[col]];const factor=a[col][col];for(let j=col;j<4;j++)a[col][j]/=factor;
  for(let row=0;row<3;row++)if(row!==col){const f=a[row][col];for(let j=col;j<4;j++)a[row][j]-=f*a[col][j];}
 }
 return a.map(row=>row[3]);
}
/** Enumerate vertices of three macro equations with bounded food portions (at most four variables). */
function solveFoods(ids:string[],side:'apple'|'carrot',target:NutritionTargets,equationScale=1):FoodPortion[]|null{
 const sidePortion={id:side,grams:100},sideTotals=totalPortions([sidePortion]);
 const rhs=[target.protein*equationScale-sideTotals.protein,target.carbs*equationScale-sideTotals.carbs,target.fat*equationScale-sideTotals.fat];
 const bounds=ids.map(id=>FOOD_PORTION_BOUNDS[id]);
 const columns=ids.map(id=>foodCatalog[id].macros.slice(1).map(n=>n/100));
 let best:FoodPortion[]|null=null,bestScore=Infinity;
 const consider=(fixedIndex=-1,fixedValue=0)=>{
  const free=ids.map((_,i)=>i).filter(i=>i!==fixedIndex);
  const answer=solve3([0,1,2].map(r=>free.map(i=>columns[i][r])),rhs.map((v,r)=>v-(fixedIndex<0?0:columns[fixedIndex][r]*fixedValue)));
  if(!answer)return;
  const grams=ids.map((_,i)=>i===fixedIndex?fixedValue:answer[free.indexOf(i)]);
  if(grams.some((g,i)=>!Number.isFinite(g)||g<bounds[i][0]-1e-7||g>bounds[i][1]+1e-7))return;
  const portions=[...ids.map((id,i)=>({id,grams:Math.round(Math.max(bounds[i][0],Math.min(bounds[i][1],grams[i])))})),sidePortion].filter(p=>p.grams>0);
  const totalGrams=portions.reduce((sum,p)=>sum+p.grams,0),proteinGrams=portions.filter(p=>['chicken','fish','eggs','tofu','lentils','yogurt'].includes(p.id)).reduce((sum,p)=>sum+p.grams,0);
  if(totalGrams>MAX_MEAL_GRAMS||proteinGrams>MAX_PROTEIN_FOOD_GRAMS||!nutritionMatches(totalPortions(portions),target))return;
  const score=ids.length*1000+totalGrams+(ids.length===4?(portions.find(p=>p.id===ids[2])?.grams??0):0);
  if(score<bestScore){best=portions;bestScore=score;}
 };
 if(ids.length===3)consider();else for(let i=0;i<ids.length;i++)for(const bound of bounds[i])consider(i,bound);
 return best;
}
function pairPortions(protein:string,carbs:string,side:'apple'|'carrot',target:NutritionTargets,allowedProtein:string[]){
 // Food-label calories need not equal 4P+4C+9F. Search inside the same 5% acceptance
 // envelope, rather than scaling portions to calories and allowing arbitrary macro drift.
 for(const scale of [1,1.02,1.04,0.98,0.96]){
  const direct=solveFoods([protein,carbs,'oil'],side,target,scale);if(direct)return direct;
  for(const supplement of allowedProtein){if(supplement===protein)continue;const fit=solveFoods([protein,carbs,supplement,'oil'],side,target,scale);if(fit)return fit;}
 }
 return null;
}
/** Preserve the selected pairing when feasible; adjust only within the user's permitted catalog. */
export function balanceMeal(profile:TjaiUserProfile,targets:NutritionTargets,mealCount:number,index:number,preferred?:{protein:string;carbs:string}):FoodPortion[]|null{
 if(!Number.isInteger(mealCount)||mealCount<3||mealCount>5||![targets.calorieTarget,targets.protein,targets.carbs,targets.fat].every(Number.isFinite))return null;
 const target={calorieTarget:targets.calorieTarget/mealCount,protein:targets.protein/mealCount,carbs:targets.carbs/mealCount,fat:targets.fat/mealCount};
 if(target.protein<=0||target.carbs<=0||target.fat<=0)return null;
 const allowed=allowedFoods(profile),side=index===0?'apple':'carrot';
 const proteins=preferred&&allowed.protein.includes(preferred.protein)?[preferred.protein,...allowed.protein.filter(p=>p!==preferred.protein)]:allowed.protein;
 const carbs=preferred&&allowed.carbs.includes(preferred.carbs)?[preferred.carbs,...allowed.carbs.filter(c=>c!==preferred.carbs)]:allowed.carbs;
 for(const protein of proteins)for(const carb of carbs){const fit=pairPortions(protein,carb,side,target,allowed.protein);if(fit)return fit;}
 return null;
}
export function preflightNutrition(profile:TjaiUserProfile,targets:NutritionTargets):boolean{
 const count=profile.mealsPerDay;
 const breakfast=balanceMeal(profile,targets,count,0),main=balanceMeal(profile,targets,count,1);
 if(!breakfast||!main)return false;
 const totals=totalPortions([...breakfast,...Array.from({length:count-1},()=>main).flat()]);
 return nutritionMatches(totals,targets);
}
