from typing import List, Dict, Tuple
from app.utils.data_loader import load_careers_json
from app.utils.priority import compute_priority_scores
from app.utils.roadmap_engine import create_full_roadmap

CAREERS = load_careers_json()

def _skill_similarity_score(profile_skills: List[str], career: dict) -> float:
    # Simple overlap ratio of profile skills vs career required skills
    req = [s.lower() for s in career.get("required_skills", [])]
    prof = [s.lower() for s in profile_skills]
    if not req:
        return 0.0
    inter = set(req).intersection(set(prof))
    return (len(inter) / len(req))  # 0..1

def _interests_score(profile_interests: List[str], career: dict) -> float:
    cat = career.get("category","").lower()
    # crude match: do any interests appear in category or career_name
    for i in profile_interests:
        li = i.lower()
        if li in cat or li in career.get("career_name","").lower():
            return 1.0
    return 0.0

def score_profile_to_career(profile: dict, career: dict) -> float:
    # blend: skill overlap (50%), priority/importance (30%), interests (20%)
    skill_sim = _skill_similarity_score(profile.get("skills", []), career)
    # priority scores from compute_priority_scores (0-100) -> normalize to 0-1
    priorities = compute_priority_scores(career, profile.get("skills", []))
    # take average priority value
    if priorities:
        avg_priority = sum(priorities.values()) / len(priorities.values()) / 100.0
    else:
        avg_priority = 0.0
    interests = _interests_score(profile.get("interests", []), career)
    final = 0.5 * skill_sim + 0.3 * avg_priority + 0.2 * interests
    return round(final, 4)

def recommend_for_profile(profile: dict, top_n:int=5) -> List[Tuple[float, dict]]:
    scored = []
    for c in CAREERS:
        s = score_profile_to_career(profile, c)
        scored.append((s, c))
    scored.sort(reverse=True, key=lambda x: x[0])
    return scored[:top_n]

def build_personalized_recommendations(profile: dict, top_n:int=5, effort:int=3):
    recs = recommend_for_profile(profile, top_n)
    out = []
    for score, career in recs:
        # also generate a small roadmap snippet using your engine
        roadmap_full = create_full_roadmap(career, profile.get("skills", []), effort)
        out.append({
            "career": career.get("career_name"),
            "score": round(float(score), 3),
            "explanation": f"Matched by skills overlap and interests in {career.get('category','Unknown')}",
            "roadmap_preview": {
                "difficulty": career.get("difficulty_level", "Medium"),
                "top_missing_skills": [s["skill"] for s in roadmap_full["skill_gap"][:4]],
                "timeline": roadmap_full["timeline"]
            }
        })
    return out
