from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Text, Integer, ForeignKey, Index, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import ExampleType
from app.models.id_gen import generate_cuid

if TYPE_CHECKING:
    from app.models.endpoint import Endpoint


class Example(Base):
    __tablename__ = "examples"
    __table_args__ = (
        Index("ix_examples_endpoint_id", "endpoint_id"),
        Index("ix_examples_type", "type"),
        {
            **Base.__table_args__,
        },
    )

    id: Mapped[str] = mapped_column(
        String(30), primary_key=True, default=generate_cuid
    )
    endpoint_id: Mapped[str] = mapped_column(
        String(30), ForeignKey("endpoints.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[ExampleType] = mapped_column(
        SAEnum(ExampleType, native_enum=False, length=10), nullable=False
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    language: Mapped[str | None] = mapped_column(String(30), nullable=True)
    code: Mapped[str] = mapped_column(Text, nullable=False)
    status_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    # Relationship
    endpoint: Mapped[Endpoint] = relationship("Endpoint", back_populates="examples")
