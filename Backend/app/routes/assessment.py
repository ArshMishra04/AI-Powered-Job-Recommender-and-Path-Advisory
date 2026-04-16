from fastapi import APIRouter
from app.models.assessment_models import AssessmentRequest, AssessmentResult

router = APIRouter()

@router.post("/submit", response_model=AssessmentResult)
def submit_assessment(payload: AssessmentRequest):
    score = sum(payload.answers) / len(payload.answers)

    return AssessmentResult(
        score=score,
        category="Technical" if score > 0.5 else "General"
    )
