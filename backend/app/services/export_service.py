from __future__ import annotations

from collections import defaultdict
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.crud.project import get_project_by_id


async def export_markdown(db: AsyncSession, project_id: str) -> str:
    project = await get_project_by_id(db, project_id)
    if not project:
        raise NotFoundError("Project")

    lines: list[str] = []
    lines.append(f"# {project.name}\n")
    if project.description:
        lines.append(f"{project.description}\n")
    lines.append("---\n")

    # Group endpoints by tag
    grouped: dict[str, list] = defaultdict(list)
    for ep in project.endpoints:
        tag = ep.tag or "General"
        grouped[tag].append(ep)

    for tag, endpoints in grouped.items():
        lines.append(f"## {tag}\n")

        for ep in endpoints:
            method_val = ep.method.value if hasattr(ep.method, "value") else ep.method
            lines.append(f"### `{method_val}` {ep.path}\n")
            if ep.summary:
                lines.append(f"{ep.summary}\n")
            if ep.description:
                lines.append(f"{ep.description}\n")

            # Parameters table
            if ep.parameters:
                lines.append("#### Parameters\n")
                lines.append("| Name | Location | Type | Required | Description |")
                lines.append("|------|----------|------|----------|-------------|")
                for p in ep.parameters:
                    loc = p.location.value if hasattr(p.location, "value") else p.location
                    req = "Yes" if p.required else "No"
                    desc = p.description or "-"
                    lines.append(f"| `{p.name}` | {loc} | {p.type} | {req} | {desc} |")
                lines.append("")

            # Examples by type
            requests = [e for e in ep.examples if (e.type.value if hasattr(e.type, "value") else e.type) == "REQUEST"]
            responses = [e for e in ep.examples if (e.type.value if hasattr(e.type, "value") else e.type) == "RESPONSE"]
            errors = [e for e in ep.examples if (e.type.value if hasattr(e.type, "value") else e.type) == "ERROR"]

            for label, group in [
                ("Request Examples", requests),
                ("Response Examples", responses),
                ("Error Scenarios", errors),
            ]:
                if group:
                    lines.append(f"#### {label}\n")
                    for ex in group:
                        status = f" ({ex.status_code})" if ex.status_code else ""
                        lines.append(f"**{ex.title}{status}**\n")
                        lines.append(f"```{ex.language or ''}")
                        lines.append(ex.code)
                        lines.append("```\n")

            lines.append("---\n")

    # Documentation pages
    if project.documentation_pages:
        lines.append("## Additional Documentation\n")
        for page in sorted(project.documentation_pages, key=lambda p: p.order):
            lines.append(f"### {page.title}\n")
            lines.append(f"{page.content}\n")

    return "\n".join(lines)
