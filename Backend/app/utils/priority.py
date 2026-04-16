# app/utils/priority.py
from typing import List, Dict

# Simple normalization helpers
def _normalize(x, min_v, max_v):
    if max_v == min_v:
        return 0.0
    return (x - min_v) / (max_v - min_v)

def compute_priority_scores(career: dict, user_skills: List[str]) -> Dict[str, float]:
    """
    Returns a map skill -> score (0-100).
    Heuristic factors:
      - required vs optional
      - demand_level (High/Medium/Low mapped to numeric)
      - salary midpoint (if available) normalized roughly
      - difficulty penalty
    """
    required = set([s.lower() for s in career.get("required_skills", [])])
    optional = set([s.lower() for s in career.get("optional_skills", [])])

    demand_map = {"low": 0.3, "medium": 0.6, "high": 1.0}
    demand_text = str(career.get("demand_level", "")).lower()
    demand_weight = demand_map.get(demand_text, 0.6)

    # rough salary normalization (expects strings like "3–40 LPA")
    salary_raw = career.get("salary_range", "")
    salary_mid = 0.0
    try:
        parts = salary_raw.replace("LPA", "").replace("lpa", "").split("–")
        if len(parts) == 2:
            lo = float(parts[0].strip())
            hi = float(parts[1].strip())
            salary_mid = (lo + hi) / 2.0
    except Exception:
        salary_mid = 0.0

    # simple difficulty mapping
    def diff_penalty(s):
        s = str(s).lower()
        if "easy" in s: return 0.1
        if "hard" in s: return 0.9
        return 0.4

    # collect candidate skills (union)
    skills = list(required.union(optional))
    if not skills:
        # fallback: try career tools or required_skills spelled variety
        skills = [s.lower() for s in career.get("required_skills", [])]

    # To normalize salary across many careers we'd need global stats.
    # Here we'll make a local heuristic: map salary_mid to 0..1 by dividing by 50 LPA
    salary_norm = min(salary_mid / 50.0, 1.0)

    scores = {}
    for s in skills:
        s_clean = s.lower()
        relevance = 1.0 if s_clean in required else 0.6
        user_has = 1.0 if s_clean in [x.lower() for x in user_skills] else 0.0
        difficulty = diff_penalty(s_clean)

        # weighted formula — tuneable
        raw = (0.45 * relevance) + (0.25 * demand_weight) + (0.20 * salary_norm) - (0.15 * difficulty)
        # if user already has skill, reduce priority a bit
        raw = raw * (0.5 if user_has else 1.0)

        # clamp and scale to 0-100
        score = max(0.0, min(1.0, raw)) * 100.0
        scores[s] = round(score, 2)

    return scores
