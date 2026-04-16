# app/routes/careers.py
from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from app.utils.data_loader import load_careers_json
import difflib

router = APIRouter()
CAREERS = load_careers_json()

# Lightweight index for faster lookups (built once)
CAREER_NAMES = [c.get("career_name","") for c in CAREERS]
CAREER_CATEGORIES = sorted(list({c.get("category","Unknown") for c in CAREERS}))

def _normalize(s: str) -> str:
    return s.lower().strip()

@router.get("/search", summary="Search careers by name/keyword/category")
def search_careers(
    q: Optional[str] = Query(None, description="Search query (name, keyword, skill, category)"),
    category: Optional[str] = Query(None, description="Filter by career category"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty_level"),
    limit: int = Query(20, gt=0, le=100)
):
    results = CAREERS

    if category:
        results = [c for c in results if _normalize(c.get("category","")) == _normalize(category)]

    if difficulty:
        results = [c for c in results if _normalize(c.get("difficulty_level","")) == _normalize(difficulty)]

    if q:
        nq = _normalize(q)
        # match on career_name, description, required_skills, optional_skills, tools
        def matches(c):
            if nq in _normalize(c.get("career_name","")): return True
            if nq in _normalize(c.get("career_description","")): return True
            # skills and tools
            txt = " ".join(c.get("required_skills",[]) + c.get("optional_skills",[]) + c.get("tools",[]))
            if nq in _normalize(txt): return True
            # category/subcategory
            if nq in _normalize(c.get("sub_category","")) or nq in _normalize(c.get("category","")):
                return True
            return False
        results = [c for c in results if matches(c)]

    # cap and return summary fields
    out = []
    for c in results[:limit]:
        out.append({
            "career_name": c.get("career_name"),
            "category": c.get("category"),
            "sub_category": c.get("sub_category"),
            "difficulty_level": c.get("difficulty_level"),
            "short_description": c.get("career_description","")[:260]
        })
    return {"count": len(results), "results": out}


@router.get("/autocomplete", summary="Career name autocomplete")
def autocomplete(query: str = Query(..., description="Partial career name"), limit: int = Query(10, le=20)):
    q = _normalize(query)
    # fast contains + fuzzy fallback
    contains = [name for name in CAREER_NAMES if q in _normalize(name)]
    if len(contains) >= limit:
        return {"query": query, "suggestions": contains[:limit]}

    # fuzzy match using difflib (names)
    scores = [(difflib.SequenceMatcher(None, q, _normalize(name)).ratio(), name) for name in CAREER_NAMES]
    scores.sort(reverse=True, key=lambda x: x[0])
    suggestions = [s[1] for s in scores if s[0] > 0.3]  # threshold
    # merge contains + fuzzy preserving order and unique
    final = []
    for n in contains + suggestions:
        if n not in final:
            final.append(n)
        if len(final) >= limit:
            break

    return {"query": query, "suggestions": final}


@router.get("/categories", summary="List categories and counts")
def categories():
    # build mapping category -> list of careers (names only)
    mapping = {}
    for c in CAREERS:
        cat = c.get("category","Unknown")
        mapping.setdefault(cat, []).append(c.get("career_name"))
    # convert to list of dicts sorted by count descending
    cat_list = [{"category": k, "count": len(v), "sample": v[:6]} for k,v in mapping.items()]
    cat_list.sort(key=lambda x: x["count"], reverse=True)
    return {"total_categories": len(mapping), "categories": cat_list}

@router.get("/detail/{career_name}", summary="Get full career details")
def career_detail(career_name: str):
    name = career_name.lower()
    for c in CAREERS:
        if c.get("career_name","").lower() == name:
            return c
    raise HTTPException(status_code=404, detail="Career not found")
