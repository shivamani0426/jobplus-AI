'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {ArrowRight,ArrowUpRight,BookOpen,Check,CheckCircle2,Compass,FileSearch,Flag,GraduationCap,Info,Target,Sparkles} from 'lucide-react'
import {PageHeading,Pill,EmptyState} from '@/components/ui'
import {useJobPulse} from '@/components/providers'
import {getRecent} from '@/lib/analysis-store'
import {browserSupabase} from '@/lib/supabase'
import type {Analysis} from '@/lib/types'
export default function Roadmap(){const {role,user}=useJobPulse(),[analysis,setAnalysis]=useState<Analysis|null>(null),[done,setDone]=useState<string[]>([]),[message,setMessage]=useState('')
 useEffect(()=>{setAnalysis(getRecent());setDone([])},[role])
 useEffect(()=>{let active=true;const key=`jobpulse:progress:${role}`;try{setDone(JSON.parse(localStorage.getItem(key)||'[]'))}catch{setDone([])}
 const sb=browserSupabase();if(sb&&user)sb.from('learning_progress').select('skill').eq('role_id',role).then(({data,error})=>{if(active&&!error&&data)setDone(data.map(x=>x.skill))})
 return()=>{active=false}},[role,user])
 async function toggle(skill:string){const next=done.includes(skill)?done.filter(x=>x!==skill):[...done,skill];setDone(next);localStorage.setItem(`jobpulse:progress:${role}`,JSON.stringify(next));const sb=browserSupabase()
 if(sb&&user){if(next.includes(skill)){const {error}=await sb.from('learning_progress').upsert({user_id:user.id,role_id:role,skill},{onConflict:'user_id,role_id,skill'});if(error)setMessage('Progress saved locally; cloud sync could not complete.')}else{const {error}=await sb.from('learning_progress').delete().eq('user_id',user.id).eq('role_id',role).eq('skill',skill);if(error)setMessage('Progress saved locally; cloud sync could not complete.')}}}
 const selected=analysis?.role_id===role?analysis:null
 return <><PageHeading eyebrow="PERSONALIZED ROADMAP" title="Small steps. Meaningful progress." subtitle="Focus on what to learn next, and build evidence of your skills through real practice." action={<Pill tone="mint"><GraduationCap size={14}/> Your learning journey</Pill>}/>
 <div className="coach-roadmap-link"><Sparkles size={17}/><span>Want help choosing what to learn next?</span><Link href="/app/coach">Ask AI Career Coach <ArrowRight size={15}/></Link></div>
 {selected?<><div className="roadmap-banner"><div><span className="eyebrow">BASED ON YOUR SKILLS SNAPSHOT</span><h2>Your path to {selected.role}.</h2><p>{selected.missing.length} competencies weren't mentioned in your resume. Start with the higher-weight skills.</p></div><div className="roadmap-progress"><strong>{done.filter(s=>selected.roadmap.some(x=>x.skill===s)).length}/{selected.roadmap.length}</strong><span>Steps checked off</span></div></div>
 {selected.roadmap.length?<div className="roadmap-timeline">{selected.roadmap.map((item,i)=><article className={'card roadmap-item '+(done.includes(item.skill)?'completed':'')} key={item.skill}><span className="step-number">{String(i+1).padStart(2,'0')}</span><div className="roadmap-body"><div className="roadmap-title"><div><span className="eyebrow">PRIORITY {i+1}</span><h3>{item.skill}</h3></div>{i===0&&<Pill tone="violet">Start here</Pill>}</div><p>Learn the fundamentals, complete a small practical project, and document evidence of your learning.</p><div className="roadmap-item-actions">{item.resource_url?<a href={item.resource_url} target="_blank" rel="noopener noreferrer">{item.resource_title} <ArrowUpRight size={16}/></a>:<span>Use official documentation and build a small project.</span>}</div></div><button className="roadmap-toggle" aria-label={done.includes(item.skill)?`Mark ${item.skill} incomplete`:`Mark ${item.skill} complete`} aria-pressed={done.includes(item.skill)} onClick={()=>toggle(item.skill)}>{done.includes(item.skill)?<Check size={21}/>:<span/>}</button></article>)}</div>:<EmptyState icon={<CheckCircle2 size={29}/>} title="All checklist terms detected" description="A keyword match is not proof of proficiency. Build portfolio projects and validate these skills with hands-on exercises."/>}
 {message&&<p className="inline-note"><Info size={15}/>{message}</p>}
 </>:<EmptyState icon={<Compass size={30}/>} title="Your roadmap starts with a resume" description="Analyze your resume for your selected career. We'll create a prioritized learning checklist from your missing role keywords." action={<Link className="button button-primary" href="/app/resume">Go to Resume Studio <ArrowRight size={16}/></Link>}/>}
 </>
}
