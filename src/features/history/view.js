// Presentational renderer; application state and actions remain in the controller.
export function renderHistory({S,hsub,dstr,kg,esc,key,M,weekdayLabels=['P','S','Ç','P','C','C','P']}){
 let h='<h1 style="text-align:center">Geçmiş</h1><div class="seg">'+['Liste','Takvim','Notlar'].map(s=>`<button class="${s===hsub?'on':''}" onclick="hsub='${s}';draw()">${s}</button>`).join('')+'</div>';
 const H=[...S.h].reverse();
 if(hsub==='Liste')h+=H.length?H.map(x=>`<div class="card" style="cursor:pointer" onclick="showH(${x.date})"><div style="display:flex;justify-content:space-between"><b>${dstr(new Date(x.date))}</b><span class="badge">${x.type}</span></div>${x.ex.map(e=>`<div class="row" style="font-size:16px"><span>${e.n}${e.pr?' 🏆':''}</span><span class="mu">${e.sets.filter(s=>s===(e.r||5)).length}/${e.sets.length} · ${kg(e.w)}</span></div>`).join('')}<div style="display:flex;justify-content:space-between;align-items:center"><span class="mu">${x.dur} dk</span><button class="pill r" style="padding:6px 14px;font-size:14px" onclick="event.stopPropagation();delH(${x.date},this)">Sil</button></div></div>`).join(''):'<p class="mu">Henüz antrenman yok.</p>';
 else if(hsub==='Notlar')h+=H.filter(x=>x.note).map(x=>`<div class="card"><b>${dstr(new Date(x.date))}</b><p data-i18n-ignore>${esc(x.note)}</p></div>`).join('')||'<p class="mu">Not yok.</p>';
 else{const done=new Set(S.h.map(x=>key(x.date))),now=new Date(),tk=key(now);
  for(let m=0;m>=-5;m--){const f=new Date(now.getFullYear(),now.getMonth()+m,1),n=new Date(f.getFullYear(),f.getMonth()+1,0).getDate(),off=(f.getDay()+6)%7;
   h+=`<h3 style="text-align:center">${M[f.getMonth()].slice(0,3)} ${f.getFullYear()}</h3><div class="cal">${weekdayLabels.map(c=>`<b>${c}</b>`).join('')}${'<i></i>'.repeat(off)}`;
   for(let d=1;d<=n;d++){const k=f.getFullYear()+'-'+(f.getMonth()+1)+'-'+d;h+=`<i class="${done.has(k)?'d':''} ${k===tk?'t':''}">${d}</i>`}
   h+='</div>'}}
 return h}

