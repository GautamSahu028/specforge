from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.schemas.parameter import ParameterOut, ParameterCreate
from app.schemas.example import ExampleOut, ExampleCreate


class EndpointOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    path: str
    method: str
    summary: str | None = None
    description: str | None = None
    tag: str | None = None
    created_at: datetime
    updated_at: datetime
    parameters: list[ParameterOut] = []
    examples: list[ExampleOut] = []


class EndpointCreate(BaseModel):
    path: str
    method: str
    summary: str | None = None
    description: str | None = None
    tag: str | None = None
    parameters: list[ParameterCreate] = []
    examples: list[ExampleCreate] = []
