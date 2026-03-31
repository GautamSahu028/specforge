from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.documentation_page import DocumentationPage


async def create_doc_page(db: AsyncSession, **kwargs) -> DocumentationPage:
    page = DocumentationPage(**kwargs)
    db.add(page)
    await db.flush()
    await db.refresh(page)
    return page


async def get_doc_pages_by_project(
    db: AsyncSession, project_id: str
) -> list[DocumentationPage]:
    stmt = (
        select(DocumentationPage)
        .where(DocumentationPage.project_id == project_id)
        .order_by(DocumentationPage.order.asc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_doc_page_by_slug(
    db: AsyncSession, project_id: str, slug: str
) -> DocumentationPage | None:
    stmt = select(DocumentationPage).where(
        DocumentationPage.project_id == project_id,
        DocumentationPage.slug == slug,
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def update_doc_page(
    db: AsyncSession, page_id: str, **kwargs
) -> DocumentationPage | None:
    page = await db.get(DocumentationPage, page_id)
    if page:
        for key, value in kwargs.items():
            setattr(page, key, value)
        await db.flush()
        await db.refresh(page)
    return page
