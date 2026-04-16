from app.utils.explainability_engine import explain_career_choice
from app.utils.data_loader import CAREERS

career = CAREERS[0]

result = explain_career_choice(
    career=career,
    user_skills=["python", "sql", "statistics"],
    all_careers=CAREERS
)

print(result["why_selected"])
