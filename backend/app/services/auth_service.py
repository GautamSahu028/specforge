from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.core.config import get_settings

_ALGORITHM = "HS256"


def create_access_token(user_id: str) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_EXPIRY_DAYS)
    payload = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=_ALGORITHM)


def decode_access_token(token: str) -> str | None:
    """Return user_id from a valid token, or None if invalid/expired."""
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
