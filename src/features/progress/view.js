import { completedSets, estimateOneRepMax } from '../../domain/metrics.js';

// Show real logged performance, never the weight scheduled for the next workout.
export function renderProgress({S,W0,kg}){
 let h='<h1>İlerleme</h1>';
 Object.keys(W0).forEach(n=>{
  const pts=completedSets(S.h,n).map(r=>r.weight);
  const target=Number(S.w[n]);
  if(!pts.length){
   h+=`<div class="card"><div style="display:flex;justify-content:space-between"><b>${n}</b><span class="red">${kg(target)} hedef</span></div><p class="mu">Henüz tamamlanmış set kaydı yok. Tahmini 1TM için antrenman kaydet.</p></div>`;
   return;
  }
  const mn=Math.min(...pts),mx=Math.max(...pts),range=mx-mn||1;
  const line=pts.map((v,i)=>`${pts.length>1?i/(pts.length-1)*300:150},${54-(v-mn)/range*48}`).join(' ');
  h+=`<div class="card"><div style="display:flex;justify-content:space-between"><b>${n}</b><span class="red">${kg(target)} hedef</span></div><svg class="ch" viewBox="0 0 300 60" preserveAspectRatio="none"><polygon points="${line} 300,60 0,60" style="fill:var(--red);opacity:.14"/><polyline points="${line}" fill="none" style="stroke:var(--red)" stroke-width="3" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg><div class="mu">Tamamlanan en yüksek ağırlık ${kg(mx)} · Tahmini 1TM ${kg(estimateOneRepMax(S.h,n))} · ${pts.length} kayıt</div></div>`;
 });
 return h;
}
