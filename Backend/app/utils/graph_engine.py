from typing import Dict, List
from app.utils.similarity_engine import load_similarity, get_similar_careers
from app.utils.clustering_engine import load_clusters

SIMILARITY_THRESHOLD = 0.55  # safe, not too loose


def build_career_graph() -> Dict[str, List[dict]]:
    """
    Builds an adjacency list where each career
    links to similar careers with reason & strength.
    """

    _, _, career_names = load_similarity()
    clusters = load_clusters()

    # reverse cluster lookup: career -> cluster_id
    career_to_cluster = {}
    for cluster in clusters.values():
        for c in cluster["careers"]:
            career_to_cluster[c] = cluster["cluster_id"]

    graph: Dict[str, List[dict]] = {}

    for career in career_names:
        graph[career] = []

        # 🔹 get similarities for THIS career
        similarities = get_similar_careers(career, top_k=10)

        for other, score in similarities:
            if score < SIMILARITY_THRESHOLD:
                continue

            same_cluster = (
                career_to_cluster.get(career)
                == career_to_cluster.get(other)
            )

            reason_parts = []
            if score >= 0.7:
                reason_parts.append("high skill similarity")
            if same_cluster:
                reason_parts.append("same career cluster")

            graph[career].append({
                "career": other,
                "strength": round(score, 3),
                "reason": " + ".join(reason_parts)
                if reason_parts else "related skills"
            })

        # sort strongest transitions first
        graph[career].sort(
            key=lambda x: x["strength"],
            reverse=True
        )

    return graph


def get_career_transitions(career_name: str, top_n: int = 5):
    graph = build_career_graph()

    if career_name not in graph:
        return []

    return graph[career_name][:top_n]
