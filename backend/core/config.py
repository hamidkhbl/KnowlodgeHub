from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "KnowledgeHub"
    database_url: str = "sqlite:///./knowledgehub.db"
    secret_key: str = "change-me-to-a-long-random-secret-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours

    model_config = {"env_file": ".env"}


settings = Settings()
