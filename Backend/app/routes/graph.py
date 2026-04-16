from fastapi import APIRouter, HTTPException
from app.utils.graph_engine import build_career_graph, get_career_transitions

router = APIRouter(prefix="/graph", tags=["Graph"])


@router.get("/full")
def get_full_graph():
    """
    Returns full career graph (adjacency list)
    """
    return build_career_graph()


@router.get("/career/{career_name}")
def get_career_graph(career_name: str, top_n: int = 5):
    """
    Returns top related career transitions for a given career
    """
    transitions = get_career_transitions(career_name, top_n)

    if not transitions:
        raise HTTPException(
            status_code=404,
            detail="Career not found or no transitions available"
        )

    return {
        "career": career_name,
        "connections": transitions
    }
