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
