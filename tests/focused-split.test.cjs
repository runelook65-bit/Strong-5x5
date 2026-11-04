const test=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const load=p=>import(pathToFileURL(path.join(__dirname,'..',p)).href);

test('the optional four-day plan covers only chest, back, legs and arms',async()=>{
 const {FOCUSED_SPLIT,FOCUSED_SPLIT_ID}=await load('src/domain/focused-split.js');
 assert.equal(FOCUSED_SPLIT.id,FOCUSED_SPLIT_ID);
 assert.equal(FOCUSED_SPLIT.ws.length,4);
 assert.deepEqual(FOCUSED_SPLIT.ws.map(w=>w.name),['1 · Göğüs','2 · Sırt','3 · Bacak','4 · Kol']);
 for(const w of FOCUSED_SPLIT.ws){
  assert.equal(w.ex[0].s,5);
  assert.equal(w.ex[0].r,5);
  assert.ok(w.ex.slice(1).every(e=>e.s===3&&e.r>=8&&e.r<=12));
  assert.ok(w.ex.every(e=>e.w>=0&&e.inc>=0));
 }
});

test('preset cloning prevents cross-user mutation',async()=>{
 const {makeFocusedSplit,FOCUSED_SPLIT}=await load('src/domain/focused-split.js');
 const a=makeFocusedSplit(),b=makeFocusedSplit();
 a.ws[0].ex[0].w=200;
 assert.equal(b.ws[0].ex[0].w,20);
 assert.equal(FOCUSED_SPLIT.ws[0].ex[0].w,20);
});

test('optional program is accepted by existing backup validation',async()=>{
 const [{makeFocusedSplit},{fresh},{parseBackup}]=await Promise.all([
  load('src/domain/focused-split.js'),load('src/data/storage.js'),load('src/data/validation.js')
 ]);
 const p=makeFocusedSplit();
 const saved=parseBackup(JSON.stringify({...fresh(),pg:[p],ap:p.id,pi:0}));
 assert.equal(saved.pg[0].ws.length,4);
 assert.equal(saved.ap,p.id);
});

test('programs screen advertises the optional split without duplicating an installed plan',async()=>{
 const [{renderPrograms},{makeFocusedSplit,FOCUSED_SPLIT,FOCUSED_SPLIT_ID}]=await Promise.all([
  load('src/features/programs/view.js'),load('src/domain/focused-split.js')
 ]);
 const prog2=()=>'<h1>Programlar</h1><h2>Kişisel Antrenmanlarım</h2>';
 const base={AP:()=>null,prog2,esc:String,FOCUSED_SPLIT,FOCUSED_SPLIT_ID};
 const offered=renderPrograms({...base,S:{pg:[]}});
 assert.match(offered,/Programı Ekle ve Seç/);
 assert.match(offered,/5×5/);
 const installed=renderPrograms({...base,S:{pg:[makeFocusedSplit()],ap:FOCUSED_SPLIT_ID}});
 assert.doesNotMatch(installed,/Programı Ekle ve Seç/);
 assert.match(installed,/4 · Kol/);
});
