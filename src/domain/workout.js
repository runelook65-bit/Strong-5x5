import { PR } from './config.js';

// Training dates are projections, not confirmed workout completions.
export function upcomingWorkouts(state, now=new Date()) {
  const w={...state.w}; let t=state.next;
  const days=Array.isArray(state.days)&&state.days.length
    ? state.days.filter(d=>Number.isInteger(d)&&d>=0&&d<=6)
    : [1,3,5];
  const schedule=new Set(days);
  const advance=()=>{
    for(const n of PR[t])w[n]+=(Number(state.inc[n])||0);
    t=t==='A'?'B':'A';
  };
  advance();
  const out=[];
  for(let i=1;i<=35&&out.length<4;i++){
    const d=new Date(now);d.setDate(d.getDate()+i);
    if(!schedule.has(d.getDay()))continue;
    out.push({d,t,l:PR[t].map(n=>[n,w[n]])});
    advance();
  }
  return out;
}

// An unfinished exercise neither adds a failure nor earns progression.
export function applyStandardProgression(state, active) {
  state.fail=state.fail||{};
  for(const e of active.ex){
    if(e.x || !(e.n in state.w) || !Array.isArray(e.sets) || !e.sets.length)continue;
    if(!e.sets.some(s=>s!==null))continue;
    state.w[e.n]=e.w;
    const fullyLogged=e.sets.every(s=>Number.isInteger(s)&&s>=0&&s<=5);
    if(!fullyLogged)continue;
    if(e.sets.every(s=>s===5)){
      state.w[e.n]+=state.inc[e.n];
      state.fail[e.n]=0;
    }else{
      state.fail[e.n]=(state.fail[e.n]||0)+1;
      if(state.fail[e.n]>=3){
        state.w[e.n]=Math.max(20,Math.round(state.w[e.n]*.9/2.5)*2.5);
        state.fail[e.n]=0;
      }
    }
  }
}
