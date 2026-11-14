'use client'
import {useState} from 'react'
import {ArrowRight,BookOpen,CheckCircle2,Target} from 'lucide-react'
import Link from 'next/link'
const steps=[
 {id:'resume',label:'Review my skills',tip:'Start with your resume, then compare it with a role checklist.',url:'/app/resume',cta:'Open Resume Studio',Icon:Target},
 {id:'learn',label:'Learn one new skill',tip:'Use the learning roadmap to pick one topic and build a small project.',url:'/app/roadmap',cta:'Open my roadmap',Icon:BookOpen},
 {id:'reflect',label:'Check my progress',tip:'Review saved reports and track the skills you have covered.',url:'/app/reports',cta:'Open reports',Icon:CheckCircle2},
]
export function MomentumPanel(){const [selected,setSelected]=useState(0);const current=steps[selected];const Icon=current.Icon
return <div className="momentum-interactive"><span className="micro-label">PICK YOUR NEXT STEP</span><div className="momentum-options">{steps.map((s,i)=><button type="button" key={s.id} aria-pressed={i===selected} className={i===selected?'chosen':''} onClick={()=>setSelected(i)}>{s.label}</button>)}</div><div className="momentum-reveal"><Icon size={28}/><div><strong>{current.label}</strong><p>{current.tip}</p><Link href={current.url}>{current.cta}<ArrowRight size={15}/></Link></div></div></div>}
