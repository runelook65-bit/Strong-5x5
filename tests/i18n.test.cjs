const test=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const load=file=>import(pathToFileURL(path.join(__dirname,'..',file)).href);

test('English is default for new and existing profiles without locale',async()=>{
 const [{fresh,loadState},{languageOf,LANGUAGES}]=await Promise.all([load('src/data/storage.js'),load('src/i18n/index.js')]);
 assert.equal(fresh().lang,'en');
 assert.deepEqual(Object.keys(LANGUAGES),['en','es','tr']);
 assert.equal(languageOf(undefined),'en');
 const data={...fresh()};delete data.lang;
 const state=loadState({getItem:()=>JSON.stringify(data)});
 assert.equal(state.lang,'en');
});

test('English and Spanish translate navigation, the home CTA, and common controls',async()=>{
 const {translateText}=await load('src/i18n/index.js');
 assert.equal(translateText('Ana Sayfa','en'),'Home');
 assert.equal(translateText('Bugünkü Antrenman','en'),"Today's Workout");
 assert.equal(translateText('Antrenmanı Başlat','es'),'Iniciar entrenamiento');
 assert.equal(translateText('Dil','es'),'Idioma');
 assert.equal(translateText('Antrenman A','es'),'Entrenamiento A');
 assert.equal(translateText('Günaydın, Alex','es'),'Buenos días, Alex');
 assert.equal(translateText('Ayarlar','tr'),'Ayarlar');
 assert.equal(translateText('Squat','es'),'Squat');
});

test('live locale switching restores original translation source rather than stacking translations',async()=>{
 const {localizeTree}=await load('src/i18n/index.js');
 const node={nodeType:3,nodeValue:'Ana Sayfa',parentElement:null};
 localizeTree(node,'en');assert.equal(node.nodeValue,'Home');
 localizeTree(node,'es');assert.equal(node.nodeValue,'Inicio');
 localizeTree(node,'tr');assert.equal(node.nodeValue,'Ana Sayfa');
 localizeTree(node,'en');assert.equal(node.nodeValue,'Home');
});

test('locale formatting covers months, Monday-first calendar and full exercise instructions',async()=>{
 const [{weekdayInitials,monthNames,exerciseInstructions},{displayDate}]=await Promise.all([load('src/i18n/index.js'),load('src/lib/format.js')]);
 assert.deepEqual(weekdayInitials('en'),['M','T','W','T','F','S','S']);
 assert.deepEqual(weekdayInitials('es'),['L','M','X','J','V','S','D']);
 assert.equal(monthNames('en')[10],'November');
 assert.equal(monthNames('es')[10],'noviembre');
 assert.match(displayDate(new Date(2026,10,5),'en'),/November/);
 assert.match(displayDate(new Date(2026,10,5),'es'),/noviembre/);
 assert.match(exerciseInstructions('Squat','en',[])[0],/bar/);
 assert.match(exerciseInstructions('Squat','es',[])[0],/barra/);
});

test('invalid locale cannot replace a valid backup and legacy backup remains accepted',async()=>{
 const [{parseBackup},{fresh}]=await Promise.all([load('src/data/validation.js'),load('src/data/storage.js')]);
 const state=fresh();
 assert.equal(parseBackup(JSON.stringify(state)).lang,'en');
 assert.throws(()=>parseBackup(JSON.stringify({...state,lang:'untrusted'})),/dil/);
 const legacy={...state};delete legacy.lang;
 assert.doesNotThrow(()=>parseBackup(JSON.stringify(legacy)));
});

test('user-authored notes bypass automated text translation',async()=>{
 const {localizeTree}=await load('src/i18n/index.js');
 const parent={closest:()=>({dataset:{i18nIgnore:true}})};
 const node={nodeType:3,nodeValue:'Ana Sayfa',parentElement:parent};
 localizeTree(node,'es');
 assert.equal(node.nodeValue,'Ana Sayfa');
});
