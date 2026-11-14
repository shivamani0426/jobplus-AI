import { NextRequest, NextResponse } from 'next/server'
import { serverSupabase } from '@/lib/supabase-server'
export async function GET(request:NextRequest){
 const code=request.nextUrl.searchParams.get('code')
 const site=request.nextUrl.origin
 if(code){const client=await serverSupabase();if(client){const {error}=await client.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL('/app',site))}}
 return NextResponse.redirect(new URL('/login?error=confirmation',site))
}
