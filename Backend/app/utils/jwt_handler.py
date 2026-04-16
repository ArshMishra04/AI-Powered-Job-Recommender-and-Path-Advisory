import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, status

SECRET_KEY = "your_secret_key_here"
ALGORITHM = "HS256"

def create_token(data: dict):
    try:
        payload = data.copy()
        expire = datetime.utcnow() + timedelta(hours=3)
        payload.update({"exp": expire})

        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        return token

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token generation failed"
        )
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")

    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
