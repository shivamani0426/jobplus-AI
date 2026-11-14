import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type Role = {
  name: string
  skills: string[]
  skill_count: number
}
export type DataPoint = { month: string; postings: number }
export type Market = {
  role: string
  is_synthetic: boolean
  source: string
  method: string
  current: number
  growth_percent: number
  projected: number
  history: DataPoint[]
  forecast: DataPoint[]
  top_skills: string[]
}
export type Recommendation = { skill: string; title: string; url: string }
export type Analysis = {
  role: string
  skills: string[]
  matched: string[]
  missing: string[]
  score: number
  recommendations: Recommendation[]
}
export type SavedAnalysis = {
  id: string
  target_role: string
  detected_skills: string[]
  missing_skills: string[]
  readiness_score: number
  recommendations: Recommendation[]
  created_at: string
}

export const ROLES: Role[] = [
  { name: 'Data Scientist', skills: ['Python','SQL','Pandas','NumPy','Scikit-learn','Statistics','Machine Learning','Data Visualization','Git','Cloud'], skill_count: 10 },
  { name: 'Data Analyst', skills: ['Excel','SQL','Python','Power BI','Tableau','Statistics','Pandas','Data Visualization','Communication','Git'], skill_count: 10 },
  { name: 'Machine Learning Engineer', skills: ['Python','SQL','Scikit-learn','PyTorch','TensorFlow','Docker','Git','MLOps','Cloud','APIs'], skill_count: 10 },
  { name: 'Backend Developer', skills: ['Python','Java','SQL','PostgreSQL','APIs','Docker','Git','Testing','Cloud','Linux'], skill_count: 10 },
  { name: 'Frontend Developer', skills: ['JavaScript','TypeScript','React','HTML','CSS','Git','Testing','APIs','Accessibility','UI/UX'], skill_count: 10 },
  { name: 'Cybersecurity Analyst', skills: ['Python','Linux','Networking','SIEM','Incident Response','Security','SQL','Cloud','Git','Threat Modeling'], skill_count: 10 },
]
export const API_URL = (import.meta.env.VITE_API_URL || 'https://jobpulse-career-api.onrender.com').replace(/\/$/, '')

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = 'Request failed. Please try again.'
    try {
      const body = await response.json()
      message = typeof body.detail === 'string'
        ? body.detail
        : response.status === 422 ? 'Please check the information you entered.' : message
    } catch { /* response was not JSON */ }
    throw new Error(message)
  }
  return response.json() as Promise<T>
}

export async function getMarket(role: string, months: number): Promise<Market> {
  const query = new URLSearchParams({role, months: String(months)})
  return parseResponse<Market>(await fetch(API_URL + '/api/market?' + query, {signal: AbortSignal.timeout(35000)}))
}
export async function analyzeResume(role: string, text: string, file: File | null): Promise<Analysis> {
  if (file) {
    const form = new FormData()
    form.append('role', role)
    form.append('file', file)
    return parseResponse<Analysis>(await fetch(API_URL + '/api/analyze-pdf', { method: 'POST', body: form }))
  }
  return parseResponse<Analysis>(await fetch(API_URL + '/api/analyze', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({role, text}),
  }))
}
export async function getReport(analysis: Analysis): Promise<Blob> {
  const response = await fetch(API_URL + '/api/report', {
    method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(analysis),
  })
  if (!response.ok) throw new Error('Could not prepare your report.')
  return response.blob()
}
export function downloadBlob(blob: Blob, filename: string) {
  const objectURL = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectURL
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(objectURL), 2000)
}

const sbUrl = import.meta.env.VITE_SUPABASE_URL
const sbKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const supabase: SupabaseClient | null =
  sbUrl && sbKey ? createClient(sbUrl, sbKey, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
  }) : null

export function demoMarket(role: string, months = 6): Market {
  const idx = Math.max(0, ROLES.findIndex(r => r.name === role))
  const base = [75,105,55,125,118,65][idx]
  const slope = [2.8,1.9,3.7,1.5,1.1,3.1][idx]
  const history = Array.from({length: 18}, (_, i) => {
    const month = new Date(Date.UTC(2025, 4 + i, 1)).toISOString().slice(0,7)
    return { month, postings: Math.max(0, Math.round(base + slope * i + 7 * Math.sin(i * .8 + idx))) }
  })
  const current = history[history.length - 1].postings
  const forecast = Array.from({length: months}, (_, i) => {
    const month = new Date(Date.UTC(2026, 10 + i, 1)).toISOString().slice(0,7)
    return {month, postings: Math.max(0, Math.round(current + slope * (i + 1)))}
  })
  return {
    role,
    is_synthetic: true,
    source: 'Synthetic demonstration data (preview)',
    method: 'Illustrative linear trend; API is unavailable',
    current,
    growth_percent: Math.round((current / history[0].postings - 1) * 1000) / 10,
    projected: forecast[forecast.length - 1].postings,
    history,
    forecast,
    top_skills: ROLES[idx].skills.slice(0,5),
  }
}
