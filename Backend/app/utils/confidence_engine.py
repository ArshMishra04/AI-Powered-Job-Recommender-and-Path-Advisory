# app/utils/confidence_engine.py

from typing import Dict, List


def calculate_confidence(
    user_skills: List[str],
    required_skills: List[str]
) -> Dict:
    user_set = set(s.lower() for s in user_skills)
    required_set = set(s.lower() for s in required_skills)

    matched = list(user_set.intersection(required_set))
    missing = list(required_set.difference(user_set))

    if not required_set:
        fit_score = 0
    else:
        fit_score = int((len(matched) / len(required_set)) * 100)

    if fit_score >= 75:
        level = "Strong Fit"
    elif fit_score >= 45:
        level = "Moderate Fit"
    else:
        level = "Weak Fit"

    explanation = (
        f"You match {len(matched)} out of {len(required_set)} core skills."
    )

    return {
        "fit_score": fit_score,
        "confidence_level": level,
        "confidence_explanation": explanation,
        "matched_skills": matched,
        "missing_skills": missing
    }
