from __future__ import annotations

from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict


class ParameterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    endpoint_id: str
    name: str
    location: str
    type: str
    required: bool
    description: str | None = None
    schema_def: dict[str, Any] | None = None
    created_at: datetime


class ParameterCreate(BaseModel):
    name: str
    location: str
    type: str = "string"
    required: bool = False
    description: str | None = None
    schema_def: dict[str, Any] | None = None
