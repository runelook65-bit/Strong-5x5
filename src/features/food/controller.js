import {createFoodPhotoAuth} from './auth.js';
// Integrated nutrition tracker from feat/beslenme-kalori.
// Nutrition records remain in sl5x5_food, independently of workout data.
export function createFoodFeature({getState,draw,sh,toast,snd,esc,key,sv,D,M,$,languageOf,monthNames}) {
/* ---------- Beslenme: fotoğrafla kalori takibi (ayrı anahtar: sl5x5_food) ---------- */
const FK='sl5x5_food',FG0={kcal:2200,p:150,c:220,f:70};
let F;try{F=JSON.parse(localStorage.getItem(FK))||{}}catch(e){F={}}
if(!F||typeof F!=='object')F={};F.g=Object.assign({},FG0,F.g);if(!F.d||typeof F.d!=='object')F.d={};
const fsave=()=>{try{localStorage.setItem(FK,JSON.stringify(F));return true}catch(e){toast('Depolama dolu, eski fotoğraflar silinebilir');return false}};
let fOff=0,fp=null,analysisVersion=0;
const photoAuth=createFoodPhotoAuth({showSheet:sh});
const fq=s=>esc(String(s==null?'':s)).replace(/"/g,'&quot;');
const fn=n=>Math.round(n||0).toLocaleString(({en:'en-US',es:'es-ES',tr:'tr-TR'})[languageOf(getState().lang)]);
const fdk=()=>{const d=new Date();d.setDate(d.getDate()-fOff);return key(d)};
function ftot(e){const m=e.m||1,t={kcal:0,p:0,c:0,f:0};(e.items||[]).forEach(i=>{t.kcal+=i.kcal*m;t.p+=i.protein*m;t.c+=i.carbs*m;t.f+=i.fat*m});return t}
function fday(k){const L=Array.isArray(F.d[k])?F.d[k]:[],t={kcal:0,p:0,c:0,f:0};L.forEach(e=>{const x=ftot(e);for(const q in t)t[q]+=x[q]});return t}
function food(){
 const k=fdk(),L=Array.isArray(F.d[k])?F.d[k]:[],t=fday(k),g=F.g,d=new Date();d.setDate(d.getDate()-fOff);
 const left=g.kcal-t.kcal,R=52,C=2*Math.PI*R,pct=Math.min(1,t.kcal/(g.kcal||1));
 const bar=(cl,l,v,gv)=>`<div class="${cl}"><small>${l}</small><b>${fn(v)}</b><span class="mu" style="font-size:13px">/${fn(gv)}g</span><div class="prog"><i style="width:${Math.min(100,v/(gv||1)*100)}%"></i></div></div>`;
 let h=`<div style="display:flex;justify-content:space-between;align-items:center"><h1 style="margin:8px 0 12px">Beslenme</h1><button class="pill" onclick="fgoal()">Hedef</button></div>
 <div class="fdn"><button onclick="fOff++;draw()" aria-label="Önceki gün">‹</button><b>${fOff===0?'Bugün':fOff===1?'Dün':d.getDate()+' '+monthNames(getState().lang)[d.getMonth()]+' '+new Intl.DateTimeFormat(({en:'en-US',es:'es-ES',tr:'tr-TR'})[languageOf(getState().lang)],{weekday:'long'}).format(d)}</b><button onclick="fOff=Math.max(0,fOff-1);draw()" ${fOff?'':'disabled'} aria-label="Sonraki gün">›</button></div>
 <div class="card hero"><div class="fring"><svg viewBox="0 0 128 128"><circle class="bg" cx="64" cy="64" r="${R}"/><circle class="fg${left<0?' ov2':''}" cx="64" cy="64" r="${R}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-pct)).toFixed(1)}"/></svg>
 <div><div class="fbig">${fn(Math.abs(left))}</div><div class="mu" style="font-size:14px;margin-top:4px">${left<0?'kcal hedefin üzerinde':'kcal kaldı'}</div><div style="margin-top:10px;font-size:14px"><b>${fn(t.kcal)}</b> <span class="mu">/ ${fn(g.kcal)} kcal yendi</span></div></div></div>
 <div class="fmac">${bar('p','Protein',t.p,g.p)}${bar('c','Karbonhidrat',t.c,g.c)}${bar('f','Yağ',t.f,g.f)}</div></div>
 <div class="fact"><button class="btn" onclick="fpick(1)">${sv('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>').replace('<svg','<svg style="width:22px;height:22px"')} Fotoğraf Çek</button><button class="pill" onclick="fpick(0)" aria-label="Galeriden seç">${sv('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>').replace('<svg','<svg style="width:22px;height:22px"')}</button><button class="pill" onclick="fman()" aria-label="Elle ekle">+</button></div>
 <h2>Öğünler</h2>`;
 h+=L.length?[...L].sort((a,b)=>b.t-a.t).map(e=>{const x=ftot(e),tm=new Date(e.t);return `<div class="card fm" onclick="fview('${e.id}')">${e.img?`<img src="${e.img}" alt="">`:'<span class="ph">🍽</span>'}<div class="t"><b data-i18n-ignore>${esc(e.name)}</b><small>${String(tm.getHours()).padStart(2,'0')}:${String(tm.getMinutes()).padStart(2,'0')}${e.m&&e.m!==1?' · '+String(e.m).replace('.',',')+' porsiyon':''}</small><div class="fdots"><i class="p">${fn(x.p)}g</i><i class="c">${fn(x.c)}g</i><i class="f">${fn(x.f)}g</i></div></div><div class="k">${fn(x.kcal)}<small>kcal</small></div></div>`}).join(''):`<p class="mu">${fOff?'Bu gün için kayıt yok.':'Henüz öğün eklemedin. Yemeğinin fotoğrafını çek, kalorisini ve makrolarını tahmin edeyim.'}</p>`;
 return h}
function fpick(cam){const i=document.createElement('input');i.type='file';i.accept='image/*';if(cam)i.setAttribute('capture','environment');i.onchange=()=>{const f=i.files&&i.files[0];if(f)fimg(f)};i.click()}
function fshrink(img,max,q){const r=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*r);c.height=Math.round(img.height*r);c.getContext('2d').drawImage(img,0,0,c.width,c.height);return c.toDataURL('image/jpeg',q)}
function fimg(file){const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{const big=fshrink(im,1024,.82),th=fshrink(im,160,.6);URL.revokeObjectURL(u);fp={img:big,th,res:null,m:1};fana()};im.onerror=()=>{URL.revokeObjectURL(u);toast('Fotoğraf açılamadı')};im.src=u}
const FERR={not_configured:'Fotoğraf analizi bu ortamda henüz etkinleştirilmedi.',auth:'Oturum doğrulanamadı. Yeniden giriş yap.',auth_service:'Google kimlik doğrulama geçici olarak kullanılamıyor.',quota:'Bugünkü fotoğraf analiz hakkın doldu. Yarın tekrar dene veya elle ekle.',quota_service:'Günlük analiz kotası doğrulanamadı. Elle ekleyebilirsin.',busy:'Servis şu an yoğun, biraz sonra tekrar dene.',image:'Fotoğraf okunamadı, başka bir fotoğraf dene.',origin:'Bu adresten analiz yapılamıyor.',offline:'İnternet bağlantısı yok.'};
async function fana(hint){if(!fp)return;
 const meal=fp,attempt=++analysisVersion;
 const idToken=await photoAuth.requireToken(()=>fana(hint));
 if(!idToken||fp!==meal||attempt!==analysisVersion)return;
 snd('tap');
 sh('Analiz ediliyor',`<div class="fimg scan"><img src="${meal.img}" alt=""></div><div class="fload"><i></i>Tabağındakileri inceliyorum…</div><p class="mu" style="text-align:center;margin:4px 0 0">Porsiyon ve kalori tahmini birkaç saniye sürer.</p>`);
 const loadingNode=$('sh')?.querySelector('.fload');
 let err='',result=null;
 try{
  if(navigator.onLine===false)throw{c:'offline'};
  const r=await fetch('/api/food/analyze',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+idToken},body:JSON.stringify({image:meal.img.split(',')[1],mediaType:'image/jpeg',hint:hint||''})});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw{c:j.error};
  result=j;
 }catch(e){err=FERR[e&&e.c]||'Analiz başarısız oldu. Tekrar dene ya da elle ekle.'}
 if(err===FERR.auth)photoAuth.clear();
 // A closed sheet, changed meal, or superseded request must never reopen
 // the photo overlay or overwrite another meal's analysis.
 if(fp!==meal||attempt!==analysisVersion||!loadingNode?.isConnected)return;
 if(err){sh('Analiz yapılamadı',`<div class="fimg"><img src="${meal.img}" alt=""></div><p class="mu">${err}</p><div style="display:flex;gap:8px"><button class="pill r" onclick="fana()">Tekrar Dene</button><button class="pill" onclick="fman(1)">Elle Ekle</button></div>`);return}
 meal.res=result;meal.m=1;
 snd('ok');fres()}
function fres(){const r=fp.res;if(!r.is_food){sh('Yemek bulunamadı',`<div class="fimg"><img src="${fp.img}" alt=""></div><p class="mu">Bu fotoğrafta yemek göremedim. Tabağın tamamı görünecek şekilde tekrar çekmeyi dene.</p><div style="display:flex;gap:8px"><button class="pill r" onclick="fpick(1)">Yeniden Çek</button><button class="pill" onclick="fman(1)">Elle Ekle</button></div>`);return}
 const x=ftot({items:r.items,m:fp.m});
 sh('Sonuç',`<div class="fimg"><img src="${fp.img}" alt=""></div><input id="fnm" value="${fq(r.name)}" oninput="fp.res.name=this.value" style="font-weight:700;font-size:18px">
 <div class="fsum" style="margin-top:14px"><div><span class="fbig">${fn(x.kcal)}</span> <span class="mu">kcal</span></div><span class="fcf">Güven: ${esc(r.confidence)}</span></div>
 <div class="fmac" style="margin-top:0"><div class="p"><small>Protein</small><b>${fn(x.p)}g</b></div><div class="c"><small>Karbonhidrat</small><b>${fn(x.c)}g</b></div><div class="f"><small>Yağ</small><b>${fn(x.f)}g</b></div></div>
 <div class="fsrv"><span>Porsiyon</span><span style="display:flex;align-items:center;gap:12px"><button class="stp" onclick="fp.m=Math.max(.5,fp.m-.5);fres()">−</button><b>${String(fp.m).replace('.',',')}</b><button class="stp" onclick="fp.m=Math.min(5,fp.m+.5);fres()">+</button></span></div>
 ${r.items.map((i,j)=>`<div class="fit"><span>${esc(i.name)} <small>· ${fn(i.grams*fp.m)}g</small></span><b>${fn(i.kcal*fp.m)}</b><button class="stp" onclick="fp.res.items.splice(${j},1);if(!fp.res.items.length)fp.res.is_food=false;fres()" aria-label="Kaldır">✕</button></div>`).join('')}
 ${r.note?`<p class="fnote">${esc(r.note)}</p>`:''}
 <div style="display:flex;gap:8px;margin-top:14px"><input id="fhn" placeholder="Düzelt: ör. yağsız pişti, 2 dilim ekmek"><button class="pill" onclick="const v=$('fhn').value.trim();if(v)fana(v)">Düzelt</button></div>
 <button class="btn" onclick="fadd()">Öğünü Kaydet</button>`)}
function fput(e){const k=key(e.t);(F.d[k]=F.d[k]||[]).push(e);return fsave()}
function fwhen(){const d=new Date();d.setDate(d.getDate()-fOff);return d.getTime()}
function fadd(){if(!fp||!fp.res)return;const r=fp.res;fput({id:'m'+Date.now(),t:fwhen(),name:(String(r.name||'').trim()||'Öğün').slice(0,80),items:r.items,m:fp.m,img:fp.th,note:r.note||''});fp=null;const e=$('sh');if(e)e.remove();draw();toast('Öğün kaydedildi 🍽')}
function ffind(id){for(const k in F.d){const L=F.d[k],i=L.findIndex(e=>e.id===id);if(i>=0)return {k,L,i,e:L[i]}}return null}
function fview(id){const o=ffind(id);if(!o)return;const e=o.e,x=ftot(e);
 sh(esc(e.name),`${e.img?`<div class="fimg" style="aspect-ratio:auto;max-height:200px"><img src="${e.img}" alt="" style="max-height:200px"></div>`:''}<div class="fsum"><div><span class="fbig">${fn(x.kcal)}</span> <span class="mu">kcal</span></div></div>
 <div class="fmac" style="margin-top:0"><div class="p"><small>Protein</small><b>${fn(x.p)}g</b></div><div class="c"><small>Karbonhidrat</small><b>${fn(x.c)}g</b></div><div class="f"><small>Yağ</small><b>${fn(x.f)}g</b></div></div>
 <div class="fsrv"><span>Porsiyon</span><span style="display:flex;align-items:center;gap:12px"><button class="stp" onclick="fsrv('${id}',-.5)">−</button><b>${String(e.m||1).replace('.',',')}</b><button class="stp" onclick="fsrv('${id}',.5)">+</button></span></div>
 ${e.items.map(i=>`<div class="fit"><span>${esc(i.name)} <small>· ${fn(i.grams*(e.m||1))}g</small></span><b>${fn(i.kcal*(e.m||1))}</b></div>`).join('')}${e.note?`<p class="fnote">${esc(e.note)}</p>`:''}
 <button class="btn" style="background:var(--card2);color:#ff453a;box-shadow:none" onclick="fdel('${id}',this)">Öğünü Sil</button>`)}
function fsrv(id,d){const o=ffind(id);if(!o)return;o.e.m=Math.min(5,Math.max(.5,(o.e.m||1)+d));fsave();fview(id);draw()}
function fdel(id,b){if(!b.dataset.a){b.dataset.a=1;b.textContent='Emin misin? Tekrar dokun';setTimeout(()=>{delete b.dataset.a;b.textContent='Öğünü Sil'},2500);return}const o=ffind(id);if(o){o.L.splice(o.i,1);if(!o.L.length)delete F.d[o.k];fsave()}const e=$('sh');if(e)e.remove();draw()}
function fman(withImg){const v=fp&&fp.res?fp.res:null;
 sh('Elle Ekle',`<input id="mn" placeholder="Yemek adı" value="${fq(v&&v.name||'')}"><div class="fgrid"><div><label>Kalori (kcal)</label><input id="mk" type="number" inputmode="decimal"></div><div><label>Protein (g)</label><input id="mp" type="number" inputmode="decimal"></div><div><label>Karbonhidrat (g)</label><input id="mc" type="number" inputmode="decimal"></div><div><label>Yağ (g)</label><input id="mf" type="number" inputmode="decimal"></div></div><button class="btn" onclick="fmsave(${withImg?1:0})">Kaydet</button>`)}
function fmsave(withImg){const n=$('mn').value.trim(),k=+$('mk').value||0;if(!n||k<=0){toast('Ad ve kalori gerekli');return}
 fput({id:'m'+Date.now(),t:fwhen(),name:n.slice(0,80),items:[{name:n.slice(0,60),grams:0,kcal:k,protein:+$('mp').value||0,carbs:+$('mc').value||0,fat:+$('mf').value||0}],m:1,img:withImg&&fp?fp.th:''});fp=null;const e=$('sh');if(e)e.remove();draw();toast('Öğün kaydedildi 🍽')}
function fgoal(){const g=F.g;
 sh('Günlük Hedef',`<div class="row"><span>Kalori (kcal)</span><input class="w" id="gk" type="number" value="${g.kcal}"></div><div class="row"><span>Protein (g)</span><input class="w" id="gp" type="number" value="${g.p}"></div><div class="row"><span>Karbonhidrat (g)</span><input class="w" id="gc" type="number" value="${g.c}"></div><div class="row"><span>Yağ (g)</span><input class="w" id="gf" type="number" value="${g.f}"></div>${getState().bw?`<button class="pill" style="margin-top:12px" onclick="fauto()">Vücut ağırlığına göre öner (${String(getState().bw).replace('.',',')} kg)</button>`:'<p class="mu" style="margin-top:12px">Ayarlar › Profil’e vücut ağırlığını girersen hedef önerebilirim.</p>'}<button class="btn" onclick="fgsave()">Kaydet</button>`)}
function fauto(){const w=+getState().bw,k=Math.round(w*33/10)*10,p=Math.round(w*1.8),f=Math.round(k*.25/9),c=Math.max(0,Math.round((k-p*4-f*9)/4));$('gk').value=k;$('gp').value=p;$('gc').value=c;$('gf').value=f}
function fgsave(){const v=id=>Math.max(0,Math.round(+$(id).value||0));F.g={kcal:v('gk')||FG0.kcal,p:v('gp'),c:v('gc'),f:v('gf')};fsave();const e=$('sh');if(e)e.remove();draw();toast('Hedef güncellendi')}

const actions={food,fpick,fimg,fana,fres,fadd,fview,fsrv,fdel,fman,fmsave,fgoal,fauto,fgsave,fday,fput,ftot};
Object.assign(window,actions);
Object.defineProperties(window,{
  fp:{configurable:true,get:()=>fp,set:value=>{fp=value}},
  fOff:{configurable:true,get:()=>fOff,set:value=>{fOff=Math.max(0,Number(value)||0)}}
});
return actions;
}
