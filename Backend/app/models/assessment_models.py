from pydantic import BaseModel
from typing import List, Optional

class AssessmentRequest(BaseModel):
    user_id: Optional[str] = None
    skills: List[str]
    interests: Optional[List[str]] = None
    education: Optional[str] = None
    experience_years: Optional[int] = 0
    goals: Optional[str] = None
    answers: List[float]  # REQUIRED for scoring

class AssessmentResult(BaseModel):
    score: float
    category: str
