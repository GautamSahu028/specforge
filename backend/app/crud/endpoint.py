from __future__ import annotations

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.endpoint import Endpoint
from app.models.parameter import Parameter
from app.models.example import Example
from app.schemas.endpoint import EndpointCreate
from app.schemas.example import ExampleCreate


async def create_endpoints_batch(
    db: AsyncSession,
    project_id: str,
    endpoints_data: list[EndpointCreate],
) -> list[Endpoint]:
    """Create multiple endpoints with nested params/examples in a single flush."""
    created: list[Endpoint] = []

    for ep_data in endpoints_data:
        endpoint = Endpoint(
            project_id=project_id,
            path=ep_data.path,
            method=ep_data.method.upper(),
            summary=ep_data.summary,
            description=ep_data.description,
            tag=ep_data.tag,
        )
        db.add(endpoint)
        await db.flush()

        # Nested parameters
        for p in ep_data.parameters:
            param = Parameter(
                endpoint_id=endpoint.id,
                name=p.name,
                location=p.location.upper(),
                type=p.type,
                required=p.required,
                description=p.description,
                schema_def=p.schema_def,
            )
            db.add(param)

        # Nested examples
        for ex in ep_data.examples:
            example = Example(
                endpoint_id=endpoint.id,
                type=ex.type.upper(),
                title=ex.title,
                language=ex.language,
                code=ex.code,
                status_code=ex.status_code,
            )
            db.add(example)

        await db.flush()
        await db.refresh(endpoint)
        created.append(endpoint)

    return created


async def get_endpoint_by_id(db: AsyncSession, endpoint_id: str) -> Endpoint | None:
    stmt = (
        select(Endpoint)
        .where(Endpoint.id == endpoint_id)
        .options(
            selectinload(Endpoint.parameters),
            selectinload(Endpoint.examples),
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_endpoints_by_project(
    db: AsyncSession, project_id: str
) -> list[Endpoint]:
    stmt = (
        select(Endpoint)
        .where(Endpoint.project_id == project_id)
        .options(
            selectinload(Endpoint.parameters),
            selectinload(Endpoint.examples),
        )
        .order_by(Endpoint.tag.asc(), Endpoint.path.asc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def add_examples_to_endpoint(
    db: AsyncSession,
    endpoint_id: str,
    examples_data: list[ExampleCreate],
) -> list[Example]:
    created: list[Example] = []
    for ex_data in examples_data:
        example = Example(
            endpoint_id=endpoint_id,
            type=ex_data.type.upper(),
            title=ex_data.title,
            language=ex_data.language,
            code=ex_data.code,
            status_code=ex_data.status_code,
        )
        db.add(example)
        created.append(example)
    await db.flush()
    return created


async def search_endpoints(
    db: AsyncSession,
    query: str,
    project_id: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Endpoint], int]:
    pattern = f"%{query}%"
    filters = [
        or_(
            Endpoint.path.ilike(pattern),
            Endpoint.summary.ilike(pattern),
            Endpoint.description.ilike(pattern),
            Endpoint.tag.ilike(pattern),
        )
    ]
    if project_id:
        filters.append(Endpoint.project_id == project_id)

    # Count
    count_stmt = select(func.count(Endpoint.id)).where(*filters)
    total = (await db.execute(count_stmt)).scalar_one()

    # Data
    data_stmt = (
        select(Endpoint)
        .where(*filters)
        .options(
            selectinload(Endpoint.parameters),
            selectinload(Endpoint.examples),
        )
        .order_by(Endpoint.path.asc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await db.execute(data_stmt)
    return list(result.scalars().all()), total
