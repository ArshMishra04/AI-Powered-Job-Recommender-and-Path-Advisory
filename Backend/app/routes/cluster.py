from fastapi import APIRouter, HTTPException
from app.utils.clustering_engine import (
    train_clusters,
    load_clusters,
    get_cluster_for_career
)

router = APIRouter(prefix="/clusters", tags=["Clustering"])


@router.post("/train")
def train_cluster_endpoint(n_clusters: int = 10):
    """
    Train career clusters (admin / dev use).
    """
    clusters = train_clusters(n_clusters=n_clusters)
    return {
        "message": "Clusters trained successfully",
        "total_clusters": len(clusters)
    }


@router.get("/")
def get_all_clusters():
    """
    Return all career clusters.
    """
    try:
        clusters = load_clusters()
        return {
            "total_clusters": len(clusters),
            "clusters": clusters
        }
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Clusters not trained yet"
        )


@router.get("/{career_name}")
def get_cluster_for_single_career(career_name: str):
    """
    Get cluster info for a specific career.
    """
    result = get_cluster_for_career(career_name)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Career not found in any cluster"
        )

    return result
