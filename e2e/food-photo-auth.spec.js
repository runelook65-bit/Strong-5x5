import {test,expect} from '@playwright/test';
// Playwright routing cannot reliably intercept requests controlled by a PWA Service Worker.
test.use({serviceWorkers:'block'});

const PNG=Buffer.from(
 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/mqUAAAAASUVORK5CYII=','base64'
);
const uploadMeal=async page=>{
 await page.locator('#nav button[data-ui-tab="food"]').click();
 const chooserPromise=page.waitForEvent('filechooser');
 await page.locator('button[onclick="fpick(0)"]').click();
 const chooser=await chooserPromise;
 await chooser.setFiles({name:'meal.png',mimeType:'image/png',buffer:PNG});
};
test('photo AI disabled without credentials leaves manual nutrition available',async({page})=>{
 await page.route('**/api/food/config',route=>route.fulfill({
  status:200,contentType:'application/json',body:JSON.stringify({enabled:false,clientId:null,dailyLimit:0})
 }));
 await page.goto('/');
 const original=await page.evaluate(()=>localStorage.getItem('sl5x5'));
 await uploadMeal(page);
 await expect(page.getByText('AI photo analysis unavailable')).toBeVisible();
 await page.locator('#sh button[onclick="fman(1)"]').click();
 await expect(page.locator('#mn')).toBeVisible();
 await page.locator('#mn').fill('Manual Meal');
 await page.locator('#mk').fill('250');
 await page.locator('#mp').fill('20');
 await page.locator('#mc').fill('25');
 await page.locator('#mf').fill('10');
 await page.locator('#sh button[onclick^="fmsave("]').click();
 await expect(page.locator('#app')).toContainText('Manual Meal');
 expect(await page.evaluate(()=>localStorage.getItem('sl5x5'))).toBe(original);
 const food=await page.evaluate(()=>JSON.parse(localStorage.getItem('sl5x5_food')));
 expect(Object.values(food.d).flat()[0].items[0].kcal).toBe(250);
});

test('Google browser identity is sent only to analysis API and never stored',async({page})=>{
 const payload=Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600})).toString('base64url');
 const fakeCredential='abc.'+payload+'.signature-for-test-only';
 const fakeGoogle=[
 'window.google={accounts:{id:{',
 'initialize(options){window.__strongfitsGoogleCallback=options.callback;},',
 'renderButton(target){',
 'const button=document.createElement("button");',
 'button.type="button";button.textContent="Test Google sign-in";',
 'button.addEventListener("click",()=>window.__strongfitsGoogleCallback({credential:'+JSON.stringify(fakeCredential)+'}));',
 'target.append(button);',
 '}}}};'
 ].join('');
 await page.route('**/api/food/config',route=>route.fulfill({
  status:200,contentType:'application/json',body:JSON.stringify({
   enabled:true,provider:'google',clientId:'test-client.apps.googleusercontent.com',dailyLimit:12
  })
 }));
 await page.route('https://accounts.google.com/gsi/client',route=>route.fulfill({
  status:200,contentType:'application/javascript',body:fakeGoogle
 }));
 let bearerSeen='',apiCalls=0;
 await page.route('**/api/food/analyze',route=>{
  apiCalls++;
  bearerSeen=route.request().headers().authorization||'';
  if(apiCalls===1)return route.fulfill({
   status:401,contentType:'application/json',body:JSON.stringify({error:'auth'})
  });
  return route.fulfill({
   status:200,contentType:'application/json',
   body:JSON.stringify({
    is_food:true,name:'Test Apple',items:[{
     name:'Apple',grams:150,kcal:80,protein:0,carbs:21,fat:0
    }],confidence:'orta',note:'Estimated from photo'
   })
  });
 });
 await page.goto('/');
 const workouts=await page.evaluate(()=>localStorage.getItem('sl5x5'));
 await uploadMeal(page);
 await expect(page.getByText('Sign in to analyze food')).toBeVisible();
 await page.getByRole('button',{name:'Test Google sign-in'}).click();
 await expect(page.locator('#sh button[onclick="fana()"]')).toBeVisible();
 await page.locator('#sh button[onclick="fana()"]').click();
 // A rejected credential must be cleared; the retry MUST ask for Google sign-in again.
 await expect(page.getByText('Sign in to analyze food')).toBeVisible();
 await page.getByRole('button',{name:'Test Google sign-in'}).click();
 await expect(page.locator('#fnm')).toHaveValue('Test Apple');
 expect(apiCalls).toBe(2);
 expect(bearerSeen).toBe('Bearer '+fakeCredential);
 expect(await page.evaluate(()=>localStorage.getItem('sl5x5'))).toBe(workouts);
 expect(await page.evaluate(()=>localStorage.getItem('strongfits_token'))).toBeNull();
 await page.locator('#sh button[onclick="fadd()"]').click();
 const food=await page.evaluate(()=>JSON.parse(localStorage.getItem('sl5x5_food')));
 expect(Object.values(food.d).flat()[0].name).toBe('Test Apple');
 expect(JSON.stringify(food)).not.toContain(fakeCredential);
 expect(await page.evaluate(()=>localStorage.getItem('sl5x5'))).toBe(workouts);
});


const signedCredential=()=>{
 const payload=Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600})).toString('base64url');
 return 'abc.'+payload+'.mock-signature';
};
async function mockGoogleAuth(page,credential=signedCredential()){
 await page.addInitScript(value=>{
  window.google={accounts:{id:{
   initialize({callback}){window.__strongfitsMockCallback=callback;},
   renderButton(target){
    const button=document.createElement('button');
    button.type='button';button.textContent='Mock Google sign-in';
    button.addEventListener('click',()=>window.__strongfitsMockCallback({credential:value}));
    target.append(button);
   }
  }}};
 },credential);
 await page.route('**/api/food/config',route=>route.fulfill({
  status:200,contentType:'application/json',
  body:JSON.stringify({enabled:true,clientId:'test-client.apps.googleusercontent.com',dailyLimit:12})
 }));
 return credential;
}

test('a Google callback after dismissing the photo sheet never uploads the photo',async({page})=>{
 const credential=await mockGoogleAuth(page);
 let analyzeCalls=0;
 await page.route('**/api/food/analyze',route=>{
  analyzeCalls++;
  return route.fulfill({status:401,contentType:'application/json',body:JSON.stringify({error:'auth'})});
 });
 await page.goto('/');
 await uploadMeal(page);
 await expect(page.getByText('Sign in to analyze food')).toBeVisible();
 await page.locator('#sh button[onclick="closeSh()"]').click();
 await expect(page.locator('#sh')).toHaveCount(0);
 await page.evaluate(value=>window.__strongfitsMockCallback({credential:value}),credential);
 await page.waitForTimeout(100);
 expect(analyzeCalls).toBe(0);
 await expect(page.locator('#sh')).toHaveCount(0);
});

test('a late photo-analysis response cannot reopen a dismissed overlay',async({page})=>{
 await mockGoogleAuth(page);
 let started,release;
 const began=new Promise(resolve=>{started=resolve});
 const gate=new Promise(resolve=>{release=resolve});
 await page.route('**/api/food/analyze',async route=>{
  started();
  await gate;
  await route.fulfill({
   status:200,contentType:'application/json',
   body:JSON.stringify({
    is_food:true,name:'Delayed Meal',confidence:'orta',
    items:[{name:'Soup',grams:200,kcal:160,protein:10,carbs:15,fat:5}]
   })
  }).catch(()=>{});
 });
 await page.goto('/');
 const before=await page.evaluate(()=>localStorage.getItem('sl5x5_food'));
 await uploadMeal(page);
 await page.getByRole('button',{name:'Mock Google sign-in'}).click();
 await began;
 await expect(page.locator('#sh .fload')).toBeVisible();
 await page.locator('#sh button[onclick="closeSh()"]').click();
 release();
 await expect(page.locator('#sh')).toHaveCount(0);
 await page.waitForTimeout(250);
 await expect(page.locator('#sh')).toHaveCount(0);
 expect(await page.evaluate(()=>localStorage.getItem('sl5x5_food'))).toBe(before);
});
