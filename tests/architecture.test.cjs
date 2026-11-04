const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.join(__dirname,'..');
const source = path => fs.readFileSync(path,'utf8');
const file = pathName => source(path.join(root,pathName));
const esm = pathName => import(pathToFileURL(path.join(root,pathName)).href);

test('HTML shell contains no embedded application CSS or JavaScript',()=>{
  const html=file('index.html');
  assert.match(html,/<script type="module" src="\/src\/main\.js"><\/script>/);
  assert.ok(!html.includes('<style>')&&!html.includes('onclick='));
  assert.match(html,/<div id="app"><\/div><nav id="nav"><\/nav><div id="ovl"><\/div>/);
});

test('app imports typed responsibilities and compatibility shim; no data migration on startup',()=>{
  const app=file('src/app.js');
  for(const item of ['domain/config','data/storage','domain/workout','lib/format'])assert.ok(app.includes(item),item);
  assert.match(app,/Object\.assign\(window/);
  assert.match(app,/let S=loadState\(localStorage\)/);
  assert.ok(!app.includes("removeItem('arm_5x5_app_state_v1')"));
});

test('the original CSS order is preserved across separated layers',()=>{
  const main=file('src/main.js');
  const names=['base.css','effects.css','components.css'];
  let last=-1;
  for(const name of names){const i=main.indexOf(name);assert.ok(i>last);last=i;}
  const css=names.map(name=>file('src/styles/'+name)).join('');
  assert.match(css,/--red:#62DBA6/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/@keyframes orb/);
});

test('fresh state preserves uploaded baseline defaults and storage key',async ()=>{
  const {fresh,loadState,saveState,STORAGE_KEY}=await esm('src/data/storage.js');
  assert.equal(STORAGE_KEY,'sl5x5');
  const state=fresh();
  assert.equal(state.next,'B');
  assert.equal(state.w.Squat,175);
  assert.equal(state.inc.Deadlift,5);
  assert.deepEqual(state.h,[]);
  const saved=new Map();
  const storage={
    getItem:k=>saved.get(k)??null,
    setItem:(k,v)=>saved.set(k,v),
    removeItem:k=>saved.delete(k)
  };
  saved.set('arm_5x5_app_state_v1','{"legacy":true}');
  assert.equal(saveState(storage,state),true);
  assert.equal(loadState(storage).next,'B');
  assert.equal(saved.get('arm_5x5_app_state_v1'),'{"legacy":true}');
  assert.deepEqual([...saved.keys()].sort(),['arm_5x5_app_state_v1','sl5x5']);
});

test('malformed storage is handled without changing old keys',async ()=>{
  const {loadState}=await esm('src/data/storage.js');
  const storage={getItem(){return '{broken'},setItem(){throw Error('must not write')}};
  const state=loadState(storage);
  assert.equal(state.w['Bench Press'],105);
  assert.equal(state.next,'B');
});

test('upcoming projected sessions do not mutate saved weights',async ()=>{
  const {upcomingWorkouts}=await esm('src/domain/workout.js');
  const {fresh}=await esm('src/data/storage.js');
  const state=fresh();
  const before=JSON.stringify(state);
  const projected=upcomingWorkouts(state,new Date(2026,10,4,12));
  assert.equal(projected.length,4);
  assert.deepEqual(projected.map(x=>x.t),['A','B','A','B']);
  assert.equal(projected[0].l[0][0],'Squat');
  assert.equal(projected[0].l[0][1],177.5);
  assert.equal(JSON.stringify(state),before);
});

test('standard progression increases completed lifts and tracks unsuccessful sets',async ()=>{
  const {applyStandardProgression}=await esm('src/domain/workout.js');
  const {fresh}=await esm('src/data/storage.js');
  const state=fresh();state.fail={};
  applyStandardProgression(state,{ex:[{n:'Squat',w:175,sets:[5,5,5,5,5]},{n:'Deadlift',w:75,sets:[5,5,5,5,4]}]});
  assert.equal(state.w.Squat,177.5);
  assert.equal(state.w.Deadlift,75);
  assert.equal(state.fail.Squat,0);
  assert.equal(state.fail.Deadlift,1);
});

test('third failed workout triggers same 10-percent deload rule',async ()=>{
  const {applyStandardProgression}=await esm('src/domain/workout.js');
  const {fresh}=await esm('src/data/storage.js');
  const state=fresh();state.fail={Squat:2};
  applyStandardProgression(state,{ex:[{n:'Squat',w:175,sets:[5,4,5,5,5]}]});
  assert.equal(state.w.Squat,157.5);
  assert.equal(state.fail.Squat,0);
});

test('formatting stays independent of the DOM and matches uploaded text conventions',async ()=>{
  const {displayWeight,displayDate,dateKey,escapeHTML}=await esm('src/lib/format.js');
  assert.equal(displayWeight(32.5,'kg'),'32,5kg');
  assert.equal(displayWeight(50,'lb'),'110lb');
  assert.equal(displayDate(new Date(2026,10,4)).includes('Kasım'),true);
  assert.equal(dateKey(new Date(2026,10,4)),'2026-11-4');
  assert.equal(escapeHTML('<script>&'), '&lt;script&gt;&amp;');
});

test('no retired ARM styles, pilot or app engine are imported',()=>{
  const entry=file('src/main.js');
  const app=file('src/app.js');
  assert.doesNotMatch(entry,/src\/v7|src\/ui-v09|pilot\//);
  assert.ok(!app.includes('v7RenderToday'));
  assert.ok(!app.includes('arm_5x5_app_state_v1'));
});

test('bounded backup parser rejects corrupt sessions without executing or altering data',async()=>{
 const {parseBackup, BACKUP_LIMIT}=await esm('src/data/validation.js');
 const {fresh}=await esm('src/data/storage.js');
 const valid=fresh();
 const before=JSON.stringify(valid);
 assert.strictEqual(parseBackup(before).next,'B');
 assert.equal(JSON.stringify(valid),before);
 assert.throws(()=>parseBackup('{bad'),/JSON/);
 assert.throws(()=>parseBackup(' '.repeat(BACKUP_LIMIT+1)),/boyut/);
 assert.throws(()=>parseBackup(JSON.stringify({...valid,w:{Squat:-1}})),/Ağırlık/);
 assert.throws(()=>parseBackup(JSON.stringify({...valid,h:[{date:Date.now(),type:'A',ex:[{n:'Squat',w:175,sets:[-1]}]}]})),/Set/);
});

test('shared program parser enforces bounded sets and nonnegative finite loads',async()=>{
 const {parseSharedProgram}=await esm('src/data/validation.js');
 const valid={name:'Üst',ws:[{name:'Gün A',ex:[{n:'Press',s:5,r:5,w:45,inc:2.5}]}]};
 assert.equal(parseSharedProgram(JSON.stringify(valid)).ws[0].ex[0].s,5);
 assert.throws(()=>parseSharedProgram(JSON.stringify({...valid,ws:[{name:'Gün A',ex:[{n:'Press',s:100000,r:5,w:45,inc:2.5}]}]})),/Program hareketi/);
 assert.throws(()=>parseSharedProgram(JSON.stringify({...valid,ws:[{name:'Gün A',ex:[{n:'Press',s:5,r:5,w:'NaN',inc:2.5}]}]})),/Program hareketi/);
});

test('GitHub Actions verifies every src change, not only HTML and tests',()=>{
 const yaml=file('.github/workflows/verify.yml');
 assert.match(yaml,/src\/\*\*/);
 assert.match(yaml,/npm test/);
 assert.match(yaml,/npm run build/);
});

test('invalid startup storage is read-only until a verified explicit replacement',async()=>{
 const {fresh,loadState,saveState,getLoadWarning}=await esm('src/data/storage.js');
 const store=new Map([['sl5x5','{corrupt'],['arm_5x5_app_state_v1','archive']]);
 const local={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
 const model=loadState(local);
 assert.equal(model.next,'B');
 assert.match(getLoadWarning(local),/Mevcut kayıt bozuk/);
 assert.equal(saveState(local,fresh()),false);
 assert.equal(store.get('sl5x5'),'{corrupt');
 assert.equal(store.get('arm_5x5_app_state_v1'),'archive');
 assert.equal(saveState(local,fresh(),{replaceInvalid:true}),true);
 assert.equal(getLoadWarning(local),null);
 assert.equal(JSON.parse(store.get('sl5x5')).next,'B');
});

test('a valid storage object with custom plans survives validated cold startup',async()=>{
 const {fresh,loadState,saveState}=await esm('src/data/storage.js');
 const saved=fresh();
 saved.pg=[{id:'p123',name:'Özel',ws:[{id:'w456',name:'Tüm Vücut',ex:[{n:'Bench Press',w:50,s:5,r:5,inc:2.5}]}]}];
 saved.cw=[{id:'c123',name:'Kol',ex:[{n:'Curl',w:20,s:3,r:10,inc:2.5}]}];
 const data=new Map([['sl5x5',JSON.stringify(saved)]]);
 const store={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 const loaded=loadState(store);
 assert.equal(loaded.pg[0].ws[0].ex[0].n,'Bench Press');
 assert.equal(loaded.cw[0].ex[0].s,3);
 assert.equal(saveState(store,loaded),true);
});
