from jobpulse.core import ROLE_SKILLS, extract_skills, analyze_resume, illustrative_market_data, forecast_demand
from jobpulse.pdf import career_report_pdf, read_resume_pdf
import pytest

def test_skill_boundaries():
    assert "SQL" not in extract_skills("NoSQL")
    assert "Java" not in extract_skills("JavaScript React")
    assert "JavaScript" in extract_skills("JavaScript React")

def test_explainable_gaps():
    r = analyze_resume("I use Python, SQL, pandas and git in dashboard projects with clients.", "Data Scientist")
    assert r["score"] == 40
    assert "Python" in r["matched"]
    assert "TensorFlow" not in r["missing"]

def test_forecast_horizon():
    data = illustrative_market_data()
    for role in ROLE_SKILLS:
        result = forecast_demand(data, role, 6)
        assert len(result) == 6
        assert (result["postings"] >= 0).all()

def test_report_pdf_roundtrip():
    r = analyze_resume("I use Python, SQL, statistics and machine learning in projects.", "Data Scientist")
    assert career_report_pdf(r).startswith(b"%PDF")
    assert "Target role" in read_resume_pdf(career_report_pdf(r))

def test_invalid_inputs():
    with pytest.raises(ValueError):
        analyze_resume("hi", "Data Scientist")
    with pytest.raises(ValueError):
        forecast_demand(illustrative_market_data(), "Data Scientist", 15)
