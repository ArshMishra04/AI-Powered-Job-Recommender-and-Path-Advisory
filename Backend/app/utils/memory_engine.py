import json
import os

MEMORY_PATH = "app/data/user_generated_careers.json"

# ensure memory file exists
if not os.path.exists(MEMORY_PATH):
    with open(MEMORY_PATH, "w", encoding="utf-8") as f:
        json.dump([], f)

def remember_new_career(name: str, user_query: str):
    with open(MEMORY_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    data.append({
        "career_name": name,
        "user_query": user_query
    })

    with open(MEMORY_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    return True
