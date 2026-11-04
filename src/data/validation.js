// Defensive import boundary; no write happens in this module.
export const BACKUP_LIMIT=2*1024*1024;
const fail=(message)=>{throw new Error(message)};
const obj=(value)=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const num=(value,min,max)=>typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max;
const str=(value,max=120)=>typeof value==='string'&&value.length>0&&value.length<=max;
const arr=(value,min,max)=>Array.isArray(value)&&value.length>=min&&value.length<=max;
const safeName=value=>str(value)&&!/[<>]/.test(value);
const safeId=value=>str(value,80)&&/^[A-Za-z0-9_-]+$/.test(value);
const exercise=(e,mode)=>{
 if(!obj(e)||!safeName(e.n)||!num(e.w,0,2000))fail('Hareket bilgisi geçersiz');
 if(mode==='saved'){
   if(!arr(e.sets,1,30)||e.sets.some(s=>s!==null&&(!num(s,0,100)||!Number.isInteger(s))))fail('Set kaydı geçersiz');
   if(e.r!==undefined&&(!num(e.r,1,100)||!Number.isInteger(e.r)))fail('Tekrar sayısı geçersiz');
 }else if(!num(e.s,1,30)||!Number.isInteger(e.s)||!num(e.r,1,100)||!Number.isInteger(e.r)||!num(e.inc,0,100))fail('Plan setleri geçersiz');
};
const session=(s)=>{
 if(!obj(s)||!num(s.date,0,4102444800000)||!safeName(s.type)||!arr(s.ex,1,60))fail('Seans bilgisi geçersiz');
 s.ex.forEach(e=>exercise(e,'saved'));
 if(s.note!==undefined&&(typeof s.note!=='string'||s.note.length>10000))fail('Seans notu geçersiz');
 if(s.cid!==undefined&&!safeId(s.cid))fail('Seans kimliği geçersiz');
};
const workout=(w)=>{
 if(!obj(w)||!safeId(w.id)||!safeName(w.name)||!arr(w.ex,1,60))fail('Antrenman planı geçersiz');
 w.ex.forEach(e=>exercise(e,'plan'));
};
const map=(data,min,max)=>{
 if(!obj(data)||Object.keys(data).length>100||Object.values(data).some(v=>!num(v,min,max)))fail('Ağırlık veya artış geçersiz');
};
const read=(raw,limit)=>{
 if(typeof raw!=='string'||!raw.trim()||raw.length>limit)fail('Veri boş veya boyut sınırı aşıldı');
 try{return JSON.parse(raw)}catch(e){fail('JSON biçimi geçersiz')}
};
export function parseBackup(raw){
 const data=read(raw,BACKUP_LIMIT);
 if(!obj(data))fail('Yedek nesnesi geçersiz');
 for(const key of Object.keys(data))if(['__proto__','prototype','constructor'].includes(key))fail('Desteklenmeyen alan');
 map(data.w,0,2000);map(data.inc,0,100);
 if(!arr(data.h,0,3000)||!['A','B'].includes(data.next))fail('Yedek program durumu geçersiz');
 data.h.forEach(session);
 if(data.act!=null)session(data.act);
 if(data.cw!==undefined){if(!arr(data.cw,0,100))fail('Kişisel antrenman listesi geçersiz');data.cw.forEach(workout)}
 if(data.pg!==undefined){
   if(!arr(data.pg,0,100))fail('Kişisel program listesi geçersiz');
   data.pg.forEach(p=>{
     if(!obj(p)||!safeId(p.id)||!safeName(p.name)||!arr(p.ws,1,30))fail('Kişisel program geçersiz');
     p.ws.forEach(workout);
   });
 }
 return data;
}
export function parseSharedProgram(raw){
 const p=read(raw,128*1024);
 if(!obj(p)||!str(p.name)||!arr(p.ws,1,30))fail('Program başlığı veya liste geçersiz');
 if(p.split!==undefined&&!str(p.split))fail('Program türü geçersiz');
 p.ws.forEach(w=>{
   if(!obj(w)||!str(w.name)||!arr(w.ex,1,60))fail('Antrenman yapısı geçersiz');
   w.ex.forEach(e=>{
     if(!obj(e)||!str(e.n)||!num(e.w,0,2000)||!num(e.inc,0,100)||!num(e.s,1,30)||!Number.isInteger(e.s)||!num(e.r,1,100)||!Number.isInteger(e.r))fail('Program hareketi geçersiz');
   });
 });
 return p;
}
