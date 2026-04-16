import json
import os
from typing import List, Dict

DATA_DIR = os.path.join("app", "data")
CAREERS_PATH = os.path.join(DATA_DIR, "careers.json")

def load_careers() -> List[Dict]:
    if not os.path.exists(CAREERS_PATH):
        raise FileNotFoundError("careers.json not found")

    with open(CAREERS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError("careers.json must be a list")

    return data


# 🔹 shared in-memory dataset
CAREERS = load_careers()


# 🔹 backward compatibility (IMPORTANT)
def load_careers_json():
    return CAREERS
