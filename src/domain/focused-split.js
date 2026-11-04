// Opt-in four-day strength split. The classic A/B 5×5 plan remains untouched.
// Weights are intentionally conservative placeholders to personalize before use.
export const FOCUSED_SPLIT_ID='builtin-upper-lower-4day-v1';
export const FOCUSED_SPLIT={
 id:FOCUSED_SPLIT_ID,
 name:'Kol · Bacak · Göğüs · Sırt',
 split:'4 Gün · Bölgesel',
 ws:[
  {id:'builtin-chest-v1',name:'1 · Göğüs',ex:[
   {n:'Bench Press',s:5,r:5,w:20,inc:2.5},
   {n:'Incline Dumbbell Press',s:3,r:8,w:0,inc:1},
   {n:'Push-up',s:3,r:10,w:0,inc:0}
  ]},
  {id:'builtin-back-v1',name:'2 · Sırt',ex:[
   {n:'Barbell Row',s:5,r:5,w:20,inc:2.5},
   {n:'Lat Pulldown',s:3,r:10,w:0,inc:2.5},
   {n:'Seated Cable Row',s:3,r:10,w:0,inc:2.5}
  ]},
  {id:'builtin-legs-v1',name:'3 · Bacak',ex:[
   {n:'Squat',s:5,r:5,w:20,inc:2.5},
   {n:'Romanian Deadlift',s:3,r:8,w:20,inc:2.5},
   {n:'Standing Calf Raise',s:3,r:12,w:0,inc:2.5}
  ]},
  {id:'builtin-arms-v1',name:'4 · Kol',ex:[
   {n:'Close-Grip Bench Press',s:5,r:5,w:20,inc:2.5},
   {n:'Dumbbell Biceps Curl',s:3,r:10,w:0,inc:1},
   {n:'Triceps Pushdown',s:3,r:10,w:0,inc:2.5}
  ]}
 ]
};
export function makeFocusedSplit(){return JSON.parse(JSON.stringify(FOCUSED_SPLIT));}
