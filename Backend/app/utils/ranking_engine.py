# app/utils/ranking_engine.py
from typing import List, Dict
from app.utils.confidence_engine import calculate_confidence


def rank_careers(
    careers: List[Dict],
    interests: str,
    user_skills: List[str],
    effort: int = 3
) -> List[Dict]:
    """
    Ranks careers based on:
    - interest match
    - skill overlap
    - confidence score
    """

    interest_lower = interests.lower()
    ranked = []

    for career in careers:
        score = 0

        # 1️⃣ Interest / tag / keyword matching
        text_blob = " ".join(
            career.get("interests", [])
            + career.get("tags", [])
            + career.get("keywords", [])
            + [career.get("career_name", "")]
        ).lower()

        if interest_lower in text_blob:
            score += 40

        # 2️⃣ Skill overlap
        required = [s.lower() for s in career.get("required_skills", [])]
        user = [s.lower() for s in user_skills]

        overlap = len(set(required) & set(user))
        score += overlap * 10

        # 3️⃣ Confidence score (✅ FIXED CALL)
        confidence = calculate_confidence(
            career=career,
            user_skills=user_skills
        )
        score += confidence["fit_score"] * 0.3

        ranked.append({
            **career,
            "_score": round(score, 2)
        })

    # Sort descending by score
    ranked.sort(key=lambda x: x["_score"], reverse=True)

    return ranked
