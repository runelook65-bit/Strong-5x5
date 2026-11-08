import {renderHome,renderCustomHome} from './features/home/view.js';
import {languageOf,LANGUAGES,localizeTree,weekdayInitials,monthNames,exerciseInstructions} from './i18n/index.js';
import {renderHistory} from './features/history/view.js';
import {renderProgress} from './features/progress/view.js';
import {renderPrograms,renderProgramComposer} from './features/programs/view.js';
import {FOCUSED_PROGRAMS,cloneFocused} from './domain/focused-programs.js';
import {renderSettings} from './features/settings/view.js';
import {createFoodFeature} from './features/food/controller.js';
import {renderWorkoutMarkup} from './features/workout/view.js';
import {registerUIActions} from './features/navigation/events.js';
import {D,M,PR,INC0,W0,AC,PLC,FORM} from './domain/config.js';
import {fresh,loadState,saveState,getLoadWarning} from './data/storage.js';
import {upcomingWorkouts,applyStandardProgression} from './domain/workout.js';
import {escapeHTML,dateKey,displayDate,displayWeight} from './lib/format.js';
import {parseBackup,parseSharedProgram} from './data/validation.js';
let S=loadState(localStorage);
let warnedSaveFailure=false;
const save=()=>{
 const saved=saveState(localStorage,S);
 if(!saved&&!warnedSaveFailure){
   warnedSaveFailure=true;
   toast('Kayıt saklanamadı. Depolamayı kontrol edip yedeğini al.');
 }
 if(saved)warnedSaveFailure=false;
 return saved;
};
const $=id=>document.getElementById(id);
const kg=w=>displayWeight(w,S.u);
const key=dateKey;
let tab='home',hsub='Takvim',timer,wtab='a',rEnd=0,dArm=0,ovOpen=0;
const tabs=[['home','⌂','Ana Sayfa'],['food','🍎','Beslenme'],['prog','🔥','Programlar'],['hist','▦','Geçmiş'],['stat','📈','İlerleme'],['set','⚙','Ayarlar']];

let foodFeature;
function food(){return foodFeature.food();}
const upcoming=()=>upcomingWorkouts(S);
const dstr=date=>displayDate(date,languageOf(S.lang));

function home(){return renderHome({S,AP,homeP,greet,esc,weekDots,dstr,PR,kg,upcoming,upCard});}

function prog(){return '<h1>Programlar</h1>'+['A','B'].map(t=>`<div class="card"><b style="font-size:22px">Antrenman ${t}</b>${PR[t].map(n=>`<div class="row"><span>${n}</span><span class="mu">${n==='Deadlift'?'1×5':'5×5'} · +${String(S.inc[n]).replace('.',',')}kg</span></div>`).join('')}</div>`).join('')+'<p class="mu">A ve B antrenmanları dönüşümlü yapılır. Tüm setler 5 tekrar tamamlanırsa ağırlık artar.</p>'}

function hist(){return renderHistory({S,hsub,dstr,kg,esc,key,M:monthNames(S.lang),weekdayLabels:weekdayInitials(S.lang)});}
const esc=escapeHTML;

function stat(){return renderProgress({S,W0,kg});}

function sett(){
 return '<h1>Ayarlar</h1><div class="card"><b>Mevcut ağırlıklar (kg)</b>'+Object.keys(W0).map(n=>`<div class="row"><span>${n}</span><input class="w" type="number" step="0.5" value="${S.w[n]}" onchange="S.w['${n}']=+this.value;save()"></div>`).join('')+'</div><div class="card"><b>Artış miktarı (kg)</b>'+Object.keys(W0).map(n=>`<div class="row"><span>${n}</span><input class="w" type="number" step="0.5" value="${S.inc[n]}" onchange="S.inc['${n}']=+this.value;save()"></div>`).join('')+'</div><div class="card"><b>Dinlenme (sn)</b><div class="row"><span>5 tekrar sonrası</span><input class="w" type="number" value="'+(S.r1||90)+'" onchange="S.r1=+this.value;save()"></div><div class="row"><span>Başarısız set sonrası</span><input class="w" type="number" value="'+(S.r2||180)+'" onchange="S.r2=+this.value;save()"></div></div><div class="card"><b>Birim</b><div style="display:flex;gap:10px;margin-top:12px">'+['kg','lb'].map(u=>`<button class="pill" style="${(S.u||'kg')===u?'outline:3px solid var(--tx)':''}" onclick="S.u='${u}';save();draw()">${u}</button>`).join('')+'</div></div><div class="card"><b>Vurgu rengi</b><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">'+Object.keys(AC).map(k=>`<button class="pill" style="background:${AC[k][0]};color:${AC[k][2]};${(S.ac||'Nane')===k?'outline:3px solid var(--tx);':''}" onclick="S.ac='${k}';save();draw()">${k}</button>`).join('')+'</div></div><div class="card"><b>Yedek</b><textarea id="bk" rows="3" style="margin:10px 0" placeholder="Yedek verisi"></textarea><button class="pill" onclick="expBk()">Dışa Aktar</button> <button class="pill" onclick="impBk()">İçe Aktar</button></div><button class="btn" style="background:var(--card);color:var(--red)" onclick="rstS(this)">Verileri Sıfırla</button>'}

function acc(){const c=AC[S.ac]||AC['Nane'],s=document.documentElement.style;s.setProperty('--red',c[0]);s.setProperty('--red2',c[1]);s.setProperty('--on',c[2]);document.documentElement.dataset.th=S.th||'auto';document.body.classList.toggle('nw',!!S.nw)}
function toast(m){if(/kaydedildi/.test(m))snd('done');const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);try{navigator.vibrate&&navigator.vibrate([60,40,60])}catch(e){}setTimeout(()=>t.remove(),2600)}
function localizeAll(){const lang=languageOf(S.lang);document.documentElement.lang=lang;localizeTree(document.body,lang)}
function draw(){acc();$('app').className=dir;dir='';
 $('app').innerHTML={home,food,prog:prog3,hist,stat,set:sett2}[tab]();
 navUp();localizeAll();(0)&&tabs.map(([k,i,l])=>`<button class="${k===tab?'on':''}" onclick="tab='${k}';draw();scrollTo(0,0)"><span>${ICN[k]}</span>${l}</button>`).join('')}

function showSetup(){
 if($('setupScreen'))return;
 const panel=document.createElement('div');panel.className='sheet';panel.id='setupScreen';
 panel.innerHTML='<div class="sh"><div class="grab"></div><h2>Başlangıç ağırlıkları</h2><p class="mu">Beş tekrar güvenle yapabildiğin ağırlıkları seç. Boş bar ile başlamak mümkündür.</p>'+
 Object.keys(W0).map((n,i)=>'<label class="row">'+n+'<input class="w" id="setupWeight'+i+'" type="number" min="20" max="500" step="0.5" value="'+S.w[n]+'" aria-label="'+n+' ağırlığı"></label>').join('')+
 '<p class="mu">Antrenman günlerini seç</p><div style="display:flex;flex-wrap:wrap;gap:8px">'+
 [1,2,3,4,5,6,0].map(d=>'<label style="padding:5px"><input id="setupDay'+d+'" type="checkbox" style="width:auto" '+((S.days||[1,3,5]).includes(d)?'checked':'')+'> '+['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'][d]+'</label>').join('')+
 '</div><button class="btn" onclick="saveSetup()">Kaydet</button><button class="pill" onclick="document.getElementById(\'setupScreen\').remove()">Kapat</button></div>';
 document.body.appendChild(panel);localizeAll();
}
function saveSetup(){
 const weights={...S.w};
 for(const [i,n] of Object.keys(W0).entries()){
  const v=Number($('setupWeight'+i)?.value);
  if(!Number.isFinite(v)||v<20||v>500||Math.abs(v*2-Math.round(v*2))>1e-8){toast('Geçerli bir ağırlık gir.');return}
  weights[n]=v;
 }
 const days=[0,1,2,3,4,5,6].filter(d=>$('setupDay'+d)?.checked);
 if(!days.length){toast('En az bir antrenman günü seç.');return}
 const old={w:S.w,days:S.days,setupDone:S.setupDone};
 S.w=weights;S.days=days;S.setupDone=true;
 if(!save()){Object.assign(S,old);return}
 $('setupScreen')?.remove();draw();toast('Başlangıç ayarları kaydedildi');
}

function start(){try{!S.al&&navigator.wakeLock&&navigator.wakeLock.request('screen').catch(()=>{})}catch(e){}
 if(S.act){wo();return}
 const wasSetupDone=S.setupDone;S.setupDone=true;
  S.act={type:S.next,date:Date.now(),ex:PR[S.next].map(n=>({n,w:S.w[n],sets:Array(n==='Deadlift'?1:5).fill(null)})),note:''};
 if(!save()){S.act=null;S.setupDone=wasSetupDone;return}
 wo()}
function wo(){
 const a=S.act;if(!a){$('ovl').innerHTML='';clearInterval(timer);return}
 $('ovl').innerHTML=renderWorkoutMarkup({a,ovOpen,M:monthNames(S.lang),wtab,S,warm,kg,plates,esc});
 clearInterval(timer);const tick=()=>{const el=$('tm');if(el&&S.act)el.textContent=Math.floor((Date.now()-S.act.date)/60000)+'d';const r=$('rs');if(r){const l=Math.ceil((rEnd-Date.now())/1000);if(l>0){r.style.display='flex';$('rt').textContent=Math.floor(l/60)+':'+String(l%60).padStart(2,'0')}else{if(rEnd){rEnd=0;snd('rest');try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}}r.style.display='none'}}};window.tk=tick;ovOpen=1;tick();timer=setInterval(tick,1000)}
function tap(i,j){const s=S.act.ex[i].sets;const R=S.act.ex[i].r||5;const previous=s[j];s[j]=s[j]===null?R:s[j]>0?s[j]-1:null;if(!save()){s[j]=previous;return}rEnd=s[j]===null||S.nr?0:Date.now()+(s[j]===R?(S.r1||90):(S.r2||180))*1000;if(S.rn){clearTimeout(rT);if(rEnd)rT=setTimeout(()=>{if(document.hidden)notify('Dinlenme bitti','Sıradaki sete hazırsın 💪')},Math.max(0,rEnd-Date.now()))}snd(s[j]===null?'tap':s[j]===R?'ok':'fail');try{navigator.vibrate&&navigator.vibrate(15)}catch(e){}const b=document.querySelectorAll('.sets')[i].children[j];b.textContent=s[j]===null?R:s[j];b.classList.toggle('off',s[j]===null);b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');$('pg').style.width=Math.round(S.act.ex.flatMap(e=>e.sets).filter(x=>x!==null).length/S.act.ex.flatMap(e=>e.sets).length*100)+'%';window.tk&&tk()}
function warm(a){const r=x=>Math.max(20,Math.round(x/2.5)*2.5);return a.ex.map(e=>{const w=e.w,L=e.n==='Deadlift'?[[w*.4,5,1],[w*.6,3,1],[w*.8,2,1]]:[[20,5,2],[w*.4,5,1],[w*.6,3,1],[w*.8,2,1]];return `<div class="ex"><span>${e.n}</span><span class="mu">${kg(e.w)}</span></div><div class="card">${L.map(([x,q,n])=>`<div class="row"><span>${n}×${q}</span><span>${kg(r(x))}</span></div>`).join('')}</div>`}).join('')}
function plates(w){let r=(w-20)/2,o=[];if(r<=0)return 'sadece bar';for(const p of [25,20,15,10,5,2.5,1.25]){while(r>=p-1e-9){o.push(String(p).replace('.',','));r-=p}}return o.join(' + ')+(r>0.01?' (+'+r+')':'')}
function adj(i,d){const e=S.act.ex[i],before=e.w;e.w=Math.max(20,e.w+d);if(!save()){e.w=before;return}wo()}
function delH(d,b){if(!b.dataset.a){b.dataset.a=1;b.textContent='Emin misin?';setTimeout(()=>{delete b.dataset.a;b.textContent='Sil'},2500)}else{S.h=S.h.filter(x=>x.date!==d);save();draw()}}
function addX(){const n=esc($('xn').value.trim()),w=+$('xw').value||20;if(!n)return;S.act.ex.push({n,w,sets:[null,null,null,null,null],x:1});save();wo()}
function rmX(i){S.act.ex.splice(i,1);save();wo()}
let draft={name:'',ex:[]};
function prog2(){return renderProgramComposer({S,draft,esc,kg,PR});}
function addD(){const n=$('en').value.trim();draft.name=$('dn').value;if(!n)return;draft.ex.push({n,s:Math.min(10,Math.max(1,+$('es').value||3)),r:+$('er').value||10,w:+$('ew').value||20,inc:+$('ei').value||2.5});draw()}
function saveC(){draft.name=$('dn').value.trim();if(!draft.name||!draft.ex.length)return;(S.cw=S.cw||[]).push({id:'c'+Date.now(),name:esc(draft.name),ex:draft.ex.map(e=>({...e,n:esc(e.n)}))});draft={name:'',ex:[]};save();draw()}
function delC(id,b){if(!b.dataset.a){b.dataset.a=1;b.textContent='Emin misin?';setTimeout(()=>{delete b.dataset.a;b.textContent='Sil'},2500)}else{S.cw=S.cw.filter(c=>c.id!==id);save();draw()}}
function startC(id){if(S.act){toast('Devam eden antrenman var');wo();return}const c=fw(id);if(!c)return;S.act={type:c.name,cid:c.id,date:Date.now(),ex:c.ex.map(e=>({n:e.n,w:e.w,r:e.r,sets:Array(e.s).fill(null)})),note:''};save();wo()}
function adjC(id,j,d){const c=S.cw.find(x=>x.id===id);c.ex[j].w=Math.max(0,c.ex[j].w+d);save();draw()}
function rmC(id,j){const c=S.cw.find(x=>x.id===id);c.ex.splice(j,1);if(!c.ex.length)S.cw=S.cw.filter(x=>x!==c);save();draw()}
function delWo(){if(!dArm){dArm=1;$('dl').textContent='Emin misin?';setTimeout(()=>{dArm=0;if($('dl'))$('dl').textContent='Sil'},2500)}else{const before=S.act;dArm=0;S.act=null;if(!save()){S.act=before;return}rEnd=0;closeWo()}}
function rstS(b){if(!b.dataset.a){b.dataset.a=1;b.textContent='Emin misin? Tekrar dokun';setTimeout(()=>{delete b.dataset.a;b.textContent='Verileri Sıfırla'},3000)}else{const before=S;S=fresh();if(!save()){S=before;return}closeSh()}}
function expBk(){$('bk').value=JSON.stringify(S);$('bk').select()}
function impBk(){
 const input=$('bk');
 try{
   const candidate=parseBackup(input.value);
   if(!saveState(localStorage,candidate))throw Error('Depolama alanına kaydedilemedi');
   S=candidate;
   draw();
   toast('Yedek doğrulandı ve geri yüklendi');
 }catch(error){
   input.placeholder='Geçersiz yedek: '+String(error.message||error);
   toast('Yedek yüklenmedi; mevcut kayıtların korundu');
 }
}
function closeWo(){ovOpen=0;$('ovl').innerHTML='';clearInterval(timer);draw()}
function finish(){
 const a=S.act;
 if(a.ex.every(e=>e.sets.every(s=>s===null)))return;
 const beforeSave=JSON.parse(JSON.stringify(S));
 S.fail=S.fail||{};const cw=a.cid&&fw(a.cid);if(cw)a.ex.forEach((e,i)=>{const c=cw.ex[i];if(c&&e.sets.some(s=>s!==null))c.w=e.w+(e.sets.every(s=>s===e.r)?c.inc:0)});else applyStandardProgression(S,a);
 let pr=0;a.ex.forEach(e=>{if(e.sets.every(s=>s===(e.r||5))&&S.h.some(h=>h.ex.some(q=>q.n===e.n))){const best=Math.max(...S.h.flatMap(h=>h.ex.filter(q=>q.n===e.n).map(q=>q.w)));if(e.w>best){e.pr=1;pr=1}}});
 S.h.push({date:a.date,type:a.type,ex:a.ex,note:a.note,dur:Math.round((Date.now()-a.date)/60000)});
 if(!a.cid)S.next=a.type==='A'?'B':'A';else{const P=AP();if(P&&P.ws.some(w=>w.id===a.cid))S.pi=((S.pi||0)+1)%P.ws.length}S.act=null;
 if(!save()){
   S=beforeSave;
   toast('Antrenman saklanamadı; açık seans korundu');
   return;
 }
 closeWo();
 toast((pr?'Yeni rekor! 🏆 ':'')+'Antrenman kaydedildi 🎉')}
let dir='',tx0=0,ty0=0,tOk=0;
document.addEventListener('touchstart',e=>{const t=e.touches[0];tx0=t.clientX;ty0=t.clientY;tOk=!e.target.closest('input,textarea,svg')},{passive:true});
document.addEventListener('touchend',e=>{if(!tOk)return;const t=e.changedTouches[0],dx=t.clientX-tx0,dy=t.clientY-ty0;if(Math.abs(dx)<70||Math.abs(dx)<Math.abs(dy)*1.6)return;
 if($('xv')||$('sh')||$('pe'))return;
 if(ovOpen){const w=dx<0?'w':'a';if(w!==wtab){wtab=w;wo()}return}
 const ks=tabs.map(x=>x[0]),n=ks.indexOf(tab)+(dx<0?1:-1);if(n<0||n>=ks.length)return;dir=dx<0?'l':'r';tab=ks[n];draw();scrollTo(0,0)},{passive:true});
function greet(){const h=new Date().getHours();return h<12?'Günaydın':h<18?'İyi günler':'İyi akşamlar'}
function weekDots(){const n=new Date(),m=new Date(n);m.setDate(n.getDate()-((n.getDay()+6)%7));const dn=new Set(S.h.map(x=>key(x.date)));return weekdayInitials(S.lang).map((l,i)=>{const d=new Date(m);d.setDate(m.getDate()+i);const k=key(d);return `<div class="wd${dn.has(k)?' d':''}${k===key(n)?' t':''}"><small>${l}</small><i>${d.getDate()}</i></div>`}).join('')}
const sv=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const ICN={home:sv('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>'),food:sv('<path d="M12 7c-1.5-2-5-2.2-6.5.3C4 9.8 5 15 7 18c1.2 1.8 2.6 2.6 5 1.6 2.4 1 3.8.2 5-1.6 2-3 3-8.2 1.5-10.7C17 5 13.5 5.2 12 7z"/><path d="M12 7c0-2 1-3.5 2.5-4"/>'),prog:sv('<path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12"/>'),hist:sv('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'),stat:sv('<path d="M4 19V5M4 19h16M8 15l4-4 3 3 5-6"/>'),set:sv('<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>')};
function showH(d){const x=S.h.find(h=>h.date===d);if(!x)return;const vol=Math.round(x.ex.reduce((t,e)=>t+e.w*e.sets.reduce((p,s)=>p+(s||0),0),0)),sets=x.ex.reduce((t,e)=>t+e.sets.length,0),el=document.createElement('div');el.className='sheet';el.onclick=e=>{if(e.target===el)el.remove()};
el.innerHTML=`<div class="sh"><div class="grab"></div><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:20px">${dstr(new Date(x.date))}</b><span class="badge">${x.type}</span></div><div class="stt"><div><b>${x.dur}</b><small>dakika</small></div><div><b>${kg(vol)}</b><small>hacim</small></div><div><b>${sets}</b><small>set</small></div></div>${x.ex.map(e=>`<div class="row"><span>${e.n}${e.pr?' 🏆':''}</span><span class="mu">${kg(e.w)}</span></div><div class="dots">${e.sets.map(s=>`<i class="${s===(e.r||5)?'f':''}">${s===null?'–':s}</i>`).join('')}</div>`).join('')}${x.note?`<p class="mu" style="margin-top:12px">${esc(x.note)}</p>`:''}<button class="btn" onclick="this.closest('.sheet').remove()">Kapat</button></div>`;document.body.appendChild(el)}
function upCard(u){const days=Math.round((u.d-new Date())/864e5),rel=days<=1?'Yarın':days+' gün sonra';return `<div class="uc"><div class="ut"><div class="ul">${u.t}</div><div><b>${dstr(u.d)}</b><small>${u.n?u.n+' · ':''}${rel} · ${u.l.length} egzersiz</small></div></div>${u.l.map(([n,w])=>`<div class="ur"><span>${n}</span><span class="uw">${kg(w)}<em>+${String(u.inc&&u.inc[n]!=null?u.inc[n]:S.inc[n]).replace('.',',')}</em></span></div>`).join('')}</div>`}
function navUp(){const n=$('nav');if(!n.querySelector('button'))n.innerHTML='<i class="ind"></i>'+tabs.map(([k,i,l])=>`<button data-k="${k}" data-ui-action="navigate" data-ui-tab="${k}"><span>${ICN[k]}</span>${l}</button>`).join('');n.style.setProperty('--i',tabs.findIndex(x=>x[0]===tab));n.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.k===tab))}
function goT(k){snd('nav');const a=tabs.map(x=>x[0]);dir=a.indexOf(k)>a.indexOf(tab)?'l':'r';tab=k;draw();scrollTo(0,0)}
const SWV={nd:()=>!!S.nd,rn:()=>!!S.rn,ns:()=>!S.ns,nr:()=>!S.nr,nw:()=>!S.nw,al:()=>!!S.al};
function tg(k,b){S[k]=!S[k];save();acc();b.classList.toggle('on',SWV[k]())}
function pick(k,v,n){S[k]=v;save();acc();if(k==='vol')snd('ok');go(n)}
function setLanguage(lang){if(!Object.hasOwn(LANGUAGES,lang))return;const before=S.lang;S.lang=lang;if(!save()){S.lang=before;return}const sheet=$('sh');if(sheet)sheet.remove();draw();localizeAll()}
function sh(t,body){const c=`<div class="grab"></div><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><b style="font-size:20px">${t}</b><button class="pill" onclick="closeSh()">Tamam</button></div>${body}`;let el=$('sh');if(el){el.firstChild.innerHTML=c;return}el=document.createElement('div');el.className='sheet';el.id='sh';el.onclick=e=>{if(e.target===el)closeSh()};el.innerHTML=`<div class="sh">${c}</div>`;document.body.appendChild(el)}
function closeSh(){const e=$('sh');if(e)e.remove();if(tab==='set')draw();if(pe&&$('pe'))per()}
function go(n){
 const T={prof:'Profil',unit:'Birimler',rest:'Dinlenme Süreleri',w:'Ağırlıklar (kg)',inc:'Artış Miktarları (kg)',theme:'Tema',accent:'Vurgu Rengi',guide:'StrongFits 5×5 Rehberi',data:'Veriler',reset:'Verileri Sıfırla',vol:'Ses Seviyesi',ndc:'Bildirim Zamanı',language:'Dil'};
 const sg=(k,d,o)=>`<div class="seg">${o.map(([v,l])=>`<button class="${(S[k]||d)===v?'on':''}" onclick="pick('${k}','${v}','${n}')">${l}</button>`).join('')}</div>`;
 const num=(l,v,c,st)=>`<div class="row"><span>${l}</span><input class="w" type="number" step="${st||1}" value="${v}" onchange="${c};save()"></div>`;
 const B={
  language:`<div class="seg" role="group" aria-label="Dil seçimi">${Object.entries(LANGUAGES).map(([code,label])=>`<button class="${languageOf(S.lang)===code?'on':''}" onclick="setLanguage('${code}')">${label}</button>`).join('')}</div>`,
 prof:`<div class="row"><span>İsim</span><input class="w" style="width:170px;text-align:right" value="${esc(S.name||'').replace(/"/g,'&quot;')}" onchange="S.name=this.value;save()"></div>`+num('Vücut ağırlığı (kg)',S.bw||'','S.bw=+this.value',0.1),
 unit:sg('u','kg',[['kg','Kilogram'],['lb','Pound']]),
 rest:num('5 tekrar sonrası (sn)',S.r1||90,'S.r1=+this.value')+num('Başarısız set sonrası (sn)',S.r2||180,'S.r2=+this.value'),
 w:Object.keys(W0).map(k=>num(k,S.w[k],`S.w['${k}']=+this.value`,0.5)).join(''),
 inc:Object.keys(W0).map(k=>num(k,S.inc[k],`S.inc['${k}']=+this.value`,0.5)).join(''),
 theme:sg('th','auto',[['auto','Otomatik'],['dark','Koyu'],['light','Açık']]),
 accent:`<div style="display:flex;gap:10px;flex-wrap:wrap">${Object.keys(AC).map(k=>`<button class="pill" style="background:${AC[k][0]};color:${AC[k][2]};${(S.ac||'Nane')===k?'outline:3px solid var(--tx)':''}" onclick="pick('ac','${k}','accent')">${k}</button>`).join('')}</div>`,
 guide:'<p class="mu" style="font-size:15px;line-height:1.6">Haftada 3 gün, A ve B antrenmanlarını dönüşümlü yap. A: Squat, Bench Press, Barbell Row. B: Squat, Overhead Press, Deadlift.<br><br>Tüm setleri tamamlarsan bir sonraki antrenmanda ağırlık artar (Deadlift +5 kg, diğerleri +2,5 kg). Aynı egzersizde 3 kez üst üste başarısız olursan ağırlık %10 düşer.<br><br>Dinlenme: 5 tekrar sonrası yaklaşık 90 sn, başarısız sette 3 dk.</p>',
 data:`<textarea id="bk" rows="4" placeholder="Yedek verisi"></textarea><div style="display:flex;gap:8px;margin-top:12px"><button class="pill" onclick="expBk()">Dışa Aktar</button><button class="pill" onclick="impBk()">İçe Aktar</button></div>`,
 ndc:`<div class="row"><span>Saat</span><input class="w" type="time" value="${S.nt||'18:00'}" onchange="S.nt=this.value;S.ndl='';save()"></div><div class="dchips">${['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map((l,i)=>{const d=[1,2,3,4,5,6,0][i];return `<button class="pill${(S.nds||[1,3,5]).includes(d)?' sel':''}" onclick="tgd(${d},this)">${l}</button>`}).join('')}</div><p class="mu" style="margin-top:14px">Antrenman günü bildirimi seçtiğin günlerde, saat gelince ve o gün henüz antrenman yapmadıysan gönderilir.</p>`,
 vol:sg('vol','0.22',[['0.08','Düşük'],['0.22','Orta'],['0.4','Yüksek']]),
 reset:'<p class="mu">Tüm antrenmanlar, ağırlıklar ve kişisel programlar silinir.</p><button class="btn" onclick="rstS(this)">Verileri Sıfırla</button>'};
 sh(T[n],B[n])}
function sett2(){return renderSettings({S,SWV,esc});}
function plArr(w){let r=(w-20)/2,o=[];if(r<=0)return o;for(const p of [25,20,15,10,5,2.5,1.25])while(r>=p-1e-9){o.push(p);r-=p}return o}
let xi=0,xt='w';
function xv(i){xi=i;xt='w';xr(1)}
function xs(t){xt=t;xr()}
function xa(d){snd('tap');const e=S.act.ex[xi];e.w=Math.max(20,e.w+d);save();xr();wo()}
function xr(first){const e=S.act&&S.act.ex[xi];if(!e)return;let el=$('xv');if(!el){el=document.createElement('div');el.id='xv';document.body.appendChild(el)}el.className='ov x'+(first?' in':'');
 const n=e.n,r=e.r||5,sub=kg(e.w)+(e.w>20?' ('+String((e.w-20)/2).replace('.',',')+'/taraf)':''),H=S.h.map(h=>({d:h.date,x:h.ex.find(q=>q.n===n)})).filter(o=>o.x),T=[['w','Ağırlıklar'],['f','Form'],['p','İlerleme'],['h','Geçmiş']];let b='';
 if(xt==='w'){b=`<div class="bb"><i class="b0"></i>${plArr(e.w).map(p=>`<div class="pl" onclick="xa(-${2*p})" style="background:${PLC[p][0]};color:${PLC[p][1]};height:${PLC[p][2]}px"><b>${String(p).replace('.',',')}</b></div>`).join('')}<i class="b1"></i></div><div class="pp">${[25,20,15,10,5,2.5,1.25].map(p=>`<button style="background:${PLC[p][0]};color:${PLC[p][1]}" onclick="xa(${2*p})">${String(p).replace('.',',')}</button>`).join('')}</div><p class="mu" style="text-align:center;margin:0 0 16px">Plaka eklemek için dokun · çıkarmak için çizimdeki plakaya dokun</p><div class="xg"><div><small>Set×Tekrar</small><b>${e.sets.length}×${r}</b></div><div><small>Egzersiz Ağırlığı</small><b><button class="stp" onclick="xa(-2.5)">−</button> ${kg(e.w)} <button class="stp" onclick="xa(2.5)">+</button></b></div></div><div class="xg"><div style="grid-column:1/3"><small>İlerleme</small><b>Ağırlık</b></div><div><small>Artışlar</small>${S.inc[n]!==undefined?`<input class="w" type="number" step="0.5" value="${S.inc[n]}" style="width:90px;text-align:center" onchange="S.inc['${n}']=+this.value;save()">`:'<b>—</b>'}</div><div><small>Sıklık</small><b>1</b></div><div><small>Deload</small><b>10%</b></div><div><small>Sıklık</small><b>3</b></div></div><div class="xg"><div><small>Bar Ağırlığı</small><b>20kg</b></div><div><small>Plakalar</small><b style="font-size:14px">25 · 20 · 15 · 10 · 5 · 2,5 · 1,25</b></div></div>`}
 else if(xt==='f'){const F=exerciseInstructions(n,S.lang,FORM[n]);b=F?`<div style="margin-top:20px">${F.map((s,i)=>`<p class="fs">${i+1}. ${s}</p>`).join('')}</div><a class="btn" style="display:block;text-align:center;text-decoration:none" href="https://www.youtube.com/results?search_query=${encodeURIComponent(n+' form')}" target="_blank" rel="noopener">Videoyu Ara</a>`:'<p class="mu" style="margin-top:24px">Bu egzersiz için form açıklaması yok.</p>'}
 else if(xt==='p'){const pts=[...H.map(o=>o.x.w),e.w],mn=Math.min(...pts),mx=Math.max(...pts),q=mx-mn||1,p=pts.map((v,i)=>`${i/(pts.length-1)*300},${54-(v-mn)/q*48}`).join(' ');b=`<div class="card" style="margin-top:20px">${pts.length>1?`<svg class="ch" viewBox="0 0 300 60" preserveAspectRatio="none"><polygon points="${p} 300,60 0,60" style="fill:var(--red);opacity:.14"/><polyline points="${p}" fill="none" style="stroke:var(--red)" stroke-width="3" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`:'<p class="mu">Grafik için en az iki kayıt gerekir.</p>'}<div class="mu" style="margin-top:8px">En iyi ${kg(mx)} · Tahmini 1TM ${kg(Math.round(e.w*7/6/2.5)*2.5)}</div></div>`}
 else{b=H.length?`<div class="card" style="margin-top:20px">${[...H].reverse().map(o=>`<div class="row"><span>${dstr(new Date(o.d))}</span><span class="mu">${kg(o.x.w)} · ${o.x.sets.filter(s=>s===(o.x.r||5)).length}/${o.x.sets.length}</span></div>`).join('')}</div>`:'<p class="mu" style="margin-top:24px">Henüz kayıt yok.</p>'}
 el.innerHTML=`<div><div class="top"><button class="pill" onclick="$('xv').remove()">‹</button><div><b style="font-size:17px">${n}</b><div class="mu">${sub}</div></div><span></span></div><div class="seg" style="margin-top:14px">${T.map(([k,l])=>`<button class="${k===xt?'on':''}" onclick="xs('${k}')">${l}</button>`).join('')}</div>${b}</div>`}
function addCx(id){sh('Egzersiz Ekle',`<input id="cn" placeholder="Egzersiz adı"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0"><input id="cs" type="number" placeholder="Set"><input id="cr" type="number" placeholder="Tekrar"><input id="cw" type="number" step="0.5" placeholder="kg"><input id="ci" type="number" step="0.5" placeholder="+kg"></div><button class="btn" onclick="saveCx('${id}')">Ekle</button>`)}
function saveCx(id){const n=$('cn').value.trim(),c=(S.cw||[]).find(x=>x.id===id);if(!n||!c)return;c.ex.push({n:esc(n),s:Math.min(10,Math.max(1,+$('cs').value||3)),r:+$('cr').value||10,w:+$('cw').value||20,inc:+$('ci').value||2.5});save();const e=$('sh');if(e)e.remove();draw()}
let AU;
function snd(t){if(S.ns)return;try{AU=AU||new(window.AudioContext||window.webkitAudioContext)();if(AU.state==='suspended')AU.resume();const P={tap:[[620,.06]],ok:[[880,.07],[1320,.1,.07]],fail:[[300,.14]],nav:[[520,.035]],rest:[[784,.12],[784,.12,.18],[1047,.28,.36]],done:[[523,.14],[659,.14,.13],[784,.14,.26],[1047,.4,.39]]}[t],n=AU.currentTime;P.forEach(([f,d,l=0])=>{const o=AU.createOscillator(),g=AU.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,n+l);g.gain.exponentialRampToValueAtTime(+S.vol||.22,n+l+.01);g.gain.exponentialRampToValueAtTime(.0001,n+l+d);o.connect(g);g.connect(AU.destination);o.start(n+l);o.stop(n+l+d+.03)})}catch(e){}}
let rT;
function notify(t,b){try{if(!('Notification' in window)||Notification.permission!=='granted')return;new Notification(t,{body:b,tag:'sl5x5'})}catch(e){}}
async function askNotif(){try{if(!('Notification' in window))return 'yok';return await Notification.requestPermission()}catch(e){return 'hata'}}
async function tgN(k,b){if(!S[k]){const p=await askNotif();if(p!=='granted'){toast('Bildirim izni alınamadı (tarayıcı desteklemiyor ya da izin verilmedi)');return}}S[k]=!S[k];save();b.classList.toggle('on',!!S[k]);if(S[k])notify('Bildirimler açık','Bildirim testi başarılı')}
function tgd(d,b){const a=S.nds||[1,3,5];S.nds=a.includes(d)?a.filter(x=>x!==d):[...a,d];save();b.classList.toggle('sel')}
function chkDay(){if(!S.nd)return;const n=new Date(),k=key(n);if(!(S.nds||[1,3,5]).includes(n.getDay())||S.ndl===k)return;const [h,m]=(S.nt||'18:00').split(':');if(n.getHours()*60+n.getMinutes()<+h*60+ +m)return;if(S.h.some(x=>key(x.date)===k))return;S.ndl=k;save();notify('Antrenman günü 🏋️','Bugün '+S.next+' antrenmanı var');toast('Bugün antrenman günü: '+S.next)}
setInterval(chkDay,30000);setTimeout(chkDay,1500);
let pe=null;
const allW=()=>[...(S.cw||[]),...(S.pg||[]).flatMap(p=>p.ws)],fw=id=>allW().find(w=>w.id===id),AP=()=>(S.pg||[]).find(p=>p.id===S.ap);
function homeP(P){return renderCustomHome(P,{S,greet,esc,weekDots,dstr,kg,upCard});}
function prog3(){return renderPrograms({S,AP,prog2,esc,FOCUSED_PROGRAMS});}
function setAp(id){
 if(S.act){toast('Önce açık antrenmanı tamamla veya kapat');return}
 const previous={ap:S.ap,pi:S.pi};
 S.ap=id||undefined;S.pi=0;
 if(!save()){S.ap=previous.ap;S.pi=previous.pi;return}
 draw();toast(id?'Aktif program değişti':'StrongFits 5×5 aktif')
}
function activateFocusedProgram(id){if(S.act){toast('Önce mevcut antrenmanı tamamla');return}const p=cloneFocused(id);if(!p)return;const candidate={...S,pg:(S.pg||[]).some(x=>x.id===id)?S.pg:[...(S.pg||[]),p],ap:id,pi:0};if(!saveState(localStorage,candidate)){toast('Program kaydedilemedi');return}S=candidate;draw();toast(p.name+' aktif')}
function pdel(id,b){if(!b.dataset.a){b.dataset.a=1;b.textContent='Emin misin?';setTimeout(()=>{delete b.dataset.a;b.textContent='Sil'},2500)}else{S.pg=S.pg.filter(p=>p.id!==id);if(S.ap===id){S.ap=undefined;S.pi=0}save();draw()}}
function pnew(){pe={name:'',split:'Tüm Vücut',ws:[{id:'w'+Date.now(),name:'Antrenman A',ex:['Squat','Bench Press','Barbell Row'].map(n=>({n,s:5,r:5,w:S.w[n],inc:S.inc[n]}))}]};per(1)}
function pedit(id){pe=JSON.parse(JSON.stringify(S.pg.find(p=>p.id===id)));per(1)}
function pok(){const b=$('pb');if(!b)return;const ok=pe.name.trim()&&pe.ws.length&&pe.ws.every(w=>w.ex.length);b.classList.toggle('r',!!ok);b.style.opacity=ok?1:.5}
function per(first){let el=$('pe');if(!el){el=document.createElement('div');el.id='pe';document.body.appendChild(el)}el.className='ov x'+(first?' in':'');
 el.innerHTML=`<div><div class="top"><button class="pill r" onclick="$('pe').remove();pe=null">Vazgeç</button><b style="font-size:17px;text-align:center">Program Yarat</b><button class="pill" id="pb" onclick="psave()">Bitti</button></div><input id="pn" placeholder="Program Adı" value="${esc(pe.name).replace(/"/g,'&quot;')}" oninput="pe.name=this.value;pok()" style="margin:20px 0 14px;height:52px;border-radius:26px"><div class="sg"><div class="srow" style="min-height:56px" onclick="psplit()"><span>Antrenman Dağılımı</span><span class="sv">${pe.split}</span></div></div><div class="sg" style="margin-top:20px">${pe.ws.map((w,i)=>`<div class="srow" style="padding:14px 16px" onclick="pwo(${i})"><span><b>${esc(w.name)}</b><br><small class="mu">${w.ex.map(e=>esc(e.n)).join(', ')||'Egzersiz yok'}</small></span><svg class="chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></div>`).join('')}<div class="srow" style="color:var(--red);font-weight:600" onclick="padd()"><span>Antrenman Ekle</span></div></div><div class="sg" style="margin-top:20px"><div class="srow" style="min-height:56px" onclick="pshare()"><span>Programı Paylaş</span></div></div></div>`;pok()}
function psplit(){const o=['Tüm Vücut','Üst / Alt','Push / Pull / Leg','Özel'];pe.split=o[(o.indexOf(pe.split)+1)%o.length];per()}
function padd(){pe.ws.push({id:'w'+Date.now(),name:'Antrenman '+String.fromCharCode(65+pe.ws.length),ex:[]});per();pwo(pe.ws.length-1)}
function pwo(i){const w=pe.ws[i];sh('Antrenman',`<input value="${esc(w.name).replace(/"/g,'&quot;')}" oninput="pe.ws[${i}].name=this.value" placeholder="Antrenman adı" style="margin-bottom:8px">${w.ex.map((e,j)=>`<div class="row"><span>${esc(e.n)}</span><span class="mu">${e.s}×${e.r} · ${kg(e.w)} · +${e.inc} <button class="stp" onclick="pxr(${i},${j})">✕</button></span></div>`).join('')}<input id="en2" placeholder="Egzersiz adı" style="margin-top:12px"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:8px 0"><input id="es2" type="number" placeholder="Set"><input id="er2" type="number" placeholder="Tekrar"><input id="ew2" type="number" step="0.5" placeholder="kg"><input id="ei2" type="number" step="0.5" placeholder="+kg"></div><div style="display:flex;gap:8px"><button class="pill" onclick="pxa(${i})">+ Egzersiz</button>${pe.ws.length>1?`<button class="pill r" onclick="pwd(${i})">Antrenmanı Sil</button>`:''}</div>`)}
function pxa(i){const n=$('en2').value.trim();if(!n)return;pe.ws[i].ex.push({n,s:Math.min(10,Math.max(1,+$('es2').value||5)),r:+$('er2').value||5,w:+$('ew2').value||20,inc:+$('ei2').value||2.5});pwo(i)}
function pxr(i,j){pe.ws[i].ex.splice(j,1);pwo(i)}
function pwd(i){pe.ws.splice(i,1);closeSh()}
function psave(){if(!pe.name.trim()||!pe.ws.length||!pe.ws.every(w=>w.ex.length))return;const p={id:pe.id||'p'+Date.now(),name:esc(pe.name.trim()),split:pe.split,ws:pe.ws.map(w=>({id:w.id,name:esc((w.name||'').trim()||'Antrenman'),ex:w.ex.map(e=>({...e,n:esc(e.n)}))}))};S.pg=S.pg||[];const k=S.pg.findIndex(x=>x.id===p.id);if(k>=0)S.pg[k]=p;else S.pg.push(p);save();$('pe').remove();pe=null;draw();toast('Program kaydedildi, aktif yapmak için kartına dokun')}
function pshare(){sh('Programı Paylaş',`<textarea id="pj" rows="6" readonly>${esc(JSON.stringify({sl5x5:1,name:pe.name,split:pe.split,ws:pe.ws.map(w=>({name:w.name,ex:w.ex}))}))}</textarea><button class="btn" onclick="pcp()">Kopyala</button>`)}
function pcp(){const t=$('pj');t.select();try{navigator.clipboard.writeText(t.value)}catch(e){try{document.execCommand('copy')}catch(_){}}toast('Kopyalandı')}
function pimpo(){sh('Program İçe Aktar',`<textarea id="pj" rows="6" placeholder="Program verisi"></textarea><button class="btn" onclick="pimp()">İçe Aktar</button>`)}
function pimp(){
 const input=$('pj');
 try{
   const data=parseSharedProgram(input.value);
   const stamp=Date.now();
   const program={id:'p'+stamp,name:esc(data.name),split:esc(data.split||'Özel'),
     ws:data.ws.map((w,i)=>({id:'w'+stamp+i,name:esc(w.name),ex:w.ex.map(e=>({
       n:esc(e.n),s:e.s,r:e.r,w:e.w,inc:e.inc
     }))}))};
   const candidate={...S,pg:[...(S.pg||[]),program]};
   if(!saveState(localStorage,candidate))throw Error('Depolama alanına kaydedilemedi');
   S=candidate;
   $('sh').remove();draw();toast('Program doğrulandı ve içe aktarıldı');
 }catch(error){
   input.placeholder='Geçersiz program: '+String(error.message||error);
   toast('Program yüklenmedi; mevcut kayıtların korundu');
 }
}
function cu(){document.querySelectorAll('#app .cu').forEach(el=>{const m=el.textContent.match(/^(\d+)(.*)$/);if(!m||!+m[1])return;const n=+m[1],t0=performance.now(),f=t=>{const p=Math.min(1,(t-t0)/900);el.textContent=Math.round(n*(1-Math.pow(1-p,3)))+m[2];if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)})}
new MutationObserver(cu).observe($('app'),{childList:true});
function resetAll(){try{localStorage.removeItem('sl5x5')}catch(e){}S=fresh();save();location.reload()}
function showErr(err){
 $('app').innerHTML='<div class="card"><b>Veri kurtarma</b><p class="mu">'+esc(String(err&&err.message||err))+'</p><p class="mu">Mevcut kayıt silinmedi. Önce ham veriyi kopyala, ardından varsa geçerli yedeğini yapıştır.</p><button class="pill" onclick="recoverData()">Ham veriyi görüntüle</button><textarea id="recoveryImport" rows="5" placeholder="Geçerli JSON yedeğini buraya yapıştır" aria-label="Kurtarma yedeği"></textarea><button class="btn" onclick="recoverImport()">Doğrula ve yedeği geri yükle</button><button class="pill" onclick="location.reload()">Yeniden dene</button></div>';
}
function recoverData(){
 let backup='';try{backup=localStorage.getItem('sl5x5')||''}catch(error){toast('Cihaz kayıtlarına erişim engellendi');return}
 const textarea=document.createElement('textarea');
 textarea.id='recoveryBackup';
 textarea.rows=8;
 textarea.readOnly=true;
 textarea.value=backup;
 textarea.setAttribute('aria-label','Ham yerel veri yedeği');
 $('app').appendChild(textarea);
 textarea.focus();
 textarea.select();
}
function recoverImport(){
 try{
  const candidate=parseBackup($('recoveryImport').value);
  if(!saveState(localStorage,candidate,{replaceInvalid:true}))throw Error('Kayıt alanına yazılamadı');
  S=candidate;draw();toast('Yedek güvenle geri yüklendi');
 }catch(error){toast('Kurtarma başarısız; önceki kayıt korundu')}
}
window.addEventListener('error',e=>{if(!$('app').children.length)showErr(e.error||e.message)});
// Localize dynamically created sheets, toasts and screens without modifying user data.
new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes||[])localizeTree(node,languageOf(S.lang))}).observe(document.body,{childList:true,subtree:true});

// Transitional legacy inline-handler bridge. Keep the existing markup actions
// functional while templates are migrated to delegated DOM events in later PRs.
// Browser inline handlers run in Window scope, whereas Vite modules are lexical.
for (const [name, access] of Object.entries({
  S: {get:()=>S,set:value=>{S=value}},
  draft: {get:()=>draft,set:value=>{draft=value}},
  pe: {get:()=>pe,set:value=>{pe=value}},
  tab: {get:()=>tab,set:value=>{tab=value}},
  hsub: {get:()=>hsub,set:value=>{hsub=value}},
  wtab: {get:()=>wtab,set:value=>{wtab=value}},
  rEnd: {get:()=>rEnd,set:value=>{rEnd=value}},
  dArm: {get:()=>dArm,set:value=>{dArm=value}}
})) Object.defineProperty(window,name,{configurable:true,enumerable:false,...access});
Object.assign(window,{showSetup,saveSetup,home,prog,hist,stat,sett,acc,toast,draw,start,wo,tap,warm,plates,adj,delH,addX,rmX,prog2,addD,saveC,delC,startC,adjC,rmC,delWo,rstS,expBk,impBk,closeWo,finish,greet,weekDots,showH,upCard,navUp,goT,tg,pick,sh,closeSh,go,sett2,plArr,xv,xs,xa,xr,addCx,saveCx,snd,notify,askNotif,tgN,tgd,chkDay,homeP,prog3,setAp,setLanguage,pdel,pnew,pedit,pok,per,psplit,padd,pwo,pxa,pxr,pwd,psave,pshare,pcp,pimpo,pimp,cu,resetAll,showErr,recoverData,recoverImport,save,$,kg,key,dstr,esc,upcoming});
registerUIActions(document,{
 navigate:goT,
 activateFocusedProgram,
 logSet:tap,
 editExercise:xv,
 viewWorkout:view=>{wtab=view;wo()},
 finishWorkout:finish,
 closeWorkout:closeWo,
 discardWorkout:delWo,
 skipRest:()=>{rEnd=0},
 showNote:()=>{if(!S.act)return;S.act.showNote=1;wo();$('nt')?.focus()},
 updateNote:value=>{if(!S.act)return;const before=S.act.note;S.act.note=value;if(!save())S.act.note=before}
});
foodFeature=createFoodFeature({getState:()=>S,draw,sh,toast,snd,esc,key,sv,D,M,$,languageOf,monthNames});
try{const warning=getLoadWarning(localStorage);if(warning)showErr(new Error(warning));else{tab='home';draw()}}catch(err){showErr(err)}
