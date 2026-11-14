import { NextRequest } from 'next/server'
import { standbyAnalyze, standbyMarket } from '@/lib/analysis-standby'
import { standbyReport } from '@/lib/report-standby'
import { roles } from '@/lib/catalog'

export const dynamic='force-dynamic'
export const runtime='nodejs'
const endpoints=new Set(['/v1/roles','/v1/market','/v1/analyze/text','/v1/analyze/pdf','/v1/report'])
const localPaths=new Set(['/v1/roles','/v1/market','/v1/analyze/text','/v1/report'])
const pause=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,ms))
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}
const hint='The PDF processing service is restarting. Please retry in about a minute, or paste your resume text to analyze it without waiting.'

async function standby(pathname:string,request:NextRequest,payload?:ArrayBuffer):Promise<Response|null>{
 if(!localPaths.has(pathname))return null
 try{
  let result:unknown
  if(pathname==='/v1/roles')result={roles:roles.map(x=>({id:x.id,title:x.title,category:x.category,description:x.description,skills:x.skills}))}
  else if(pathname==='/v1/market'){
   const role=request.nextUrl.searchParams.get('role_id')||'data-scientist'
   const horizon=Number(request.nextUrl.searchParams.get('horizon')||6)
   result=standbyMarket(role,horizon)
  } else {
   if(!payload||payload.byteLength>120_500)throw new Error('Request exceeds the text/report size limit.')
   const body:unknown=JSON.parse(new TextDecoder().decode(payload))
   if(!body||typeof body!=='object')throw new Error('Invalid request.')
   const value=body as Record<string,unknown>
   if(pathname==='/v1/analyze/text') {
    if(typeof value.text!=='string'||typeof value.role_id!=='string')throw new Error('Select a career and provide resume text.')
    result=standbyAnalyze(value.text,value.role_id)
   }else if(pathname==='/v1/report') {
    const pdf=await standbyReport(body)
    return new Response(Uint8Array.from(pdf),{status:200,headers:{...headers,'X-JobPulse-Mode':'local-standby',
     'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="jobpulse-career-report.pdf"'}})
   }
  }
  return Response.json(result,{status:200,headers:{...headers,'X-JobPulse-Mode':'local-standby'}})
 }catch(e){
  const message=e instanceof Error?e.message:'Invalid analysis request.'
  return Response.json({detail:message},{status:422,headers})
 }
}

async function handler(request:NextRequest,context:{params:Promise<{path:string[]}>}){
 const {path}=await context.params
 const pathname='/'+path.join('/')
 if(!endpoints.has(pathname))return Response.json({detail:'Unknown API endpoint.'},{status:404,headers})
 if(request.method==='GET'&&!['/v1/roles','/v1/market'].includes(pathname))
  return Response.json({detail:'Method not allowed.'},{status:405,headers})
 if(request.method==='POST'&&['/v1/roles','/v1/market'].includes(pathname))
  return Response.json({detail:'Method not allowed.'},{status:405,headers})

 const origin=(process.env.INTELLIGENCE_API_URL||'http://localhost:8000').replace(/\/$/,'')
 if(!/^https?:\/\//.test(origin))return Response.json({detail:'Intelligence service configuration is invalid.'},{status:503,headers})

 const outgoing=new Headers()
 const contentType=request.headers.get('content-type')
 if(contentType)outgoing.set('content-type',contentType)
 let payload:ArrayBuffer|undefined
 if(request.method==='POST'){
  if(Number(request.headers.get('content-length')||0)>5_600_000)
   return Response.json({detail:'Upload exceeds 5 MB limit.'},{status:413,headers})
  try{payload=await request.arrayBuffer()}
  catch{return Response.json({detail:'Unable to read uploaded file.'},{status:400,headers})}
  if(payload.byteLength>5_600_000)return Response.json({detail:'Upload exceeds 5 MB limit.'},{status:413,headers})
 }
 const standbySupported=localPaths.has(pathname)
 const deadline=Date.now()+(standbySupported?8500:65000)
 const delays=standbySupported?[0]:[0,4000,8000,12000]
 for(let attempt=0;attempt<delays.length;attempt++){
  if(attempt)await pause(Math.min(delays[attempt],Math.max(0,deadline-Date.now()-2000)))
  const timeLeft=deadline-Date.now()-1000
  if(timeLeft<=0)break
  try{
   const init:RequestInit={
    method:request.method,headers:outgoing,cache:'no-store',
    signal:AbortSignal.timeout(Math.min(timeLeft,standbySupported?8000:23000))
   }
   if(payload)init.body=payload
   const response=await fetch(origin+pathname+request.nextUrl.search,init)
   // Render Free can return an HTML 502/503 loading page while the Python service starts.
   // Do not forward HTML as a success response to a JSON/PDF consumer.
   const expected=pathname==='/v1/report'?'application/pdf':'application/json'
   const wrongType=response.ok&&!response.headers.get('content-type')?.toLowerCase().includes(expected)
   if(response.status>=500||wrongType){
    try{await response.body?.cancel()}catch{}
    if(standbySupported)break
    if(attempt<delays.length-1)continue
    break
   }
   const pass=new Headers(headers)
   for(const key of ['content-type','content-disposition']){
    const value=response.headers.get(key)
    if(value)pass.set(key,value)
   }
   return new Response(response.body,{status:response.status,headers:pass})
  }catch{
   if(standbySupported)break
   // An instance can reset its connection while spinning up.
  }
 }
 const fallback=await standby(pathname,request,payload)
 if(fallback)return fallback
 return Response.json({detail:hint},{status:503,headers})
}

export {handler as GET,handler as POST}
