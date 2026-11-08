import {test,expect} from '@playwright/test';

test('main navigation loads five real screens without a runtime fallback',async({page})=>{
  await page.goto('/');
  await expect(page.getByText("Today's Workout")).toBeVisible();
  const pages=[
    ['prog','Programs'],
    ['hist','History'],
    ['stat','Progress'],
    ['set','Settings'],
    ['home',"Today's Workout"]
  ];
  for(const [tab,title] of pages){
    await page.locator('#nav button[data-ui-tab="'+tab+'"]').click();
    expect(await page.evaluate(()=>window.innerWidth)).toBe(page.viewportSize().width);
    await expect(page.getByText(title,{exact:true}).first()).toBeVisible();
    await expect(page.locator('#app')).not.toContainText('Something went wrong');
  }
});

test('the first recorded set is persisted and survives a page refresh',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Start Workout'}).click();
  const first=page.locator('[data-ui-action="log-set"]').first();
  await expect(first).toBeVisible();
  await expect(first).toHaveAttribute('aria-label',/Set 1:/);
  await first.click();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sl5x5')).act.ex[0].sets[0])).toBe(5);
  await page.reload();
  await expect(page.getByText("Today's Workout")).toBeVisible();
  await page.getByRole('button',{name:'Resume Workout'}).click();
  await expect(page.locator('[data-ui-action="log-set"]').first()).toBeVisible();
  const recorded=await page.evaluate(()=>JSON.parse(localStorage.getItem('sl5x5')).act.ex[0].sets[0]);
  expect(recorded).toBe(5);
});

test('finishing a partially recorded session creates exactly one history entry',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Start Workout'}).click();
  await page.locator('[data-ui-action="log-set"]').first().click();
  await page.locator('[data-ui-action="finish-workout"]').click();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sl5x5')).h.length)).toBe(1);
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('sl5x5')));
  expect(state.act).toBeNull();
  expect(state.next).toBe('A');
  await page.locator('#nav button[data-ui-tab="hist"]').click();
  await page.getByRole('button',{name:'List'}).click();
  await expect(page.locator('#app')).toContainText('Squat');
});

test('damaged local data is left intact and recovery actions are displayed',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('sl5x5','{damaged'));
  await page.goto('/');
  await expect(page.getByText('Data Recovery')).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('sl5x5'))).toBe('{damaged');
  await page.getByRole('button',{name:'View Raw Data'}).click();
  await expect(page.locator('#recoveryBackup')).toHaveValue('{damaged');
  expect(await page.evaluate(()=>localStorage.getItem('sl5x5'))).toBe('{damaged');
});

test('navigation and workout controls fit the simulated mobile viewport',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#nav button[data-ui-tab="home"]')).toBeVisible();
  await page.getByRole('button',{name:'Start Workout'}).click();
  await expect(page.locator('[data-ui-action="log-set"]').first()).toBeVisible();
  const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(width.scroll).toBeLessThanOrEqual(width.client+3);
});


test('chest A/B selection persists and classic 5x5 remains',async({page})=>{await page.goto('/');await page.locator('#nav button[data-ui-tab="prog"]').click();await expect(page.locator('[data-ui-action="activate-focused-program"]')).toHaveCount(4);await page.locator('[data-program-id="focus-chest-ab"]').click();const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('sl5x5')));expect(s.ap).toBe('focus-chest-ab');expect(s.pg[0].ws).toHaveLength(2);await page.reload();await expect(page.locator('#app')).toContainText('Workout A');await page.locator('#nav button[data-ui-tab="prog"]').click();await page.locator('.pgc').filter({hasText:'StrongFits 5×5'}).click();expect((await page.evaluate(()=>JSON.parse(localStorage.getItem('sl5x5')))).ap).toBeUndefined();});


test('English opens Home by default, including with an unfinished workout',async({page})=>{
  await page.goto('/');
  await expect(page.getByText("Today's Workout")).toBeVisible();
  expect(await page.locator('html').getAttribute('lang')).toBe('en');
  await page.getByRole('button',{name:'Start Workout'}).click();
  await page.locator('[data-ui-action="log-set"]').first().click();
  await page.reload();
  await expect(page.getByText("Today's Workout")).toBeVisible();
  await expect(page.getByRole('button',{name:'Resume Workout'})).toBeVisible();
  expect(await page.locator('#ovl').innerHTML()).toBe('');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('sl5x5')).act.ex[0].sets[0])).toBe(5);
});

test('Spanish choice persists and translates navigation, settings and workout Home',async({page})=>{
  await page.goto('/');
  await page.locator('#nav button[data-ui-tab="set"]').click();
  await page.getByText('Language',{exact:true}).click();
  await expect(page.getByRole('button',{name:'English'})).toHaveClass(/on/);
  await page.getByRole('button',{name:'Español'}).click();
  await expect(page.getByText('Ajustes',{exact:true}).first()).toBeVisible();
  await expect(page.getByText('Idioma',{exact:true}).first()).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('sl5x5')).lang)).toBe('es');
  expect(await page.locator('html').getAttribute('lang')).toBe('es');
  await page.locator('#nav button[data-ui-tab="home"]').click();
  await expect(page.getByText('Entrenamiento de hoy')).toBeVisible();
  await expect(page.getByRole('button',{name:'Iniciar entrenamiento'})).toBeVisible();
  await page.reload();
  await expect(page.getByText('Entrenamiento de hoy')).toBeVisible();
  await page.locator('#nav button[data-ui-tab="set"]').click();
  await page.getByText('Idioma',{exact:true}).click();
  await page.getByRole('button',{name:'English'}).click();
  await page.locator('#nav button[data-ui-tab="home"]').click();
  await expect(page.getByText("Today's Workout")).toBeVisible();
  expect(await page.locator('html').getAttribute('lang')).toBe('en');
});


test('nutrition tab logs a manual meal and preserves workout state on refresh',async({page})=>{
  await page.goto('/');
  const workoutBefore=await page.evaluate(()=>localStorage.getItem('sl5x5'));
  await page.locator('#nav button[data-ui-tab="food"]').click();
  await expect(page.getByRole('heading',{name:'Nutrition'})).toBeVisible();
  await expect(page.locator('#app')).toContainText('2,200');
  await page.getByRole('button',{name:'Add manually'}).click();
  await page.locator('#mn').fill('Banana');
  await page.locator('#mk').fill('105');
  await page.locator('#mp').fill('1');
  await page.locator('#mc').fill('27');
  await page.locator('#mf').fill('0');
  await page.getByRole('button',{name:'Save',exact:true}).click();
  await expect(page.locator('#app')).toContainText('Banana');
  const food=await page.evaluate(()=>JSON.parse(localStorage.getItem('sl5x5_food')));
  expect(Object.values(food.d).flat()).toHaveLength(1);
  expect(Object.values(food.d).flat()[0].items[0].kcal).toBe(105);
  expect(await page.evaluate(()=>localStorage.getItem('sl5x5'))).toBe(workoutBefore);
  await page.reload();
  await page.locator('#nav button[data-ui-tab="food"]').click();
  await expect(page.locator('#app')).toContainText('Banana');
});

test('StrongFits brand appears on Home and in installed-app metadata',async({page})=>{
  await page.goto('/');
  await expect(page).toHaveTitle('StrongFits');
  await expect(page.locator('#app h1').first()).toHaveText('StrongFits');
  const manifestUrl=await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifestUrl).toBeTruthy();
  const manifest=await (await page.request.get(new URL(manifestUrl,page.url()).toString())).json();
  expect(manifest.name).toBe('StrongFits');
  expect(manifest.short_name).toBe('StrongFits');
  await page.locator('#nav button[data-ui-tab="set"]').click();
  await expect(page.locator('#app')).toContainText('StrongFits');
  await page.locator('#nav button[data-ui-tab="prog"]').click();
  await expect(page.locator('#app')).toContainText('StrongFits 5×5');
});


test('home opens directly on workout without starter weight setup banner',async({page})=>{
  await page.goto('/');
  await expect(page.getByText("Today's Workout")).toBeVisible();
  await expect(page.locator('#app')).not.toContainText('Başlangıç ağırlıklarını belirle');
  await expect(page.locator('#app button[onclick="showSetup()"]')).toHaveCount(0);
  await page.locator('#nav button[data-ui-tab="set"]').click();
  await expect(page.locator('#app .srow[onclick="go(\'w\')"]')).toHaveCount(1);
});
