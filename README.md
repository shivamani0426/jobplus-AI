# JobPulse — CareerCatalysts

**JobPulse** is a student-focused predictive career intelligence prototype built with Python, Streamlit, Scikit-learn, Plotly, PyMuPDF and Supabase.

## Features
- Resume PDF analysis and skill-gap detection for six target careers
- Personalised, resource-linked career roadmap and downloadable PDF report
- Interactive skill-demand trends with an illustrative Ridge forecasting baseline
- Optional Supabase account registration, sign-in and private analysis history
- Automated unit tests and security-scoped PostgreSQL database migration

> **Data quality note:** Built-in job market observations are synthetic demonstration data, not live job postings. Forecasts are educational illustrations, not validated predictions. Resume scores measure detectable keywords, not employment probabilities.

## Run locally
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

For Windows, activate using `.venv\Scripts\activate`. Optional cloud sync requires `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` environment variables. Never commit secret or service-role keys.

## Deploy on Render free
- Build command: `pip install -r requirements.txt`
- Start command: `streamlit run app.py --server.address 0.0.0.0 --server.port $PORT --server.headless true`
- Configure `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in service environment variables.

## Tests
```bash
pytest -q
```

**Team:** CareerCatalysts · **Theme:** Data Science & Automation | Open Innovation
