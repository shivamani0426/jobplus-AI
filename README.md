# JobPulse — Career Intelligence SaaS (CareerCatalysts)

**Team:** CareerCatalysts · **Theme:** Data Science & Automation | Open Innovation

## Production links
- **React SaaS website:** https://jobpulse-careercatalysts.onrender.com
- **FastAPI backend:** https://jobpulse-career-api.onrender.com
- **FastAPI documentation:** https://jobpulse-career-api.onrender.com/api/docs
- **Supabase project:** https://supabase.com/dashboard/project/xnmjjdezdbsjcbgqmvyk
- **Legacy Streamlit prototype:** https://jobplus-ai.onrender.com

## Architecture
- **React 19 + TypeScript + Vite + Tailwind + Recharts** in `frontend/`
- **FastAPI + PyMuPDF + ReportLab + Pandas + Scikit-learn** in `backend/` and `jobpulse/`
- **Supabase Auth + PostgreSQL** with row-level security for private account history
- **Render free static site + Render free Python web service**
- The old `app.py` is preserved for reference; the new production frontend does not use Streamlit.

## Features
Interactive dashboard, six career checklists, resume upload or pasted text, skill matching, explainable gap analysis, downloadable PDF reports, educational synthetic forecasting, personalized learning steps, account sign-up/sign-in, private saved career history, fully responsive mobile/desktop interface.

## Local development
```bash
python -m pip install -r requirements-api.txt
uvicorn backend.api:app --reload --port 8000
```
In another terminal:
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase project URL and publishable key
npm run dev
```

## Tests
```bash
python -m pip install pytest httpx
python -m pytest tests -q
cd frontend && npm run build
```
GitHub Actions runs Python tests and the frontend production build on every push to `main` and `saas-v2`.

## Hosting setup
Backend: build `pip install -r requirements-api.txt`, start `uvicorn backend.api:app --host 0.0.0.0 --port $PORT`.
Frontend: build `cd frontend && npm install && npm run build`, publish `frontend/dist`; set `VITE_API_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_PUBLISHABLE_KEY`. Render static may use `SKIP_INSTALL_DEPS=true` to avoid auto-installing root Python requirements.

For email signup confirmations to return to the frontend, configure Supabase **Authentication → URL Configuration**: Site URL and Redirect URLs should include the production frontend origin. Supabase Auth controls email delivery/verification.

## Important data integrity disclaimer
The built-in posting counts are **synthetic**; forecasts are illustrative Ridge trend extrapolations. They are **not** predictions from genuine employer data. Resume alignment measures keyword mentions, not verified skills or hiring probability. For real predictive intelligence, ingest sourced dated postings and time-backtest models.

## Privacy
- Only user-selected skills summaries are persisted, and their access is secured by Supabase RLS.
- Uploaded PDF contents and raw resume text are never stored in the application database.
- Frontend uses **publishable keys only**; service role and database secrets are not required or committed.
- PDF upload has a 5 MB / 12 page limit.

## Production branches
The new Render SaaS frontend and API currently auto-deploy from `saas-v2`. The original Streamlit service follows `main`; keep the `saas-v2` branch updated for future SaaS deployments until Render is reconfigured to `main`.
