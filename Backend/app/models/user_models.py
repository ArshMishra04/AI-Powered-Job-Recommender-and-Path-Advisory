from pydantic import BaseModel
from typing import List, Optional, Dict

class UserProfile(BaseModel):
    user_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    skills: List[str] = []
    interests: List[str] = []
    education: Optional[str] = None
    experience_years: Optional[int] = 0
    personality: Optional[str] = None
    work_style: Optional[str] = None
    goals: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class ProfileCreateRequest(BaseModel):
    user_id: str
    name: Optional[str] = None
    email: Optional[str] = None

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    education: Optional[str] = None
    experience_years: Optional[int] = None
    personality: Optional[str] = None
    work_style: Optional[str] = None
    goals: Optional[str] = None

class RecommendPersonalRequest(BaseModel):
    user_id: str
    top_n: Optional[int] = 5

class PredictRequest(BaseModel):
    user_id: str
    horizon_months: Optional[int] = 12

class PersonalRecommendItem(BaseModel):
    career: str
    score: float
    explanation: str

class PersonalRecommendResponse(BaseModel):
    user_id: str
    recommendations: List[PersonalRecommendItem]
    used_profile: dict

class PredictItem(BaseModel):
    career: str
    probability: float
    rationale: str

class PredictResponse(BaseModel):
    user_id: str
    predictions: List[PredictItem]
