from pydantic import BaseModel
from typing import List, Optional


class SearchResult(BaseModel):
    name: str
    category: Optional[str]
    popularity: Optional[int]
    type: str


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total: int
    suggestions: List[SearchResult]
