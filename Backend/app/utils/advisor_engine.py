# app/utils/advisor_engine.py

from app.utils.confidence_engine import calculate_confidence
from app.utils.similarity_engine import get_similar_careers
from app.utils.data_loader import load_careers_json

CAREERS = load_careers_json()


def ai_advisor(
    interests=None,
    skills=None,
    experience=0,
    effort=3,
    compare=False
):
    """
    Core advisor engine
    """

    interests = interests or []
    skills = skills or []

    scored_careers = []

    for career in CAREERS:
        # ---------- CONFIDENCE ----------
        confidence_result = calculate_confidence(
            skills,
            career.get("required_skills", [])
        )

        # 🔑 SAFE extraction (FIX)
        fit_score = confidence_result.get("fit_score", 0)
        confidence_level = confidence_result.get("confidence_level", "Unknown")
        explanation = confidence_result.get("explanation", "")

        scored_careers.append({
            "career_name": career.get("career_name"),
            "fit_score": fit_score,
            "confidence_level": confidence_level,
            "confidence_explanation": explanation,
            "category": career.get("category"),
            "difficulty_level": career.get("difficulty_level")
        })

    # ---------- SORT ----------
    scored_careers.sort(key=lambda x: x["fit_score"], reverse=True)

    # ---------- SIMILARITY (OPTIONAL) ----------
    if compare and scored_careers:
        top_career = scored_careers[0]["career_name"]
        similar = get_similar_careers(top_career)

        return {
            "best_match": scored_careers[0],
            "alternatives": scored_careers[1:5],
            "similar_careers": similar
        }

    return {
        "recommendations": scored_careers[:5]
    }
