from pydantic import BaseModel
from typing import List, Optional

class RecommendRequest(BaseModel):
    interests: Optional[List[str]] = None

class ExtraSuggestion(BaseModel):
    career: str
    confidence: float

class RecommendResponse(BaseModel):
    career: str
    confidence: float
    skills: List[str] = []
    description: str = ""
    extra: List[ExtraSuggestion] = []
