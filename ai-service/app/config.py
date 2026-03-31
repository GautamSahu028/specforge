from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    groq_api_key: str
    groq_model: str = "llama-3.1-70b-versatile"
    groq_max_tokens: int = 4096
    groq_temperature: float = 0.1
    log_level: str = "INFO"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
