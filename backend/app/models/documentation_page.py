from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Text, Integer, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.id_gen import generate_cuid

if TYPE_CHECKING:
    from app.models.project import Project


class DocumentationPage(Base):
    __tablename__ = "documentation_pages"
    __table_args__ = (
        UniqueConstraint("project_id", "slug", name="uq_docpage_project_slug"),
        Index("ix_docpages_project_id", "project_id"),
        Index("ix_docpages_order", "order"),
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
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    slug: Mapped[str] = mapped_column(String(300), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationship
    project: Mapped[Project] = relationship("Project", back_populates="documentation_pages")
