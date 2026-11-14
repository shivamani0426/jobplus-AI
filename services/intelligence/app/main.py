"""JobPulse intelligence API v3. All personal analysis runs without storing raw resumes."""
from __future__ import annotations
import os
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field
from .catalog import ROLES
from .analysis import analyze
from .market import market
from .resume import extract_pdf, MAX_PDF_BYTES
from .reports import render_pdf

app = FastAPI(title="JobPulse Intelligence API", version="3.0.0", docs_url="/docs", redoc_url=None)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[s.strip().rstrip("/") for s in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if s.strip()],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
    allow_credentials=False,
)

class TextAnalysisRequest(BaseModel):
    role_id: str = Field(min_length=2, max_length=50)
    text: str = Field(min_length=30, max_length=120_000)

class Matched(BaseModel):
    skill: str = Field(max_length=100)
    weight: int = Field(ge=1, le=5)
    evidence: str = Field(max_length=300)

class Missing(BaseModel):
    skill: str = Field(max_length=100)
    weight: int = Field(ge=1, le=5)

class RoadmapItem(BaseModel):
    skill: str = Field(max_length=100)
    priority: int = Field(ge=1, le=20)
    effort: str = Field(max_length=120)
    resource_title: str = Field(max_length=250)
    resource_url: str = Field(max_length=500)

class ReportInput(BaseModel):
    role_id: str
    role: str = Field(max_length=100)
    score: int = Field(ge=0, le=100)
    matched: list[Matched] = Field(max_length=30)
    missing: list[Missing] = Field(max_length=30)
    roadmap: list[RoadmapItem] = Field(max_length=15)

@app.get("/healthz")
def healthz():
    return {"status": "ok", "service": "jobpulse-intelligence", "version": "3.0.0"}

@app.get("/v1/roles")
def roles():
    return {"roles": [{"id": role_id, "title": val["title"], "category": val["category"],
                        "description": val["description"], "skills": [s for s, _ in val["skills"]]}
                       for role_id, val in ROLES.items()]}

@app.get("/v1/market")
def market_info(role_id: str = "data-scientist", horizon: int = 6):
    try:
        return market(role_id, horizon)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

@app.post("/v1/analyze/text")
def analyze_text(payload: TextAnalysisRequest):
    try:
        return analyze(payload.text, payload.role_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

@app.post("/v1/analyze/pdf")
async def analyze_pdf(role_id: str = Form(...), file: UploadFile = File(...)):
    if role_id not in ROLES:
        raise HTTPException(status_code=422, detail="Choose a supported career role.")
    if file.content_type not in {"application/pdf", "application/octet-stream"}:
        raise HTTPException(status_code=415, detail="Upload a PDF file only.")
    raw = await file.read(MAX_PDF_BYTES + 1)
    await file.close()
    if len(raw) > MAX_PDF_BYTES:
        raise HTTPException(status_code=413, detail="PDF must be 5 MB or smaller.")
    try:
        return analyze(extract_pdf(raw), role_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

@app.post("/v1/report")
def report(payload: ReportInput):
    if payload.role_id not in ROLES or payload.role != ROLES[payload.role_id]["title"]:
        raise HTTPException(status_code=422, detail="Invalid role in report request.")
    content = render_pdf(payload.model_dump())
    return Response(content=content, media_type="application/pdf",
                    headers={"Content-Disposition": 'attachment; filename="jobpulse-career-report.pdf"',
                             "Cache-Control": "no-store"})

@app.get("/")
def root():
    return {"message": "JobPulse Intelligence API", "status": "ok", "documentation": "/docs"}
