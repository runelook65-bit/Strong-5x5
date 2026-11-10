const test = require('node:test');
const assert = require('node:assert/strict');

const nutrition = import('../src/features/food/portion.js');

test('correction of estimated grams rescales each nutrient consistently', async () => {
  const {rescaleFoodItem} = await nutrition;
  const original = {name:'Rice',grams:150,kcal:195,protein:4,carbs:42,fat:0.5};
  assert.deepEqual(rescaleFoodItem(original,300),{name:'Rice',grams:300,kcal:390,protein:8,carbs:84,fat:1});
  assert.equal(original.grams,150);
});

test('invalid quantities do not replace food estimates', async () => {
  const {rescaleFoodItem} = await nutrition;
  const item = {grams:100,kcal:130};
  for (const n of [0,-1,3001,'bad',Infinity]) assert.equal(rescaleFoodItem(item,n),null);
  assert.equal(rescaleFoodItem({grams:0,kcal:130},100),null);
});

test('meal totals include all components and saved portion multipliers', async () => {
  const {mealTotals} = await nutrition;
  assert.deepEqual(mealTotals({m:1.5,items:[
    {kcal:100,protein:10,carbs:12,fat:1},
    {kcal:200,protein:20,carbs:24,fat:2}
  ]}),{kcal:450,p:45,c:54,f:4.5});
});

test('missing and malformed meals do not create NaN in dashboard', async () => {
  const {mealTotals} = await nutrition;
  assert.deepEqual(mealTotals({items:[]}),{kcal:0,p:0,c:0,f:0});
  assert.deepEqual(mealTotals({m:Infinity,items:[{kcal:'bad',protein:-10,carbs:10,fat:2}]}),{kcal:0,p:0,c:10,f:2});
});

test('manual edits preserve source meal and reject out-of-range calories or macros', async () => {
 const {correctFoodItem} = await nutrition;
 const source={name:'Rice',grams:120,kcal:155,protein:3,carbs:34,fat:0.3};
 const next=correctFoodItem(source,{name:' Rice, cooked ',grams:'180',kcal:'233',protein:'5',carbs:'50',fat:'0.5'});
 assert.deepEqual(next,{name:'Rice, cooked',grams:180,kcal:233,protein:5,carbs:50,fat:0.5});
 assert.equal(source.grams,120);
 assert.equal(correctFoodItem(source,{...source,kcal:'-1'}),null);
 assert.equal(correctFoodItem(source,{...source,protein:'Infinity'}),null);
 assert.equal(correctFoodItem(source,{...source,fat:''}),null);
 assert.equal(correctFoodItem(source,{...source,kcal:'11000'}),null);
});

test('macro energy mismatch flags questionable scans but does not rewrite AI values', async () => {
 const {calorieConsistency} = await nutrition;
 assert.deepEqual(calorieConsistency({items:[{kcal:200,protein:10,carbs:20,fat:9}]}),{needsReview:false,calculatedKcal:201});
 assert.deepEqual(calorieConsistency({items:[{kcal:200,protein:1,carbs:1,fat:1}]}),{needsReview:true,calculatedKcal:17});
 assert.deepEqual(calorieConsistency({items:[]}),{needsReview:false,calculatedKcal:0});
});
