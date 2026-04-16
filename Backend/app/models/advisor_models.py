from pydantic import BaseModel
from typing import Optional, Dict, Any, List


class AdvisorRequest(BaseModel):
    interests: Optional[List[str]] = None
    skills: List[str]
    experience_level: str = "beginner"
    effort: int = 3
    compare: bool = False   # ✅ ADD THIS (required by route)


class AdvisorResponse(BaseModel):
    career: Optional[str]
    experience_level: str
    confidence: Optional[Dict[str, Any]]
    why_selected: str
    roadmap: Optional[Dict[str, Any]]
