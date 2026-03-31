from __future__ import annotations

from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.export_service import export_markdown

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/{project_id}/markdown")
async def export_md(project_id: str, db: AsyncSession = Depends(get_db)):
    markdown = await export_markdown(db, project_id)
    return PlainTextResponse(
        content=markdown,
        media_type="text/markdown",
        headers={"Content-Disposition": 'attachment; filename="api-docs.md"'},
    )
