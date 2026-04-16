from pydantic import BaseModel
from typing import List

class CompareRequest(BaseModel):
    careers: List[str]
    user_skills: List[str]
    effort: int = 3

class CareerComparison(BaseModel):
    career: str
    fit_score: int
    confidence_level: str
    matched_skills: List[str]
    missing_skills: List[str]
    summary: str

class CompareResponse(BaseModel):
    comparison: List[CareerComparison]
    recommended: str
    reason: str
