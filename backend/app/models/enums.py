import enum


class SourceType(str, enum.Enum):
    RAW_CODE = "RAW_CODE"
    OPENAPI_SPEC = "OPENAPI_SPEC"


class ProjectStatus(str, enum.Enum):
    PENDING = "PENDING"
    PARSING = "PARSING"
    PARSED = "PARSED"
    GENERATING = "GENERATING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class HttpMethod(str, enum.Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    DELETE = "DELETE"
    HEAD = "HEAD"
    OPTIONS = "OPTIONS"


class ParamLocation(str, enum.Enum):
    QUERY = "QUERY"
    PATH = "PATH"
    BODY = "BODY"
    HEADER = "HEADER"


class ExampleType(str, enum.Enum):
    REQUEST = "REQUEST"
    RESPONSE = "RESPONSE"
    ERROR = "ERROR"
