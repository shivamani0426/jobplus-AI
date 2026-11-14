'use client'
import {useState} from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {Activity,ArrowRight,BookOpen,ChartNoAxesCombined,ChevronDown,ChevronRight,Compass,BrainCircuit,FileCheck2,FileText,House,LayoutDashboard,LogOut,Menu,Settings2,ShieldCheck,Users,UserRound,X} from 'lucide-react'
import {Brand} from './brand'
import {Providers,useJobPulse} from './providers'
import {roles} from '@/lib/catalog'
import {browserSupabase} from '@/lib/supabase'
const nav=[
 {href:'/app',label:'Overview',Icon:LayoutDashboard},
 {href:'/app/resume',label:'Resume studio',Icon:FileText},
 {href:'/app/coach',label:'AI Career Coach',Icon:BrainCircuit},
 {href:'/app/market',label:'Market intelligence',Icon:ChartNoAxesCombined},
 {href:'/app/roadmap',label:'Learning roadmap',Icon:Compass},
 {href:'/app/reports',label:'My reports',Icon:FileCheck2},
]
const secondary=[{href:'/app/methodology',label:'Methodology',Icon:BookOpen},{href:'/app/team',label:'For the judges',Icon:Users},{href:'/app/settings',label:'Settings',Icon:Settings2}]
function Frame({children}:{children:React.ReactNode}){
 const path=usePathname()
 const {role,setRole,user}=useJobPulse()
 const [menu,setMenu]=useState(false)
 const page=[...nav,...secondary].find(n=>n.href===path)?.label||'Workspace'
 return <div className="workspace">
   {menu&&<button className="mobile-overlay" aria-label="Close menu" onClick={()=>setMenu(false)}/>}
   <aside className={'sidebar '+(menu?'sidebar-open':'')}>
     <div className="sidebar-brand"><Brand/><button className="mobile-close" aria-label="Close navigation" onClick={()=>setMenu(false)}><X size={20}/></button></div>
     <div className="workspace-label"><span className="workspace-monogram">C</span><span><strong>CareerCatalysts</strong><small>Student workspace</small></span><ChevronDown size={15}/></div>
     <div className="side-group-title">WORKSPACE</div>
     <nav aria-label="Workspace navigation" className="side-links">{nav.map(item=><NavItem {...item} key={item.href} path={path} close={()=>setMenu(false)}/>)}</nav>
     <div className="side-group-title secondary-group">RESOURCES</div>
     <nav aria-label="Resources and settings" className="side-links">{secondary.map(item=><NavItem {...item} key={item.href} path={path} close={()=>setMenu(false)}/>)}</nav>
     <div className="sidebar-spacer"/>
     <div className="sidebar-tip"><div className="tip-icon"><Activity size={20}/></div><strong>Make the next move count.</strong><p>Uncover strengths and build a focused career roadmap.</p><Link href="/app/resume" onClick={()=>setMenu(false)}>Analyze your resume <ArrowRight size={15}/></Link></div>
     <div className="side-user"><span className="user-circle"><UserRound size={20}/></span><span><strong>{user?.email?.split('@')[0]||'Guest learner'}</strong><small>{user?'Synced with Supabase':'Explore without an account'}</small></span><ChevronRight size={16}/></div>
   </aside>
   <div className="workspace-main"><header className="workspace-header"><div className="bread"><button className="mobile-open" aria-label="Open navigation" onClick={()=>setMenu(true)}><Menu size={21}/></button><span className="bread-home">Workspace</span><ChevronRight size={15}/><strong>{page}</strong></div>
     <div className="header-actions"><div className="role-control"><span>Target role</span><select aria-label="Target career" value={role} onChange={e=>setRole(e.target.value)}>{roles.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}</select></div><Link className="profile-action" href={user?'/app/settings':'/login'} aria-label="Account"><UserRound size={19}/></Link></div>
   </header><div className="workspace-content">{children}</div><footer className="workspace-footer"><span>© 2026 JobPulse · CareerCatalysts</span><span>Educational career intelligence, grounded in transparency.</span></footer></div>
 </div>
}
function NavItem({href,label,Icon,path,close}:{href:string;label:string;Icon:typeof House;path:string;close:()=>void}){
 const active=path===href
 return <Link href={href} onClick={close} className={'side-link '+(active?'selected':'')} aria-current={active?'page':undefined}><Icon size={18} strokeWidth={1.8}/><span>{label}</span>{active&&<span className="active-dot"/>}</Link>
}
export function DashboardShell({children}:{children:React.ReactNode}){return <Providers><Frame>{children}</Frame></Providers>}
