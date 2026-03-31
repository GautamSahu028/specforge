from fastapi import APIRouter

from app.api.routes.projects import router as projects_router
from app.api.routes.endpoints import router as endpoints_router
from app.api.routes.search import router as search_router
from app.api.routes.export import router as export_router

api_router = APIRouter(prefix="/api")

api_router.include_router(projects_router)
api_router.include_router(endpoints_router)
api_router.include_router(search_router)
api_router.include_router(export_router)
