from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

from app.schemas.endpoint import EndpointOut
from app.schemas.doc_page import DocPageOut


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)
    source_type: str = "RAW_CODE"
    source_code: str = Field(..., min_length=10, max_length=100_000)
    framework: str | None = Field(None, max_length=50)


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str | None = None
    source_type: str
    source_code: str
    framework: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime
    endpoints: list[EndpointOut] = []
    documentation_pages: list[DocPageOut] = []


class ProjectListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str | None = None
    source_type: str
    framework: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime
    endpoint_count: int = 0


class ProjectIdBody(BaseModel):
    project_id: str = Field(..., alias="projectId")

    model_config = ConfigDict(populate_by_name=True)
