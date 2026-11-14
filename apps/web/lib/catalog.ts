import type { Role } from './types'
export const roles: Role[] = [
 {id:'data-scientist',title:'Data Scientist',category:'Data & AI',description:'Explore patterns and build predictive models.',skills:['Python','SQL','Pandas','NumPy','Statistics','Machine Learning','Scikit-learn','Data Visualization','Git','Cloud']},
 {id:'data-analyst',title:'Data Analyst',category:'Data & AI',description:'Turn information into decisions.',skills:['SQL','Excel','Python','Statistics','Power BI','Tableau','Pandas','Data Visualization','Communication','Git']},
 {id:'ml-engineer',title:'ML Engineer',category:'Data & AI',description:'Build and deploy machine learning services.',skills:['Python','Machine Learning','Scikit-learn','PyTorch','TensorFlow','APIs','Docker','Git','MLOps','Cloud']},
 {id:'backend-engineer',title:'Backend Engineer',category:'Engineering',description:'Design dependable applications and APIs.',skills:['Python','Java','SQL','PostgreSQL','APIs','Docker','Testing','Git','Linux','Cloud']},
 {id:'frontend-engineer',title:'Frontend Engineer',category:'Engineering',description:'Craft accessible, performant interfaces.',skills:['JavaScript','TypeScript','React','HTML','CSS','Accessibility','Testing','Git','APIs','UI/UX']},
 {id:'cybersecurity-analyst',title:'Cybersecurity Analyst',category:'Security',description:'Understand and defend modern systems.',skills:['Networking','Linux','Python','SIEM','Incident Response','Security','Threat Modeling','Cloud','SQL','Git']},
]
export const roleById = (id:string)=> roles.find(r=>r.id===id) ?? roles[0]
export const formatMonth = (x:string)=> new Date(x+'-01T00:00:00Z').toLocaleDateString('en-US',{month:'short',year:'2-digit',timeZone:'UTC'})
export const formatDate = (x:string)=>new Date(x).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})
