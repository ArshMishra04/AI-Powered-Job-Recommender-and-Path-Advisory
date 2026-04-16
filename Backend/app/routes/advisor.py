from fastapi import APIRouter
from app.models.advisor_models import AdvisorRequest
from app.utils.advisor_engine import ai_advisor

router = APIRouter(prefix="/advisor", tags=["Advisor"])


@router.post("/")
def advisor_endpoint(payload: AdvisorRequest):
    return ai_advisor(
        interests=payload.interests,
        skills=payload.skills,
        effort=payload.effort,
        compare=payload.compare
    )
