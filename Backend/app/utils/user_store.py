import json
import os
from typing import Optional, Dict, Any, List
from datetime import datetime

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USERS_PATH = os.path.join(BASE, "data", "users.json")
HISTORY_PATH = os.path.join(BASE, "data", "user_history.json")

def _ensure_files():
    os.makedirs(os.path.join(BASE, "data"), exist_ok=True)
    if not os.path.exists(USERS_PATH):
        with open(USERS_PATH, "w", encoding="utf-8") as f:
            json.dump({}, f)
    if not os.path.exists(HISTORY_PATH):
        with open(HISTORY_PATH, "w", encoding="utf-8") as f:
            json.dump({}, f)

def load_users() -> Dict[str, dict]:
    _ensure_files()
    with open(USERS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_users(users: Dict[str, dict]):
    _ensure_files()
    with open(USERS_PATH, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2, ensure_ascii=False)

def load_history() -> Dict[str, List[dict]]:
    _ensure_files()
    with open(HISTORY_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def append_history(user_id: str, entry: dict):
    h = load_history()
    h.setdefault(user_id, []).append({"ts": datetime.utcnow().isoformat(), **entry})
    with open(HISTORY_PATH, "w", encoding="utf-8") as f:
        json.dump(h, f, indent=2, ensure_ascii=False)

def create_or_get_profile(user_id: str, base: Optional[dict] = None) -> dict:
    users = load_users()
    if user_id in users:
        return users[user_id]
    profile = base or {"user_id": user_id, "skills": [], "interests": [], "experience_years": 0}
    profile["created_at"] = datetime.utcnow().isoformat()
    profile["updated_at"] = profile["created_at"]
    users[user_id] = profile
    save_users(users)
    return profile

def update_profile(user_id: str, fields: Dict[str, Any]) -> dict:
    users = load_users()
    if user_id not in users:
        raise KeyError("user_not_found")
    users[user_id].update({k: v for k,v in fields.items() if v is not None})
    users[user_id]["updated_at"] = datetime.utcnow().isoformat()
    save_users(users)
    return users[user_id]

def get_profile(user_id: str) -> Optional[dict]:
    users = load_users()
    return users.get(user_id)
