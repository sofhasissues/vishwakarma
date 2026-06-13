import boto3
from app.config import settings


polly_client = boto3.client(
    "polly",
    region_name=settings.aws_region,
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
)


def text_to_speech(text: str) -> bytes:
    """Convert text to speech using AWS Polly. Returns MP3 bytes."""
    response = polly_client.synthesize_speech(
        Text=text,
        OutputFormat="mp3",
        VoiceId="Kajal",      # Indian English female voice
        Engine="neural",
        LanguageCode="en-IN",
    )
    return response["AudioStream"].read()
