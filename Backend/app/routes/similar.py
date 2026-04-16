from fastapi import APIRouter
from app.data.loader import CAREERS
from app.utils.similarity_engine import train_similarity, get_similar_careers

router = APIRouter(prefix="/similar", tags=["Similarity"])

# Train similarity model once
train_similarity(CAREERS)

@router.get("/{career_name}")
def similar_careers(career_name: str, top_k: int = 5):
    return get_similar_careers(career_name, top_k)
