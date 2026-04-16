from collections import Counter
from app.utils.data_loader import load_careers_json


class CareerService:
    def __init__(self):
        self.careers = load_careers_json()

    # ----------------------------
    # SKILLS
    # ----------------------------
    def get_popular_skills(self, limit=50):
        counter = Counter()

        for c in self.careers:
            for s in c.get("required_skills", []) + c.get("optional_skills", []):
                counter[s] += 1

        return [
            {
                "name": skill,
                "popularity": count,
                "category": "general",
            }
            for skill, count in counter.most_common(limit)
        ]

    def search_skills(self, query, category="all", limit=50):
        query = query.lower()
        skills = self.get_popular_skills(500)

        filtered = [
            s for s in skills
            if query in s["name"].lower()
        ]

        return filtered[:limit]

    # ----------------------------
    # INTERESTS (🔥 NEW)
    # ----------------------------
    def get_all_interests(self):
        interests = set()
        for c in self.careers:
            for i in c.get("interests", []):
                interests.add(i)
        return sorted(interests)

    def search_interests(self, query, limit=50):
        query = query.lower()
        interests = self.get_all_interests()

        filtered = [
            i for i in interests
            if query in i.lower()
        ]

        return filtered[:limit]

    # ----------------------------
    # CAREERS
    # ----------------------------
    def search_careers(self, skills=None, interests=None, limit=10):
        skills = skills or []
        interests = interests or []

        results = []

        for c in self.careers:
            score = 0

            for s in skills:
                if s.lower() in " ".join(c.get("required_skills", [])).lower():
                    score += 2

            for i in interests:
                if i.lower() in " ".join(c.get("interests", [])).lower():
                    score += 1

            if score > 0:
                results.append({
                    "career_name": c["career_name"],
                    "category": c.get("category"),
                    "match_score": score,
                    "required_skills": c.get("required_skills", []),
                    "optional_skills": c.get("optional_skills", []),
                })

        results.sort(key=lambda x: x["match_score"], reverse=True)
        return results[:limit]

    def get_categories(self):
        return sorted(set(c.get("category") for c in self.careers))


career_service = CareerService()
