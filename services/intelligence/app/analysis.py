"""Explainable, rule-based skill detection; never claim semantic LLM evaluation."""
from __future__ import annotations
import re
from .catalog import ALIASES, RESOURCES, ROLES

MAX_TEXT = 120_000


def extract_skills(text: str) -> dict[str, str]:
    """Return a representative match excerpt for each explicitly mentioned skill."""
    found: dict[str, str] = {}
    for skill, patterns in ALIASES.items():
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                start, end = max(0, match.start() - 40), min(len(text), match.end() + 48)
                excerpt = " ".join(text[start:end].split())
                found[skill] = ("…" if start else "") + excerpt + ("…" if end < len(text) else "")
                break
    return found


def analyze(text: str, role: str) -> dict:
    if role not in ROLES:
        raise ValueError("Please select a supported career role.")
    if len(text.strip()) < 30:
        raise ValueError("Please provide a resume with at least 30 characters of meaningful text.")
    if len(text) > MAX_TEXT:
        raise ValueError("Resume text is too long (120,000-character limit).")
    detected = extract_skills(text)
    skill_weights = ROLES[role]["skills"]
    total = sum(weight for _, weight in skill_weights)
    have = sum(weight for name, weight in skill_weights if name in detected)
    matched = [{"skill": name, "weight": weight, "evidence": detected[name]}
               for name, weight in skill_weights if name in detected]
    missing = [{"skill": name, "weight": weight}
               for name, weight in skill_weights if name not in detected]
    missing.sort(key=lambda x: (-x["weight"], x["skill"]))
    roadmap = []
    for i, item in enumerate(missing[:8]):
        title, url = RESOURCES.get(item["skill"], ("Find official documentation and build a project", ""))
        roadmap.append({"skill": item["skill"], "priority": i + 1, "effort": "Foundations + practice project",
                        "resource_title": title, "resource_url": url})
    return {
        "role_id": role, "role": ROLES[role]["title"],
        "score": round(have / total * 100),
        "score_type": "weighted_keyword_alignment",
        "matched": matched, "missing": missing,
        "detected_skills": sorted(detected), "roadmap": roadmap,
        "methodology": "Explicit keyword and abbreviation matching against a curated, weighted role rubric. Mentions are not proof of proficiency.",
        "disclaimer": "Not a measure of hiring probability or a validated career-readiness assessment.",
    }
