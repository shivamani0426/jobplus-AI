'use client'
import {useEffect,useState} from 'react'
import {Activity,ArrowRight,BookOpen,ChartNoAxesCombined,Info,RefreshCw,Sparkles,TrendingUp} from 'lucide-react'
import Link from 'next/link'
import {getMarket} from '@/lib/api'
import {useJobPulse} from './providers'
import {Metric,Pill,PageHeading,DemoNote,SectionTitle} from './ui'
import {MarketChart} from './market-chart'
import type {Market} from '@/lib/types'
import {roleById} from '@/lib/catalog'
export function MarketModule({overview=false}:{overview?:boolean}){
 const {role}=useJobPulse();const [horizon,setHorizon]=useState(6)
 const [market,setMarket]=useState<Market|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('')
 useEffect(()=>{let active=true;setBusy(true);setError('');setMarket(null)
 getMarket(role,horizon).then(x=>{if(active)setMarket(x)}).catch(x=>{if(active)setError(x.message||'Unable to retrieve data')}).finally(()=>{if(active)setBusy(false)})
 return()=>{active=false}},[role,horizon])
 if(overview)return <div className="dashboard-market card"><div className="card-head"><div><span className="eyebrow">EXPLORE THE NUMBERS</span><h3>Career demand, explained</h3><p>{roleById(role).title} · Synthetic series</p></div><Link href="/app/market" className="text-link">View trends <ArrowRight size={16}/></Link></div>
 {busy&&<div className="chart-loading">Loading sample chart…</div>}{error&&<div className="inline-error">{error} <button onClick={()=>setHorizon(horizon===6?5:6)}>Retry</button></div>}{market&&<><div className="chart-legend"><span><i className="legend-purple"/> Synthetic history</span><span><i className="legend-mint"/> Demo projection</span></div><MarketChart compact market={market}/></>}
 <DemoNote compact/></div>
 return <>
  <PageHeading eyebrow="MARKET INTELLIGENCE" title="Understand the direction. Not just the numbers." subtitle="Explore a transparent forecasting pipeline. This prototype uses labelled synthetic observations while real historical job-market data is being sourced." action={<Pill tone="warning"><Info size={14}/> Prototype data</Pill>}/>
  <div className="market-filter card"><div><label htmlFor="horizon">Projection window</label><select id="horizon" value={horizon} onChange={e=>setHorizon(Number(e.target.value))}><option value="3">3 months</option><option value="6">6 months</option><option value="9">9 months</option><option value="12">12 months</option></select></div><div><label>Career track</label><div className="filter-static">{roleById(role).title}</div></div><span className="spacer"/><Pill>Ridge regression demo</Pill></div>
  {busy&&<div className="card page-loading"><RefreshCw size={22} className="spin"/> Preparing chart…</div>}
  {error&&<div className="inline-error"><Info size={16}/>{error}. The Python service may be waking up.</div>}
  {market&&<><div className="metric-grid market-metrics"><Metric title="Latest sample count" value={market.latest_sample_count.toLocaleString()} detail="Not real postings" icon={<ChartNoAxesCombined size={19}/>} tone="violet"/><Metric title="Sample series growth" value={`${market.sample_growth_pct>0?'+':''}${market.sample_growth_pct}%`} detail="In synthetic history" icon={<TrendingUp size={19}/>} tone="mint"/><Metric title="Illustrative future value" value={market.sample_projection.toLocaleString()} detail={`${horizon}-month extrapolation`} icon={<Activity size={19}/>} tone="blue"/><Metric title="Data quality status" value="DEMO" detail="Requires real source data" icon={<Info size={19}/>} tone="peach"/></div>
   <div className="card market-big"><div className="card-head"><div><span className="eyebrow">EXPLORATORY FORECAST</span><h3>{market.role} sample trend</h3><p>18 generated months and {horizon} extrapolated months</p></div><Pill tone="violet">Illustrative only</Pill></div><div className="chart-legend"><span><i className="legend-purple"/> Synthetic history</span><span><i className="legend-mint"/> Projection</span></div><MarketChart market={market}/><DemoNote/></div>
  </>}
  <div className="two-col"><div className="card info-card"><span className="icon-square mint"><BookOpen size={22}/></span><h3>What we’re modelling</h3><p>A sample time-series is fitted with Ridge regression. The example demonstrates how forecasting could work once an ethically collected, dated job-posting dataset is available.</p><Link href="/app/methodology" className="text-link">Read methodology <ArrowRight size={16}/></Link></div><div className="card info-card"><span className="icon-square violet"><Sparkles size={22}/></span><h3>What production needs</h3><p>Named data sources, deduplicated vacancies, documented collection dates, time-based validation, drift checks and a confidence interval before any real demand claims.</p><Link href="/app/methodology" className="text-link">View model safeguards <ArrowRight size={16}/></Link></div></div>
 </>
}
