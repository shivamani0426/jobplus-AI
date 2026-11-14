/** Standby PDF generator for free-tier backend sleep. Nothing is persisted. */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

type SmallSkill={skill:string}
type Roadmap={skill:string;resource_title:string;resource_url:string}
type ReportData={role_id:string;role:string;score:number;matched:SmallSkill[];missing:SmallSkill[];roadmap:Roadmap[]}
const plain=(value:unknown,max=150)=>String(value??'').replace(/[^\x20-\x7E]/g,' ').slice(0,max).trim()

export async function standbyReport(value:unknown):Promise<Uint8Array>{
 if(!value||typeof value!=='object')throw new Error('Invalid report data.')
 const r=value as Partial<ReportData>
 if(typeof r.role_id!=='string'||!/^[a-z-]{3,50}$/.test(r.role_id)||typeof r.role!=='string'||r.role.length>100||
  typeof r.score!=='number'||!Number.isInteger(r.score)||r.score<0||r.score>100||
  !Array.isArray(r.matched)||r.matched.length>30||!Array.isArray(r.missing)||r.missing.length>30||
  !Array.isArray(r.roadmap)||r.roadmap.length>15)throw new Error('Invalid report fields.')
 const pdf=await PDFDocument.create()
 pdf.setTitle('JobPulse career skill-gap report')
 pdf.setAuthor('CareerCatalysts')
 const font=await pdf.embedFont(StandardFonts.Helvetica)
 const bold=await pdf.embedFont(StandardFonts.HelveticaBold)
 const purple=rgb(.27,.29,.79),dark=rgb(.12,.13,.25),muted=rgb(.37,.38,.48)
 let page=pdf.addPage([595.28,841.89]),y=794
 const margin=46,available=595.28-2*margin
 function line(value:string,{size=10,heading=false,color=dark,gap=7}:{size?:number;heading?:boolean;color?:ReturnType<typeof rgb>;gap?:number}={}) {
  const type=heading?bold:font;const text=plain(value,500)||' '
  const words=text.split(/\s+/);const wraps:string[]=[];let current=''
  for(const word of words){
   const next=(current?current+' ':'')+word
   if(current&&type.widthOfTextAtSize(next,size)>available){wraps.push(current);current=word}else current=next
  }
  if(current)wraps.push(current)
  for(const item of wraps){
   if(y<60){page=pdf.addPage([595.28,841.89]);y=791}
   page.drawText(item,{x:margin,y,size,font:type,color})
   y-=size+gap
  }
 }
 line('JOBPULSE | CAREERCATALYSTS',{size:22,heading:true,color:purple,gap:15})
 line('YOUR PERSONAL SKILL-GAP REPORT',{size:13,heading:true,gap:13})
 line('Target role: '+r.role,{size:12,heading:true,gap:11})
 line('Weighted keyword alignment: '+r.score+'%',{size:16,heading:true,color:purple,gap:15})
 line('This score reflects matched skill keywords only. It is not verified proficiency or a hiring probability.',{size:10,color:muted,gap:16})
 line('DETECTED ROLE SKILLS',{size:12,heading:true,color:purple,gap:9})
 line(r.matched!.map(x=>plain(x?.skill,80)).join(', ')||'None detected in role checklist.',{gap:13})
 line('SKILLS TO STRENGTHEN',{size:12,heading:true,color:purple,gap:9})
 line(r.missing!.map(x=>plain(x?.skill,80)).join(', ')||'Every checklist keyword was mentioned.',{gap:13})
 line('SUGGESTED LEARNING STEPS',{size:12,heading:true,color:purple,gap:10})
 for(const [i,item] of r.roadmap!.entries()){
  line((i+1)+'. '+plain(item?.skill,80)+' - '+plain(item?.resource_title,170),{gap:8})
  if(item?.resource_url)line('   '+plain(item.resource_url,250),{size:9,color:muted,gap:8})
 }
 y-=18
 line('Educational prototype. Your original resume is not included or saved in this report.',{size:9,color:muted,gap:7})
 return pdf.save()
}
