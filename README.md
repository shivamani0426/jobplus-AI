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
