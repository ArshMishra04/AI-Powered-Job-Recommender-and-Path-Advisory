# app/utils/sentence_generator.py

from typing import Dict, Optional, List, Union
import random
import hashlib

# --------------------------------------------------
# Deterministic randomness (IMPORTANT)
# --------------------------------------------------
def _seed_from_text(text: str):
    """
    Same input text -> same random output
    """
    seed = int(hashlib.md5(text.encode()).hexdigest(), 16)
    random.seed(seed)

# --------------------------------------------------
# Templates
# --------------------------------------------------
FORMAL_SUMMARY = [
    "{career} is a professional role within {category}. It requires competencies such as {skills} and familiarity with tools like {tools}.",
    "The position of {career} operates in the {category} domain and demands proficiency in {skills}."
]

CASUAL_SUMMARY = [
    "{career} is a great option if you enjoy {what_kind}. You’ll mostly work with {skills} and tools like {tools}.",
    "If you like {what_kind}, then {career} could be a fun and practical career choice."
]

MOTIVATIONAL_SUMMARY = [
    "Choosing {career} can be a powerful step toward a future in {category}. By learning {skills}, you can build a strong career foundation.",
    "{career} offers exciting opportunities for those passionate about {what_kind}. Start with {skills} and grow from there."
]

SUMMARY_TEMPLATES = [
    "The role of {career} sits in {category}. It typically requires skills such as {skills} and tools like {tools}.",
    "{career} is a {difficulty} career in {category}. Core skills include {skills}.",
    "{career} involves work related to {what_kind}. Commonly used skills include {skills}."
]

RESPONSIBILITY_TEMPLATES = [
    "Typical responsibilities include: {bullets}.",
    "You will often be expected to: {bullets}.",
    "{career}s commonly handle tasks such as {bullets}."
]

WHY_FIT_TEMPLATES = [
    "Because you have experience with {matching_skills}, {career} could be a strong fit for you.",
    "Your interest in {user_interests} matches this role well, as {career} relies on {skills}.",
    "If you enjoy {user_interests} and have skills like {matching_skills}, {career} offers a clear professional path."
]

SHORT_PITCH_TEMPLATES = [
    "{career} — a great career for those who enjoy {what_kind}. Learn {skills} and build practical projects.",
    "Want to become a {career}? Start with {starter_skills} and work with tools like {tools}."
]

# --------------------------------------------------
# Helpers
# --------------------------------------------------
def _join_list(items: List[str], limit: int = 4) -> str:
    if not items:
        return "relevant skills"
    items = items[:limit]
    if len(items) == 1:
        return items[0]
    return ", ".join(items[:-1]) + " and " + items[-1]

def _normalize_interests(interests: Optional[Union[str, List[str]]]) -> str:
    """
    Accepts None, string, or list[str] and returns safe string
    """
    if not interests:
        return "this field"
    if isinstance(interests, list):
        return _join_list(interests, 3)
    return str(interests)

def apply_style(text: str, style: str) -> str:
    if style == "short":
        return text.split(".")[0] + "."
    if style == "detailed":
        return text + " This career also offers long-term growth and diverse opportunities."
    if style == "casual":
        return text.replace("typically", "usually")
    return text

# --------------------------------------------------
# Generators
# --------------------------------------------------
def generate_summary(
    career: Dict,
    user_interests: Optional[Union[str, List[str]]] = None,
    tone: str = "neutral",
    style: str = "normal"
) -> str:

    career_name = career.get("career_name", "This career")
    _seed_from_text(career_name)

    category = career.get("category", "Unknown")
    difficulty = career.get("difficulty_level", "Medium")
    skills = _join_list(career.get("required_skills", []), 5)
    tools = _join_list(career.get("tools", []), 3)
    what_kind = career.get("sub_category") or category

    if tone == "formal":
        template = random.choice(FORMAL_SUMMARY)
    elif tone == "casual":
        template = random.choice(CASUAL_SUMMARY)
    elif tone == "motivational":
        template = random.choice(MOTIVATIONAL_SUMMARY)
    else:
        template = random.choice(SUMMARY_TEMPLATES)

    text = template.format(
        career=career_name,
        category=category,
        difficulty=difficulty,
        skills=skills,
        tools=tools,
        what_kind=what_kind
    )

    return apply_style(text, style)


def generate_responsibilities(career: Dict, style: str = "normal") -> str:
    _seed_from_text(career.get("career_name", "career"))

    bullets = (
        career.get("learning_path")
        or career.get("beginner_projects")
        or career.get("advanced_projects")
        or []
    )

    bullets_str = _join_list(bullets, 5)
    template = random.choice(RESPONSIBILITY_TEMPLATES)

    text = template.format(
        career=career.get("career_name", "This role"),
        bullets=bullets_str
    )

    return apply_style(text, style)


def generate_why_fit(
    career: Dict,
    user_skills: List[str],
    user_interests: Optional[Union[str, List[str]]] = None,
    style: str = "normal"
) -> str:

    _seed_from_text(career.get("career_name", "career"))

    req = career.get("required_skills", []) + career.get("optional_skills", [])
    matching = [s for s in req if any(uk.lower() in s.lower() for uk in user_skills)]
    matching_skills = _join_list(matching, 4)

    template = random.choice(WHY_FIT_TEMPLATES)

    text = template.format(
        career=career.get("career_name", "This career"),
        matching_skills=matching_skills,
        user_interests=_normalize_interests(user_interests),
        skills=_join_list(career.get("required_skills", []), 4)
    )

    return apply_style(text, style)


def generate_short_pitch(career: Dict, style: str = "normal") -> str:
    _seed_from_text(career.get("career_name", "career"))

    text = random.choice(SHORT_PITCH_TEMPLATES).format(
        career=career.get("career_name", "This career"),
        what_kind=career.get("sub_category", career.get("category", "the field")),
        skills=_join_list(career.get("required_skills", []), 3),
        starter_skills=_join_list(career.get("required_skills", [])[:2], 2),
        tools=_join_list(career.get("tools", []), 2)
    )

    return apply_style(text, style)
