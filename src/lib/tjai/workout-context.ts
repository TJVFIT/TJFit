type WorkoutContextRow={workout_date:string;exercise:string;sets:number|null;reps:number|null;weight_kg:number|null;sets_data:unknown};
/** Summarize actual per-set work; legacy summary columns cannot represent differing sets. */
export function workoutForCoach(w:WorkoutContextRow){
 const raw=Array.isArray(w.sets_data)?w.sets_data:[];
 const sets=raw.filter((s):s is {reps:number;weight_kg:number}=>Boolean(s&&typeof s==='object'&&Number.isFinite(s.reps)&&Number.isFinite(s.weight_kg)&&s.reps>0&&s.weight_kg>=0)).slice(0,30);
 const base={date:w.workout_date,exercise:String(w.exercise).slice(0,80)};
 if(sets.length)return {...base,setCount:sets.length,totalReps:sets.reduce((sum,s)=>sum+s.reps,0),volumeKg:sets.reduce((sum,s)=>sum+s.reps*s.weight_kg,0),maxLoadKg:Math.max(...sets.map(s=>s.weight_kg))};
 return {...base,sets:w.sets,repsPerSet:w.reps,loadKg:w.weight_kg};
}
