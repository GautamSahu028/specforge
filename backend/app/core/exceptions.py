from __future__ import annotations


class AppError(Exception):
    """Base operational error with HTTP status and machine-readable code."""

    def __init__(
        self,
        message: str = "An unexpected error occurred",
        status_code: int = 500,
        code: str = "INTERNAL_ERROR",
    ):
        self.message = message
        self.status_code = status_code
        self.code = code
        super().__init__(message)


class NotFoundError(AppError):
    def __init__(self, resource: str = "Resource"):
        super().__init__(
            message=f"{resource} not found",
            status_code=404,
            code="NOT_FOUND",
        )


class ValidationError(AppError):
    def __init__(self, message: str = "Validation failed", details: list | None = None):
        self.details = details
        super().__init__(message=message, status_code=400, code="VALIDATION_ERROR")


class AIServiceError(AppError):
    def __init__(self, message: str = "AI service unavailable"):
        super().__init__(message=message, status_code=502, code="AI_SERVICE_ERROR")


class TimeoutError(AppError):
    def __init__(self, message: str = "Request timed out"):
        super().__init__(message=message, status_code=504, code="TIMEOUT_ERROR")


class DuplicateError(AppError):
    def __init__(self, message: str = "A record with this data already exists"):
        super().__init__(message=message, status_code=409, code="DUPLICATE_ENTRY")
