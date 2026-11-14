"""Testable resume keyword analysis and educational, synthetic market forecasts."""
from __future__ import annotations
import re
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge

ROLE_SKILLS = {
    "Data Scientist": ["Python", "SQL", "Pandas", "NumPy", "Scikit-learn", "Statistics", "Machine Learning", "Data Visualization", "Git", "Cloud"],
    "Data Analyst": ["Excel", "SQL", "Python", "Power BI", "Tableau", "Statistics", "Pandas", "Data Visualization", "Communication", "Git"],
    "Machine Learning Engineer": ["Python", "SQL", "Scikit-learn", "PyTorch", "TensorFlow", "Docker", "Git", "MLOps", "Cloud", "APIs"],
    "Backend Developer": ["Python", "Java", "SQL", "PostgreSQL", "APIs", "Docker", "Git", "Testing", "Cloud", "Linux"],
    "Frontend Developer": ["JavaScript", "TypeScript", "React", "HTML", "CSS", "Git", "Testing", "APIs", "Accessibility", "UI/UX"],
    "Cybersecurity Analyst": ["Python", "Linux", "Networking", "SIEM", "Incident Response", "Security", "SQL", "Cloud", "Git", "Threat Modeling"],
}
ALIASES = {
    "Python": [r"\bpython\b"], "SQL": [r"\bsql\b", r"\bmysql\b", r"\bpostgres(?:ql)?\b"],
    "Pandas": [r"\bpandas\b"], "NumPy": [r"\bnumpy\b"],
    "Scikit-learn": [r"\bscikit[ -]?learn\b", r"\bsklearn\b"],
    "Statistics": [r"\bstatistic(?:s|al)?\b", r"\bprobability\b"],
    "Machine Learning": [r"\bmachine learning\b", r"\bml models?\b"],
    "Data Visualization": [r"\bdata visuali[sz]ation\b", r"\bmatplotlib\b", r"\bplotly\b"],
    "Git": [r"\bgit\b", r"\bgithub\b", r"\bgitlab\b"],
    "Cloud": [r"\bcloud\b", r"\baws\b", r"\bazure\b", r"\bgcp\b"],
    "Excel": [r"\bexcel\b", r"\bspreadsheets?\b"],
    "Power BI": [r"\bpower\s*bi\b"], "Tableau": [r"\btableau\b"],
    "Communication": [r"\bcommunication\b", r"\bpresentation\b"],
    "PyTorch": [r"\bpytorch\b", r"\btorch\b"],
    "TensorFlow": [r"\btensorflow\b", r"\bkeras\b"],
    "Docker": [r"\bdocker\b", r"\bcontainers?\b"],
    "MLOps": [r"\bmlops\b", r"\bmodel deployment\b", r"\bmlflow\b"],
    "APIs": [r"\bapi(?:s)?\b", r"\brest(?:ful)?\b", r"\bfastapi\b"],
    "Java": [r"\bjava\b"], "PostgreSQL": [r"\bpostgres(?:ql)?\b"],
    "Testing": [r"\btesting\b", r"\bpytest\b", r"\bunit tests?\b"],
    "Linux": [r"\blinux\b", r"\bubuntu\b"],
    "JavaScript": [r"\bjavascript\b", r"\bnode\.?js\b"],
    "TypeScript": [r"\btypescript\b"], "React": [r"\breact(?:\.js)?\b"],
    "HTML": [r"\bhtml\b"], "CSS": [r"\bcss\b"],
    "Accessibility": [r"\baccessibility\b", r"\bwcag\b"],
    "UI/UX": [r"\bui\s*/\s*ux\b", r"\buser experience\b"],
    "Networking": [r"\bnetworking\b", r"\btcp/ip\b"],
    "SIEM": [r"\bsiem\b", r"\bsplunk\b"],
    "Incident Response": [r"\bincident response\b"],
    "Security": [r"\bcybersecurity\b", r"\binformation security\b"],
    "Threat Modeling": [r"\bthreat model(?:ing|ling)?\b"],
}
RESOURCES = {
    "Python": ("Python tutorial", "https://docs.python.org/3/tutorial/"),
    "SQL": ("SQLBolt interactive lessons", "https://sqlbolt.com/"),
    "Git": ("Pro Git book", "https://git-scm.com/book/en/v2"),
    "Scikit-learn": ("Scikit-learn user guide", "https://scikit-learn.org/stable/user_guide.html"),
    "Machine Learning": ("Google ML Crash Course", "https://developers.google.com/machine-learning/crash-course"),
    "Statistics": ("Khan Academy statistics", "https://www.khanacademy.org/math/statistics-probability"),
    "Data Visualization": ("Plotly Python fundamentals", "https://plotly.com/python/"),
    "Docker": ("Docker getting started", "https://docs.docker.com/get-started/"),
    "React": ("React learn", "https://react.dev/learn"),
    "Cloud": ("AWS Skill Builder", "https://skillbuilder.aws/"),
}

def extract_skills(text: str) -> list[str]:
    """Detect explicit skill mentions, not verified proficiency."""
    return sorted(skill for skill, patterns in ALIASES.items()
                  if any(re.search(pattern, text or "", re.I) for pattern in patterns))

def analyze_resume(text: str, role: str) -> dict:
    if role not in ROLE_SKILLS:
        raise ValueError("Unknown role")
    if not text or len(text.strip()) < 25:
        raise ValueError("Please provide at least 25 characters of resume content")
    found = extract_skills(text)
    needed = ROLE_SKILLS[role]
    matched = [skill for skill in needed if skill in found]
    missing = [skill for skill in needed if skill not in found]
    score = round(100 * len(matched) / len(needed))
    recommendations = [
        {"skill": skill, "title": RESOURCES.get(skill, (f"Learn {skill}", ""))[0],
         "url": RESOURCES.get(skill, ("", ""))[1]}
        for skill in missing[:6]
    ]
    return {"role": role, "skills": found, "matched": matched,
            "missing": missing, "score": score, "recommendations": recommendations}

def illustrative_market_data() -> pd.DataFrame:
    """Entirely synthetic posting counts. Never represent as live job market data."""
    profiles = {"Data Scientist": (75, 2.8), "Data Analyst": (105, 1.9),
                "Machine Learning Engineer": (55, 3.7), "Backend Developer": (125, 1.5),
                "Frontend Developer": (118, 1.1), "Cybersecurity Analyst": (65, 3.1)}
    months = pd.date_range(end=pd.Timestamp("2026-10-01"), periods=18, freq="MS")
    rows = []
    for group, (role, (baseline, slope)) in enumerate(profiles.items()):
        for i, month in enumerate(months):
            rows.append({"month": month, "role": role,
                         "postings": max(0, round(baseline + slope * i + 7 * np.sin(i * .8 + group))),
                         "source": "Synthetic demonstration data"})
    return pd.DataFrame(rows)

def forecast_demand(data: pd.DataFrame, role: str, horizon: int = 6) -> pd.DataFrame:
    """Ridge trend extrapolation for demo, not validated labor market prediction."""
    history = data[data["role"] == role].sort_values("month")
    if len(history) < 6:
        raise ValueError("At least 6 monthly observations are needed")
    if horizon < 1 or horizon > 12:
        raise ValueError("Horizon must be between 1 and 12 months")
    x = np.arange(len(history)).reshape(-1, 1)
    model = Ridge(alpha=1.).fit(x, history["postings"])
    projection = model.predict(np.arange(len(history), len(history) + horizon).reshape(-1, 1))
    start = pd.Timestamp(history["month"].iloc[-1]) + pd.offsets.MonthBegin(1)
    return pd.DataFrame({"month": pd.date_range(start, periods=horizon, freq="MS"),
                         "role": role,
                         "postings": np.maximum(0, np.round(projection)).astype(int),
                         "type": "Illustrative projection"})

def readiness_label(score: int) -> str:
    return ("Strong keyword match" if score >= 80
            else "Developing keyword match" if score >= 50
            else "Early-stage keyword match")
