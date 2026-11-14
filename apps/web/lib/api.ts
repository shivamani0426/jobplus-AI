import type { Analysis, Market } from './types'
const PREFIX='/api/intelligence'
async function request<T>(path:string, options?:RequestInit):Promise<T>{
  let response:Response
  try{response=await fetch(PREFIX+path,{cache:'no-store',...options})}
  catch{throw new Error('The intelligence service is unreachable. Please retry shortly.')}
  if(!response.ok){let message='Request could not be completed.';try{const body=await response.json();message=typeof body.detail==='string'?body.detail:message}catch{}throw new Error(message)}
  return response.json() as Promise<T>
}
export function getMarket(role:string,horizon=6){return request<Market>('/v1/market?'+new URLSearchParams({role_id:role,horizon:String(horizon)}))}
export function analyzeText(role_id:string,text:string){return request<Analysis>('/v1/analyze/text',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role_id,text})})}
export function analyzePdf(role_id:string,file:File){const form=new FormData();form.append('role_id',role_id);form.append('file',file);return request<Analysis>('/v1/analyze/pdf',{method:'POST',body:form})}
export async function downloadReport(data:Analysis){
 const r=await fetch(PREFIX+'/v1/report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 if(!r.ok)throw new Error('Could not generate the PDF report.')
 const blob=await r.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='JobPulse-career-report.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)
}
