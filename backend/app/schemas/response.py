from __future__ import annotations

from typing import Any, Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: list[Any] | None = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail


class SuccessResponse(BaseModel, Generic[T]):
    success: bool = True
    data: T


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = True
    data: list[T]
    pagination: PaginationMeta
