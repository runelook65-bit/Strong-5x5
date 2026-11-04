import { W0, INC0 } from '../domain/config.js';
import { parseBackup } from './validation.js';

export const STORAGE_KEY='sl5x5';
const blockedStores=new WeakMap();
export const fresh=()=>({w:{...W0},inc:{...INC0},h:[],next:'B',act:null});
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
  state=Object.assign(fresh(),state);
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
