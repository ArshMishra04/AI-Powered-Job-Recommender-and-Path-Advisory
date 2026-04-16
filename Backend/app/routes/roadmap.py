from fastapi import APIRouter, HTTPException
from app.models.roadmap_models import RoadmapRequest, RoadmapResponse
from app.utils.data_loader import load_careers_json
from app.utils.roadmap_engine import create_full_roadmap

router = APIRouter()
CAREERS = load_careers_json()

@router.post("/", response_model=RoadmapResponse)
def generate_roadmap(payload: RoadmapRequest):
    name = payload.career.lower().strip()
    selected = None
    for c in CAREERS:
        if c["career_name"].lower().strip() == name:
            selected = c
            break

    if not selected:
        raise HTTPException(status_code=404, detail="Career not found")

    effort = payload.effort or 3

    full = create_full_roadmap(selected, payload.current_skills, effort)

    return {
        "career": selected["career_name"],
        "difficulty": selected.get("difficulty_level", "Medium"),
        "skill_gap": full["skill_gap"],
        "priority_scores": full["priority_scores"],
        "courses": full["courses"],
        "projects": full["projects"],
        "timeline": full["timeline"],
        "explanation": full["explanation"]
    }
