from pydantic import BaseModel, Field
from typing import List, Optional


class ConfidenceRequest(BaseModel):
    career: str
    user_skills: List[str]

    # accept both "interest" and "interests"
    interests: Optional[List[str]] = Field(
        default=None,
        alias="interest"
    )

    class Config:
        populate_by_name = True


class ConfidenceResponse(BaseModel):
    career: str
    fit_score: int
    confidence_level: str
    explanation: str
