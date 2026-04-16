# app/utils/courses.py
from typing import List, Dict

# Lightweight mapping: skill keyword -> list of recommended resources (title, source, hours, type)
_COURSE_SEED = {
    "python": [
        {"name": "Python for Everybody", "source": "Coursera", "duration": "20 hrs", "type": "free"},
        {"name": "Complete Python Bootcamp", "source": "Udemy", "duration": "30 hrs", "type": "paid"},
    ],
    "sql": [
        {"name": "SQL for Data Science", "source": "Coursera", "duration": "15 hrs", "type": "free"},
        {"name": "The Complete SQL Bootcamp", "source": "Udemy", "duration": "18 hrs", "type": "paid"}
    ],
    "docker": [
        {"name": "Docker for Developers", "source": "Udemy", "duration": "6 hrs", "type": "paid"},
        {"name": "Docker Basics", "source": "YouTube", "duration": "4 hrs", "type": "free"}
    ],
    "kubernetes": [
        {"name": "Kubernetes Fundamentals", "source": "YouTube", "duration": "10 hrs", "type": "free"},
        {"name": "Kubernetes for Developers", "source": "Coursera", "duration": "25 hrs", "type": "paid"}
    ],
    "aws": [
        {"name": "AWS Cloud Practitioner", "source": "Coursera", "duration": "20 hrs", "type": "paid"}
    ],
    "machine learning": [
        {"name": "Machine Learning by Andrew Ng", "source": "Coursera", "duration": "60 hrs", "type": "free"},
    ]
}

def recommend_courses_for_skills(skills: List[str], max_per_skill:int=1):
    results = []
    for s in skills:
        key = s.lower()
        # fuzzy match: find key in seed keys
        matched = None
        for k in _COURSE_SEED.keys():
            if k in key or key in k:
                matched = k
                break
        if matched:
            items = _COURSE_SEED[matched][:max_per_skill]
            for it in items:
                results.append({
                    "skill": s,
                    "name": it["name"],
                    "source": it["source"],
                    "duration": it.get("duration"),
                    "type": it.get("type")
                })
    return results
