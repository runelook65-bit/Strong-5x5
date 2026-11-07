import {securityConfigured} from './security.js';

export default function config(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({error:'method'});
 const enabled=securityConfigured()&&Boolean(process.env.OPENROUTER_API_KEY);
 return res.status(200).json({
  enabled,
  provider:'google',
  clientId:enabled?process.env.GOOGLE_CLIENT_ID:null,
  dailyLimit:enabled?Math.min(50,Math.max(1,Number(process.env.FOOD_AI_DAILY_LIMIT)||12)):0
 });
}
