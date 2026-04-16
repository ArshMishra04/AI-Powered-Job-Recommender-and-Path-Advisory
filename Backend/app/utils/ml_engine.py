import json
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

DATA_PATH = "app/data/careers.json"

# Load dataset
with open(DATA_PATH, "r", encoding="utf-8") as f:
    CAREERS = json.load(f)

# Prepare text corpus for ML
corpus = [
    f"{c['career_name']} {c['category']} {c['sub_category']} "
    f"{' '.join(c.get('required_skills', []))} "
    f"{c.get('career_description','')}"
    for c in CAREERS
]

vectorizer = TfidfVectorizer(stop_words="english")
tfidf_matrix = vectorizer.fit_transform(corpus)

def ml_match(query: str):
    """Return best ML match using cosine similarity."""
    query_vec = vectorizer.transform([query])
    scores = cosine_similarity(query_vec, tfidf_matrix)[0]

    best_index = scores.argmax()
    best_score = scores[best_index]

    return best_score, CAREERS[best_index]
