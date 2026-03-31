from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ExampleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    endpoint_id: str
    type: str
    title: str
    language: str | None = None
    code: str
    status_code: int | None = None
    created_at: datetime


class ExampleCreate(BaseModel):
    type: str
    title: str
    language: str | None = None
    code: str
    status_code: int | None = None
