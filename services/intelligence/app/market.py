"""Market explorer with explicitly synthetic demonstration data.

For actual predictions ingest validated, dated observations and back-test before release.
"""
from __future__ import annotations
from datetime import date
import math
import numpy as np
from sklearn.linear_model import Ridge
from .catalog import ROLES

PARAMETERS = [(66, 2.8), (90, 1.6), (52, 3.5), (112, 1.8), (104, 1.2), (60, 2.4)]

def month_add(start: date, offset: int) -> str:
    year = start.year + (start.month - 1 + offset) // 12
    month = (start.month - 1 + offset) % 12 + 1
    return f"{year:04d}-{month:02d}"

def market(role: str, horizon: int = 6) -> dict:
    if role not in ROLES:
        raise ValueError("Choose a supported career role.")
    if not 1 <= horizon <= 12:
        raise ValueError("Select a forecast window between 1 and 12 months.")
    index = list(ROLES).index(role)
    base, slope = PARAMETERS[index]
    # Fixed demo window, not purported real-time records.
    series = [{"month": month_add(date(2025, 5, 1), i),
               "count": round(base + slope * i + 5 * math.sin(i * 0.8 + index))}
              for i in range(18)]
    x = np.arange(18).reshape(-1, 1)
    y = np.array([item["count"] for item in series])
    model = Ridge(alpha=1.0).fit(x, y)
    values = model.predict(np.arange(18, 18 + horizon).reshape(-1, 1))
    future = [{"month": month_add(date(2025, 5, 1), 18 + i),
               "count": max(0, round(float(v)))} for i, v in enumerate(values)]
    current, first = series[-1]["count"], series[0]["count"]
    return {
        "role_id": role, "role": ROLES[role]["title"],
        "data_status": "synthetic_demo", "can_make_real_world_claims": False,
        "source_label": "Synthetic example dataset — not job-board or employer postings",
        "method": "Ridge regression extrapolation, educational illustration only",
        "history": series, "forecast": future,
        "latest_sample_count": current, "sample_growth_pct": round(100 * (current / first - 1), 1),
        "sample_projection": future[-1]["count"],
        "disclaimer": "Demo-only numbers. Real demand forecasts require historical sourced job listings and time-based backtesting.",
    }
