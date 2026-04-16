# app/ml/similarity.py
from typing import List, Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ---------- Step 1 (already done) ----------
def career_to_text(career: Dict) -> str:
    fields = []

    fields.append(career.get("career_name", ""))

    fields.extend(career.get("interests", []))
    fields.extend(career.get("tags", []))
    fields.extend(career.get("keywords", []))
    fields.extend(career.get("required_skills", []))
    fields.extend(career.get("optional_skills", []))

    return " ".join([str(f).lower() for f in fields if f])


# ---------- Step 2 (NEW) ----------
def build_tfidf_matrix(careers: List[Dict]):
    """
    Builds TF-IDF matrix for all careers
    """
    texts = [career_to_text(c) for c in careers]

    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=5000,
        ngram_range=(1, 2)
    )

    tfidf_matrix = vectorizer.fit_transform(texts)

    return tfidf_matrix, vectorizer


def compute_similarity_matrix(tfidf_matrix):
    """
    Computes cosine similarity between all careers
    """
    return cosine_similarity(tfidf_matrix)


def get_similar_careers(
    career_index: int,
    careers: List[Dict],
    similarity_matrix,
    top_k: int = 5
):
    """
    Returns top-K similar careers (excluding itself)
    """
    scores = list(enumerate(similarity_matrix[career_index]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)

    results = []
    for idx, score in scores[1 : top_k + 1]:
        results.append({
            "career": careers[idx]["career_name"],
            "similarity_score": round(float(score), 3)
        })

    return results
