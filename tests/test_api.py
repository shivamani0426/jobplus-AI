from fastapi.testclient import TestClient
from backend.api import app

client = TestClient(app)

def test_health_and_roles():
    assert client.get("/health").json()["status"] == "ok"
    assert len(client.get("/api/roles").json()["roles"]) == 6

def test_market_labels_are_honest():
    r = client.get("/api/market", params={"role": "Data Scientist", "months": 6})
    assert r.status_code == 200
    payload = r.json()
    assert payload["is_synthetic"] is True
    assert len(payload["history"]) == 18
    assert len(payload["forecast"]) == 6

def test_bad_roles_rejected():
    assert client.get("/api/market", params={"role": "fake"}).status_code == 422

def test_analyze_and_report_pdf():
    a = client.post("/api/analyze", json={
        "role": "Data Scientist",
        "text": "I have worked with Python, SQL, Pandas, NumPy, Scikit-learn, Statistics and Git.",
    })
    assert a.status_code == 200
    analysis = a.json()
    assert "SQL" in analysis["matched"]
    pdf = client.post("/api/report", json=analysis)
    assert pdf.status_code == 200
    assert pdf.content.startswith(b"%PDF")

def test_short_resume_rejected():
    a = client.post("/api/analyze", json={"role": "Data Scientist", "text": "hi"})
    assert a.status_code == 422
