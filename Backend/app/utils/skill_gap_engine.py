def skill_gap_analysis(user_skills, required_skills):
    missing = list(set(required_skills) - set(user_skills))

    difficulty_map = {
        "easy": "1–2 weeks",
        "medium": "3–6 weeks",
        "hard": "2–3 months"
    }

    def predict_difficulty(skill):
        s = skill.lower()
        if "python" in s: return ("Easy", difficulty_map["easy"])
        if "docker" in s: return ("Medium", difficulty_map["medium"])
        if "kubernetes" in s: return ("Hard", difficulty_map["hard"])
        if "c++" in s: return ("Hard", difficulty_map["hard"])
        if "microservices" in s: return ("Hard", difficulty_map["hard"])
        return ("Medium", difficulty_map["medium"])

    result = []
    for s in missing:
        diff, time = predict_difficulty(s)
        result.append({
            "skill": s,
            "difficulty": diff,
            "estimated_time": time
        })

    return result
