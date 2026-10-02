from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Kantio Contabilidad API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "supersecret_jwt_key_kantio_conta_2026_secure_key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres123@localhost:5434/kantio_contabilidad"
    
    KANTIO_CORE_URL: str = "https://api.kantio.online"
    KANTIO_CORE_PUBLIC_KEY: str = ""  # Ed25519 Public Key
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://contabilidad.kantio.online",
        "https://panel.kantio.online"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
