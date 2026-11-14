/**
 * Local standby for the public hackathon demonstration.
 * Port of services/intelligence/app/{analysis,catalog,market}.py.
 * The Python API remains canonical when available; this only runs on transient 5xx/timeouts.
 * Explicit keyword detection is NOT verified proficiency or real hiring predictions.
 */
type Weight = [name: string, weight: number]
const rubrics: Record<string, {title:string; skills:Weight[]; base:number; slope:number}> = {
  'data-scientist':{title:'Data Scientist',skills:[['Python',3],['SQL',3],['Pandas',2],['NumPy',2],['Statistics',3],['Machine Learning',3],['Scikit-learn',2],['Data Visualization',2],['Git',1],['Cloud',1]],base:66,slope:2.8},
  'data-analyst':{title:'Data Analyst',skills:[['SQL',3],['Excel',3],['Python',2],['Statistics',3],['Power BI',2],['Tableau',2],['Pandas',2],['Data Visualization',3],['Communication',2],['Git',1]],base:90,slope:1.6},
  'ml-engineer':{title:'Machine Learning Engineer',skills:[['Python',3],['Machine Learning',3],['Scikit-learn',2],['PyTorch',3],['TensorFlow',2],['APIs',2],['Docker',3],['Git',1],['MLOps',3],['Cloud',2]],base:52,slope:3.5},
  'backend-engineer':{title:'Backend Engineer',skills:[['Python',3],['Java',2],['SQL',3],['PostgreSQL',2],['APIs',3],['Docker',2],['Testing',3],['Git',2],['Linux',2],['Cloud',2]],base:112,slope:1.8},
  'frontend-engineer':{title:'Frontend Engineer',skills:[['JavaScript',3],['TypeScript',3],['React',3],['HTML',3],['CSS',3],['Accessibility',3],['Testing',2],['Git',2],['APIs',2],['UI/UX',2]],base:104,slope:1.2},
  'cybersecurity-analyst':{title:'Cybersecurity Analyst',skills:[['Networking',3],['Linux',3],['Python',2],['SIEM',3],['Incident Response',3],['Security',3],['Threat Modeling',2],['Cloud',2],['SQL',1],['Git',1]],base:60,slope:2.4}
}
const aliases:Record<string,RegExp[]> = {
 Python:[/\bpython\b/i], SQL:[/(?<![a-z])sql\b/i,/\bmysql\b/i,/\bpostgres(?:ql)?\b/i],
 Pandas:[/\bpandas\b/i],NumPy:[/\bnumpy\b/i],Statistics:[/\bstatistic(?:s|al)?\b/i,/\bprobability\b/i],
 'Machine Learning':[/\bmachine[ -]learning\b/i,/\bml\s+(?:models?|pipelines?)\b/i],
 'Scikit-learn':[/\bscikit[ -]?learn\b/i,/\bsklearn\b/i],
 'Data Visualization':[/\bdata\s+visuali[sz]ation\b/i,/\bmatplotlib\b/i,/\bplotly\b/i],
 Git:[/(?<![a-z])git(?![a-z])/i,/\bgithub\b/i,/\bgitlab\b/i],
 Cloud:[/\bcloud\b/i,/\baws\b/i,/\bazure\b/i,/\bgcp\b/i],
 Excel:[/\bexcel\b/i,/\bspreadsheet(?:s)?\b/i],
 'Power BI':[/\bpower\s*bi\b/i],Tableau:[/\btableau\b/i],
 Communication:[/\bcommunication\b/i,/\bpresentation(?:s)?\b/i],
 PyTorch:[/\bpytorch\b/i,/\btorch\b/i],
 TensorFlow:[/\btensorflow\b/i,/\bkeras\b/i],
 Docker:[/\bdocker\b/i,/\bcontainers?\b/i],
 MLOps:[/\bmlops\b/i,/\bmlflow\b/i],
 APIs:[/\bapi(?:s)?\b/i,/\brest(?:ful)?\b/i,/\bfastapi\b/i,/\bgraphql\b/i],
 Java:[/\bjava\b/i],PostgreSQL:[/\bpostgres(?:ql)?\b/i],
 Testing:[/\btesting\b/i,/\bpytest\b/i,/\bunit\s+tests?\b/i,/\bjest\b/i],
 Linux:[/\blinux\b/i,/\bubuntu\b/i],
 JavaScript:[/\bjavascript\b/i,/\bnode(?:\.js|js)?\b/i],
 TypeScript:[/\btypescript\b/i],
 React:[/\breact(?:\.js)?\b/i],HTML:[/\bhtml\b/i],CSS:[/\bcss\b/i,/\btailwind\b/i],
 Accessibility:[/\baccessibility\b/i,/\bwcag\b/i,/\baria\b/i],
 'UI/UX':[/\bui[/ -]ux\b/i,/\buser experience\b/i,/\buser interface\b/i],
 Networking:[/\bnetworking\b/i,/\btcp[/ -]ip\b/i],
 SIEM:[/\bsiem\b/i,/\bsplunk\b/i],
 'Incident Response':[/\bincident response\b/i],
 Security:[/\bcybersecurity\b/i,/\binformation security\b/i],
 'Threat Modeling':[/\bthreat model(?:ing|ling)?\b/i]
}
const resources:Record<string,[string,string]> = {
 Python:['Official Python tutorial','https://docs.python.org/3/tutorial/'],
 SQL:['SQLBolt interactive practice','https://sqlbolt.com/'],
 Statistics:['Khan Academy statistics','https://www.khanacademy.org/math/statistics-probability'],
 'Machine Learning':['Google ML Crash Course','https://developers.google.com/machine-learning/crash-course'],
 'Scikit-learn':['Scikit-learn learning guide','https://scikit-learn.org/stable/user_guide.html'],
 React:['React documentation','https://react.dev/learn'],
 TypeScript:['TypeScript handbook','https://www.typescriptlang.org/docs/handbook/intro.html'],
 Git:['Pro Git book','https://git-scm.com/book/en/v2'],
 Docker:['Docker getting started','https://docs.docker.com/get-started/'],
 Pandas:['Pandas user guide','https://pandas.pydata.org/docs/user_guide/index.html'],
 'Data Visualization':['Plotly fundamentals','https://plotly.com/python/'],
 Accessibility:['W3C accessibility introductions','https://www.w3.org/WAI/fundamentals/accessibility-intro/'],
 Cloud:['AWS Skill Builder','https://skillbuilder.aws/'],
 Networking:['Cisco Networking Academy','https://www.netacad.com/']
}
export function standbyAnalyze(text:string, roleId:string) {
 const rubric=rubrics[roleId]
 if(!rubric) throw new Error('Please select a supported career role.')
 if(typeof text!=='string'||text.trim().length<30) throw new Error('Please provide a resume with at least 30 characters of meaningful text.')
 if(text.length>120000) throw new Error('Resume text is too long (120,000-character limit).')
 const detected:Record<string,string>={}
 for(const [skill,patterns] of Object.entries(aliases)) {
  for(const pattern of patterns) {
   const match=pattern.exec(text)
   if(match){
    const start=Math.max(0,match.index-40),end=Math.min(text.length,match.index+match[0].length+48)
    detected[skill]=(start?'…':'')+text.slice(start,end).split(/\s+/).join(' ')+(end<text.length?'…':'')
    break
   }
  }
 }
 const matched=rubric.skills.filter(([name])=>name in detected).map(([skill,weight])=>({skill,weight,evidence:detected[skill]}))
 const missing=rubric.skills.filter(([name])=>!(name in detected)).map(([skill,weight])=>({skill,weight})).sort((a,b)=>b.weight-a.weight||a.skill.localeCompare(b.skill,'en'))
 const total=rubric.skills.reduce((n,[,w])=>n+w,0),matchedWeight=matched.reduce((n,x)=>n+x.weight,0)
 const roadmap=missing.slice(0,8).map((item,i)=>{const [resource_title,resource_url]=resources[item.skill]??['Find official documentation and build a project',''];return {skill:item.skill,priority:i+1,effort:'Foundations + practice project',resource_title,resource_url}})
 return {
  role_id:roleId, role:rubric.title, score:Math.round(matchedWeight/total*100), score_type:'weighted_keyword_alignment',
  matched,missing,detected_skills:Object.keys(detected).sort(),roadmap,
  methodology:'Explicit keyword matching against a curated weighted role rubric (local standby — Python service temporarily unavailable). Mentions are not proof of proficiency.',
  disclaimer:'Not a measure of hiring probability or a validated career-readiness assessment.'
 }
}
function month(offset:number){const value=new Date(Date.UTC(2025,4+offset,1));return value.toISOString().slice(0,7)}
export function standbyMarket(roleId:string,horizon:number) {
 const rubric=rubrics[roleId];if(!rubric)throw new Error('Choose a supported career role.')
 if(!Number.isInteger(horizon)||horizon<1||horizon>12)throw new Error('Select a forecast window between 1 and 12 months.')
 const index=Object.keys(rubrics).indexOf(roleId)
 const history=Array.from({length:18},(_,i)=>({month:month(i),count:Math.round(rubric.base+rubric.slope*i+5*Math.sin(i*0.8+index))}))
 // Closed-form Ridge(alpha=1) with an unpenalized intercept, equivalent to scikit-learn.
 const xMean=8.5,yMean=history.reduce((n,x)=>n+x.count,0)/18
 const covariance=history.reduce((n,x,i)=>n+(i-xMean)*(x.count-yMean),0)
 const variance=history.reduce((n,x,i)=>n+(i-xMean)**2,0)+1
 const slope=covariance/variance,intercept=yMean-slope*xMean
 const forecast=Array.from({length:horizon},(_,i)=>({month:month(18+i),count:Math.max(0,Math.round(intercept+slope*(18+i)))}))
 const latest=history[17].count,first=history[0].count
 return {role_id:roleId,role:rubric.title,data_status:'synthetic_demo' as const,can_make_real_world_claims:false,
  source_label:'Synthetic example dataset — not job-board or employer postings',
  method:'Ridge regression extrapolation, educational illustration only (local standby)',
  history,forecast,latest_sample_count:latest,sample_growth_pct:Math.round((100*(latest/first-1))*10)/10,
  sample_projection:forecast[forecast.length-1].count,
  disclaimer:'Demo-only numbers. Real demand forecasts require historical sourced job listings and time-based backtesting.'}
}
