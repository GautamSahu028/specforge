import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.api import router
from app.config import get_settings

# Configure logging
settings = get_settings()
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

app = FastAPI(
    title="SpecForge AI Service",
    version="1.0.0",
    description="API parsing and documentation generation powered by Groq LLM",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "ok", "model": settings.groq_model}
