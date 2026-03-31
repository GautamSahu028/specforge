import logging
from app.services.llm_service import llm_service
from app.prompts.templates import PARSE_SYSTEM_PROMPT, PARSE_USER_TEMPLATE
from app.schemas.api import ParseRequest, ParseResponse, ParsedEndpoint

logger = logging.getLogger(__name__)

VALID_METHODS = {"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
VALID_LOCATIONS = {"QUERY", "PATH", "BODY", "HEADER"}


def _sanitize_endpoint(raw: dict) -> dict | None:
    """Validate and sanitize a single parsed endpoint dict."""
    method = raw.get("method", "").upper()
    if method not in VALID_METHODS:
        logger.warning(f"Skipping endpoint with invalid method: {method}")
        return None

    path = raw.get("path", "")
    if not path or not path.startswith("/"):
        logger.warning(f"Skipping endpoint with invalid path: {path}")
        return None

    params = []
    for p in raw.get("parameters", []):
        loc = p.get("location", "").upper()
        if loc not in VALID_LOCATIONS:
            loc = "QUERY"
        params.append({
            "name": p.get("name", "unknown"),
            "location": loc,
            "type": p.get("type", "string"),
            "required": bool(p.get("required", False)),
            "description": p.get("description"),
            "schema": p.get("schema"),
        })

    return {
        "path": path,
        "method": method,
        "summary": raw.get("summary"),
        "description": raw.get("description"),
        "tag": raw.get("tag"),
        "parameters": params,
    }


def parse_api_code(request: ParseRequest) -> ParseResponse:
    source_label = "OpenAPI specification" if request.source_type == "OPENAPI_SPEC" else "API source code"
    framework_hint = f"Framework: {request.framework}" if request.framework else "Detect the framework automatically."

    user_prompt = PARSE_USER_TEMPLATE.format(
        source_type=source_label,
        framework_hint=framework_hint,
        source_code=request.source_code,
    )

    result = llm_service.call_json(PARSE_SYSTEM_PROMPT, user_prompt)

    raw_endpoints = result.get("endpoints", [])
    if not isinstance(raw_endpoints, list):
        raise ValueError("LLM did not return an endpoints array")

    sanitized = [_sanitize_endpoint(ep) for ep in raw_endpoints]
    valid = [ep for ep in sanitized if ep is not None]

    if not valid:
        raise ValueError("No valid endpoints extracted from the provided code")

    logger.info(f"Parsed {len(valid)} endpoints (from {len(raw_endpoints)} raw)")

    return ParseResponse(
        endpoints=[ParsedEndpoint(**ep) for ep in valid],
        framework_detected=result.get("framework_detected"),
    )
