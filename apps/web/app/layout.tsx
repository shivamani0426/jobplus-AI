import type { Metadata, Viewport } from 'next'
import './globals.css'
export const metadata:Metadata = {
 title:{default:'JobPulse — Clarity for your next move',template:'%s | JobPulse'},
 description:'Career intelligence built for students. Explore career paths, compare skill gaps, build learning roadmaps, and understand job-market forecasting.',
 applicationName:'JobPulse',robots:{index:true,follow:true},
}
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#f8f9fd'}
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body>{children}</body></html>
}
