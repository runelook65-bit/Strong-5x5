// Next-session targets must not be mistaken for completed performance.
export function completedSets(history,name){
 return (history||[]).flatMap(session=>(session.ex||[]))
  .filter(e=>e.n===name && Number.isFinite(e.w)&&Array.isArray(e.sets)&&e.sets.some(s=>Number.isInteger(s)&&s>=5))
  .map(e=>({weight:e.w,reps:Math.max(...e.sets.filter(s=>Number.isInteger(s)&&s>0))}));
}
export function estimateOneRepMax(history,name){
 const rows=completedSets(history,name);
 if(!rows.length)return null;
 return Math.round(Math.max(...rows.map(r=>r.weight*(1+r.reps/30)))/2.5)*2.5;
}
