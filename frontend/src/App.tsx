import { useEffect, useRef, useState, type ReactNode, type CSSProperties, type FormEvent } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  Activity, ArrowRight, ArrowUpRight, BarChart3, BookOpen, Check, CheckCircle2,
  ChevronDown, ChevronRight, CircleAlert, Compass, Download, FileCheck2, FileText,
  FolderOpen, GraduationCap, LayoutDashboard, LoaderCircle, LockKeyhole, LogOut,
  Menu, ShieldCheck, Sparkles, Target, TrendingUp, UploadCloud, UserRound,
  WandSparkles, X, Zap
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { API_URL, ROLES, analyzeResume, demoMarket, downloadBlob, getMarket, getReport, supabase } from './api'
import type { Analysis, Market, SavedAnalysis } from './api'

type View = 'overview' | 'resume' | 'market' | 'roadmap' | 'reports' | 'account'
type Notice = { message: string; tone: 'success' | 'error' | 'info' }
const nav: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'resume', label: 'Resume Studio', icon: FileText },
  { id: 'market', label: 'Market Intelligence', icon: BarChart3 },
  { id: 'roadmap', label: 'My Roadmap', icon: Compass },
  { id: 'reports', label: 'Reports & History', icon: FolderOpen },
  { id: 'account', label: 'My Account', icon: UserRound },
]
const prettyMonth = (month: string) => new Date(month + '-01T00:00:00Z').toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
const prettyDate = (date: string) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
function IconBadge({ children, kind = 'lavender' }: { children: ReactNode; kind?: 'lavender' | 'mint' | 'peach' | 'blue' }) {
  return <span className={'icon-badge icon-badge-' + kind}>{children}</span>
}
function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="section-head"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{description && <p>{description}</p>}</div>{action && <div className="section-action">{action}</div>}</div>
}
function MarketGraph({ market, small = false }: { market: Market; small?: boolean }) {
  const series = [
    ...market.history.map((d, i) => ({ label: d.month, actual: d.postings, future: i === market.history.length-1 ? d.postings : null })),
    ...market.forecast.map(d => ({ label: d.month, actual: null, future: d.postings })),
  ]
  return <div className={'graph-wrap ' + (small ? 'graph-small' : '')} role="img" aria-label="Synthetic historical posting counts with illustrative projected values">
    <ResponsiveContainer width="100%" height="100%"><AreaChart data={series} margin={{ top: 12, right: 7, left: -22, bottom: 0 }}>
      <defs><linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7666ef" stopOpacity={0.20}/><stop offset="100%" stopColor="#7666ef" stopOpacity={0}/></linearGradient><linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#35bba4" stopOpacity={0.16}/><stop offset="100%" stopColor="#35bba4" stopOpacity={0}/></linearGradient></defs>
      <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="#e9edf5"/>
      <XAxis dataKey="label" tickFormatter={prettyMonth} interval={small?4:3} tickLine={false} axisLine={false} tick={{fill:'#9aa2b5',fontSize:11}} dy={8}/>
      <YAxis tickLine={false} axisLine={false} tick={{fill:'#9aa2b5',fontSize:11}}/>
      <Tooltip contentStyle={{background:'#fff',border:'1px solid #e9eaf4',borderRadius:14,boxShadow:'0 14px 32px rgba(30,35,65,.12)',fontSize:12}}/>
      <Area name="Synthetic history" type="monotone" dataKey="actual" stroke="#7767ed" strokeWidth={3} fill="url(#historyGradient)" activeDot={{r:5,stroke:'#fff',strokeWidth:2}}/>
      <Area name="Illustrative projection" type="monotone" dataKey="future" stroke="#33b9a1" strokeDasharray="7 5" strokeWidth={3} fill="url(#forecastGradient)" activeDot={{r:5,stroke:'#fff',strokeWidth:2}}/>
    </AreaChart></ResponsiveContainer>
  </div>
}
function StatCard({ icon, label, value, sub, color = 'lavender' }: { icon: ReactNode; label: string; value: string | number; sub: string; color?: 'lavender' | 'mint' | 'peach' | 'blue' }) {
  return <div className="stat-card"><div className="stat-top"><IconBadge kind={color}>{icon}</IconBadge><ArrowUpRight size={16} className="muted-icon"/></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-sub">{sub}</div></div>
}
function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><span className="empty-icon">{icon}</span><h3>{title}</h3><p>{description}</p>{action && <div className="empty-action">{action}</div>}</div>
}
function Chip({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral'|'green'|'purple' }) {
  return <span className={'chip chip-' + tone}>{children}</span>
}
function AnalysisSummary({ data, onDownload, onSave, busy, hasUser }: { data: Analysis; onDownload: ()=>void; onSave: ()=>void; busy: boolean; hasUser: boolean }) {
  return <div className="analysis-results">
    <div className="results-summary"><div className="score-ring" style={{'--value':data.score+'%'} as CSSProperties}><span className="score-inner"><b>{data.score}%</b><small>alignment</small></span></div><div className="results-summary-text"><div className="eyebrow">RESUME INTELLIGENCE</div><h3>Your skills snapshot is ready</h3><p>We found <strong>{data.matched.length} of {data.matched.length+data.missing.length}</strong> target-role keywords for <strong>{data.role}</strong>. This is a keyword match, not a measured employability score.</p><div className="results-buttons"><button className="btn btn-primary" onClick={onDownload} disabled={busy}><Download size={16}/> Download report</button><button className="btn btn-secondary" onClick={onSave} disabled={busy}><FolderOpen size={16}/> {hasUser?'Save analysis':'Sign in to save'}</button></div></div></div>
    <div className="results-grid"><div className="result-panel"><div className="result-panel-head"><span className="result-indicator green"><Check size={14}/></span><h4>Skills detected</h4><span className="count-pill">{data.matched.length}</span></div><div className="skills-cloud">{data.matched.length?data.matched.map(s=><Chip tone="green" key={s}>{s}</Chip>):<span className="muted">No target-role keywords detected</span>}</div></div><div className="result-panel"><div className="result-panel-head"><span className="result-indicator purple"><Target size={14}/></span><h4>Growth opportunities</h4><span className="count-pill">{data.missing.length}</span></div><div className="skills-cloud">{data.missing.length?data.missing.map(s=><Chip tone="purple" key={s}>{s}</Chip>):<span className="muted">All checklist keywords detected!</span>}</div></div></div>
  </div>
}
export default function App() {
  const [view, setView] = useState<View>('overview')
  const [mobileNav, setMobileNav] = useState(false)
  const [role, setRole] = useState('Data Scientist')
  const [months, setMonths] = useState(6)
  const [market, setMarket] = useState<Market>(()=>demoMarket('Data Scientist'))
  const [marketLoading, setMarketLoading] = useState(false)
  const [apiOffline, setApiOffline] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis|null>(null)
  const [resumeText, setResumeText] = useState('')
  const [resumeFile, setResumeFile] = useState<File|null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice|null>(null)
  const [user, setUser] = useState<User|null>(null)
  const [history, setHistory] = useState<SavedAnalysis[]>([])
  const [authMode, setAuthMode] = useState<'signin'|'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const matched = analysis?.role===role?analysis:null
  const roleMeta = ROLES.find(r=>r.name===role)||ROLES[0]
  const displayName = user?.email?.split('@')[0]||'Guest workspace'
  const setPage = (page:View) => {setView(page);setMobileNav(false);setNotice(null);window.scrollTo({top:0,behavior:'smooth'})}
  useEffect(()=>{
    let active=true;setMarketLoading(true);setMarket(demoMarket(role,months))
    getMarket(role,months).then(data=>{if(active){setMarket(data);setApiOffline(false)}}).catch(()=>{if(active){setMarket(demoMarket(role,months));setApiOffline(true)}}).finally(()=>{if(active)setMarketLoading(false)})
    return ()=>{active=false}
  },[role,months])
  useEffect(()=>{
    if(!supabase)return
    supabase.auth.getUser().then(({data})=>setUser(data.user)).catch(()=>setUser(null))
    const {data}=supabase.auth.onAuthStateChange((_event,session)=>setUser(session?.user??null))
    return ()=>data.subscription.unsubscribe()
  },[])
  const loadHistory=async()=>{
    if(!supabase||!user)return
    const {data,error}=await supabase.from('resume_analyses').select('id,target_role,detected_skills,missing_skills,readiness_score,recommendations,created_at').order('created_at',{ascending:false}).limit(30)
    if(error)throw error
    setHistory((data||[]) as SavedAnalysis[])
  }
  useEffect(()=>{
    if(!supabase||!user){setHistory([]);return}
    const client=supabase;let active=true
    client.from('resume_analyses').select('id,target_role,detected_skills,missing_skills,readiness_score,recommendations,created_at').order('created_at',{ascending:false}).limit(30).then(({data,error})=>{if(active&&!error)setHistory((data||[]) as SavedAnalysis[])})
    return ()=>{active=false}
  },[user])
  const runAnalysis=async()=>{
    if(!resumeFile&&resumeText.trim().length<25){setNotice({tone:'error',message:'Upload a PDF or enter at least 25 characters of resume text.'});return}
    if(resumeFile&&resumeFile.size>5*1024*1024){setNotice({tone:'error',message:'Your PDF must be smaller than 5 MB.'});return}
    setBusy(true);setNotice(null)
    try{setAnalysis(await analyzeResume(role,resumeText,resumeFile));setNotice({tone:'success',message:'Analysis complete! Your skills snapshot is ready below.'})}
    catch(e){setNotice({tone:'error',message:e instanceof Error?e.message:'The resume service is unavailable.'})}
    finally{setBusy(false)}
  }
  const download=async(data:Analysis)=>{
    setBusy(true)
    try{downloadBlob(await getReport(data),'JobPulse-Career-Report.pdf')}
    catch(e){setNotice({tone:'error',message:e instanceof Error?e.message:'Report download failed.'})}
    finally{setBusy(false)}
  }
  const save=async()=>{
    if(!matched){setPage('resume');return}
    if(!user||!supabase){setPage('account');setNotice({tone:'info',message:'Sign in to save your career analysis securely.'});return}
    setBusy(true)
    try{
      const {error}=await supabase.from('resume_analyses').insert({user_id:user.id,target_role:matched.role,detected_skills:matched.skills,missing_skills:matched.missing,readiness_score:matched.score,recommendations:matched.recommendations})
      if(error)throw error
      await loadHistory();setNotice({tone:'success',message:'Saved to your private history. The raw resume was not stored.'})
    }catch{setNotice({tone:'error',message:'Could not save analysis. Check your connection and try again.'})}
    finally{setBusy(false)}
  }
  const authSubmit=async(e:FormEvent)=>{
    e.preventDefault();if(!supabase)return;setBusy(true);setNotice(null)
    try{
      if(authMode==='signup'){
        const {error}=await supabase.auth.signUp({email,password});if(error)throw error
        setNotice({tone:'success',message:'Check your email for the verification link, if required. Then sign in.'})
      }else{
        const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error
        setPassword('');setNotice({tone:'success',message:'Welcome back! Your private career history is ready.'})
      }
    }catch(e){setNotice({tone:'error',message:e instanceof Error?e.message:'Authentication failed.'})}
    finally{setBusy(false)}
  }
  const savedToAnalysis=(saved:SavedAnalysis):Analysis=>({
    role:saved.target_role,skills:saved.detected_skills||[],missing:saved.missing_skills||[],score:saved.readiness_score,recommendations:saved.recommendations||[],
    matched:(ROLES.find(r=>r.name===saved.target_role)?.skills||[]).filter(s=>(saved.detected_skills||[]).includes(s)),
  })
  const currentName=nav.find(n=>n.id===view)?.label||'Overview'
  return <div className="app-shell">
    {mobileNav&&<button className="sidebar-scrim" aria-label="Close navigation" onClick={()=>setMobileNav(false)}/>}
    <aside className={'sidebar '+(mobileNav?'sidebar-open':'')}>
      <button className="brand" onClick={()=>setPage('overview')}><span className="brand-symbol"><Activity size={26} strokeWidth={2.6}/></span><span className="brand-copy"><strong>jobpulse<span className="brand-dot">.</span></strong><small>CAREER INTELLIGENCE</small></span></button>
      <div className="sidebar-section-label">WORKSPACE</div><nav className="nav-items" aria-label="Workspace">{nav.slice(0,4).map(n=>{const Icon=n.icon;return <button key={n.id} className={'nav-item '+(view===n.id?'active':'')} onClick={()=>setPage(n.id)}><Icon size={19}/><span>{n.label}</span>{view===n.id&&<i className="nav-dot"/>}</button>})}</nav>
      <div className="sidebar-section-label sidebar-second-label">YOUR SPACE</div><nav className="nav-items" aria-label="Your space">{nav.slice(4).map(n=>{const Icon=n.icon;return <button key={n.id} className={'nav-item '+(view===n.id?'active':'')} onClick={()=>setPage(n.id)}><Icon size={19}/><span>{n.label}</span>{view===n.id&&<i className="nav-dot"/>}</button>})}</nav>
      <div className="sidebar-fill"/><div className="sidebar-promo"><span className="promo-icon"><Sparkles size={17}/></span><strong>Clarity for your next chapter.</strong><p>Discover strengths. Build the skills that matter for your goals.</p><button onClick={()=>setPage('resume')}>Explore Resume Studio <ArrowRight size={15}/></button></div>
      <button className="sidebar-profile" onClick={()=>setPage('account')}><span className="avatar">{displayName.slice(0,2).toUpperCase()}</span><span className="profile-text"><strong>{displayName}</strong><small>{user?'Your private workspace':'Sign in to sync'}</small></span><ChevronRight size={16}/></button>
    </aside>
    <div className="main-area"><header className="topbar"><div className="topbar-left"><button className="mobile-menu" aria-label="Open navigation" onClick={()=>setMobileNav(true)}><Menu size={21}/></button><span className="breadcrumb-home">Workspace</span><ChevronRight className="breadcrumb-chevron" size={14}/><strong>{currentName}</strong></div><div className="topbar-right"><div className="target-select-wrap"><Target size={16}/><span className="target-text">Career goal</span><select aria-label="Target career" value={role} onChange={e=>setRole(e.target.value)}>{ROLES.map(r=><option key={r.name}>{r.name}</option>)}</select><ChevronDown className="target-chevron" size={14}/></div><button className="topbar-avatar" aria-label="Your account" onClick={()=>setPage('account')}><UserRound size={19}/></button></div></header>
      <main className="content">
        {notice&&<div className={'notice notice-'+notice.tone} role="status">{notice.tone==='error'?<CircleAlert size={18}/>:<CheckCircle2 size={18}/>}<p>{notice.message}</p><button aria-label="Dismiss" onClick={()=>setNotice(null)}><X size={16}/></button></div>}
        {apiOffline&&<div className="api-banner"><CircleAlert size={16}/><span>Python API unavailable or waking. Charts show labelled synthetic preview values; resume processing requires the API.</span><button onClick={()=>getMarket(role,months).then(d=>{setMarket(d);setApiOffline(false)}).catch(()=>setApiOffline(true))}>Retry</button></div>}
        {view==='overview'&&<>
          <div className="page-intro"><div><div className="eyebrow">YOUR CAREER COMPASS</div><h1>Shape a career that’s<br/><span className="gradient-word">one step ahead.</span></h1><p>Understand your strengths, explore career trends and turn your goals into an actionable plan.</p></div><span className="intro-date"><Zap size={15}/> JobPulse Insight Hub</span></div>
          <div className="hero-panel"><div className="hero-content"><span className="hero-pill"><Sparkles size={13}/> YOUR NEXT MOVE STARTS HERE</span><h2>Less guessing.<br/>More growing.</h2><p>Upload your resume and discover the skills you have, the gaps to bridge, and where to focus next.</p><button className="hero-action" onClick={()=>setPage('resume')}>Analyze my resume <ArrowUpRight size={18}/></button></div><div className="hero-art" aria-hidden="true"><i className="orbit orbit-one"/><i className="orbit orbit-two"/><div className="hero-orb"><Activity size={49}/></div><div className="floating-badge floating-badge-top"><span><TrendingUp size={17}/></span><div><small>Discover your</small><b>career potential</b></div></div><div className="floating-badge floating-badge-bottom"><span><Target size={16}/></span><div><small>Personalized</small><b>learning path</b></div></div></div></div>
          <div className="stats-grid"><StatCard icon={<Target size={20}/>} label="Target career" value={role} sub="Your selected career track"/><StatCard color="mint" icon={<BarChart3 size={20}/>} label="Illustrative market index" value={market.current.toLocaleString()} sub="Synthetic sample observations"/><StatCard color="blue" icon={<TrendingUp size={20}/>} label="Demo trend change" value={(market.growth_percent>0?'+':'')+market.growth_percent+'%'} sub="In the synthetic data series"/><StatCard color="peach" icon={<FileCheck2 size={20}/>} label="Resume skill alignment" value={matched?matched.score+'%':'Not scanned'} sub={matched?'Checklist keyword alignment':'Run a free resume analysis'}/></div>
          <div className="overview-grid"><section className="surface-card chart-card"><div className="card-heading"><div><span className="mini-eyebrow">MARKET INTELLIGENCE</span><h3>Career trend explorer</h3><p>Illustrative synthetic series · {role}</p></div><button className="text-action" onClick={()=>setPage('market')}>Explore <ArrowUpRight size={16}/></button></div><div className="chart-legend"><span><i className="legend-dot violet"/> Synthetic history</span><span><i className="legend-dot teal"/> Illustrative forecast</span></div><MarketGraph market={market} small/><div className="card-foot"><span><CircleAlert size={14}/> Not observed hiring statistics</span><span>{marketLoading?'Refreshing…':'Demo dataset'}</span></div></section><section className="surface-card skills-card"><div className="card-heading"><div><span className="mini-eyebrow">CAREER ESSENTIALS</span><h3>Your skills checklist</h3><p>Core topics for {role}</p></div><IconBadge><GraduationCap size={19}/></IconBadge></div><div className="essential-list">{roleMeta.skills.slice(0,5).map((s,i)=><div className="essential-row" key={s}><span className="essential-number">0{i+1}</span><div className="essential-name">{s}<div className="essential-track"><span style={{width:(90-i*13)+'%'}}/></div></div><span className="essential-tag">Focus</span></div>)}</div><button className="card-bottom-button" onClick={()=>setPage('roadmap')}>View learning roadmap <ArrowRight size={16}/></button></section></div>
          <div className="bottom-banner"><span className="bottom-banner-icon"><ShieldCheck size={20}/></span><div><strong>Career intelligence with context</strong><p>Built-in job counts are synthetic. Real forecasting needs sourced, dated vacancies and validation.</p></div><button onClick={()=>setPage('market')}>Understand the data <ArrowRight size={16}/></button></div>
        </>}
        {view==='market'&&<><SectionHeading eyebrow="INTELLIGENCE / FORECASTING" title="Explore what’s next." description="Understand skill-demand forecasting through a transparent, synthetic demonstration dataset." action={<Chip tone="purple"><Sparkles size={13}/> Data science demo</Chip>}/><div className="control-strip"><div><label htmlFor="market-role">Explore career</label><select id="market-role" value={role} onChange={e=>setRole(e.target.value)}>{ROLES.map(r=><option key={r.name}>{r.name}</option>)}</select></div><div><label htmlFor="forecast-months">Forecast window</label><select id="forecast-months" value={months} onChange={e=>setMonths(Number(e.target.value))}><option value={3}>3 months</option><option value={6}>6 months</option><option value={9}>9 months</option><option value={12}>12 months</option></select></div><div className="control-spacer"/><Chip><CircleAlert size={13}/> Synthetic dataset</Chip></div><div className="stats-grid"><StatCard icon={<BarChart3 size={20}/>} label="Latest sample index" value={market.current} sub="Synthetic posting count"/><StatCard color="mint" icon={<TrendingUp size={20}/>} label="Illustrative projection" value={market.projected} sub={'Example '+months+'-month result'}/><StatCard color="blue" icon={<Activity size={20}/>} label="Synthetic growth" value={market.growth_percent+'%'} sub="Across the demo series"/><StatCard color="peach" icon={<BookOpen size={20}/>} label="Essential role skills" value={roleMeta.skill_count} sub="Skills in curated checklist"/></div><section className="surface-card full-chart-card"><div className="card-heading"><div><span className="mini-eyebrow">TREND MODELLING</span><h3>{role} — illustrative activity</h3><p>18 months of sample history + {months} months of extrapolated values</p></div><div className="chart-legend"><span><i className="legend-dot violet"/> History</span><span><i className="legend-dot teal"/> Forecast</span></div></div><MarketGraph market={market}/><div className="chart-note"><CircleAlert size={16}/><span>Generated examples, not real employer posting counts. Ridge regression trend extrapolation is not a validated hiring prediction.</span></div></section><div className="two-col-grid"><section className="surface-card padded-card"><span className="mini-eyebrow">SKILL LANDSCAPE</span><h3>Skills to explore</h3><p className="card-sub">A curated learning checklist for your selected role.</p><div className="skills-cloud skill-list-spaced">{roleMeta.skills.map(s=><Chip key={s}>{s}</Chip>)}</div></section><section className="surface-card padded-card method-card"><IconBadge kind="mint"><ShieldCheck size={20}/></IconBadge><h3>How this forecast works</h3><p>We generate a sample monthly series, fit a Ridge regression trend and extrapolate the next {months} periods. Real-world forecasts require historical data and backtesting.</p><a href={API_URL+'/api/docs'} target="_blank" rel="noreferrer">Explore API documentation <ArrowUpRight size={16}/></a></section></div></>}
        {view==='resume'&&<><SectionHeading eyebrow="RESUME STUDIO / INTELLIGENCE" title="Make your experience count." description="Turn your resume into a skills snapshot and a focused career plan." action={<Chip tone="green"><ShieldCheck size={14}/> Private by default</Chip>}/><div className="resume-grid"><section className="surface-card upload-panel"><div className="upload-head"><IconBadge><UploadCloud size={23}/></IconBadge><div><h3>Analyze your resume</h3><p>Upload a resume or paste its text to get started.</p></div></div><input type="file" accept=".pdf,application/pdf" className="sr-only" ref={fileInput} onChange={e=>setResumeFile(e.target.files?.[0]||null)}/><button className={'file-drop '+(resumeFile?'file-chosen':'')} onClick={()=>fileInput.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files?.[0];if(f?.type==='application/pdf'&&f.size<=5*1024*1024)setResumeFile(f);else setNotice({tone:'error',message:'Drop a PDF smaller than 5 MB.'})}}>{resumeFile?<><FileCheck2 size={29}/><strong>{resumeFile.name}</strong><span>{(resumeFile.size/1024).toFixed(0)} KB · Click to replace</span></>:<><UploadCloud size={32}/><strong>Click to upload, or drag and drop</strong><span>PDF only · Up to 5 MB · Max 12 pages</span></>}</button>{resumeFile&&<button className="remove-file" onClick={()=>{setResumeFile(null);if(fileInput.current)fileInput.current.value=''}}>Remove file <X size={13}/></button>}<div className="or-divider"><span>OR PASTE RESUME TEXT</span></div><label className="form-label" htmlFor="resume-copy">Your experience</label><textarea id="resume-copy" value={resumeText} disabled={Boolean(resumeFile)} onChange={e=>setResumeText(e.target.value)} rows={6} maxLength={100000} placeholder="I built a machine learning project using Python, SQL, Pandas and Scikit-learn…"/><label className="form-label" htmlFor="resume-goal">Career you're aiming for</label><select className="form-select" id="resume-goal" value={role} onChange={e=>setRole(e.target.value)}>{ROLES.map(r=><option key={r.name}>{r.name}</option>)}</select><button className="btn btn-primary btn-wide analyze-button" onClick={runAnalysis} disabled={busy}>{busy?<LoaderCircle size={18} className="spin"/>:<WandSparkles size={18}/>} {busy?'Analyzing your skills…':'Analyze resume'} <ArrowRight size={17}/></button><p className="privacy-caption"><LockKeyhole size={13}/> PDF contents are processed transiently, not stored.</p></section><div className="resume-info"><div className="resume-gradient-card"><span className="mini-eyebrow">HOW IT WORKS</span><h3>From resume<br/>to roadmap.</h3><p>Career preparation starts with knowing where you stand.</p><div className="mini-steps"><div><span>01</span><strong>Share your experience</strong></div><div><span>02</span><strong>Find matched and missing skills</strong></div><div><span>03</span><strong>Build a focused learning plan</strong></div></div></div><div className="surface-card help-card"><ShieldCheck size={21}/><div><strong>Transparent by design</strong><p>Our scanner detects explicit keywords. It cannot verify proficiency or predict hiring outcomes.</p></div></div></div></div>{matched&&<section className="surface-card results-wrapper"><AnalysisSummary data={matched} onDownload={()=>download(matched)} onSave={save} busy={busy} hasUser={Boolean(user)}/></section>}</>}
        {view==='roadmap'&&<><SectionHeading eyebrow="PERSONAL GROWTH / ROADMAP" title="Your path, made clearer." description="Prioritize the skills that move you closer to your target role."/>{matched?<><div className="roadmap-overview"><div><div className="eyebrow">YOUR PERSONAL LEARNING PLAN</div><h3>{role} growth roadmap</h3><p>Based on the skills mentioned in your latest resume analysis.</p></div><div className="roadmap-score"><b>{matched.score}%</b><span>Keyword alignment</span></div></div><div className="roadmap-list">{matched.recommendations.length?matched.recommendations.map((step,i)=><article className="roadmap-step" key={step.skill}><span className="roadmap-index">{String(i+1).padStart(2,'0')}</span><div className="roadmap-main"><div className="roadmap-step-top"><div><span className="mini-eyebrow">LEARNING PRIORITY {i+1}</span><h3>{step.skill}</h3></div><Chip tone={i===0?'purple':'neutral'}>{i===0?'Start here':'Next up'}</Chip></div><p>Learn fundamentals, build a hands-on project and document your progress in your portfolio.</p>{step.url?<a className="learn-link" href={step.url} target="_blank" rel="noreferrer">{step.title} <ArrowUpRight size={16}/></a>:<span className="muted">Explore the official documentation and a practice tutorial.</span>}</div><IconBadge kind={i%2?'mint':'lavender'}><BookOpen size={20}/></IconBadge></article>):<EmptyState icon={<CheckCircle2 size={28}/>} title="All checklist keywords detected" description="Build projects, verify your proficiency and showcase evidence of your skills."/>}</div></>:<EmptyState icon={<Compass size={30}/>} title="Your roadmap begins with a resume" description="Analyze your resume against a target role to discover your personalized learning priorities." action={<button className="btn btn-primary" onClick={()=>setPage('resume')}>Open Resume Studio <ArrowRight size={16}/></button>}/>}</>}
        {view==='reports'&&<><SectionHeading eyebrow="YOUR WORKSPACE / REPORTS" title="A record of your progress." description="Save your skill-gap analyses and revisit your learning priorities."/>{matched&&<div className="latest-report surface-card"><IconBadge kind="mint"><FileCheck2 size={22}/></IconBadge><div><strong>Latest analysis · {matched.role}</strong><p>{matched.score}% keyword alignment · {matched.missing.length} gaps</p></div><button className="btn btn-secondary" onClick={()=>download(matched)} disabled={busy}><Download size={16}/> PDF report</button><button className="btn btn-primary" onClick={save} disabled={busy}>{user?'Save report':'Sign in to save'}</button></div>}{user?(history.length?<section className="surface-card history-card"><div className="card-heading"><div><h3>Saved analyses</h3><p>Only your records appear here, protected by row-level security.</p></div><Chip tone="green">{history.length} saved</Chip></div><div className="history-list">{history.map(item=><div className="history-row" key={item.id}><span className="history-file"><FileText size={20}/></span><div className="history-meta"><strong>{item.target_role}</strong><small>{prettyDate(item.created_at)} · {item.missing_skills.length} learning gaps</small></div><span className="history-score">{item.readiness_score}% match</span><button className="history-download" aria-label={'Download '+item.target_role+' report'} onClick={()=>download(savedToAnalysis(item))} disabled={busy}><Download size={18}/></button></div>)}</div></section>:<EmptyState icon={<FolderOpen size={29}/>} title="No saved reports yet" description="Analyze a resume and choose Save analysis to start tracking your skills." action={<button className="btn btn-primary" onClick={()=>setPage('resume')}>Analyze a resume <ArrowRight size={16}/></button>}/>):<EmptyState icon={<LockKeyhole size={28}/>} title="Sign in to view saved reports" description="Your career history is stored in a private workspace. You can still download PDF reports without an account." action={<button className="btn btn-primary" onClick={()=>setPage('account')}>Sign in or register <ArrowRight size={16}/></button>}/>}</>}
        {view==='account'&&<><SectionHeading eyebrow="YOUR ACCOUNT / CAREER WORKSPACE" title="Make it yours." description="Sync your skills history across sessions with a private account."/><div className="account-layout"><section className="surface-card account-form">{user?<><span className="account-signed-avatar"><UserRound size={28}/></span><h3>You're signed in</h3><p>Good to see you, <strong>{user.email}</strong>.</p><div className="account-info-row"><ShieldCheck size={18}/><span>Saved analyses are restricted to your own account.</span></div><div className="account-info-row"><FolderOpen size={18}/><span>{history.length} saved analyses in your history.</span></div><button className="btn btn-primary btn-wide" onClick={()=>setPage('reports')}>View my reports <ArrowRight size={17}/></button><button className="btn btn-outline btn-wide" onClick={async()=>{await supabase?.auth.signOut();setUser(null);setHistory([]);setNotice({tone:'info',message:'You have signed out.'})}}><LogOut size={17}/> Sign out</button></>:<><span className="account-signed-avatar"><LockKeyhole size={26}/></span><h3>{authMode==='signin'?'Welcome back':'Join JobPulse'}</h3><p>{authMode==='signin'?'Sign in to access your career workspace.':'Create a free account to save your learning progress.'}</p><div className="auth-tabs"><button className={authMode==='signin'?'selected':''} onClick={()=>setAuthMode('signin')}>Sign in</button><button className={authMode==='signup'?'selected':''} onClick={()=>setAuthMode('signup')}>Create account</button></div><form onSubmit={authSubmit}><label className="form-label" htmlFor="auth-email">Email address</label><input id="auth-email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/><label className="form-label" htmlFor="auth-password">Password</label><input id="auth-password" type="password" minLength={6} autoComplete={authMode==='signin'?'current-password':'new-password'} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters"/><button className="btn btn-primary btn-wide" type="submit" disabled={busy||!supabase}>{busy?<LoaderCircle size={17} className="spin"/>:<LockKeyhole size={17}/>} {authMode==='signin'?'Sign in securely':'Create free account'} <ArrowRight size={17}/></button></form>{!supabase&&<p className="configuration-note"><CircleAlert size={16}/> Supabase authentication has not been configured.</p>}<p className="auth-foot">Raw resume files are never stored in your account.</p></>}</section><div className="account-benefits"><div className="benefit-title"><Sparkles size={19}/><h3>Your career, organized.</h3></div><p>Build momentum with a workspace designed around you.</p><div className="benefit-item"><IconBadge><FolderOpen size={20}/></IconBadge><div><strong>Private skill-gap history</strong><span>Access reports you intentionally save.</span></div></div><div className="benefit-item"><IconBadge kind="mint"><Compass size={20}/></IconBadge><div><strong>Career clarity</strong><span>Focus on skills relevant to your goal.</span></div></div><div className="benefit-item"><IconBadge kind="peach"><LockKeyhole size={20}/></IconBadge><div><strong>Privacy first</strong><span>Original resume PDFs are not retained.</span></div></div><p className="demo-disclaimer">JobPulse is an educational prototype, not a hiring decision service.</p></div></div></>}
      </main><footer className="footer"><span>© 2026 JobPulse by CareerCatalysts</span><span>Designed for progress, powered by perspective. <span className="footer-accent">✦</span></span></footer>
    </div>
  </div>
}