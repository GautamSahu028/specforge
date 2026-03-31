from __future__ import annotations

import asyncio
import httpx

from app.core.config import get_settings
from app.core.exceptions import AIServiceError, TimeoutError as AppTimeoutError
from app.core.logging import logger

settings = get_settings()

_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            base_url=settings.AI_SERVICE_URL,
            timeout=httpx.Timeout(120.0, connect=10.0),
            headers={"Content-Type": "application/json"},
        )
    return _client


async def close_ai_client() -> None:
    global _client
    if _client and not _client.is_closed:
        await _client.aclose()
        _client = None


async def _call_with_retry(
    method: str,
    url: str,
    json_body: dict,
    retries: int = 2,
) -> dict:
    client = _get_client()
    last_err: Exception | None = None

    for attempt in range(1, retries + 2):
        try:
            response = await client.request(method, url, json=json_body)
            response.raise_for_status()
            return response.json()
        except httpx.TimeoutException as exc:
            last_err = exc
            if attempt > retries:
                break
        except httpx.HTTPStatusError as exc:
            last_err = exc
            if exc.response.status_code < 500 or attempt > retries:
                break
        except httpx.ConnectError as exc:
            last_err = exc
            if attempt > retries:
                break

        delay = attempt * 2
        logger.warning(
            "AI service call failed (attempt %d/%d), retrying in %ds: %s",
            attempt, retries + 1, delay, last_err,
        )
        await asyncio.sleep(delay)

    # All retries exhausted
    if isinstance(last_err, httpx.TimeoutException):
        raise AppTimeoutError("AI service timed out")

    detail = "AI service unavailable"
    if isinstance(last_err, httpx.HTTPStatusError):
        try:
            detail = last_err.response.json().get("detail", detail)
        except Exception:
            pass

    raise AIServiceError(detail)


async def parse_api(
    source_code: str,
    source_type: str,
    framework: str | None,
) -> dict:
    return await _call_with_retry(
        "POST",
        "/parse",
        {
            "source_code": source_code,
            "source_type": source_type,
            "framework": framework,
        },
    )


async def generate_docs(endpoint: dict) -> dict:
    return await _call_with_retry(
        "POST",
        "/generate",
        {"endpoint": endpoint},
    )
