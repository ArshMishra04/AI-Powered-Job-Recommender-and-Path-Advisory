from fastapi import APIRouter, HTTPException, Query
from app.utils.explainability_engine import explain_career_choice
from app.utils.data_loader import load_careers_json

router = APIRouter(prefix="/explain", tags=["Explainability"])

CAREERS = load_careers_json()


@router.get("/career/{career_name}")
def explain_career(
    career_name: str,
    user_skills: list[str] = Query(default=[])
):
    """
    Explain why a career fits the user
    """

    career = next(
        (c for c in CAREERS if c["career_name"].lower() == career_name.lower()),
        None
    )

    if not career:
        raise HTTPException(status_code=404, detail="Career not found")

    explanation = explain_career_choice(
        career=career,
        user_skills=user_skills,
        all_careers=CAREERS
    )

    return explanation
