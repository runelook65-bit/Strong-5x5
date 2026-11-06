const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const analyze = require('../api/food/analyze.js');

function app(initial = {}) {
  const store = new Map(Object.entries(initial));
  const els = new Map();
  const el = () => ({ classList:{toggle(){},add(){},remove(){}}, style:{setProperty(){}}, dataset:{}, children:[],
    setAttribute(){}, appendChild(){}, remove(){}, focus(){}, select(){}, querySelector(){return null}, querySelectorAll(){return []},
    textContent:'', innerHTML:'', value:'', firstChild:{innerHTML:''} });
  const get = id => { if (!els.has(id)) els.set(id, el()); return els.get(id); };
  const ctx = { console, Date, Math, JSON, Map, Set, String, Number, Array, Object, RegExp, Error, Promise, URL,
    localStorage:{ getItem:k=>store.get(k)??null, setItem:(k,v)=>store.set(k,v), removeItem:k=>store.delete(k) },
    document:{ documentElement:{style:{setProperty(){}},dataset:{}}, body:{classList:{toggle(){}},appendChild(){}},
      getElementById:get, querySelectorAll:()=>[], addEventListener(){}, createElement:el },
    navigator:{}, addEventListener(){}, MutationObserver:class{observe(){}},
    setInterval:()=>1, clearInterval(){}, setTimeout:()=>1, clearTimeout(){}, performance:{now:()=>0},
    requestAnimationFrame(){}, scrollTo(){}, location:{reload(){}} };
  ctx.window = ctx;
  vm.createContext(ctx);
  new vm.Script(source).runInContext(ctx);
  return { ctx, get, store, run:c=>vm.runInContext(c, ctx), food:()=>JSON.parse(store.get('sl5x5_food')||'null') };
}

const meal = { is_food:true, name:'Mercimek çorbası', confidence:'yüksek', note:'',
  items:[{name:'Mercimek çorbası',grams:300,kcal:180,protein:9,carbs:27,fat:4},{name:'Ekmek',grams:50,kcal:130,protein:4,carbs:25,fat:1}] };

test('six tabs including Beslenme are mounted',()=>{
  const a=app();
  assert.match(a.get('nav').innerHTML,/Beslenme/);
  assert.match(a.get('nav').innerHTML,/Ayarlar/);
  assert.match(html,/width:calc\(\(100% - 12px\)\/6\)/);
});

test('nutrition screen renders default goal and empty state',()=>{
  const a=app();
  a.run("goT('food')");
  const h=a.get('app').innerHTML;
  assert.match(h,/Beslenme/);
  assert.match(h,/2\.200/);
  assert.match(h,/Fotoğraf Çek/);
  assert.match(h,/Henüz öğün eklemedin/);
});

test('analysed meal is saved in its own key with portion multiplier',()=>{
  const a=app({sl5x5:JSON.stringify({h:[],w:{},inc:{}})});
  a.run(`fp={img:'data:image/jpeg;base64,AAAA',th:'data:image/jpeg;base64,BB',m:1.5,res:${JSON.stringify(meal)}};fadd()`);
  const f=a.food(), day=Object.values(f.d)[0];
  assert.equal(day.length,1);
  assert.equal(day[0].name,'Mercimek çorbası');
  assert.equal(day[0].m,1.5);
  const t=a.run(`fday(key(new Date()))`);
  assert.equal(t.kcal,(180+130)*1.5);
  assert.equal(t.p,(9+4)*1.5);
  assert.equal(JSON.parse(a.store.get('sl5x5')).food,undefined,'workout state untouched');
  a.run("tab='food';draw()");
  assert.match(a.get('app').innerHTML,/465/);
});

test('manual entry, portion change and delete',()=>{
  const a=app();
  a.get('mn').value='Muz'; a.get('mk').value='105'; a.get('mp').value='1'; a.get('mc').value='27'; a.get('mf').value='0';
  a.run('fmsave(0)');
  const id=Object.values(a.food().d)[0][0].id;
  a.run(`fsrv('${id}',.5)`);
  assert.equal(a.run(`fday(key(new Date())).kcal`),157.5);
  const b={dataset:{},textContent:''};
  a.ctx.btn=b; a.run(`fdel('${id}',btn)`); a.run(`fdel('${id}',btn)`);
  assert.deepEqual(a.food().d,{});
});

test('manual entry requires a name and calories',()=>{
  const a=app();
  a.get('mn').value=''; a.get('mk').value='200';
  a.run('fmsave(0)');
  assert.equal(a.food(),null);
});

test('goal suggestion uses body weight',()=>{
  const a=app({sl5x5:JSON.stringify({bw:80,h:[]})});
  a.run('fauto();fgsave()');
  const g=a.food().g;
  assert.equal(g.kcal,2640); assert.equal(g.p,144); assert.equal(g.f,73);
  assert.ok(Math.abs(g.p*4+g.c*4+g.f*9-g.kcal)<10);
});

test('meal names from the model are escaped in the list',()=>{
  const a=app();
  a.run(`fput({id:'x',t:Date.now(),name:'<img src=x onerror=alert(1)>',items:[],m:1})`);
  a.run("tab='food';draw()");
  assert.ok(!a.get('app').innerHTML.includes('<img src=x'));
});

test('corrupt nutrition storage falls back to defaults',()=>{
  const a=app({sl5x5_food:'{bozuk'});
  a.run("tab='food';draw()");
  assert.match(a.get('app').innerHTML,/2\.200/);
});

// ---- API ----
function res(){ const r={code:0,body:null,headers:{}}; r.status=c=>{r.code=c;return r}; r.json=b=>{r.body=b;return r}; r.setHeader=(k,v)=>{r.headers[k]=v}; return r; }
const req=(body,extra={})=>({method:'POST',headers:{host:'arm-5x5.vercel.app',origin:'https://arm-5x5.vercel.app',...extra},body});

test('API rejects missing key, bad method, foreign origin and bad image',async()=>{
  delete process.env.ANTHROPIC_API_KEY;
  let r=res(); await analyze(req({image:'AAAA'}),r); assert.equal(r.code,503);
  process.env.ANTHROPIC_API_KEY='test';
  r=res(); await analyze({method:'GET',headers:{}},r); assert.equal(r.code,405);
  r=res(); await analyze(req({image:'AAAA'},{origin:'https://evil.example'}),r); assert.equal(r.code,403);
  r=res(); await analyze(req({image:'not base64!'}),r); assert.equal(r.code,400);
});

test('API forwards image to Claude and cleans the tool output',async()=>{
  process.env.ANTHROPIC_API_KEY='test';
  let sent;
  global.fetch=async(url,opt)=>{ sent={url,body:JSON.parse(opt.body),headers:opt.headers};
    return {ok:true,status:200,json:async()=>({content:[{type:'tool_use',name:'report_meal',input:{...meal,items:[{...meal.items[0],kcal:'180.6'}]}}]})}; };
  const r=res(); await analyze(req({image:'AAAA',mediaType:'image/jpeg',hint:'yağsız'}),r);
  assert.equal(r.code,200);
  assert.equal(r.body.items[0].kcal,181);
  assert.equal(sent.url,'https://api.anthropic.com/v1/messages');
  assert.equal(sent.headers['x-api-key'],'test');
  assert.equal(sent.body.tool_choice.name,'report_meal');
  assert.equal(sent.body.messages[0].content[0].source.data,'AAAA');
  assert.match(sent.body.messages[0].content[1].text,/yağsız/);
});

test('API maps upstream rate limit to busy',async()=>{
  process.env.ANTHROPIC_API_KEY='test';
  global.fetch=async()=>({ok:false,status:429,json:async()=>({})});
  const r=res(); await analyze(req({image:'AAAA'}),r);
  assert.equal(r.code,429); assert.equal(r.body.error,'busy');
});

test('clean() marks empty results as not food',()=>{
  assert.equal(analyze.clean({is_food:true,items:[]}).is_food,false);
});
