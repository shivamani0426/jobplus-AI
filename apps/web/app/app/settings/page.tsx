'use client'
import Link from 'next/link'
import {useState} from 'react'
import {ArrowRight,CheckCircle2,LockKeyhole,LogOut,ShieldCheck,Trash2,UserRound} from 'lucide-react'
import {PageHeading,Pill,EmptyState} from '@/components/ui'
import {useJobPulse} from '@/components/providers'
import {browserSupabase} from '@/lib/supabase'
import {clearRecent} from '@/lib/analysis-store'
export default function Settings(){const {user,authLoading}=useJobPulse(),[message,setMessage]=useState(''),[working,setWorking]=useState(false)
 async function logout(){setWorking(true);await browserSupabase()?.auth.signOut();clearRecent();window.location.assign('/login')}
 async function erase(){if(!user||!confirm('Permanently delete all saved JobPulse analyses and roadmap progress for your account?'))return;setWorking(true);setMessage('');const sb=browserSupabase();if(!sb)return
 const results=await Promise.all([sb.from('resume_analyses').delete().eq('user_id',user.id),sb.from('learning_progress').delete().eq('user_id',user.id)]);setMessage(results.some(x=>x.error)?'Some records could not be deleted. Try again.':'Your saved analyses and learning progress have been deleted.');setWorking(false)}
 return <><PageHeading eyebrow="ACCOUNT & PRIVACY" title="Your workspace. Your control." subtitle="Manage your account session and the skill summaries you explicitly chose to save." action={<Pill tone="mint"><ShieldCheck size={14}/> Privacy controls</Pill>}/>
 {authLoading?<div className="card page-loading">Loading account…</div>:user?<div className="two-col settings-grid"><div className="card settings-card"><span className="icon-square violet"><UserRound size={22}/></span><h2>Account details</h2><p className="field-label">Signed in as</p><strong className="account-email">{user.email}</strong><p className="setting-explainer">Supabase manages your identity and credentials. JobPulse never receives your password directly.</p><button className="button button-outline" onClick={logout} disabled={working}><LogOut size={17}/> Sign out</button></div><div className="card settings-card"><span className="icon-square peach"><Trash2 size={22}/></span><h2>Delete saved data</h2><p className="setting-explainer">Remove saved analysis summaries and learning progress. This action doesn't delete your Supabase authentication account.</p><button className="button button-danger" onClick={erase} disabled={working}><Trash2 size={16}/> Delete my JobPulse data</button></div></div>:<EmptyState icon={<LockKeyhole size={28}/>} title="You’re exploring as a guest" description="Create an account to save reports and sync your learning progress. Guest analysis remains available." action={<Link href="/login" className="button button-primary">Sign in or register <ArrowRight size={16}/></Link>}/>}
 {message&&<div role="status" className="alert-success"><CheckCircle2 size={17}/>{message}</div>}
 <div className="card privacy-section"><ShieldCheck size={21}/><div><h3>What we save—and what we don't</h3><p>Uploaded PDF bytes and raw resume text are processed transiently and aren't written to our database. Only a derived skill summary is stored if you explicitly click Save. Role selection and unsynced progress may be stored locally on your device.</p></div></div>
 </>
}
