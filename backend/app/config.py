import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FleetRipple AI"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./fleetripple.db")
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]
    DEFAULT_UNDERBOOKING_THRESHOLD: float = 50.0
    DEFAULT_VIABILITY_THRESHOLD: float = 70.0
    PLATFORM_BROKERAGE_FEE: float = 800.0

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
