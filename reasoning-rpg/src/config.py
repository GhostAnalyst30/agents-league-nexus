import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "ReasoningRPG"
    debug: bool = True
    log_level: str = "INFO"
    database_url: str = "sqlite:///./rpg.db"
    openrouter_api_key: str | None = None
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_model: str = "openai/gpt-4o-mini"
    azure_openai_api_key: str | None = None
    azure_openai_endpoint: str | None = None
    azure_openai_deployment: str = "gpt-4o"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
