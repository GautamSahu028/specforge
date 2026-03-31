from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from app.core.config import get_settings

settings = get_settings()

engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.is_development,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={
        "charset": "utf8mb4",
    },
)
