from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Text, ForeignKey, Index, UniqueConstraint, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import HttpMethod
from app.models.id_gen import generate_cuid

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.parameter import Parameter
    from app.models.example import Example


class Endpoint(Base):
    __tablename__ = "endpoints"
    __table_args__ = (
        UniqueConstraint("project_id", "path", "method", name="uq_endpoint_project_path_method"),
        Index("ix_endpoints_project_id", "project_id"),
        Index("ix_endpoints_method", "method"),
        Index("ix_endpoints_tag", "tag"),
        {
            **Base.__table_args__,
        },
    )

    id: Mapped[str] = mapped_column(
        String(30), primary_key=True, default=generate_cuid
    )
    project_id: Mapped[str] = mapped_column(
        String(30), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    path: Mapped[str] = mapped_column(String(500), nullable=False)
    method: Mapped[HttpMethod] = mapped_column(
        SAEnum(HttpMethod, native_enum=False, length=10), nullable=False
    )
    summary: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    tag: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    project: Mapped[Project] = relationship("Project", back_populates="endpoints")
    parameters: Mapped[list[Parameter]] = relationship(
        "Parameter",
        back_populates="endpoint",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    examples: Mapped[list[Example]] = relationship(
        "Example",
        back_populates="endpoint",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
