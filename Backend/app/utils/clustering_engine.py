# app/utils/clustering_engine.py

from sklearn.cluster import KMeans
import pickle
import os
import numpy as np
from collections import Counter
from app.utils.similarity_engine import load_similarity

DATA_DIR = "app/data"
CLUSTER_PATH = os.path.join(DATA_DIR, "career_clusters.pkl")

def train_clusters(n_clusters: int = 10):
    """
    Train KMeans on TF-IDF career vectors
    Saves:
    - cluster assignments
    - cluster keywords
    """
    vectorizer, matrix, career_names = load_similarity()

    model = KMeans(
        n_clusters=n_clusters,
        random_state=42,
        n_init=10
    )

    labels = model.fit_predict(matrix)

    feature_names = vectorizer.get_feature_names_out()

    clusters = {}
    cluster_keywords = {}

    for cluster_id in range(n_clusters):
        idxs = np.where(labels == cluster_id)[0]
        careers = [career_names[i] for i in idxs]

        # Compute top keywords for the cluster
        centroid = model.cluster_centers_[cluster_id]
        top_indices = centroid.argsort()[-8:][::-1]
        keywords = [feature_names[i] for i in top_indices]

        clusters[cluster_id] = {
            "cluster_id": cluster_id,
            "careers": careers,
            "keywords": keywords,
            "theme": " / ".join(keywords[:2]).title()
        }

    with open(CLUSTER_PATH, "wb") as f:
        pickle.dump(clusters, f)

    return clusters

def load_clusters():
    if not os.path.exists(CLUSTER_PATH):
        return train_clusters()

    with open(CLUSTER_PATH, "rb") as f:
        return pickle.load(f)

def get_cluster_for_career(career_name: str):
    clusters = load_clusters()

    for cluster in clusters.values():
        if career_name in cluster["careers"]:
            return {
                "career": career_name,
                "cluster_id": cluster["cluster_id"],
                "cluster_theme": cluster["theme"],
                "related_careers": cluster["careers"],
                "keywords": cluster["keywords"]
            }

    return None
