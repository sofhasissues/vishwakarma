from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    anthropic_api_key: str = ""
    groq_api_key: str = ""

    database_url: str = "postgresql+asyncpg://vishwakarma:vishwakarma_dev@172.19.0.2:5432/vishwakarma_db"
    redis_url: str = "redis://localhost:6379/0"

    aws_region: str = "auto"  # B2/R2 use 'auto'; set to region string for real AWS
    s3_bucket: str = "vishwakarma-resumes"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    s3_endpoint_url: str = ""  # e.g. https://s3.us-east-005.backblazeb2.com (leave empty for real AWS S3)
    gemini_api_key: str = ""
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""

    deepgram_api_key: str = ""
    did_api_key: str = ""
    serpapi_key: str = ""

    nextauth_secret: str = ""

    environment: str = "development"
    log_level: str = "INFO"


settings = Settings()
