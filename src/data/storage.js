import { W0, INC0 } from '../domain/config.js';
import { parseBackup } from './validation.js';

export const STORAGE_KEY='sl5x5';
const blockedStores=new WeakMap();
export const fresh=()=>({lang:'en',w:{...W0},inc:{...INC0},h:[],next:'B',act:null,setupDone:false,days:[1,3,5]});
export const getLoadWarning=storage=>blockedStores.get(storage)||null;

export function loadState(storage){
  let raw;
  try{raw=storage.getItem(STORAGE_KEY)}
  catch(error){
    blockedStores.set(storage,'Cihaz kayıtlarına erişilemiyor: '+String(error.message||error));
    return fresh();
  }
  if(raw==null)return fresh();
  let state;
  try{state=parseBackup(raw)}
  catch(error){
    // Never overwrite the raw user record on the next tap.
    blockedStores.set(storage,'Mevcut kayıt bozuk veya uyumsuz: '+String(error.message||error));
    return fresh();
  }
  blockedStores.delete(storage);
  const isExistingProfile=!Object.prototype.hasOwnProperty.call(state,'setupDone');
  state=Object.assign(fresh(),state);
  if(isExistingProfile)state.setupDone=true; // Legacy profiles keep their existing weights and UI.
  if(!Array.isArray(state.days)||!state.days.some(d=>Number.isInteger(d)&&d>=0&&d<=6))state.days=[1,3,5];
  state.w=Object.assign({},W0,state.w);
  state.inc=Object.assign({},INC0,state.inc);
  return state;
}

export function saveState(storage,state,{replaceInvalid=false}={}){
  if(blockedStores.has(storage)&&!replaceInvalid)return false;
  try{
    storage.setItem(STORAGE_KEY,JSON.stringify(state));
    blockedStores.delete(storage);
    return true;
  }catch(_){return false}
}
