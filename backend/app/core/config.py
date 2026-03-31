from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "specforge_user"
    DB_PASSWORD: str = "specforge_pass"
    DB_NAME: str = "specforge"

    # Application
    APP_ENV: str = "development"
    APP_PORT: int = 3000
    CORS_ORIGIN: str = "http://localhost:5173"

    # AI Service
    AI_SERVICE_URL: str = "http://localhost:8000"

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 100

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+aiomysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
