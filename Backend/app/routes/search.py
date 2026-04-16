from fastapi import APIRouter, Query
from typing import List
from app.models.search_models import SearchResponse, SearchResult
from ..services.career_service import career_service

router = APIRouter()


@router.get("", response_model=SearchResponse)
async def search(
    q: str = Query("", description="Search query"),
    type: str = Query("skills", description="skills | interests | careers | jobs"),
    category: str = Query("all"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    query = q.strip()
    results: List[SearchResult] = []
    suggestions: List[SearchResult] = []

    # ----------------------------
    # SKILLS
    # ----------------------------
    if type == "skills":
        skills = (
            career_service.get_popular_skills(limit)
            if len(query) < 2
            else career_service.search_skills(query, category, limit)
        )

        results = [
            SearchResult(
                name=s["name"],
                category=s.get("category"),
                popularity=s.get("popularity"),
                type="skill",
            )
            for s in skills
        ]

    # ----------------------------
    # INTERESTS (🔥 FIXED)
    # ----------------------------
    elif type == "interests":
        interests = career_service.search_interests(query, limit)

        results = [
            SearchResult(
                name=i,
                category=None,
                popularity=None,
                type="interest",
            )
            for i in interests
        ]

    # ----------------------------
    # CAREERS / JOBS
    # ----------------------------
    elif type in {"careers", "jobs"}:
        careers = career_service.search_careers(
            skills=[query] if query else [],
            limit=limit,
        )

        results = [
            SearchResult(
                name=c["career_name"],
                category=c.get("category"),
                popularity=int(c.get("match_score", 50)),
                type="career" if type == "careers" else "job",
            )
            for c in careers
        ]

    suggestions = results[:10]

    return SearchResponse(
        query=query,
        results=results[offset: offset + limit],
        total=len(results),
        suggestions=suggestions,
    )
