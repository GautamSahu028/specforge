"""initial schema — all tables

Revision ID: 001_initial
Revises:
Create Date: 2026-03-31

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.mysql import JSON, TEXT

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── projects ──────────────────────────────────────────────────────────
    op.create_table(
        "projects",
        sa.Column("id", sa.String(30), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.String(500), nullable=True),
        sa.Column("source_type", sa.String(20), nullable=False, server_default="RAW_CODE"),
        sa.Column("source_code", TEXT, nullable=False),
        sa.Column("framework", sa.String(50), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="PENDING"),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        mysql_engine="InnoDB",
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )
    op.create_index("ix_projects_status", "projects", ["status"])
    op.create_index("ix_projects_created_at", "projects", ["created_at"])

    # ── endpoints ─────────────────────────────────────────────────────────
    op.create_table(
        "endpoints",
        sa.Column("id", sa.String(30), primary_key=True),
        sa.Column("project_id", sa.String(30), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("path", sa.String(500), nullable=False),
        sa.Column("method", sa.String(10), nullable=False),
        sa.Column("summary", sa.String(500), nullable=True),
        sa.Column("description", TEXT, nullable=True),
        sa.Column("tag", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.UniqueConstraint("project_id", "path", "method", name="uq_endpoint_project_path_method"),
        mysql_engine="InnoDB",
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )
    op.create_index("ix_endpoints_project_id", "endpoints", ["project_id"])
    op.create_index("ix_endpoints_method", "endpoints", ["method"])
    op.create_index("ix_endpoints_tag", "endpoints", ["tag"])

    # ── parameters ────────────────────────────────────────────────────────
    op.create_table(
        "parameters",
        sa.Column("id", sa.String(30), primary_key=True),
        sa.Column("endpoint_id", sa.String(30), sa.ForeignKey("endpoints.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("location", sa.String(10), nullable=False),
        sa.Column("type", sa.String(50), nullable=False, server_default="string"),
        sa.Column("required", sa.Boolean, nullable=False, server_default=sa.text("0")),
        sa.Column("description", sa.String(1000), nullable=True),
        sa.Column("schema", JSON, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        mysql_engine="InnoDB",
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )
    op.create_index("ix_parameters_endpoint_id", "parameters", ["endpoint_id"])

    # ── examples ──────────────────────────────────────────────────────────
    op.create_table(
        "examples",
        sa.Column("id", sa.String(30), primary_key=True),
        sa.Column("endpoint_id", sa.String(30), sa.ForeignKey("endpoints.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", sa.String(10), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("language", sa.String(30), nullable=True),
        sa.Column("code", TEXT, nullable=False),
        sa.Column("status_code", sa.Integer, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        mysql_engine="InnoDB",
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )
    op.create_index("ix_examples_endpoint_id", "examples", ["endpoint_id"])
    op.create_index("ix_examples_type", "examples", ["type"])

    # ── documentation_pages ───────────────────────────────────────────────
    op.create_table(
        "documentation_pages",
        sa.Column("id", sa.String(30), primary_key=True),
        sa.Column("project_id", sa.String(30), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("slug", sa.String(300), nullable=False),
        sa.Column("content", TEXT, nullable=False),
        sa.Column("order", sa.Integer, nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.UniqueConstraint("project_id", "slug", name="uq_docpage_project_slug"),
        mysql_engine="InnoDB",
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )
    op.create_index("ix_docpages_project_id", "documentation_pages", ["project_id"])
    op.create_index("ix_docpages_order", "documentation_pages", ["order"])


def downgrade() -> None:
    op.drop_table("documentation_pages")
    op.drop_table("examples")
    op.drop_table("parameters")
    op.drop_table("endpoints")
    op.drop_table("projects")
