from typing import List, Dict
from app.utils.confidence_engine import calculate_confidence
from app.utils.similarity_engine import get_similar_careers
from app.utils.clustering_engine import get_cluster_for_career


def compare_careers(
    careers: List[Dict],
    career_names: List[str],
    user_skills: List[str],
    effort: int
) -> Dict:
    """
    Compare multiple careers for a user.
    Does NOT modify any shared engine contracts.
    """

    results = []

    for career in careers:
        # ----------------------------
        # Confidence (SAFE handling)
        # ----------------------------
        confidence_result = calculate_confidence(
            user_skills=user_skills,
            required_skills=career.get("required_skills", [])
        )

        # Handle tuple return safely
        if isinstance(confidence_result, tuple):
            fit_score = confidence_result[0]
            confidence_level = confidence_result[1]
            explanation = confidence_result[2]
        else:
            fit_score = confidence_result.get("score", 0)
            confidence_level = confidence_result.get("level", "Unknown")
            explanation = confidence_result.get(
                "explanation",
                confidence_result.get("reason", "")
            )

        # ----------------------------
        # Similar careers
        # ----------------------------
        similar = get_similar_careers(
            career_name=career["career_name"],
            top_k=3
        )

        # ----------------------------
        # Cluster info
        # ----------------------------
        cluster = get_cluster_for_career(career["career_name"])

        # ----------------------------
        # Effort adjustment (simple)
        # ----------------------------
        adjusted_score = fit_score - (effort * 5)

        results.append({
            "career": career["career_name"],
            "fit_score": fit_score,
            "adjusted_score": max(adjusted_score, 0),
            "confidence_level": confidence_level,
            "confidence_explanation": explanation,
            "cluster": cluster,
            "similar_careers": [c[0] for c in similar]
        })

    return {
        "input_careers": career_names,
        "effort_level": effort,
        "comparison": sorted(
            results,
            key=lambda x: x["adjusted_score"],
            reverse=True
        )
    }
