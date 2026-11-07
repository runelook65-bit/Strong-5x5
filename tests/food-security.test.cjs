const test=require('node:test');
const assert=require('node:assert/strict');
const {generateKeyPairSync,sign}=require('node:crypto');
const security=import('../api/food/security.js');
const configModule=import('../api/food/config.js');
const analysisModule=import('../api/food/analyze.js');

function fixture(){
 const {publicKey,privateKey}=generateKeyPairSync('rsa',{modulusLength:2048});
 const jwk={...publicKey.export({format:'jwk'}),use:'sig',alg:'RS256',kid:'strongfits-test-2026'};
 const now=Date.now(),aud='test-client.apps.googleusercontent.com';
 const signToken=(claims={})=>{
  const header={alg:'RS256',typ:'JWT',kid:jwk.kid};
  const payload={iss:'https://accounts.google.com',aud,sub:'123456789012345678901',
    iat:Math.floor(now/1000),exp:Math.floor(now/1000)+3600,...claims};
  const prefix=[header,payload].map(value=>Buffer.from(JSON.stringify(value)).toString('base64url')).join('.');
  return prefix+'.'+sign('RSA-SHA256',Buffer.from(prefix),privateKey).toString('base64url');
 };
 const fetcher=async url=>{
  assert.equal(url,'https://www.googleapis.com/oauth2/v3/certs');
  return {ok:true,headers:{get:()=> 'public, max-age=300'},json:async()=>({keys:[jwk]})};
 };
 return {aud,now,fetcher,signToken};
}

test('Google RS256 signature, issuer, audience and expiry are verified',async()=>{
 const {verifyGoogleIdToken}=await security;
 const {aud,now,fetcher,signToken}=fixture();
 const valid=signToken();
 assert.equal((await verifyGoogleIdToken(valid,aud,{fetcher,now:()=>now})).sub,'123456789012345678901');
 for(const claims of [
  {aud:'attacker.apps.googleusercontent.com'},
  {iss:'https://evil.example'},
  {exp:Math.floor(now/1000)-1},
  {iat:Math.floor(now/1000)+3600}
 ]){
  await assert.rejects(verifyGoogleIdToken(signToken(claims),aud,{fetcher,now:()=>now}),/auth/);
 }
 const parts=valid.split('.');
 const edited=parts[0]+'.'+parts[1]+'.'+(parts[2][0]==='A'?'B':'A')+parts[2].slice(1);
 await assert.rejects(verifyGoogleIdToken(edited,aud,{fetcher,now:()=>now}),/auth/);
 await assert.rejects(verifyGoogleIdToken('a.b.c',aud,{fetcher,now:()=>now}),/auth/);
});

test('Google public-key outage fails closed',async()=>{
 const {verifyGoogleIdToken}=await security;
 const {aud,now,signToken}=fixture();
 await assert.rejects(
  verifyGoogleIdToken(signToken(),aud,{now:()=>now,fetcher:async()=>{throw Error('offline')}}),
  /auth_service/);
});

test('daily usage limit uses hashed per-account key and atomic Redis EVAL',async()=>{
 const {consumeDailyQuota}=await security;
 const env={UPSTASH_REDIS_REST_URL:'https://test.upstash.io',UPSTASH_REDIS_REST_TOKEN:'not-a-real-token',FOOD_AI_DAILY_LIMIT:'12'};
 let request;
 const user='123456789012345678901';
 const fetcher=async(url,options)=>{
  request={url,options};
  return {ok:true,json:async()=>({result:[1,1]})};
 };
 const time=Date.UTC(2026,10,8,12);
 const result=await consumeDailyQuota(user,{env,fetcher,now:()=>time});
 assert.deepEqual(result,{allowed:true,remaining:11,limit:12});
 assert.equal(request.url,'https://test.upstash.io/');
 assert.equal(request.options.headers.authorization,'Bearer not-a-real-token');
 const payload=JSON.parse(request.options.body);
 assert.equal(payload[0],'EVAL');
 assert.match(payload[1],/redis.call\('INCR'/);
 assert.match(payload[1],/redis.call\('EXPIRE'/);
 assert.equal(payload[2],'1');
 assert.ok(!payload[3].includes(user),'User ID is hashed before storage');
 assert.ok(payload[3].endsWith(':2026-11-08'));
 assert.equal(payload[4],'12');
 assert.ok(Number(payload[5])>40000&&Number(payload[5])<50000);
});

test('quota exhausted and storage failures never authorize AI requests',async()=>{
 const {consumeDailyQuota}=await security;
 const env={UPSTASH_REDIS_REST_URL:'https://test.upstash.io',UPSTASH_REDIS_REST_TOKEN:'secret'};
 const user='123456789012345678901';
 let response=await consumeDailyQuota(user,{env,fetcher:async()=>({ok:true,json:async()=>({result:[0,12]})})});
 assert.equal(response.allowed,false);
 await assert.rejects(
  consumeDailyQuota(user,{env,fetcher:async()=>{throw Error('offline')}}),/quota_service/);
 await assert.rejects(
  consumeDailyQuota(user,{env,fetcher:async()=>({ok:true,json:async()=>({error:'READONLY'})})}),/quota_service/);
});

function response(){
 const out={code:0,body:null,headers:{}};
 out.setHeader=(k,v)=>{out.headers[k]=v};
 out.status=c=>{out.code=c;return out};
 out.json=b=>{out.body=b;return out};
 return out;
}
test('configuration endpoint discloses client ID only when all services are ready',async()=>{
 const {default:config}=await configModule;
 const keys=['GOOGLE_CLIENT_ID','UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','OPENROUTER_API_KEY'];
 const old=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{
  for(const key of keys)delete process.env[key];
  let res=response();config({method:'GET'},res);
  assert.equal(res.code,200);assert.equal(res.body.enabled,false);assert.equal(res.body.clientId,null);
  process.env.GOOGLE_CLIENT_ID='test.apps.googleusercontent.com';
  process.env.UPSTASH_REDIS_REST_URL='https://test.upstash.io';
  process.env.UPSTASH_REDIS_REST_TOKEN='test';
  process.env.OPENROUTER_API_KEY='test';
  res=response();config({method:'GET'},res);
  assert.equal(res.body.enabled,true);assert.equal(res.body.dailyLimit,12);
  assert.deepEqual(Object.keys(res.body).sort(),['clientId','dailyLimit','enabled','provider']);
 }finally{
  for(const key of keys){if(old[key]===undefined)delete process.env[key];else process.env[key]=old[key]}
 }
});

test('unauthenticated and quota-exceeded requests never reach OpenRouter',async()=>{
 const {createFoodAnalyzeHandler}=await analysisModule;
 const keys=['GOOGLE_CLIENT_ID','UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','OPENROUTER_API_KEY'];
 const old=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 for(const k of keys)process.env[k]='test';
 let calls=0,fetchCalls=0;
 const oldFetch=global.fetch;
 global.fetch=async()=>{fetchCalls++;throw Error('should not call OpenRouter')};
 try{
  const auth=async()=>{calls++;return{sub:'123456789012345678901'}};
  let handler=createFoodAnalyzeHandler({authenticate:auth,charge:async()=>({allowed:false,remaining:0})});
  const headers={host:'arm-5x5.vercel.app',origin:'https://arm-5x5.vercel.app'};
  let res=response();
  await handler({method:'POST',headers,body:{image:'AAAA'}},res);
  assert.equal(res.code,401);assert.equal(calls,0);
  res=response();
  await handler({method:'POST',headers:{...headers,authorization:'Bearer '+('a'.repeat(80))},body:{image:'AAAA'}},res);
  assert.equal(res.code,429);assert.equal(res.body.error,'quota');assert.equal(fetchCalls,0);
  handler=createFoodAnalyzeHandler({authenticate:async()=>{throw Error('identity down')},charge:async()=>{throw Error('quota must not run')}});
  res=response();
  await handler({method:'POST',headers:{...headers,authorization:'Bearer '+('a'.repeat(80))},body:{image:'AAAA'}},res);
  assert.equal(res.code,503);assert.equal(fetchCalls,0);
 }finally{
  global.fetch=oldFetch;
  for(const key of keys){if(old[key]===undefined)delete process.env[key];else process.env[key]=old[key]}
 }
});
