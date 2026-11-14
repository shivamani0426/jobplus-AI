'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, BrainCircuit, CircleAlert, LockKeyhole, Send, ShieldCheck, Sparkles, WandSparkles } from 'lucide-react'
import { useJobPulse } from '@/components/providers'
import { getRecent } from '@/lib/analysis-store'
import { roleById } from '@/lib/catalog'
import { PageHeading, Pill } from '@/components/ui'
import type { Analysis } from '@/lib/types'

type AIStatus = { configured: boolean; model: string; guest_access: boolean }
type CoachResponse = { answer: string; model: string; disclaimer: string }
const EXAMPLE = 'What should I learn first to prepare for this role?'

export default function CareerCoach() {
  const { role } = useJobPulse()
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [status, setStatus] = useState<AIStatus | null>(null)
  const [question, setQuestion] = useState(EXAMPLE)
  const [answer, setAnswer] = useState<CoachResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { setAnalysis(getRecent()) }, [role])
  useEffect(() => {
    let active = true
    fetch('/api/ai/coach', { cache: 'no-store' })
      .then(r => r.json()).then((s: AIStatus) => { if (active) setStatus(s) })
      .catch(() => { if (active) setStatus({ configured: false, model: 'openrouter/free', guest_access: true }) })
    return () => { active = false }
  }, [])
  const current = analysis?.role_id === role ? analysis : null

  async function ask(event: React.FormEvent) {
    event.preventDefault()
    setAnswer(null); setError('')
    if (!question.trim() || question.trim().length < 8) {
      setError('Please enter a career question with at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      // The backend receives only summary keywords and role, never PDF bytes or raw resume.
      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_id: role,
          score: current?.score,
          matched: current?.matched.map(s => s.skill) ?? [],
          missing: current?.missing.map(s => s.skill) ?? [],
          question: question.trim(),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result?.detail || 'AI guidance could not be generated.')
      setAnswer(result as CoachResponse)
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not reach the AI coach.') }
    finally { setLoading(false) }
  }

  return <>
    <PageHeading
      eyebrow="OPTIONAL AI GUIDANCE"
      title="Meet your AI Career Coach."
      subtitle="Ask a focused career question and get practical learning suggestions. No account required."
      action={<Pill tone="violet"><Sparkles size={14}/> OpenRouter-powered</Pill>}
    />
    <div className="coach-layout">
      <section className="card coach-main">
        <div className="coach-intro">
          <div className="coach-icon"><BrainCircuit size={27}/></div>
          <div><h2>Plan your next move</h2><p>Selected track: <strong>{roleById(role).title}</strong></p></div>
        </div>
        {current
          ? <div className="coach-context"><ShieldCheck size={19}/><span>Using your recent skill summary: <strong>{current.matched.length} matched</strong>, <strong>{current.missing.length} missing</strong>. Your original resume is never sent to the AI provider.</span></div>
          : <div className="coach-context"><BookOpen size={19}/><span>No resume needed. Get general study advice now, or <Link href="/app/resume">analyze a sample resume</Link> for personalized steps.</span></div>}
        {status && !status.configured && <div className="coach-notice" role="status"><CircleAlert size={19}/><div><strong>AI coaching needs an OpenRouter key.</strong><p>The administrator must add it securely to Render. Resume analysis, skill gaps, forecasts and PDFs still work.</p></div></div>}
        <form onSubmit={ask} className="coach-form">
          <label htmlFor="coach-question">What would you like help with?</label>
          <textarea
            id="coach-question"
            rows={4}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            maxLength={300}
            placeholder="Example: Suggest three beginner projects for my career goal."
          />
          <div className="coach-chips">
            {[
              'What should I learn first?',
              'Suggest three portfolio projects for this role.',
              'Help me plan the next four weeks of learning.',
            ].map(s => <button key={s} type="button" onClick={() => setQuestion(s)}>{s}</button>)}
          </div>
          <div className="coach-form-bottom">
            <small><LockKeyhole size={14}/> Only your question and derived skill keywords are shared with the model provider. Avoid personal details.</small>
            <button type="submit" className="button button-primary" disabled={loading || status?.configured === false}>
              {loading ? 'Thinking…' : 'Get career guidance'} <Send size={16}/>
            </button>
          </div>
        </form>
        {error && <div role="alert" className="alert-error"><CircleAlert size={16}/>{error}</div>}
        {answer && <article className="coach-answer" aria-live="polite">
          <div className="coach-answer-title"><WandSparkles size={20}/><h3>Your suggested next steps</h3></div>
          <p className="coach-answer-text">{answer.answer}</p>
          <small>{answer.disclaimer} · Model: {answer.model}</small>
        </article>}
      </section>
      <aside className="coach-side">
        <div className="coach-side-hero"><Sparkles size={29}/><h3>Your pace.<br/>Your progress.</h3><p>One skill. One project. One good next step.</p><Link href="/app/roadmap">Explore your roadmap <ArrowRight size={16}/></Link></div>
        <div className="card coach-side-note"><ShieldCheck size={23}/><h3>What this AI doesn't do</h3><p>It does not verify skills, guarantee jobs, read live vacancies, or replace the original JobPulse resume analyzer.</p></div>
      </aside>
    </div>
  </>
}
