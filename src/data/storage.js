import { W0, INC0 } from '../domain/config.js';

export const STORAGE_KEY = 'sl5x5';
export const fresh = () => ({w:{...W0}, inc:{...INC0}, h:[], next:'B', act:null});

export function loadState(storage) {
  let state;
  try { state = JSON.parse(storage.getItem(STORAGE_KEY)) || fresh(); }
  catch (_) { state = fresh(); }
  state = Object.assign(fresh(), state);
  state.w = Object.assign({}, W0, state.w);
  state.inc = Object.assign({}, INC0, state.inc);
  if (!Array.isArray(state.h)) state.h=[];
  if (state.next !== 'A' && state.next !== 'B') state.next='A';
  if (state.act && (!Array.isArray(state.act.ex) || !state.act.ex.length)) state.act=null;
  return state;
}

export function saveState(storage, state) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
  catch (_) { return false; }
}
