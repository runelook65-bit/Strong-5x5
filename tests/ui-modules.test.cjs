const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.join(__dirname,'..');
const load=name=>import(pathToFileURL(path.join(root,name)).href);
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

test('feature views have independent modules and thin adapters',()=>{
 const app=read('src/app.js');
 for(const name of ['home','history','programs','progress','settings','workout']) assert.ok(app.includes('./features/'+name+'/view.js'),name);
 for(const [oldName,newName] of [['home','renderHome'],['hist','renderHistory'],['stat','renderProgress'],['prog3','renderPrograms'],['sett2','renderSettings']]){
  assert.ok(app.includes('function '+oldName+'(){return '+newName+'('),oldName);
 }
 assert.match(app,/renderWorkoutMarkup\(\{a,ovOpen,M,wtab,S,warm,kg,plates,esc\}\)/);
});

test('home view reads state without mutating it',async()=>{
 const {renderHome}=await load('src/features/home/view.js');
 const S={name:'Tester',next:'B',act:null,w:{Squat:100,Deadlift:70},h:[]};
 const before=JSON.stringify(S);
 const result=renderHome({S,AP:()=>null,homeP:()=>'',greet:()=> 'Merhaba',esc:String,weekDots:()=>'',dstr:()=> 'Bugün',PR:{B:['Squat','Deadlift']},kg:w=>w+'kg',upcoming:()=>[],upCard:()=>''});
 assert.match(result,/Bugünkü Antrenman/);assert.match(result,/Squat/);assert.match(result,/100kg/);
 assert.equal(JSON.stringify(S),before);
});

test('history/progress views are usable without a live app DOM',async()=>{
 const [{renderHistory},{renderProgress}]=await Promise.all([load('src/features/history/view.js'),load('src/features/progress/view.js')]);
 const S={h:[],w:{Squat:100}};
 const history=renderHistory({S,hsub:'Takvim',key:()=> '2026-11-4',M:['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],dstr:()=>'',kg:w=>w+'kg',esc:String});
 assert.match(history,/class="cal"/);
 assert.match(renderProgress({S,W0:{Squat:100},kg:w=>w+'kg'}),/100kg/);
 assert.equal(S.h.length,0);
});

test('workout view generates accessible delegated controls without inline set handlers',async()=>{
 const {renderWorkoutMarkup}=await load('src/features/workout/view.js');
 const result=renderWorkoutMarkup({
  a:{type:'B',date:Date.now(),ex:[{n:'Press "Quoted"',w:60,r:5,sets:[5,null]}],note:''},
  ovOpen:false,M:['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
  wtab:'a',S:{nw:false},warm:()=>'',kg:w=>w+'kg',plates:()=>'',esc:s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
 });
 assert.match(result,/data-ui-action="log-set"/);
 assert.match(result,/data-ui-action="finish-workout"/);
 assert.match(result,/data-ui-note="true"/);
 assert.match(result,/aria-label="Press &quot;Quoted&quot; 1. set:/);
 assert.doesNotMatch(result,/onclick="tap\(/);
});

function harness(){
 const listeners={},calls=[];
 const root={addEventListener:(name,callback)=>{listeners[name]=callback}};
 const names=['navigate','logSet','editExercise','viewWorkout','finishWorkout','closeWorkout','discardWorkout','skipRest','showNote','updateNote'];
 const callbacks=Object.fromEntries(names.map(name=>[name,(...args)=>calls.push([name,...args])]));
 const control=(action,data={})=>({dataset:{uiAction:action,...data}});
 const click=(action,data={})=>listeners.click({target:{closest:()=>control(action,data)}});
 return {root,callbacks,listeners,calls,click,control};
}

test('delegated navigation, set and workout actions keep the original controller callbacks',async()=>{
 const {registerUIActions}=await load('src/features/navigation/events.js');
 const h=harness();registerUIActions(h.root,h.callbacks);
 h.click('navigate',{uiTab:'hist'});
 h.click('log-set',{uiExercise:'2',uiSet:'4'});
 h.click('view-workout',{uiView:'w'});
 h.click('finish-workout');
 assert.deepEqual(h.calls,[['navigate','hist'],['logSet',2,4],['viewWorkout','w'],['finishWorkout']]);
});

test('delegated click handlers reject invalid indices and invalid tab names',async()=>{
 const {registerUIActions}=await load('src/features/navigation/events.js');
 const h=harness();registerUIActions(h.root,h.callbacks);
 h.click('log-set',{uiExercise:'-1',uiSet:'3'});
 h.click('log-set',{uiExercise:'abc',uiSet:'0'});
 h.click('navigate',{uiTab:'unknown'});
 h.click('view-workout',{uiView:'unknown'});
 assert.deepEqual(h.calls,[]);
});

test('keyboard exercise access and note input work through event delegation',async()=>{
 const {registerUIActions}=await load('src/features/navigation/events.js');
 const h=harness();registerUIActions(h.root,h.callbacks);
 let prevented=false;
 const control=h.control('edit-exercise',{uiExercise:'1'});
 h.listeners.keydown({key:'Enter',target:{closest:()=>control},preventDefault(){prevented=true}});
 h.listeners.input({target:{closest:()=>({value:'Setler tamam'})}});
 assert.equal(prevented,true);
 assert.deepEqual(h.calls,[['editExercise',1],['updateNote','Setler tamam']]);
});
