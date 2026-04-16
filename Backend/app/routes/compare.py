from fastapi import APIRouter, HTTPException
from app.models.compare_models import CompareRequest
from app.utils.comparison_engine import compare_careers
from app.utils.data_loader import CAREERS

router = APIRouter(prefix="/compare", tags=["Career Comparison"])


@router.post("")
def compare_endpoint(payload: CompareRequest):
    if len(payload.careers) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least two careers are required for comparison"
        )

    selected_careers = [
        c for c in CAREERS if c["career_name"] in payload.careers
    ]

    if len(selected_careers) < 2:
        raise HTTPException(
            status_code=400,
            detail="Provided career names not found in dataset"
        )

    # ✅ FIX: pass career_names explicitly
    return compare_careers(
        careers=selected_careers,
        career_names=payload.careers,
        user_skills=payload.user_skills,
        effort=payload.effort
    )
