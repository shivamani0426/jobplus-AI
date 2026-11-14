import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
const endpoints = new Set(['/v1/roles', '/v1/market', '/v1/analyze/text', '/v1/analyze/pdf', '/v1/report'])
const wakingStatuses = new Set([502, 503, 504])
const pause = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

async function handler(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  const pathname = '/' + path.join('/')
  if (!endpoints.has(pathname)) return Response.json({ detail: 'Unknown API endpoint.' }, { status: 404 })
  if (request.method === 'GET' && !['/v1/roles', '/v1/market'].includes(pathname)) return Response.json({ detail: 'Method not allowed.' }, { status: 405 })
  if (request.method === 'POST' && ['/v1/roles', '/v1/market'].includes(pathname)) return Response.json({ detail: 'Method not allowed.' }, { status: 405 })

  const origin = (process.env.INTELLIGENCE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
  if (!/^https?:\/\//.test(origin)) return Response.json({ detail: 'Intelligence service configuration is invalid.' }, { status: 503 })

  const headers = new Headers()
  const contentType = request.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  let payload: ArrayBuffer | undefined
  if (request.method === 'POST') {
    if (Number(request.headers.get('content-length') || 0) > 5_600_000) return Response.json({ detail: 'Upload exceeds 5 MB limit.' }, { status: 413 })
    payload = await request.arrayBuffer()
    if (payload.byteLength > 5_600_000) return Response.json({ detail: 'Upload exceeds 5 MB limit.' }, { status: 413 })
  }

  // Render free web services can sleep while idle. Retry only transient upstream failures.
  // The entire request is capped, and only read/analysis/report endpoints are allowed above.
  const retryDelays = [0, 4_000, 8_000, 12_000]
  const deadline = Date.now() + 55_000
  for (let attempt = 0; attempt < retryDelays.length; attempt++) {
    if (attempt) await pause(Math.min(retryDelays[attempt], Math.max(0, deadline - Date.now() - 2000)))
    const remaining = deadline - Date.now() - 1000
    if (remaining <= 0) break
    try {
      const init: RequestInit = {
        method: request.method,
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(Math.min(remaining, 23_000)),
      }
      if (payload) init.body = payload
      const response = await fetch(origin + pathname + request.nextUrl.search, init)
      if (wakingStatuses.has(response.status) && attempt < retryDelays.length - 1) {
        try { await response.body?.cancel() } catch { /* best effort */ }
        continue
      }
      const forwarded = new Headers({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
      for (const key of ['content-type', 'content-disposition']) {
        const value = response.headers.get(key)
        if (value) forwarded.set(key, value)
      }
      return new Response(response.body, { status: response.status, headers: forwarded })
    } catch {
      // A sleeping instance may reset the connection; try again within the total deadline.
    }
  }
  return Response.json({ detail: 'The analysis service is waking up or temporarily unavailable. Please retry shortly.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
}

export { handler as GET, handler as POST }