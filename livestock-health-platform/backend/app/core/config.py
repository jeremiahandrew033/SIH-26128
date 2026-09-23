from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_NAME: str = "livestock-health-platform-api"
    APP_VERSION: str = "0.1.0"
    PHASE: str = "phase-1"
    PLATFORM_NAME: str = "AI-Enabled Livestock Health, Disease Surveillance & Management Platform"
    
    # CORS Configuration
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # JWT Authentication Security Settings
    JWT_SECRET: str  # REQUIRED: Set via JWT_SECRET env variable — no hardcoded default
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours

    # Environment Feature Flags
    DEMO_MODE: bool = False

    # Database & Supabase Placeholders (Phase 1)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return ["http://localhost:5173"]  # Safe default for local dev — never wildcard
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

settings = Settings()
