import boto3
from botocore.exceptions import ClientError
from app.config import settings
import uuid


def _make_s3_client():
    """Create an S3-compatible client.
    Points to Cloudflare R2 when CLOUDFLARE_R2_ENDPOINT_URL is set,
    otherwise falls back to AWS S3 (useful for local dev).
    """
    kwargs = dict(
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
    )
    if settings.s3_endpoint_url:
        kwargs["endpoint_url"] = settings.s3_endpoint_url
    return boto3.client("s3", **kwargs)


s3_client = _make_s3_client()


def upload_resume(file_bytes: bytes, filename: str, user_id: str) -> str:
    """Upload resume to S3, return the S3 key."""
    ext = filename.split(".")[-1]
    key = f"resumes/{user_id}/{uuid.uuid4()}.{ext}"
    s3_client.put_object(
        Bucket=settings.s3_bucket,
        Key=key,
        Body=file_bytes,
        ContentType="application/pdf" if ext == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )
    return key


def download_resume(s3_key: str) -> bytes:
    """Download resume from S3, return bytes."""
    response = s3_client.get_object(Bucket=settings.s3_bucket, Key=s3_key)
    return response["Body"].read()


def delete_resume(s3_key: str) -> None:
    """Delete resume from S3."""
    s3_client.delete_object(Bucket=settings.s3_bucket, Key=s3_key)
