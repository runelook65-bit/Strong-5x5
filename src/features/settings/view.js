// Presentational renderer; application state and actions remain in the controller.
export function renderSettings({S,SWV,esc}){
 const row=(l,v,n)=>`<div class="srow" onclick="go('${n}')"><span>${l}</span><span class="sv">${v}</span><svg class="chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></div>`,
 sw=(l,k)=>`<div class="srow"><span>${l}</span><button class="sw${SWV[k]()?' on':''}" onclick="${k==='rn'||k==='nd'?'tgN':'tg'}('${k}',this)"></button></div>`,
 grp=(t,r)=>`<div class="sl">${t}</div><div class="sg">${r.join('')}</div>`;
 return '<h1 style="text-align:center">Ayarlar</h1>'+
 grp('Hesap',[row('Profil',S.name?esc(S.name):'','prof')])+
 grp('Tercihler',[row('Birimler',S.u==='lb'?'Pound':'Kilogram','unit'),sw('Sesler','ns'),row('Ses Seviyesi',{'0.08':'Düşük','0.22':'Orta','0.4':'Yüksek'}[S.vol||'0.22'],'vol'),sw('Dinlenme Sayacı','nr'),row('Dinlenme Süreleri',(S.r1||90)+' / '+(S.r2||180)+' sn','rest'),sw('Isınma','nw'),sw('Ekranı Otomatik Kilitle','al'),row('Ağırlıklar','','w'),row('Artış Miktarları','','inc')])+
 grp('Bildirimler',[sw('Antrenman Günü Bildirimi','nd'),row('Bildirim Saati ve Günler',S.nt||'18:00','ndc'),sw('Set Süresi Bitiş Bildirimi','rn')])+
 grp('Görünüm',[row('Tema',{auto:'Otomatik (Sistem)',dark:'Koyu',light:'Açık'}[S.th||'auto'],'theme'),row('Vurgu Rengi',S.ac||'Nane','accent')])+
 grp('Destek',[row('StrongLifts 5×5 Rehberi','','guide')])+
 grp('Veriler ve Erişim',[row('Verileri Dışa / İçe Aktar','','data'),`<div class="srow" style="color:#ff453a" onclick="go('reset')"><span>Verileri Sıfırla</span></div>`])+
 '<p class="mu" style="text-align:center;margin:28px 0 0;font-size:13px">StrongLifts 5×5 · web sürümü</p>'}

