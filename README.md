# JobPulse — Predictive Career Intelligence Platform

**Team:** CareerCatalysts · **Theme:** Data Science & Automation | Open Innovation

## SaaS architecture (v2)
- **React / TypeScript / Vite / Tailwind CSS** dashboard in `frontend/`, deployed as a free Render static site
- **FastAPI** service in `backend/api.py`, deployed as a free Render Python web service
- **Supabase Auth and PostgreSQL** for account-specific career analysis history (RLS enabled)
- **Pandas / Scikit-learn / Plotly-style charts** for illustrative analytics; **PyMuPDF** for resume extraction and **ReportLab** for PDF reports
- Previous `app.py` Streamlit app retained as a legacy prototype until full migration is verified.

### Start locally

```bash
pip install -r requirements-api.txt
uvicorn backend.api:app --reload --port 8000
# separate terminal
cd frontend
npm install
npm run dev
```

Create `frontend/.env.local` using the `frontend/.env.example` template. Copy only **Supabase publishable** credentials, never secret/service-role keys. The API does not store PDF contents, and the user chooses whether to persist a *skills summary* to Supabase.

### Tests
```bash
pip install pytest httpx
pytest tests -q
cd frontend && npm run build
```

### Backend hosting
Build: `pip install -r requirements-api.txt`
Start: `uvicorn backend.api:app --host 0.0.0.0 --port $PORT`

### Frontend hosting
Build: `cd frontend && npm install && npm run build`
Publish: `frontend/dist`
Variables: `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`

### Data integrity and limitations
**All built-in historical posting counts are synthetic demonstration data.** Forecasts are educational Ridge trend extrapolations and are not validated projections of actual hiring. Resume readiness scores show checklist keyword alignment, not true job-readiness or hiring probability. Any real-world forecasts require sourced and dated employer observations, cleaning, and time-based backtesting.

### Security
- Personal analyses are protected by Supabase RLS, scoped to `auth.uid()`.
- Only publishable keys are used on the frontend.
- PDF upload is capped at 5 MB and 12 pages; no original PDF or raw resume text is stored in the database.
- No service-role keys in GitHub.

MIT-style educational demo; not a hiring decision tool.
