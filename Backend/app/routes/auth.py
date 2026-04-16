from fastapi import APIRouter, HTTPException
from app.models.auth_models import SignupRequest, LoginRequest, TokenResponse
from app.utils.password import hash_password, verify_password
from app.utils.jwt_handler import create_token

router = APIRouter()

# Temporary DB
_users = {}

@router.post("/signup", status_code=201)
def signup(payload: SignupRequest):
    email = payload.email.lower()

    if email in _users:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_pass = hash_password(payload.password)

    _users[email] = {
        "name": payload.name,
        "email": email,
        "password": hashed_pass,
    }

    return {"message": "Signup successful"}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    email = payload.email.lower()

    user = _users.get(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect password")

    token = create_token({"sub": email})

    return {"access_token": token, "token_type": "bearer"}
