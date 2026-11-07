import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir:'./e2e',
  timeout:15000,
  retries:0,
  reporter:process.env.CI?'github':'list',
  use:{
    baseURL:'http://127.0.0.1:4173',
    trace:'retain-on-failure',
    locale:'tr-TR'
  },
  projects:[
    {name:'mobile-390',use:{browserName:'chromium',viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true}},
    {name:'mobile-320',use:{browserName:'chromium',viewport:{width:320,height:740},deviceScaleFactor:2,isMobile:true,hasTouch:true}}
  ],
  webServer:{
    command:'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url:'http://127.0.0.1:4173',
    reuseExistingServer:!process.env.CI,
    timeout:120000
  }
});
