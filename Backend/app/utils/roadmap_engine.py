from typing import List, Dict, Tuple

from app.utils.priority import compute_priority_scores
from app.utils.courses import recommend_courses_for_skills
from app.utils.projects import generate_projects


def build_timeline_phases(
    prioritized_skills: List[Tuple[str, float]],
    effort: int = 3
):
    """
    Build 3, 6, and 12 month roadmap timelines.
    effort: 1–5 (higher = faster pace)
    """

    speed_map = {1: 0.6, 2: 0.8, 3: 1.0, 4: 1.4, 5: 1.8}
    speed = speed_map.get(effort, 1.0)

    top_skills = [s for s, _ in prioritized_skills[:6]]

    three_months = []

    if top_skills:
        three_months.append(f"Week 1–2: Fundamentals of {top_skills[0]}")
        three_months.append(f"Week 3–4: Build a mini project using {top_skills[0]}")

    if len(top_skills) > 1:
        three_months.append(f"Month 2: Learn {top_skills[1]} and integrate it")

    if len(top_skills) > 2:
        three_months.append(f"Month 3: Add {top_skills[2]} and finalize project")

    six_months = [
        "Months 1–2: Complete core courses for top skills",
        "Months 3–4: Build an integrated intermediate project",
        "Months 5–6: Deploy, test, document, and polish portfolio"
    ]

    twelve_months = [
        "Months 1–3: Strengthen foundations and algorithms",
        "Months 4–6: Learn advanced topics and cloud deployment",
        "Months 7–9: Build a production-level system",
        "Months 10–12: Interview prep, mock interviews, job applications"
    ]

    def tag(plan):
        return [f"{step} (pace x{speed})" for step in plan]

    return tag(three_months), tag(six_months), tag(twelve_months)


def generate_roadmap(
    career: Dict,
    user_skills: List[str],
    effort: int = 3
) -> Dict:
    """
    Core roadmap generator.
    """

    user_skills_lower = [s.lower() for s in user_skills]

    scores: Dict[str, float] = compute_priority_scores(
        career=career,
        user_skills=user_skills
    )

    prioritized = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    missing_skills = [
        s for s in career.get("required_skills", [])
        if s.lower() not in user_skills_lower
    ]

    skill_gap = []

    for skill in missing_skills:
        sl = skill.lower()
        score = scores.get(sl, 0.0)

        difficulty = "Medium"
        est_time = "3–6 weeks"

        if any(k in sl for k in ["kubernetes", "microservices", "c++"]):
            difficulty = "Hard"
            est_time = "2–3 months"
        elif any(k in sl for k in ["git", "sql", "excel"]):
            difficulty = "Easy"
            est_time = "1–2 weeks"

        if score >= 70:
            priority = "High"
        elif score >= 40:
            priority = "Medium"
        else:
            priority = "Low"

        skill_gap.append({
            "skill": skill,
            "difficulty": difficulty,
            "estimated_time": est_time,
            "priority": priority,
            "priority_score": round(score, 2)
        })

    courses = recommend_courses_for_skills(
        [s for s, _ in prioritized[:6]],
        max_per_skill=1
    )

    projects = generate_projects(
        career=career,
        missing_skills=missing_skills
    )

    three, six, twelve = build_timeline_phases(
        prioritized_skills=prioritized,
        effort=effort
    )

    return {
        "skill_gap": skill_gap,
        "priority_scores": scores,
        "courses": courses,
        "projects": projects,
        "timeline": {
            "three_months": three,
            "six_months": six,
            "twelve_months": twelve
        },
        "explanation": (
            f"Roadmap generated using {len(prioritized)} scored skills. "
            f"Effort level {effort} adjusted learning pace."
        )
    }


# ✅ WRAPPER FOR API & ADVISOR (THIS FIXES YOUR ERROR)
def create_full_roadmap(
    career: Dict,
    user_skills: List[str],
    effort: int = 3
) -> Dict:
    """
    Public-facing roadmap API.
    """
    return generate_roadmap(
        career=career,
        user_skills=user_skills,
        effort=effort
    )
