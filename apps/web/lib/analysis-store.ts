'use client'
import type {Analysis} from './types'
const KEY='jobpulse:analysis:v3'
// Only derived skills and rubric results; never persist resume text or PDF bytes.
export function getRecent():Analysis|null{if(typeof sessionStorage==='undefined')return null;try{const value=sessionStorage.getItem(KEY);return value?JSON.parse(value) as Analysis:null}catch{return null}}
export function saveRecent(value:Analysis){if(typeof sessionStorage==='undefined')return;sessionStorage.setItem(KEY,JSON.stringify(value))}
export function clearRecent(){if(typeof sessionStorage==='undefined')return;sessionStorage.removeItem(KEY)}
