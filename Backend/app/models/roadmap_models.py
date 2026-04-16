from pydantic import BaseModel
from typing import List, Optional

class RoadmapRequest(BaseModel):
    career: str
    current_skills: List[str]
    effort: Optional[int] = 3

class SkillGapItem(BaseModel):
    skill: str
    difficulty: str
    estimated_time: str
    priority: Optional[str] = None  # High / Medium / Low
    priority_score: Optional[float] = None  # 0-100 numeric

class CourseItem(BaseModel):
    skill: str
    name: str
    source: str
    duration: Optional[str] = None
    type: Optional[str] = None  # free / paid / youtube

class ProjectItem(BaseModel):
    level: str  # beginner / intermediate / advanced
    title: str
    description: str
    estimated_time: Optional[str] = None

class TimelineResponse(BaseModel):
    three_months: List[str]
    six_months: List[str]
    twelve_months: List[str]

class RoadmapResponse(BaseModel):
    career: str
    difficulty: str
    skill_gap: List[SkillGapItem]
    priority_scores: dict
    courses: List[CourseItem]
    projects: List[ProjectItem]
    timeline: TimelineResponse
    explanation: str
