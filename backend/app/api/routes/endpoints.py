from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.exceptions import NotFoundError
from app.crud.endpoint import get_endpoint_by_id
from app.schemas.endpoint import EndpointOut
from app.schemas.response import SuccessResponse

router = APIRouter(prefix="/endpoints", tags=["endpoints"])


@router.get("/{endpoint_id}", response_model=SuccessResponse[EndpointOut])
async def get_endpoint(endpoint_id: str, db: AsyncSession = Depends(get_db)):
    endpoint = await get_endpoint_by_id(db, endpoint_id)
    if not endpoint:
        raise NotFoundError("Endpoint")
    return SuccessResponse(data=EndpointOut.model_validate(endpoint))
