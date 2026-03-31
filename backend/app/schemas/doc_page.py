from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DocPageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    title: str
    slug: str
    content: str
    order: int
    created_at: datetime
    updated_at: datetime


class DocPageCreate(BaseModel):
    title: str
    slug: str
    content: str
    order: int = 0
