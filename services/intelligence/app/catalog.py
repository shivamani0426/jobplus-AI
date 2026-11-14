"""Transparent curated role competency rubrics for the hackathon product."""
from __future__ import annotations

ROLES: dict[str, dict] = {
    "data-scientist": {
        "title": "Data Scientist", "category": "Data & AI", "description": "Turn data into practical insights and predictive models.",
        "skills": [("Python", 3), ("SQL", 3), ("Pandas", 2), ("NumPy", 2), ("Statistics", 3), ("Machine Learning", 3), ("Scikit-learn", 2), ("Data Visualization", 2), ("Git", 1), ("Cloud", 1)],
    },
    "data-analyst": {
        "title": "Data Analyst", "category": "Data & AI", "description": "Find patterns and communicate the story behind the data.",
        "skills": [("SQL", 3), ("Excel", 3), ("Python", 2), ("Statistics", 3), ("Power BI", 2), ("Tableau", 2), ("Pandas", 2), ("Data Visualization", 3), ("Communication", 2), ("Git", 1)],
    },
    "ml-engineer": {
        "title": "Machine Learning Engineer", "category": "Data & AI", "description": "Build, ship, and maintain intelligent systems.",
        "skills": [("Python", 3), ("Machine Learning", 3), ("Scikit-learn", 2), ("PyTorch", 3), ("TensorFlow", 2), ("APIs", 2), ("Docker", 3), ("Git", 1), ("MLOps", 3), ("Cloud", 2)],
    },
    "backend-engineer": {
        "title": "Backend Engineer", "category": "Engineering", "description": "Design reliable services and data infrastructure.",
        "skills": [("Python", 3), ("Java", 2), ("SQL", 3), ("PostgreSQL", 2), ("APIs", 3), ("Docker", 2), ("Testing", 3), ("Git", 2), ("Linux", 2), ("Cloud", 2)],
    },
    "frontend-engineer": {
        "title": "Frontend Engineer", "category": "Engineering", "description": "Craft fast, accessible, delightful digital experiences.",
        "skills": [("JavaScript", 3), ("TypeScript", 3), ("React", 3), ("HTML", 3), ("CSS", 3), ("Accessibility", 3), ("Testing", 2), ("Git", 2), ("APIs", 2), ("UI/UX", 2)],
    },
    "cybersecurity-analyst": {
        "title": "Cybersecurity Analyst", "category": "Security", "description": "Understand risk, investigate threats, and protect systems.",
        "skills": [("Networking", 3), ("Linux", 3), ("Python", 2), ("SIEM", 3), ("Incident Response", 3), ("Security", 3), ("Threat Modeling", 2), ("Cloud", 2), ("SQL", 1), ("Git", 1)],
    },
}

# Explicit keyword boundaries reduce accidental matches (Java vs. JavaScript, SQL vs. NoSQL).
ALIASES: dict[str, list[str]] = {
    "Python": [r"\bpython\b"], "SQL": [r"(?<![a-z])sql\b", r"\bmysql\b", r"\bpostgres(?:ql)?\b"],
    "Pandas": [r"\bpandas\b"], "NumPy": [r"\bnumpy\b"],
    "Statistics": [r"\bstatistic(?:s|al)?\b", r"\bprobability\b"],
    "Machine Learning": [r"\bmachine[ -]learning\b", r"\bml\s+(?:models?|pipelines?)\b"],
    "Scikit-learn": [r"\bscikit[ -]?learn\b", r"\bsklearn\b"],
    "Data Visualization": [r"\bdata\s+visuali[sz]ation\b", r"\bmatplotlib\b", r"\bplotly\b"],
    "Git": [r"(?<![a-z])git(?![a-z])", r"\bgithub\b", r"\bgitlab\b"],
    "Cloud": [r"\bcloud\b", r"\baws\b", r"\bazure\b", r"\bgcp\b"],
    "Excel": [r"\bexcel\b", r"\bspreadsheet(?:s)?\b"], "Power BI": [r"\bpower\s*bi\b"],
    "Tableau": [r"\btableau\b"], "Communication": [r"\bcommunication\b", r"\bpresentation(?:s)?\b"],
    "PyTorch": [r"\bpytorch\b", r"\btorch\b"], "TensorFlow": [r"\btensorflow\b", r"\bkeras\b"],
    "Docker": [r"\bdocker\b", r"\bcontainers?\b"], "MLOps": [r"\bmlops\b", r"\bmlflow\b"],
    "APIs": [r"\bapi(?:s)?\b", r"\brest(?:ful)?\b", r"\bfastapi\b", r"\bgraphql\b"],
    "Java": [r"\bjava\b"], "PostgreSQL": [r"\bpostgres(?:ql)?\b"],
    "Testing": [r"\btesting\b", r"\bpytest\b", r"\bunit\s+tests?\b", r"\bjest\b"],
    "Linux": [r"\blinux\b", r"\bubuntu\b"],
    "JavaScript": [r"\bjavascript\b", r"\bnode(?:\.js|js)?\b"],
    "TypeScript": [r"\btypescript\b"], "React": [r"\breact(?:\.js)?\b"],
    "HTML": [r"\bhtml\b"], "CSS": [r"\bcss\b", r"\btailwind\b"],
    "Accessibility": [r"\baccessibility\b", r"\bwcag\b", r"\baria\b"],
    "UI/UX": [r"\bui[/ -]ux\b", r"\buser experience\b", r"\buser interface\b"],
    "Networking": [r"\bnetworking\b", r"\btcp[/ -]ip\b"], "SIEM": [r"\bsiem\b", r"\bsplunk\b"],
    "Incident Response": [r"\bincident response\b"],
    "Security": [r"\bcybersecurity\b", r"\binformation security\b"],
    "Threat Modeling": [r"\bthreat model(?:ing|ling)?\b"],
}

RESOURCES: dict[str, tuple[str, str]] = {
    "Python": ("Official Python tutorial", "https://docs.python.org/3/tutorial/"),
    "SQL": ("SQLBolt interactive practice", "https://sqlbolt.com/"),
    "Statistics": ("Khan Academy statistics", "https://www.khanacademy.org/math/statistics-probability"),
    "Machine Learning": ("Google ML Crash Course", "https://developers.google.com/machine-learning/crash-course"),
    "Scikit-learn": ("Scikit-learn learning guide", "https://scikit-learn.org/stable/user_guide.html"),
    "React": ("React documentation", "https://react.dev/learn"),
    "TypeScript": ("TypeScript handbook", "https://www.typescriptlang.org/docs/handbook/intro.html"),
    "Git": ("Pro Git book", "https://git-scm.com/book/en/v2"),
    "Docker": ("Docker getting started", "https://docs.docker.com/get-started/"),
    "Pandas": ("Pandas user guide", "https://pandas.pydata.org/docs/user_guide/index.html"),
    "Data Visualization": ("Plotly fundamentals", "https://plotly.com/python/"),
    "Accessibility": ("W3C accessibility introductions", "https://www.w3.org/WAI/fundamentals/accessibility-intro/"),
    "Cloud": ("AWS Skill Builder", "https://skillbuilder.aws/"),
    "Networking": ("Cisco Networking Academy", "https://www.netacad.com/"),
}
