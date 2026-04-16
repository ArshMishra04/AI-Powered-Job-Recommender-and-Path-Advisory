# app/routes/profile.py

from fastapi import APIRouter, HTTPException
from typing import Dict

from app.models.user_models import (
    ProfileCreateRequest,
    ProfileUpdateRequest,
    RecommendPersonalRequest,
    PredictRequest,
    PredictResponse,
)

from app.utils.user_store import (
    create_or_get_profile,
    update_profile,
    get_profile,
    append_history,
)

from app.utils.personal_matcher import build_personalized_recommendations

router = APIRouter()


@router.post("/create", summary="Create or get profile")
def create_profile(payload: ProfileCreateRequest):
    return create_or_get_profile(
        payload.user_id,
        base={
            "user_id": payload.user_id,
            "name": payload.name,
            "email": payload.email,
        },
    )


@router.get("/{user_id}", summary="Get user profile")
def read_profile(user_id: str):
    prof = get_profile(user_id)
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")
    return prof


@router.patch("/{user_id}", summary="Update profile")
def patch_profile(user_id: str, payload: ProfileUpdateRequest):
    try:
        return update_profile(user_id, payload.dict(exclude_unset=True))
    except KeyError:
        raise HTTPException(status_code=404, detail="Profile not found")


@router.post("/recommend", summary="Personalized recommendations")
def personal_recommend(payload: RecommendPersonalRequest):
    prof = get_profile(payload.user_id)
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")

    recs = build_personalized_recommendations(prof, top_n=payload.top_n)
    append_history(payload.user_id, {"action": "recommend", "top_n": payload.top_n})

    return {
        "user_id": payload.user_id,
        "recommendations": recs,
        "used_profile": prof,
    }


@router.post("/predict", summary="Predict career path", response_model=PredictResponse)
def predict_path(payload: PredictRequest):
    prof = get_profile(payload.user_id)
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")

    recs = build_personalized_recommendations(prof, top_n=5)

    total = sum(r["score"] for r in recs) or 1.0
    predictions = []

    for r in recs[:3]:
        predictions.append({
            "career": r["career"],
            "probability": round(r["score"] / total, 3),
            "rationale": r["explanation"],
        })

    append_history(payload.user_id, {"action": "predict"})

    return {
        "user_id": payload.user_id,
        "predictions": predictions,
    }
