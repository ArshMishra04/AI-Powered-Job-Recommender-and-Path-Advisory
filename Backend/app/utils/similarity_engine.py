import os
import pickle
from typing import List, Tuple

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.utils.data_loader import load_careers_json

DATA_DIR = "app/data"
VECTORIZER_PATH = os.path.join(DATA_DIR, "tfidf_vectorizer.pkl")
MATRIX_PATH = os.path.join(DATA_DIR, "tfidf_matrix.pkl")
NAMES_PATH = os.path.join(DATA_DIR, "career_names.pkl")


# ----------------------------
# TRAINING
# ----------------------------
def train_similarity(careers: list | None = None):
    if careers is None:
        careers = load_careers_json()

    texts = []
    names = []

    for c in careers:
        combined = " ".join(
            c.get("tags", [])
            + c.get("keywords", [])
            + c.get("interests", [])
            + c.get("required_skills", [])
        )
        texts.append(combined)
        names.append(c["career_name"])

    vectorizer = TfidfVectorizer(stop_words="english")
    matrix = vectorizer.fit_transform(texts)

    os.makedirs(DATA_DIR, exist_ok=True)

    with open(VECTORIZER_PATH, "wb") as f:
        pickle.dump(vectorizer, f)

    with open(MATRIX_PATH, "wb") as f:
        pickle.dump(matrix, f)

    with open(NAMES_PATH, "wb") as f:
        pickle.dump(names, f)

    return vectorizer, matrix, names


# ----------------------------
# LOADING
# ----------------------------
def load_similarity():
    if not os.path.exists(MATRIX_PATH):
        raise RuntimeError("Similarity model not trained")

    with open(VECTORIZER_PATH, "rb") as f:
        vectorizer = pickle.load(f)

    with open(MATRIX_PATH, "rb") as f:
        matrix = pickle.load(f)

    with open(NAMES_PATH, "rb") as f:
        names = pickle.load(f)

    return vectorizer, matrix, names


# ----------------------------
# ORIGINAL FUNCTION (KEEP)
# ----------------------------
def get_similar_careers(
    career_name: str,
    top_k: int = 5
) -> List[Tuple[str, float]]:

    _, matrix, names = load_similarity()

    if career_name not in names:
        return []

    idx = names.index(career_name)
    scores = cosine_similarity(matrix[idx], matrix)[0]

    ranked = sorted(
        zip(names, scores),
        key=lambda x: x[1],
        reverse=True
    )

    ranked = [(n, float(s)) for n, s in ranked if n != career_name]
    return ranked[:top_k]


# ----------------------------
# ✅ BACKWARD COMPATIBILITY WRAPPER
# ----------------------------
def get_similarity_scores(
    career_name: str,
    top_k: int = 5
) -> List[str]:
    """
    Wrapper so older engines don't break.
    Returns only career names.
    """
    similar = get_similar_careers(career_name, top_k)
    return [name for name, _ in similar]
