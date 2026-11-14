'use client'
import Link from 'next/link'
import {Activity,ArrowRight,ArrowUpRight,BookOpen,ChartNoAxesCombined,Compass,FileCheck2,FileSearch,ShieldCheck,Sparkles,Target,TrendingUp,UploadCloud} from 'lucide-react'
import {useJobPulse} from '@/components/providers'
import {DemoNote,Metric,Pill,SectionTitle} from '@/components/ui'
import {MarketModule} from '@/components/market-module'
import {roleById} from '@/lib/catalog'
import {useEffect,useState} from 'react'
import {getRecent} from '@/lib/analysis-store'
import type {Analysis} from '@/lib/types'
export default function Dashboard(){const {role,user}=useJobPulse();const current=roleById(role);const [analysis,setAnalysis]=useState<Analysis|null>(null)
 useEffect(()=>setAnalysis(getRecent()),[role])
 const match=analysis?.role_id===role?analysis:null
 return <>
  <div className="dashboard-intro"><div><span className="eyebrow">YOUR CAREER COMPASS</span><h1>Good things start with <span>clear direction.</span></h1><p>{user?`Welcome back. Your journey toward ${current.title} starts here.`:`A clearer view of your skills, your opportunities, and your next move.`}</p></div><Pill tone="mint"><Sparkles size={14}/> Your personal workspace</Pill></div>
  <section className="dashboard-hero"><div className="dashboard-hero-copy"><span className="hero-eyebrow"><Sparkles size={15}/> MAKE YOUR NEXT MOVE COUNT</span><h2>Unlock your<br/>career potential.</h2><p>Get an honest snapshot of your skills and a focused plan for what comes next.</p><Link href="/app/resume" className="button button-white">Analyze my resume <ArrowUpRight size={17}/></Link></div><div className="dashboard-orb" aria-hidden="true"><i/><span><Activity size={73}/></span><div className="orbit-card orbit-top"><Target size={18}/> Understand your skills</div><div className="orbit-card orbit-bottom"><Compass size={18}/> Build your roadmap</div></div></section>
  <div className="metric-grid"><Metric icon={<Target size={19}/>} title="Career goal" value={current.title} detail={current.category} tone="violet"/><Metric icon={<BookOpen size={19}/>} title="Role competencies" value={String(current.skills.length)} detail="Transparent curated checklist" tone="mint"/><Metric icon={<FileCheck2 size={19}/>} title="Keyword alignment" value={match?match.score+'%':'Not scanned'} detail={match?'Latest session analysis':'Run a resume analysis'} tone="blue"/><Metric icon={<TrendingUp size={19}/>} title="Market insights" value="Demo mode" detail="Synthetic sample data" tone="peach"/></div>
  <div className="dashboard-secondary"><MarketModule overview/><div className="card skills-panel"><div className="card-head"><div><span className="eyebrow">YOUR LEARNING FOCUS</span><h3>Skills for {current.title}</h3><p>Core competencies from our role rubric.</p></div><span className="subtle-ring"><BookOpen size={21}/></span></div><div className="checklist-preview">{current.skills.slice(0,6).map((skill,i)=><div className="checklist-row" key={skill}><span className="checklist-number">{String(i+1).padStart(2,'0')}</span><div><strong>{skill}</strong><span className="preview-track"><i style={{width:(94-i*11)+'%'}}/></span></div><span className="checklist-focus">Focus</span></div>)}</div><Link href="/app/roadmap" className="panel-bottom-link">Explore learning roadmap <ArrowRight size={16}/></Link></div></div>
  <div className="overview-next card"><span className="next-icon"><ShieldCheck size={24}/></span><div><strong>Clarity is part of the product.</strong><p>We explain how skill matching works and clearly identify sample market trends. No invented employment statistics.</p></div><Link href="/app/methodology">Our methodology <ArrowRight size={16}/></Link></div>
 </>
}
