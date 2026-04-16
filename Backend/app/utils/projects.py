# app/utils/projects.py
from typing import List, Dict

def generate_projects(career: dict, missing_skills: List[str]):
    """
    Return a list of ProjectItem-like dicts (beginner/intermediate/advanced).
    """
    career_name = career.get("career_name", "Unknown")
    projects = []

    # Beginner
    projects.append({
        "level": "beginner",
        "title": f"{career_name} — Starter Project",
        "description": f"Small project to apply basics: use {', '.join(missing_skills[:2])} to build a simple pipeline.",
        "estimated_time": "2–4 weeks"
    })

    # Intermediate
    projects.append({
        "level": "intermediate",
        "title": f"{career_name} — Portfolio Project",
        "description": f"Create a full pipeline and deploy it. Use {', '.join(missing_skills[:4])}.",
        "estimated_time": "1–2 months"
    })

    # Advanced
    projects.append({
        "level": "advanced",
        "title": f"{career_name} — Production-like Project",
        "description": f"Build a scalable, monitored system (streaming/ETL/ML) using multiple skills: {', '.join(missing_skills)}.",
        "estimated_time": "2–4 months"
    })

    return projects
