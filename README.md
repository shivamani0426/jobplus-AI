# JobPulse v3 · CareerCatalysts

A rebuilt career-intelligence SaaS for students and early-career professionals, using an original playful panel-based design and a production-oriented separation of responsibilities.

## Production architecture

- **Next.js 16, React 19, TypeScript** — marketing site, multi-page student workspace, session-aware Supabase authentication, server-side API proxy
- **Python FastAPI, PyMuPDF, Pandas, scikit-learn, ReportLab** — resume text extraction, transparent weighted skill matching, synthetic forecasting demo, exportable PDF reports
- **Supabase Auth + Postgres** — account-scoped report history and roadmap progress, protected by RLS
- **Render** — Node web service for SSR Next.js and Python API service for intelligence
- **GitHub Actions** — Python unit tests, TypeScript validation, Next.js production build before merge

## Start locally

```bash
cd services/intelligence
python -m pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000
```

In another terminal:

```bash
cd apps/web
npm install
cp .env.example .env.local
npm run dev
```

Fill `apps/web/.env.local` with the Supabase public URL, publishable key and `INTELLIGENCE_API_URL=http://localhost:8000`. Do not commit service-role keys, API secrets, or user resumes.

## Quality gates

```bash
cd services/intelligence && python -m pytest -q
cd ../../apps/web && npm run typecheck && npm run build
```

## Functionality

Public single-scroll landing page, six-role career selection, resume PDF/text intelligence, explainable skill-gap alignment, personal learning roadmaps and progress checkboxes, synthetic illustrative job-market forecasts with full disclosure, privacy-first reports, Supabase sign-in/sign-up, guest session, account history and deletion, judge-friendly architecture/methodology pages.

## What is and isn't predictive

The built-in job-posting counts are **synthetic**. The prediction line is an educational extrapolation of generated values, **not** a forecast of real hiring demand. Resume scores measure documented keyword alignment against a role rubric, **not** verified proficiency or hiring probability. A production hiring trend forecast needs real historical data, provenance, privacy compliance, time-based validation and confidence ranges.

## Privacy and data

Raw resumes are analyzed in memory and not saved to the application database. Personal history and progress require explicit sign-in and use Supabase Row Level Security (RLS). Run `supabase/sql/learning_progress.sql` as an additive migration in the existing project (already applied to the deployed environment).

## Releases

Keep previous Git commits and deployed services until the new deployment is verified. Do not delete history, branches or existing user data to reconstruct the frontend.


## Optional OpenRouter AI Career Coach

The workspace includes `/app/coach`. This is an **opt-in educational assistant** using OpenRouter's chat-completions API. It is separate from the deterministic resume/forecasting pipeline. Only selected career role, derived skills, keyword-alignment score, and a short user-written question are sent to OpenRouter; raw resumes and PDFs are **not** sent.

Set `OPENROUTER_API_KEY` in the **Render `jobpulse-v3-web` web service → Environment** (or in local server-only `apps/web/.env.local`). Never use `NEXT_PUBLIC_OPENROUTER_API_KEY` or commit the key. The optional `OPENROUTER_MODEL` defaults to `openrouter/free`, which is rate limited. The coach returns a clear 'not configured' message when no key is available, while resume analysis, skill gaps, roadmaps, synthetic forecasts, and PDFs continue to work.

The public guest AI endpoint has lightweight per-process limits (3 requests / 15 minutes / IP, 40 requests / day / process); **this is not robust distributed rate limiting**. Add a persistent quota/Turnstile before high-traffic or paid-model usage. Use OpenRouter provider privacy settings appropriate for any data sent, and never upload sensitive resume contents to the AI service.


## Free-tier standby mode

The normal FastAPI service remains the authoritative implementation of skills,
synthetic market forecasts and downloadable PDF reports. When its **free Render
instance is asleep or temporarily unreachable**, the Next.js server can compute
the same educational keyword rubric and demo trend with a restricted local
standby module. PDF files still require the Python service for safe text extraction,
so the UI explains that PDF users should retry after the service wakes or paste
resume text.

Local standby reports are generated with pdf-lib and do not upload files to
Supabase. The backup is intentionally limited to public, deterministic student
demo operations; it does not use OpenRouter or Supabase storage. The Next.js
proxy advertises \`X-JobPulse-Mode: local-standby\` on standby responses.
GitHub CI runs a separate browser suite with an unreachable backend to
verify this fallback, alongside the normal full-stack tests.
