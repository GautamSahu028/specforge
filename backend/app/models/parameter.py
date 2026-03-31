from __future__ import annotations

from datetime import datetime
from typing import Any, TYPE_CHECKING

from sqlalchemy import String, Boolean, ForeignKey, Index, Enum as SAEnum
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import ParamLocation
from app.models.id_gen import generate_cuid

if TYPE_CHECKING:
    from app.models.endpoint import Endpoint


class Parameter(Base):
    __tablename__ = "parameters"
    __table_args__ = (
        Index("ix_parameters_endpoint_id", "endpoint_id"),
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
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    location: Mapped[ParamLocation] = mapped_column(
        SAEnum(ParamLocation, native_enum=False, length=10), nullable=False
    )
    type: Mapped[str] = mapped_column(String(50), nullable=False, default="string")
    required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    schema_def: Mapped[dict[str, Any] | None] = mapped_column(
        "schema", JSON, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    # Relationship
    endpoint: Mapped[Endpoint] = relationship("Endpoint", back_populates="parameters")
