const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { buildSync } = require('esbuild');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
// Bundle the actual ESM graph into a browser-compatible IIFE for deterministic VM tests.
const generated=buildSync({
  entryPoints:[path.join(root,'src','main.js')],
  absWorkingDir:root,
  bundle:true, format:'iife', platform:'browser', write:false, logLevel:'silent',
  loader:{'.css':'empty'}
});
const source=(generated.outputFiles.find(x=>x.path.endsWith('.js')) || generated.outputFiles[0]).text;
const baseCSS=fs.readFileSync(path.join(root,'src','styles','base.css'),'utf8');
const configSource=fs.readFileSync(path.join(root,'src','domain','config.js'),'utf8');
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

test('Vite entrypoint replaces inline CSS and inline JS without losing the HTML shell',()=>{
  assert.match(html,/^<!DOCTYPE html>/);
  assert.match(html,/<title>StrongLifts 5×5<\/title>/);
  for(const id of ['app','nav','ovl']) assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(html,/<script type="module" src="\/src\/main\.js"><\/script>/);
  assert.ok(!html.includes('<style>'));
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('/src/ui-v09.css'));
  assert.ok(!html.includes('arm_5x5_app_state_v1'));
  assert.ok(!html.includes('v7RenderToday'));
});
test('ES modules bundle to executable browser JavaScript',()=>{ assert.doesNotThrow(()=>new vm.Script(source)); });
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
  assert.match(baseCSS,/--red:#62DBA6/);
  assert.match(baseCSS,/--red2:#4fc496/);
  assert.match(configSource,/const AC=\{'Nane'/);
});
test('mobile safe areas, reduced motion and offline PWA wrapper remain',()=>{
  assert.match(html,/viewport-fit=cover/);
  assert.ok(['base.css','effects.css','components.css'].some(f=>fs.readFileSync(path.join(root,'src','styles',f),'utf8').includes('safe-area-inset-bottom')));
  assert.match(fs.readFileSync(path.join(root,'src','styles','components.css'),'utf8'),/prefers-reduced-motion:reduce/);
  assert.match(vite,/VitePWA/);
  assert.match(vite,/registerType: 'autoUpdate'/);
  assert.match(vite,/cleanupOutdatedCaches: true/);
  assert.match(vite,/StrongLifts 5×5/);
});
test('package ships a single Vite app and no obsolete Tailwind or React runtime',()=>{
  assert.equal(pkg.name,'stronglifts-5x5-html-baseline');
  assert.equal(pkg.type,'module');
  assert.ok(pkg.devDependencies.esbuild);
  assert.equal(pkg.scripts.build,'vite build');
  assert.ok(!pkg.devDependencies.tailwindcss);
  assert.ok(!pkg.dependencies?.react);
});

test('invalid backup cannot overwrite live workout data',()=>{
 const a=harness({arm_5x5_app_state_v1:'legacy'});
 a.run('start()');
 const original=a.store.get('sl5x5');
 a.get('bk').value=JSON.stringify({w:{Squat:-10},inc:{Squat:2.5},h:[],next:'B'});
 a.run('impBk()');
 assert.equal(a.store.get('sl5x5'),original);
 assert.equal(a.store.get('arm_5x5_app_state_v1'),'legacy');
 assert.equal(a.run('S.act!==null'),true);
 assert.match(a.get('bk').placeholder,/Geçersiz yedek/);
});

test('valid backup loads through the new validator without losing the old storage key',()=>{
 const a=harness({arm_5x5_app_state_v1:'archive'});
 a.run('start()');
 const candidate=a.state();candidate.w.Squat=190;
 a.get('bk').value=JSON.stringify(candidate);
 a.run('impBk()');
 assert.equal(a.state().w.Squat,190);
 assert.equal(a.store.get('arm_5x5_app_state_v1'),'archive');
});

test('unsafe shared program import leaves existing workout history intact',()=>{
 const a=harness();a.run('start()');
 const old=a.store.get('sl5x5');
 a.get('pj').value=JSON.stringify({name:'Unsafe',ws:[{name:'Day',ex:[{n:'Squat',s:9999,r:5,w:40,inc:2.5}]}]});
 a.run('pimp()');
 assert.equal(a.store.get('sl5x5'),old);
 assert.equal(a.run('S.act!==null'),true);
 assert.match(a.get('pj').placeholder,/Geçersiz program/);
});

test('valid shared program persists only validated exercises',()=>{
 const a=harness();a.run('start()');
 a.get('pj').value=JSON.stringify({name:'Kuvvet',split:'Özel',ws:[{name:'Gün 1',ex:[{n:'Squat',s:3,r:5,w:60,inc:2.5}]}]});
 a.run('pimp()');
 const saved=a.state();
 assert.equal(saved.pg.length,1);
 assert.equal(saved.pg[0].ws[0].ex[0].s,3);
 assert.equal(saved.pg[0].ws[0].ex[0].w,60);
 assert.equal(saved.act.ex.length,3);
});

test('storage write failure does not mark a workout complete or delete its active session',()=>{
 const a=harness();a.run('start()');
 const stored=a.store.get('sl5x5');
 a.run('S.act.ex.forEach(e=>e.sets.fill(5))');
 a.ctx.localStorage.setItem=()=>{throw Error('Quota exceeded')};
 a.run('finish()');
 assert.equal(a.store.get('sl5x5'),stored);
 assert.equal(a.run('S.act!==null'),true);
 assert.equal(a.run('S.h.length'),0);
});

test('runtime recovery never prompts a one-click factory reset',()=>{
 const a=harness();a.run('showErr(new Error("temporary rendering failure"))');
 const markup=a.get('app').innerHTML;
 assert.match(markup,/Ham veriyi görüntüle/);
 assert.ok(!markup.includes('onclick="resetAll()"'));
 assert.doesNotThrow(()=>a.run('recoverData()'));
});

test('a failed write does not start an unpersisted workout',()=>{
 const a=harness();
 a.ctx.localStorage.setItem=()=>{throw Error('Storage quota exceeded')};
 a.run('start()');
 assert.equal(a.run('S.act'),null);
 assert.equal(a.store.has('sl5x5'),false);
});

test('failed set recording keeps the previously logged repetitions intact',()=>{
 const a=harness();a.run('start()');
 const original=a.store.get('sl5x5');
 a.ctx.localStorage.setItem=()=>{throw Error('Storage denied')};
 a.run('tap(0,0)');
 assert.equal(a.run('S.act.ex[0].sets[0]'),null);
 assert.equal(a.store.get('sl5x5'),original);
});

test('weight edits do not appear saved if browser storage rejects the update',()=>{
 const a=harness();a.run('start()');
 const old=a.run('S.act.ex[0].w');
 a.ctx.localStorage.setItem=()=>{throw Error('Storage denied')};
 a.run('adj(0,5)');
 assert.equal(a.run('S.act.ex[0].w'),old);
});

test('failed storage preserves an active session when canceling it',()=>{
 const a=harness();a.run('start()');
 const original=a.store.get('sl5x5');
 a.ctx.localStorage.setItem=()=>{throw Error('Storage denied')};
 a.run('delWo()');a.run('delWo()');
 assert.equal(a.run('S.act!==null'),true);
 assert.equal(a.store.get('sl5x5'),original);
});

test('failed reset restores in-memory records instead of silently losing them',()=>{
 const a=harness();a.run('start()');
 const before=a.store.get('sl5x5');
 a.ctx.localStorage.setItem=()=>{throw Error('Storage denied')};
 a.ctx.resetButton=a.get('reset');
 a.run('rstS(resetButton)');a.run('rstS(resetButton)');
 assert.equal(a.run('S.act!==null'),true);
 assert.equal(a.store.get('sl5x5'),before);
});
