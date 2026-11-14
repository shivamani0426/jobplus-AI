import type { Analysis, Market } from './types'
const PREFIX='/api/intelligence'
async function request<T>(path:string, options?:RequestInit):Promise<T>{
  let response:Response
  try{response=await fetch(PREFIX+path,{cache:'no-store',...options})}
  catch{throw new Error('The intelligence service is unreachable. Please retry shortly.')}
  if(!response.ok){
    let message=response.status>=500
      ? 'The analysis service is restarting. Please retry shortly, or paste resume text for the guest demo.'
      : 'The request was not accepted. Please check your input and try again.'
    try{const body=await response.json();if(typeof body.detail==='string')message=body.detail}catch{}
    throw new Error(message)
  }
  return response.json() as Promise<T>
}
export function getMarket(role:string,horizon=6){return request<Market>('/v1/market?'+new URLSearchParams({role_id:role,horizon:String(horizon)}))}
export function analyzeText(role_id:string,text:string){return request<Analysis>('/v1/analyze/text',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role_id,text})})}
export function analyzePdf(role_id:string,file:File){const form=new FormData();form.append('role_id',role_id);form.append('file',file);return request<Analysis>('/v1/analyze/pdf',{method:'POST',body:form})}
export async function downloadReport(data:Analysis){
 const r=await fetch(PREFIX+'/v1/report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 if(!r.ok){let message='Could not generate the PDF report. Please retry.';try{const body=await r.json();if(typeof body.detail==='string')message=body.detail}catch{}throw new Error(message)}
 const blob=await r.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='JobPulse-career-report.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)
}
