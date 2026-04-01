from typing import Optional

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.user import create_user, get_user_by_email, get_user_by_id, verify_password
from app.db.session import get_db
from app.schemas.auth import TokenResponse, UserCreate, UserLogin, UserOut
from app.services.auth_service import create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

_COOKIE = "access_token"
_COOKIE_MAX_AGE = 7 * 24 * 60 * 60  # 7 days


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=_COOKIE,
        value=token,
        httponly=True,
        max_age=_COOKIE_MAX_AGE,
        samesite="lax",
        secure=False,  # set True behind HTTPS in production
        path="/",
    )


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    body: UserCreate,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    if await get_user_by_email(db, body.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    user = await create_user(db, body)
    _set_auth_cookie(response, create_access_token(user.id))
    return TokenResponse(user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login(
    body: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    user = await get_user_by_email(db, body.email)
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    _set_auth_cookie(response, create_access_token(user.id))
    return TokenResponse(user=UserOut.model_validate(user))


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key=_COOKIE, path="/", samesite="lax")
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserOut)
async def get_me(
    access_token: Optional[str] = Cookie(default=None),
    db: AsyncSession = Depends(get_db),
):
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_id = decode_access_token(access_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return UserOut.model_validate(user)
