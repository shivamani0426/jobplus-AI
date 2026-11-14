'use client'
import {AreaChart,Area,ResponsiveContainer,CartesianGrid,XAxis,YAxis,Tooltip} from 'recharts'
import type {Market} from '@/lib/types'
import {formatMonth} from '@/lib/catalog'
export function MarketChart({market,compact=false}:{market:Market;compact?:boolean}){
 const data=[...market.history.map((x,i)=>({month:x.month,history:x.count,predicted:i===market.history.length-1?x.count:null})),...market.forecast.map(x=>({month:x.month,history:null,predicted:x.count}))]
 return <div className={'market-graph '+(compact?'market-graph-compact':'')} role="img" aria-label="Synthetic sample time series with an illustrative Ridge regression forecast">
  <ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{top:15,right:6,bottom:0,left:-22}}>
    <defs><linearGradient id="historygradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6658DF" stopOpacity={.23}/><stop offset="100%" stopColor="#6658DF" stopOpacity={0}/></linearGradient><linearGradient id="projectiongradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1BAF9A" stopOpacity={.15}/><stop offset="100%" stopColor="#1BAF9A" stopOpacity={0}/></linearGradient></defs>
    <CartesianGrid strokeDasharray="3 6" stroke="#EDEFFA" vertical={false}/>
    <XAxis dataKey="month" axisLine={false} tickLine={false} tickFormatter={formatMonth} interval={compact?5:3} tick={{fontSize:11,fill:'#8A91A4'}} dy={9}/>
    <YAxis axisLine={false} tickLine={false} tick={{fontSize:11,fill:'#8A91A4'}}/>
    <Tooltip contentStyle={{border:'1px solid #E7E9F2',borderRadius:14,boxShadow:'0 14px 35px #202F4A12',fontSize:12}} labelFormatter={val=>formatMonth(String(val))}/>
    <Area type="monotone" dataKey="history" name="Synthetic sample" connectNulls={false} stroke="#6658DF" strokeWidth={2.8} fill="url(#historygradient)" activeDot={{r:5}}/>
    <Area type="monotone" dataKey="predicted" name="Illustrative projection" connectNulls={false} stroke="#1BAF9A" strokeDasharray="7 5" strokeWidth={2.8} fill="url(#projectiongradient)" activeDot={{r:5}}/>
  </AreaChart></ResponsiveContainer>
 </div>
}
