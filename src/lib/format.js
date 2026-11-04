import { D, M } from '../domain/config.js';

export const escapeHTML = value => String(value).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
export const dateKey = date => {const d=new Date(date);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
export const displayDate = date => date.getDate()+' '+M[date.getMonth()]+' '+D[date.getDay()];
export const displayWeight = (weight,unit) => unit==='lb'?Math.round(weight*2.20462)+'lb':String(weight).replace('.',',')+'kg';
