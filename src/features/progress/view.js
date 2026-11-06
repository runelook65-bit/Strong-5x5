// Presentational renderer; application state and actions remain in the controller.
export function renderProgress({S,W0,kg}){
 let h='<h1>İlerleme</h1>';
 Object.keys(W0).forEach(n=>{
  const pts=S.h.map(x=>(x.ex.find(e=>e.n===n)||{}).w).filter(Boolean);pts.push(S.w[n]);
  const mn=Math.min(...pts),mx=Math.max(...pts),r=mx-mn||1;
  const p=pts.map((v,i)=>`${pts.length>1?i/(pts.length-1)*300:150},${54-(v-mn)/r*48}`).join(' ');
  h+=`<div class="card"><div style="display:flex;justify-content:space-between"><b style="font-size:20px">${n}</b><span class="red" style="font-weight:700">${kg(S.w[n])}</span></div><svg class="ch" viewBox="0 0 300 60" preserveAspectRatio="none"><polygon points="${p} 300,60 0,60" style="fill:var(--red);opacity:.14"/><polyline points="${p}" fill="none" style="stroke:var(--red)" stroke-width="3" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg><div class="mu">En iyi ${kg(mx)} · Tahmini 1TM ${kg(Math.round(S.w[n]*7/6/2.5)*2.5)} · ${S.h.length} antrenman</div></div>`});
 return h}

