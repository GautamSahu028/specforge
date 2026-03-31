from __future__ import annotations

import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.crud.endpoint import search_endpoints
from app.schemas.endpoint import EndpointOut
from app.schemas.response import PaginatedResponse, PaginationMeta

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=PaginatedResponse[EndpointOut])
async def search(
    q: str = Query(..., min_length=1, max_length=200),
    project_id: str | None = Query(None, alias="projectId"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    endpoints, total = await search_endpoints(
        db, query=q, project_id=project_id, page=page, limit=limit
    )
    return PaginatedResponse(
        data=[EndpointOut.model_validate(ep) for ep in endpoints],
        pagination=PaginationMeta(
            page=page,
            limit=limit,
            total=total,
            total_pages=math.ceil(total / limit) if limit else 0,
        ),
    )
