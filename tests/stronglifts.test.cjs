const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const found = html.match(/<script>([\s\S]*?)<\/script>/);
const source = found ? found[1] : '';
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const vite = fs.readFileSync(path.join(root, 'vite.config.mjs'), 'utf8');

function harness(initial = {}) {
  const store = new Map(Object.entries(initial));
  const elements = new Map();
  const element = () => ({
    classList: { toggle(){}, add(){}, remove(){} },
    style: { setProperty(){}, display: '' },
    setAttribute(){}, focus(){}, appendChild(){}, remove(){}, select(){},
    children: [], dataset: {}, offsetWidth: 100,
    querySelector(){ return null; },
    querySelectorAll(){ return []; },
    textContent:'', innerHTML:'', value:''
  });
  const get = id => {
    if (!elements.has(id)) elements.set(id, element());
    return elements.get(id);
  };
  const setButtons = Array.from({length:3}, () => ({
    children: Array.from({length:5}, () => element())
  }));
  const ctx = {
    console, Date, Math, JSON, Map, Set, String, Number, Array, Object, RegExp, Error,
    localStorage: {
      getItem: key => store.get(key) ?? null,
      setItem: (key,value) => store.set(key,value),
      removeItem: key => store.delete(key)
    },
    document: {
      documentElement: { style: { setProperty(){} }, dataset:{} },
      body: { classList: { toggle(){} }, appendChild(){} },
      getElementById: get,
      querySelectorAll: selector => selector === '.sets' ? setButtons : [],
      addEventListener(){}, createElement: element
    },
    navigator:{},
    addEventListener(){},
    MutationObserver:class { observe(){} },
    setInterval:()=>1, clearInterval(){}, setTimeout:()=>1, clearTimeout(){},
    performance:{now:()=>0}, requestAnimationFrame(){}, scrollTo(){},
    location:{reload(){}}
  };
  ctx.window = ctx; // window and the global object coincide in browsers
  vm.createContext(ctx);
  new vm.Script(source, {filename:'uploaded-stronglifts.js'}).runInContext(ctx,{timeout:5000});
  const run=(code)=>vm.runInContext(code,ctx,{timeout:5000});
  const state=()=>JSON.parse(store.get('sl5x5') || 'null');
  return {ctx,get,store,run,state};
}

test('the uploaded single-file application is the active root',()=>{
  assert.match(html,/^<!DOCTYPE html>/);
  assert.match(html,/<title>StrongLifts 5×5<\/title>/);
  for(const id of ['app','nav','ovl']) assert.match(html,new RegExp('id="'+id+'"'));
  assert.ok(!html.includes('/src/ui-v09.css'));
  assert.ok(!html.includes('arm_5x5_app_state_v1'));
  assert.ok(!html.includes('v7RenderToday'));
});
test('uploaded script syntax is valid',()=>{ assert.doesNotThrow(()=>new vm.Script(source)); });
test('the 5-tab interface is mounted on initial load',()=>{
  const a=harness();
  assert.match(a.get('nav').innerHTML,/Ana Sayfa/);
  assert.match(a.get('nav').innerHTML,/Programlar/);
  assert.match(a.get('nav').innerHTML,/Geçmiş/);
  assert.match(a.get('nav').innerHTML,/İlerleme/);
  assert.match(a.get('nav').innerHTML,/Ayarlar/);
});
test('initial home displays real A/B plan exercises',()=>{
  const a=harness();
  assert.match(a.get('app').innerHTML,/Bugünkü Antrenman/);
  assert.match(a.get('app').innerHTML,/Squat/);
  assert.match(a.get('app').innerHTML,/Deadlift/);
  assert.match(a.get('app').innerHTML,/Antrenmanı Başlat/);
});
test('starts one session and persists it only in the new sl5x5 key',()=>{
  const old='{"note":"unmigrated ARM snapshot"}';
  const a=harness({arm_5x5_app_state_v1:old});
  a.run('start()');
  assert.ok(a.state().act);
  assert.equal(a.state().act.ex.length,3);
  assert.equal(a.store.get('arm_5x5_app_state_v1'),old);
});
test('resuming a workout does not create a second session',()=>{
  const a=harness();
  a.run('start()');
  const date=a.state().act.date;
  a.run('start()');
  assert.equal(a.state().act.date,date);
});
test('unrecorded empty session cannot be saved to history',()=>{
  const a=harness();a.run('start()');a.run('finish()');
  assert.equal(a.state().h.length,0);
  assert.ok(a.state().act);
});
test('single tap records five repetitions and repeated taps cycle repeat counts',()=>{
  const a=harness();a.run('start()');
  a.run('tap(0,0)');
  assert.equal(a.state().act.ex[0].sets[0],5);
  a.run('tap(0,0)');
  assert.equal(a.state().act.ex[0].sets[0],4);
  for(let i=0;i<5;i++)a.run('tap(0,0)');
  assert.equal(a.state().act.ex[0].sets[0],null);
});
test('completed session is saved and A/B alternation progresses',()=>{
  const a=harness();a.run('start()');
  a.run('S.act.ex.forEach(e=>e.sets.fill(5));finish()');
  const data=a.state();
  assert.equal(data.h.length,1);
  assert.equal(data.next,'A');
  assert.equal(data.w.Squat,177.5);
  assert.equal(data.w.Deadlift,80);
  assert.equal(data.act,null);
});
test('weight progression is based on saved repetitions, not decorative circles',()=>{
  const a=harness();a.run('start()');
  a.run('S.act.ex[0].sets[0]=5;save();finish()');
  const data=a.state();
  assert.equal(data.h.length,1);
  assert.equal(data.w.Squat,175);
  assert.equal(data.fail.Squat,1);
});
test('history is empty on fresh profile and filled from saved session',()=>{
  const a=harness();
  a.run('goT("hist")');
  assert.match(a.get('app').innerHTML,/Geçmiş/);
  assert.ok(!a.get('app').innerHTML.includes('🏆'));
  a.run('start();S.act.ex.forEach(e=>e.sets.fill(5));finish();goT("hist")');
  assert.match(a.get('app').innerHTML,/Geçmiş/);
  assert.match(a.get('app').innerHTML,/class="d/);
});
test('program and settings tabs render independently',()=>{
  const a=harness();
  a.run('goT("prog")');assert.match(a.get('app').innerHTML,/Programlar/);
  a.run('goT("set")');assert.match(a.get('app').innerHTML,/Ayarlar/);
  assert.match(a.get('app').innerHTML,/Verileri Dışa \/ İçe Aktar/);
});
test('progress screen renders the user supplied exercises',()=>{
  const a=harness();a.run('goT("stat")');
  assert.match(a.get('app').innerHTML,/İlerleme/);
  assert.match(a.get('app').innerHTML,/Overhead Press/);
});
test('backup exports new schema without deleting old ARM storage',()=>{
  const old='{"legacy":true}',a=harness({arm_5x5_app_state_v1:old});
  a.run('start()');a.run('expBk()');
  assert.ok(a.get('bk').value.includes('"act"'));
  assert.equal(a.store.get('arm_5x5_app_state_v1'),old);
});
test('initial accent matches supplied emerald palette',()=>{
  assert.match(html,/--red:#62DBA6/);
  assert.match(html,/--red2:#4fc496/);
  assert.match(html,/const AC=\{'Nane'/);
});
test('mobile safe areas, reduced motion and offline PWA wrapper remain',()=>{
  assert.match(html,/viewport-fit=cover/);
  assert.match(html,/safe-area-inset-bottom/);
  assert.match(html,/prefers-reduced-motion:reduce/);
  assert.match(vite,/VitePWA/);
  assert.match(vite,/registerType: 'autoUpdate'/);
  assert.match(vite,/cleanupOutdatedCaches: true/);
  assert.match(vite,/StrongLifts 5×5/);
});
test('package ships a single Vite app and no obsolete Tailwind or React runtime',()=>{
  assert.equal(pkg.name,'stronglifts-5x5-html-baseline');
  assert.equal(pkg.scripts.build,'vite build');
  assert.ok(!pkg.devDependencies.tailwindcss);
  assert.ok(!pkg.dependencies?.react);
});

test('programs tab lists exercise-focused catalog programs, not only 5x5',()=>{
  const a=harness();
  a.run('goT("prog")');
  const out=a.get('app').innerHTML;
  for(const n of ['Kol Antrenman','Göğüs Antrenman','Sırt Antrenman','Omuz Antrenman','Bacak Antrenman','Tüm Vücut'])assert.match(out,new RegExp(n));
  assert.match(out,/StrongLifts 5×5/);
});
test('catalog programs have a 4-week plan with rest days and valid exercises',()=>{
  const a=harness();
  assert.equal(a.run('CAT.every(p=>cdays(p).length===28)'),true);
  assert.equal(a.run('CAT.every(p=>cdays(p).some(d=>d.rest)&&cdays(p).filter(d=>!d.rest).every(d=>d.ex.length>=3&&d.ex.every(e=>e.s>0&&e.r>0&&e.w>=20&&e.inc>0)))'),true);
});
test('catalog day runs through the normal workout flow and records progress',()=>{
  const a=harness();
  a.run('startC("c:kol:0")');
  assert.equal(a.state().act.cid,'c:kol:0');
  assert.equal(a.state().act.ex.length,4);
  a.run('S.act.ex.forEach(e=>e.sets.fill(e.r));finish()');
  const d=a.state();
  assert.equal(d.pp.kol.done[0],1);
  assert.equal(d.cwt['kol|Barbell Curl'],22.5);
  assert.equal(d.h.length,1);
  assert.equal(d.next,'B');
  assert.equal(a.run('catW("kol",0).ex[0].w'),22.5);
  assert.equal(a.run('cpc(CAT[0]).dn'),1);
});
test('unfinished catalog day does not advance weights and rest days cannot start',()=>{
  const a=harness();
  a.run('startC("c:kol:0");S.act.ex[0].sets[0]=10;finish()');
  assert.equal(a.state().cwt['kol|Barbell Curl'],20);
  assert.equal(a.run('catW("kol",3)'),null);
  a.run('pdo("kol");pdreset({dataset:{},textContent:""});');
});
