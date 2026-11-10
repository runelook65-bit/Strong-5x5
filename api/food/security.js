import {createHash, createPublicKey, verify as verifySignature} from 'node:crypto';

export const securityConfigured = (env=process.env) =>
  Boolean(env.GOOGLE_CLIENT_ID && env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);

export class AnalysisSecurityError extends Error {
  constructor(code, status){super(code);this.code=code;this.status=status;}
}

const GOOGLE_JWKS='https://www.googleapis.com/oauth2/v3/certs';
let cachedKeys=null;
let cacheUntil=0;

const jsonPart=s=>{
  if(!/^[A-Za-z0-9_-]+$/.test(s)||s.length>8192)throw new AnalysisSecurityError('auth',401);
  try{return JSON.parse(Buffer.from(s,'base64url').toString('utf8'))}
  catch{throw new AnalysisSecurityError('auth',401)}
};

export async function verifyGoogleIdToken(token,clientId,{fetcher=fetch,now=Date.now}={}){
  if(!clientId||typeof token!=='string'||token.length>8192)
    throw new AnalysisSecurityError('auth',401);
  const parts=token.split('.');
  if(parts.length!==3)throw new AnalysisSecurityError('auth',401);
  const header=jsonPart(parts[0]),payload=jsonPart(parts[1]);
  if(header.alg!=='RS256'||typeof header.kid!=='string'||!header.kid)
    throw new AnalysisSecurityError('auth',401);
  const nowSecs=Math.floor(now()/1000);
  if(payload.aud!==clientId
    || !['accounts.google.com','https://accounts.google.com'].includes(payload.iss)
    || !Number.isSafeInteger(payload.exp)||payload.exp<=nowSecs
    || !Number.isSafeInteger(payload.iat)||payload.iat>nowSecs+60
    || !/^[0-9]{6,32}$/.test(payload.sub||''))
    throw new AnalysisSecurityError('auth',401);
  if(!cachedKeys||now()>=cacheUntil||!cachedKeys.some(k=>k.kid===header.kid)){
    let response;
    try{response=await fetcher(GOOGLE_JWKS,{signal:AbortSignal.timeout(5000)})}
    catch{throw new AnalysisSecurityError('auth_service',503)}
    if(!response.ok)throw new AnalysisSecurityError('auth_service',503);
    const data=await response.json().catch(()=>null);
    if(!data||!Array.isArray(data.keys)||data.keys.length>30)
      throw new AnalysisSecurityError('auth_service',503);
    cachedKeys=data.keys.filter(k=>k.kty==='RSA'&&k.use==='sig'&&k.alg==='RS256');
    const age=Number(/max-age=(\d+)/i.exec(response.headers?.get?.('cache-control')||'')?.[1]||300);
    cacheUntil=now()+Math.min(3600,Math.max(60,age))*1000;
  }
  const jwk=cachedKeys.find(k=>k.kid===header.kid);
  if(!jwk)throw new AnalysisSecurityError('auth',401);
  try{
    const key=createPublicKey({key:jwk,format:'jwk'});
    const signed=Buffer.from(parts[0]+'.'+parts[1]);
    const sig=Buffer.from(parts[2],'base64url');
    if(!verifySignature('RSA-SHA256',signed,key,sig))
      throw new AnalysisSecurityError('auth',401);
  }catch(e){
    if(e instanceof AnalysisSecurityError)throw e;
    throw new AnalysisSecurityError('auth',401);
  }
  return {sub:payload.sub};
}

const QUOTA_SCRIPT=String.raw`
local userCount=tonumber(redis.call('GET',KEYS[1]) or '0')
local globalCount=tonumber(redis.call('GET',KEYS[2]) or '0')
if userCount>=tonumber(ARGV[1]) or globalCount>=tonumber(ARGV[3]) then
  return {0,userCount,globalCount}
end
userCount=redis.call('INCR',KEYS[1])
if userCount==1 then redis.call('EXPIRE',KEYS[1],tonumber(ARGV[2])) end
globalCount=redis.call('INCR',KEYS[2])
if globalCount==1 then redis.call('EXPIRE',KEYS[2],tonumber(ARGV[2])) end
return {1,userCount,globalCount}
`;
export async function consumeDailyQuota(userId,{
  env=process.env,fetcher=fetch,now=Date.now
}={}){
  if(!env.UPSTASH_REDIS_REST_URL||!env.UPSTASH_REDIS_REST_TOKEN)
    throw new AnalysisSecurityError('quota_service',503);
  const url=new URL(env.UPSTASH_REDIS_REST_URL);
  if(url.protocol!=='https:'||!url.hostname.endsWith('.upstash.io'))
    throw new AnalysisSecurityError('quota_service',503);
  const dailyLimit=Math.min(50,Math.max(1,Number(env.FOOD_AI_DAILY_LIMIT)||12));
  // Bound total traffic to OpenRouter's shared free-account budget, not only each user's quota.
  const globalLimit=Math.min(1000,Math.max(1,Number(env.FOOD_AI_GLOBAL_DAILY_LIMIT)||40));
  const ts=now(),utc=new Date(ts);
  const date=utc.toISOString().slice(0,10);
  const midnight=Date.UTC(utc.getUTCFullYear(),utc.getUTCMonth(),utc.getUTCDate()+1);
  const ttl=Math.max(60,Math.ceil((midnight-ts)/1000)+60);
  const key='strongfits:food:v1:'+createHash('sha256').update(userId).digest('hex')+':'+date;
  const globalKey='strongfits:food:global:v1:'+date;
  let response;
  try{
    response=await fetcher(url.toString(),{
      method:'POST',
      headers:{authorization:'Bearer '+env.UPSTASH_REDIS_REST_TOKEN,'content-type':'application/json'},
      body:JSON.stringify(['EVAL',QUOTA_SCRIPT,'2',key,globalKey,String(dailyLimit),String(ttl),String(globalLimit)]),
      signal:AbortSignal.timeout(5000)
    });
  }catch{throw new AnalysisSecurityError('quota_service',503)}
  if(!response.ok)throw new AnalysisSecurityError('quota_service',503);
  const data=await response.json().catch(()=>null);
  if(!data||data.error||!Array.isArray(data.result)||data.result.length!==3)
    throw new AnalysisSecurityError('quota_service',503);
  const allowed=Number(data.result[0])===1,count=Number(data.result[1]),globalCount=Number(data.result[2]);
  if(!Number.isInteger(count)||count<0||!Number.isInteger(globalCount)||globalCount<0)
    throw new AnalysisSecurityError('quota_service',503);
  return {allowed,remaining:Math.max(0,dailyLimit-count),limit:dailyLimit,
    globalRemaining:Math.max(0,globalLimit-globalCount),globalLimit};
}
