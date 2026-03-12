from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "EuroCards Premium"
    API_V1_STR: str = "/api/v1"
    BOT_TOKEN: str
    GEMINI_API_KEY: str
    DATABASE_URL: str
    SECRET_KEY: str
    DEBUG: bool = False

    class Config:
        env_file = ".env"
    ADMIN_ID: int
settings = Settings()
