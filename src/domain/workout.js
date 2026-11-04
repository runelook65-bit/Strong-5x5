import { PR } from './config.js';

// Same A/B projection and two-day cadence as the uploaded HTML.
// Does not mutate the user's saved working weights.
export function upcomingWorkouts(state, now=new Date()) {
  const w={...state.w}; let t=state.next;
  const advance=()=>{PR[t].forEach(n=>w[n]+=state.inc[n]);t=t==='A'?'B':'A'};
  advance();
  const out=[];
  for(let i=1;i<=4;i++){
    const d=new Date(now);d.setDate(d.getDate()+2*i);
    out.push({d,t,l:PR[t].map(n=>[n,w[n]])});
    advance();
  }
  return out;
}

export function applyStandardProgression(state, active) {
  active.ex.forEach(e=>{
    if(e.x)return;
    state.w[e.n]=e.w;
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
  });
}
