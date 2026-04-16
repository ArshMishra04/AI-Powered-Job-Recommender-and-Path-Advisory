# app/routes/generator.py
from fastapi import APIRouter, HTTPException
from app.models.generator_models import GeneratorRequest, SummaryResponse, ResponsibilitiesResponse, WhyFitResponse, PitchResponse
from app.utils.data_loader import load_careers_json
from app.utils.sentence_generator import generate_summary, generate_responsibilities, generate_why_fit, generate_short_pitch

router = APIRouter()
CAREERS = load_careers_json()

def _find_career(name: str):
    n = name.lower().strip()
    for c in CAREERS:
        if c.get("career_name","").lower().strip() == n:
            return c
    return None

@router.post("/summary", response_model=SummaryResponse)
def summary(req: GeneratorRequest):
    career = _find_career(req.career_name)
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    text = generate_summary(career,user_interests=req.user_interests,tone=req.tone)
    return {"career_name": career.get("career_name"), "summary": text}

@router.post("/responsibilities", response_model=ResponsibilitiesResponse)
def responsibilities(req: GeneratorRequest):
    career = _find_career(req.career_name)
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    text = generate_responsibilities(career)
    return {"career_name": career.get("career_name"), "responsibilities": text}

@router.post("/why-fit", response_model=WhyFitResponse)
def why_fit(req: GeneratorRequest):
    career = _find_career(req.career_name)
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    text = generate_why_fit(career, req.user_skills or [], req.user_interests)
    return {"career_name": career.get("career_name"), "why_fit": text}

@router.post("/pitch", response_model=PitchResponse)
def pitch(req: GeneratorRequest):
    career = _find_career(req.career_name)
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    text = generate_short_pitch(career)
    return {"career_name": career.get("career_name"), "pitch": text}
