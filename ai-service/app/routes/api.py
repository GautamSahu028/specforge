import logging
from fastapi import APIRouter, HTTPException
from app.schemas.api import (
    ParseRequest, ParseResponse,
    GenerateRequest, GenerateResponse,
    ErrorResponse,
)
from app.services.parse_service import parse_api_code
from app.services.generate_service import generate_docs

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/parse",
    response_model=ParseResponse,
    responses={400: {"model": ErrorResponse}, 502: {"model": ErrorResponse}},
)
async def parse_endpoint(request: ParseRequest):
    try:
        return parse_api_code(request)
    except ValueError as e:
        logger.warning(f"Parse validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Parse failed: {e}", exc_info=True)
        raise HTTPException(status_code=502, detail=f"AI processing failed: {e}")


@router.post(
    "/generate",
    response_model=GenerateResponse,
    responses={400: {"model": ErrorResponse}, 502: {"model": ErrorResponse}},
)
async def generate_endpoint(request: GenerateRequest):
    try:
        return generate_docs(request)
    except ValueError as e:
        logger.warning(f"Generate validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Generate failed: {e}", exc_info=True)
        raise HTTPException(status_code=502, detail=f"AI processing failed: {e}")
