from typing import Dict, List

from app.utils.confidence_engine import calculate_confidence
from app.utils.similarity_engine import get_similar_careers
from app.utils.clustering_engine import get_cluster_for_career


def explain_career_choice(
    career: Dict,
    user_skills: List[str],
    all_careers: List[Dict],
    top_k_similar: int = 5
) -> Dict:
    """
    Core explainability logic.
    This function matches engine contracts exactly.
    """

    # 1️⃣ Confidence (DICT-based output)
    confidence = calculate_confidence(
        user_skills=user_skills,
        required_skills=career.get("required_skills", [])
    )

    fit_score = confidence["fit_score"]
    confidence_level = confidence["confidence_level"]
    confidence_explanation = confidence["confidence_explanation"]
    matched_skills = confidence.get("matched_skills", [])
    missing_skills = confidence.get("missing_skills", [])

    # 2️⃣ Similar careers
    similar_careers = get_similar_careers(
        career_name=career["career_name"],
        top_k=top_k_similar
    )

    # 3️⃣ Cluster information
    cluster_info = get_cluster_for_career(career["career_name"])

    # 4️⃣ Human-readable reasons
    reasons = []

    if fit_score >= 75:
        reasons.append("Strong alignment with your current skill set")
    elif fit_score >= 45:
        reasons.append("Moderate alignment with some upskilling needed")
    else:
        reasons.append("Requires significant upskilling")

    if matched_skills:
        reasons.append(
            f"Matches skills like {', '.join(matched_skills[:3])}"
        )

    if cluster_info:
        reasons.append(
            f"Belongs to the '{cluster_info['cluster_theme']}' career cluster"
        )
        reasons.append(
            f"Related careers include {', '.join(cluster_info['related_careers'][:3])}"
        )

    if similar_careers:
        reasons.append(
            "Closely related to careers like "
            + ", ".join([c[0] for c in similar_careers[:3]])
        )

    return {
        "career": career["career_name"],
        "fit_score": fit_score,
        "confidence_level": confidence_level,
        "confidence_explanation": confidence_explanation,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "cluster": cluster_info,
        "similar_careers": similar_careers,
        "why_selected": reasons
    }


# --------------------------------------------------
# ✅ ADAPTER FUNCTION (DO NOT REMOVE)
# --------------------------------------------------
def generate_explanation(
    career: Dict,
    user_skills: List[str],
    all_careers: List[Dict]
) -> Dict:
    """
    Adapter for advisor_engine and routes.
    Keeps backward compatibility.
    """
    return explain_career_choice(
        career=career,
        user_skills=user_skills,
        all_careers=all_careers
    )
