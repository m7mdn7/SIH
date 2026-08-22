from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"

    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    SIMILARITY_DUPLICATE_THRESHOLD: float = 0.90
    SIMILARITY_RELATED_THRESHOLD: float = 0.75

    LLM_PROVIDER: str = "mock"  # "mock" or "openai"

    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    DATA_DIR: str = "./data"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


settings = Settings()
