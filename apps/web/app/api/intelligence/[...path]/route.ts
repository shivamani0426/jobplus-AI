import { NextRequest } from 'next/server'
export const dynamic='force-dynamic'
const allowed=new Set(['/v1/roles','/v1/market','/v1/analyze/text','/v1/analyze/pdf','/v1/report'])
async function handler(request:NextRequest,ctx:{params:Promise<{path:string[]}>}){
  const {path}=await ctx.params
  const pathname='/'+path.join('/')
  if(!allowed.has(pathname))return Response.json({detail:'Unknown API endpoint'},{status:404})
  if(request.method==='GET'&&!['/v1/roles','/v1/market'].includes(pathname))return Response.json({detail:'Method not allowed'},{status:405})
  if(request.method==='POST'&&['/v1/roles','/v1/market'].includes(pathname))return Response.json({detail:'Method not allowed'},{status:405})
  const origin=(process.env.INTELLIGENCE_API_URL||'http://localhost:8000').replace(/\/$/,'')
  const suffix=request.nextUrl.search
  const headers=new Headers()
  if(request.headers.get('content-type'))headers.set('content-type',request.headers.get('content-type')!)
  if(request.method==='POST'){
    const size=Number(request.headers.get('content-length')||0)
    if(size>5_600_000)return Response.json({detail:'Upload exceeds 5 MB limit.'},{status:413})
  }
  try{
    const init:RequestInit={method:request.method,headers,cache:'no-store',signal:AbortSignal.timeout(58_000)}
    if(request.method==='POST')init.body=await request.arrayBuffer()
    const response=await fetch(origin+pathname+suffix,init)
    const output=new Headers({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'})
    for(const name of ['content-type','content-disposition']){const value=response.headers.get(name);if(value)output.set(name,value)}
    return new Response(response.body,{status:response.status,headers:output})
  }catch{return Response.json({detail:'Analysis service is waking up or unavailable. Try again shortly.'},{status:503,headers:{'Cache-Control':'no-store'}})}
}
export {handler as GET,handler as POST}
