const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const esm=p=>import('../'+p);
test('safe fresh weights without overwriting an existing profile',async()=>{
 const {fresh,loadState}=await esm('src/data/storage.js');
 assert.equal(fresh().w.Squat,20);
 assert.equal(fresh().w.Deadlift,40);
 assert.equal(fresh().setupDone,false);
 const old={w:{Squat:115},inc:{Squat:2.5},h:[],next:'A',act:null};
 const state=loadState({getItem:()=>JSON.stringify(old)});
 assert.equal(state.w.Squat,115);
 assert.equal(state.setupDone,true);
});
test('interrupted sets and skipped exercises are never penalized',async()=>{
 const {fresh}=await esm('src/data/storage.js');
 const {applyStandardProgression}=await esm('src/domain/workout.js');
 const state=fresh();state.fail={Squat:2,Deadlift:2};
 applyStandardProgression(state,{ex:[{n:'Squat',w:20,sets:[5,null,null,null,null]},{n:'Deadlift',w:40,sets:[null]}]});
 assert.equal(state.fail.Squat,2);
 assert.equal(state.fail.Deadlift,2);
 assert.equal(state.w.Squat,20);
 applyStandardProgression(state,{ex:[{n:'Deadlift',w:40,sets:[4]}]});
 assert.equal(state.w.Deadlift,35);
 assert.equal(state.fail.Deadlift,0);
});
test('one successful deadlift work set earns a 5 kg increase',async()=>{
 const {fresh}=await esm('src/data/storage.js');
 const {applyStandardProgression}=await esm('src/domain/workout.js');
 const state=fresh();applyStandardProgression(state,{ex:[{n:'Deadlift',w:40,sets:[5]}]});
 assert.equal(state.w.Deadlift,45);
 const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
 assert.match(app,/n==='Deadlift'\?1:5/);
});
test('estimated 1RM never substitutes next workout target',async()=>{
 const {estimateOneRepMax,completedSets}=await esm('src/domain/metrics.js');
 assert.equal(estimateOneRepMax([], 'Squat'),null);
 const hist=[{ex:[{n:'Squat',w:50,sets:[5,5,null,null,null]}]}];
 assert.equal(estimateOneRepMax(hist,'Squat'),57.5);
 assert.equal(completedSets(hist,'Deadlift').length,0);
});
test('calendar respects scheduled days without mutating state',async()=>{
 const {upcomingWorkouts}=await esm('src/domain/workout.js');
 const {fresh}=await esm('src/data/storage.js');
 const state=fresh();state.days=[1,3,5];const before=JSON.stringify(state);
 const upcoming=upcomingWorkouts(state,new Date(2026,10,8,12));
 assert.deepEqual(upcoming.map(x=>x.d.getDay()),[1,3,5,1]);
 assert.equal(JSON.stringify(state),before);
});
test('replaced PWA logo is the StrongFits fork-and-dumbbell',()=>{
 const icon=fs.readFileSync(path.join(root,'public/icons/strength-5x5.svg'),'utf8');
 assert.match(icon,/StrongFits - fork and dumbbell/);
 assert.match(icon,/00c96e/);
});
