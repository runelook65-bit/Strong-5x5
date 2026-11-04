import {test,expect} from '@playwright/test';

test('main navigation loads five real screens without a runtime fallback',async({page})=>{
  await page.goto('/');
  await expect(page.getByText('Bugünkü Antrenman')).toBeVisible();
  const pages=[
    ['prog','Programlar'],
    ['hist','Geçmiş'],
    ['stat','İlerleme'],
    ['set','Ayarlar'],
    ['home','Bugünkü Antrenman']
  ];
  for(const [tab,title] of pages){
    const snapshot=await page.evaluate((tab)=>{
      const btn=document.querySelector('#nav button[data-ui-tab="'+tab+'"]');
      const bar=document.querySelector('#nav');
      const r=btn.getBoundingClientRect();
      const cx=r.left+r.width/2,cy=r.top+r.height/2;
      const hit=document.elementFromPoint(cx,cy);
      const style=getComputedStyle(btn),barStyle=getComputedStyle(bar);
      return {tab,viewport:[innerWidth,innerHeight],rect:[r.x,r.y,r.width,r.height],center:[cx,cy],hit:{tag:hit?.tagName,id:hit?.id,cls:hit?.className,text:hit?.textContent?.slice(0,25)},button:{z:style.zIndex,position:style.position,pointer:style.pointerEvents},nav:{rect:[bar.getBoundingClientRect().x,bar.getBoundingClientRect().y,bar.getBoundingClientRect().width,bar.getBoundingClientRect().height],z:barStyle.zIndex,position:barStyle.position,pointer:barStyle.pointerEvents}};
    },tab);
    console.log('NAV HIT DEBUG:',JSON.stringify(snapshot));
    await page.locator('#nav button[data-ui-tab="'+tab+'"]').click({timeout:6000});
    await expect(page.getByText(title,{exact:true}).first()).toBeVisible();
    await expect(page.locator('#app')).not.toContainText('Bir hata oluştu');
  }
});

test('the first recorded set is persisted and survives a page refresh',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Antrenmanı Başlat'}).click();
  const first=page.locator('[data-ui-action="log-set"]').first();
  await expect(first).toBeVisible();
  await expect(first).toHaveAttribute('aria-label',/1\. set:/);
  await first.click();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sl5x5')).act.ex[0].sets[0])).toBe(5);
  await page.reload();
  await expect(page.locator('[data-ui-action="log-set"]').first()).toBeVisible();
  const recorded=await page.evaluate(()=>JSON.parse(localStorage.getItem('sl5x5')).act.ex[0].sets[0]);
  expect(recorded).toBe(5);
});

test('finishing a partially recorded session creates exactly one history entry',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Antrenmanı Başlat'}).click();
  await page.locator('[data-ui-action="log-set"]').first().click();
  await page.locator('[data-ui-action="finish-workout"]').click();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sl5x5')).h.length)).toBe(1);
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('sl5x5')));
  expect(state.act).toBeNull();
  expect(state.next).toBe('A');
  await page.locator('#nav button[data-ui-tab="hist"]').click();
  await page.getByRole('button',{name:'Liste'}).click();
  await expect(page.locator('#app')).toContainText('Squat');
});

test('damaged local data is left intact and recovery actions are displayed',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('sl5x5','{damaged'));
  await page.goto('/');
  await expect(page.getByText('Veri kurtarma')).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('sl5x5'))).toBe('{damaged');
  await page.getByRole('button',{name:'Ham veriyi görüntüle'}).click();
  await expect(page.locator('#recoveryBackup')).toHaveValue('{damaged');
  expect(await page.evaluate(()=>localStorage.getItem('sl5x5'))).toBe('{damaged');
});

test('navigation and workout controls fit the simulated mobile viewport',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#nav button[data-ui-tab="home"]')).toBeVisible();
  await page.getByRole('button',{name:'Antrenmanı Başlat'}).click();
  await expect(page.locator('[data-ui-action="log-set"]').first()).toBeVisible();
  const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(width.scroll).toBeLessThanOrEqual(width.client+3);
});
