const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname,'..');
const analyzePromise = import('../api/food/analyze.js');
const foodPromise = import('../src/features/food/controller.js');
const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
const nav=fs.readFileSync(path.join(root,'src/features/navigation/events.js'),'utf8');
const styles=fs.readFileSync(path.join(root,'src/styles/effects.css'),'utf8');
const reg=()=>{
 const store=new Map(), oldWindow=global.window,oldStorage=global.localStorage;
 global.window={};global.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
 const fields={};const el=id=>fields[id]||={value:'',remove(){}};
 const ctx={getState:()=>({bw:80,lang:'en'}),draw:()=>{},sh:()=>{},toast:()=>{},snd:()=>{},esc:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),key:d=>{d=new Date(d);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()},sv:()=>'<svg></svg>',D:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],M:[], $:el,languageOf:l=>l||'en',monthNames:()=>Array(12).fill('November')};
 return {store,fields,ctx,restore(){global.window=oldWindow;global.localStorage=oldStorage}};
};
test('nutrition navigation and six-position indicator are wired',()=>{
 assert.match(app,/\['food','🍎','Beslenme'\]/);
 assert.match(app,/home,food,prog:prog3/);
 assert.match(nav,/\['home', 'food', 'prog'/);
 assert.match(styles,/width:calc\(\(100% - 12px\)\/6\)/);
});
test('food module renders English-number formatting and stores food independently',async()=>{
 const e=reg();try{
   const {createFoodFeature}=await foodPromise;
   const f=createFoodFeature(e.ctx);
   assert.match(f.food(),/Beslenme/);
   assert.match(f.food(),/2,200/);
   f.fput({id:'x',t:Date.now(),name:'<img src=x onerror=alert(1)>',items:[{name:'meal',grams:100,kcal:180,protein:10,carbs:20,fat:5}],m:1.5});
   assert.equal(f.fday(e.ctx.key(new Date())).kcal,270);
   assert.doesNotMatch(f.food(),/<img src=x onerror=alert\(1\)>/);
   assert.ok(e.store.has('sl5x5_food'));
   assert.ok(!e.store.has('sl5x5'));
 }finally{e.restore()}
});
test('manual meal, goal and portion change survive separate local storage',async()=>{
 const e=reg();try{
 const {createFoodFeature}=await foodPromise;const f=createFoodFeature(e.ctx);
 const data={mn:'Banana',mk:'105',mp:'1',mc:'27',mf:'0'};for(const [id,value] of Object.entries(data))e.fields[id]={value};
 f.fmsave(0);assert.equal(f.fday(e.ctx.key(new Date())).kcal,105);
 const id=JSON.parse(e.store.get('sl5x5_food')).d[e.ctx.key(new Date())][0].id;
 f.fsrv(id,.5);assert.equal(f.fday(e.ctx.key(new Date())).kcal,157.5);
 }finally{e.restore()}
});
function res(){const r={code:0,body:null,headers:{}};r.status=c=>{r.code=c;return r};r.json=b=>{r.body=b;return r};r.setHeader=(k,v)=>{r.headers[k]=v};return r}
const req=(body,extra={})=>({method:'POST',headers:{host:'arm-5x5.vercel.app',origin:'https://arm-5x5.vercel.app',...extra},body});
test('API requires OpenRouter key, correct origin, and valid image',async()=>{
 const {default:analyze}=await analyzePromise;
 const old=process.env.OPENROUTER_API_KEY;
 try{
  delete process.env.OPENROUTER_API_KEY;
  let r=res();await analyze(req({image:'AAAA'}),r);assert.equal(r.code,503);
  process.env.OPENROUTER_API_KEY='test';
  r=res();await analyze({method:'GET',headers:{}},r);assert.equal(r.code,405);
  r=res();await analyze(req({image:'AAAA'},{origin:'https://evil.example'}),r);assert.equal(r.code,403);
  r=res();await analyze(req({image:'AAAA'},{origin:undefined}),r);assert.equal(r.code,403);
  r=res();await analyze(req({image:'not base64!'}),r);assert.equal(r.code,400);
 }finally{if(old===undefined)delete process.env.OPENROUTER_API_KEY;else process.env.OPENROUTER_API_KEY=old}
});
test('API sends image to OpenRouter free vision model and cleans JSON result',async()=>{
 const {default:analyze}=await analyzePromise;
 const previousFetch=global.fetch,old=process.env.OPENROUTER_API_KEY;
 process.env.OPENROUTER_API_KEY='test';
 let call;
 try{
  global.fetch=async(url,options)=>{
   call={url,options};
   return {ok:true,status:200,json:async()=>({choices:[{message:{content:JSON.stringify({
     is_food:true,name:'Soup',confidence:'yüksek',
     items:[{name:'Soup',grams:200,kcal:'180.6',protein:8,carbs:15,fat:6}]
   })}}]})};
  };
  let r=res();await analyze(req({image:'AAAA',mediaType:'image/jpeg'}),r);
  assert.equal(r.code,200);assert.equal(r.body.items[0].kcal,181);
  assert.equal(call.url,'https://openrouter.ai/api/v1/chat/completions');
  assert.equal(call.options.headers.authorization,'Bearer test');
  const sent=JSON.parse(call.options.body);
  assert.equal(sent.model,'google/gemma-4-26b-a4b-it:free');
  assert.equal(sent.response_format.type,'json_object');
  assert.equal(sent.messages[1].content[1].image_url.url,'data:image/jpeg;base64,AAAA');
 }finally{global.fetch=previousFetch;if(old===undefined)delete process.env.OPENROUTER_API_KEY;else process.env.OPENROUTER_API_KEY=old}
});
test('API maps OpenRouter errors and malformed JSON without exposing details',async()=>{
 const {default:analyze}=await analyzePromise;
 const previousFetch=global.fetch,old=process.env.OPENROUTER_API_KEY;
 process.env.OPENROUTER_API_KEY='test';
 try{
  global.fetch=async()=>({ok:false,status:429});
  let r=res();await analyze(req({image:'AAAA'}),r);
  assert.equal(r.code,429);assert.equal(r.body.error,'busy');
  global.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content:'not json'}}]})});
  r=res();await analyze(req({image:'AAAA'}),r);
  assert.equal(r.code,502);assert.equal(r.body.error,'parse');
 }finally{global.fetch=previousFetch;if(old===undefined)delete process.env.OPENROUTER_API_KEY;else process.env.OPENROUTER_API_KEY=old}
});
