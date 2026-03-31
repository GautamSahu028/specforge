import json
import logging
from app.services.llm_service import llm_service
from app.prompts.templates import GENERATE_SYSTEM_PROMPT, GENERATE_USER_TEMPLATE
from app.schemas.api import GenerateRequest, GenerateResponse, GeneratedExample, GeneratedDocumentation

logger = logging.getLogger(__name__)

VALID_TYPES = {"REQUEST", "RESPONSE", "ERROR"}


def _sanitize_example(raw: dict) -> dict | None:
    ex_type = raw.get("type", "").upper()
    if ex_type not in VALID_TYPES:
        return None
    return {
        "type": ex_type,
        "title": raw.get("title", "Example"),
        "language": raw.get("language"),
        "code": raw.get("code", ""),
        "status_code": raw.get("status_code"),
    }


def generate_docs(request: GenerateRequest) -> GenerateResponse:
    ep = request.endpoint
    params_str = json.dumps(ep.parameters, indent=2) if ep.parameters else "None"

    user_prompt = GENERATE_USER_TEMPLATE.format(
        method=ep.method,
        path=ep.path,
        summary=ep.summary or "N/A",
        description=ep.description or "N/A",
        parameters=params_str,
    )

    result = llm_service.call_json(GENERATE_SYSTEM_PROMPT, user_prompt)

    # Sanitize examples
    raw_examples = result.get("examples", [])
    examples = []
    for raw in raw_examples:
        sanitized = _sanitize_example(raw)
        if sanitized:
            examples.append(GeneratedExample(**sanitized))

    # Extract documentation
    raw_doc = result.get("documentation", {})
    documentation = GeneratedDocumentation(
        title=raw_doc.get("title", f"{ep.method} {ep.path}"),
        content=raw_doc.get("content", f"## {ep.method} {ep.path}\n\nDocumentation pending."),
    )

    logger.info(f"Generated {len(examples)} examples for {ep.method} {ep.path}")

    return GenerateResponse(examples=examples, documentation=documentation)
