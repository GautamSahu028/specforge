from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


# --- Enums ---
class HttpMethod(str, Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    DELETE = "DELETE"
    HEAD = "HEAD"
    OPTIONS = "OPTIONS"


class ParamLocation(str, Enum):
    QUERY = "QUERY"
    PATH = "PATH"
    BODY = "BODY"
    HEADER = "HEADER"


class ExampleType(str, Enum):
    REQUEST = "REQUEST"
    RESPONSE = "RESPONSE"
    ERROR = "ERROR"


# --- Parse Request/Response ---
class ParseRequest(BaseModel):
    source_code: str = Field(..., min_length=10, max_length=100_000)
    source_type: str = Field(default="RAW_CODE")
    framework: Optional[str] = None


class ParsedParameter(BaseModel):
    name: str
    location: ParamLocation
    type: str = "string"
    required: bool = False
    description: Optional[str] = None
    schema_def: Optional[dict] = Field(None, alias="schema")

    class Config:
        populate_by_name = True


class ParsedEndpoint(BaseModel):
    path: str
    method: HttpMethod
    summary: Optional[str] = None
    description: Optional[str] = None
    tag: Optional[str] = None
    parameters: list[ParsedParameter] = []


class ParseResponse(BaseModel):
    endpoints: list[ParsedEndpoint]
    framework_detected: Optional[str] = None


# --- Generate Request/Response ---
class EndpointInput(BaseModel):
    path: str
    method: str
    summary: Optional[str] = None
    description: Optional[str] = None
    parameters: list[dict] = []


class GenerateRequest(BaseModel):
    endpoint: EndpointInput


class GeneratedExample(BaseModel):
    type: ExampleType
    title: str
    language: Optional[str] = None
    code: str
    statusCode: Optional[int] = Field(None, alias="status_code")

    class Config:
        populate_by_name = True


class GeneratedDocumentation(BaseModel):
    title: str
    content: str  # Markdown


class GenerateResponse(BaseModel):
    examples: list[GeneratedExample]
    documentation: GeneratedDocumentation


# --- Error ---
class ErrorResponse(BaseModel):
    detail: str
    code: str = "INTERNAL_ERROR"
