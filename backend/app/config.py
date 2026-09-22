from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    llm_api_key: SecretStr
    model: str
    debug: bool

    langsmith_tracing: bool
    # langsmith_endpoint: str
    langsmith_api_key: SecretStr
    langsmith_project: str

    tavily_api_key: SecretStr

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
