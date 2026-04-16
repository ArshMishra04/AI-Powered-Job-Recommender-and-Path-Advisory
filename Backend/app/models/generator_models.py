# app/models/generator_models.py
from pydantic import BaseModel
from typing import Optional, List

class GeneratorRequest(BaseModel):
    career_name: str
    user_interests: Optional[List[str]] = None
    user_skills: Optional[List[str]] = []
    tone: Optional[str] = "neutral"     # NEW

class SummaryResponse(BaseModel):
    career_name: str
    summary: str

class ResponsibilitiesResponse(BaseModel):
    career_name: str
    responsibilities: str

class WhyFitResponse(BaseModel):
    career_name: str
    why_fit: str

class PitchResponse(BaseModel):
    career_name: str
    pitch: str
