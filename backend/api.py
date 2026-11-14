"""JobPulse SaaS API — keep career intelligence on a separate Python service."""
from __future__ import annotations

import io
import os

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from jobpulse.core import (
    ROLE_SKILLS,
    analyze_resume,
    forecast_demand,
    illustrative_market_data,
)
from jobpulse.pdf import career_report_pdf, read_resume_pdf

app = FastAPI(
    title="JobPulse Career Intelligence API",
    version="2.0.0",
    description="Educational resume, skill gap and illustrative market-data API.",
    docs_url="/api/docs",
    redoc_url=None,
)
allowed_origins = [
    "http://localhost:5173",
    "https://jobpulse-careercatalysts.onrender.com",
]
allowed_origins.extend(
    origin.strip().rstrip("/")
    for origin in os.environ.get("CORS_ORIGINS", "").split(",")
    if origin.strip()
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


class ResumeRequest(BaseModel):
    role: str = Field(min_length=2, max_length=100)
    text: str = Field(min_length=25, max_length=100_000)


class ReportRequest(BaseModel):
    role: str
    skills: list[str] = Field(default_factory=list, max_length=100)
    missing: list[str] = Field(default_factory=list, max_length=100)
    score: int = Field(ge=0, le=100)
    recommendations: list[dict[str, str]] = Field(default_factory=list, max_length=10)


def checked_role(role: str) -> str:
    if role not in ROLE_SKILLS:
        raise HTTPException(status_code=422, detail="Choose a supported career role.")
    return role


def perform_analysis(role: str, text: str) -> dict:
    try:
        return analyze_resume(text, checked_role(role))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.get("/")
def api_home():
    return {"name": "JobPulse API", "status": "ok", "docs": "/api/docs"}


@app.get("/health")
def health():
    return {"status": "ok", "service": "jobpulse-api", "version": "2.0.0"}


@app.get("/api/roles")
def roles():
    return {"roles": [
        {"name": name, "skills": skills, "skill_count": len(skills)}
        for name, skills in ROLE_SKILLS.items()
    ]}


@app.get("/api/market")
def market(role: str = "Data Scientist", months: int = 6):
    role = checked_role(role)
    if not 1 <= months <= 12:
        raise HTTPException(status_code=422, detail="Forecast months must be 1–12.")
    synthetic = illustrative_market_data()
    historic = synthetic[synthetic["role"] == role].sort_values("month")
    future = forecast_demand(synthetic, role, months)
    def records(df):
        return [
            {"month": pd_month.strftime("%Y-%m"), "postings": int(value)}
            for pd_month, value in zip(df["month"], df["postings"])
        ]
    current = int(historic["postings"].iloc[-1])
    baseline = int(historic["postings"].iloc[0])
    return {
        "role": role,
        "is_synthetic": True,
        "source": "Synthetic demonstration series, not live employer data",
        "method": "Ridge regression trend extrapolation; illustrative, not validated",
        "current": current,
        "growth_percent": round(100 * (current / baseline - 1), 1),
        "projected": int(future["postings"].iloc[-1]),
        "history": records(historic),
        "forecast": records(future),
        "top_skills": ROLE_SKILLS[role][:5],
    }


@app.post("/api/analyze")
def analyze(body: ResumeRequest):
    return perform_analysis(body.role, body.text)


@app.post("/api/analyze-pdf")
async def analyze_pdf(role: str = Form(...), file: UploadFile = File(...)):
    checked_role(role)
    if file.content_type not in {"application/pdf", "application/x-pdf", "application/octet-stream"}:
        raise HTTPException(status_code=415, detail="Only PDF resumes are supported.")
    body = await file.read(5 * 1024 * 1024 + 1)
    await file.close()
    if len(body) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Maximum PDF size is 5 MB.")
    try:
        text = read_resume_pdf(body)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return perform_analysis(role, text)


@app.post("/api/report")
def download_report(body: ReportRequest):
    checked_role(body.role)
    pdf = career_report_pdf(body.model_dump())
    return StreamingResponse(
        io.BytesIO(pdf),
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="jobpulse-career-report.pdf"'},
    )
