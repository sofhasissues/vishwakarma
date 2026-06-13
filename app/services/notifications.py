import boto3
from twilio.rest import Client
from app.config import settings


# ── Email via AWS SES ──────────────────────────────────────────
ses_client = boto3.client(
    "ses",
    region_name=settings.aws_region,
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
)


def send_email(to_email: str, subject: str, body: str) -> bool:
    try:
        ses_client.send_email(
            Source="sofpradhan15@gmail.com",
            Destination={"ToAddresses": [to_email]},
            Message={
                "Subject": {"Data": subject},
                "Body": {"Text": {"Data": body}},
            }
        )
        return True
    except Exception as e:
        print(f"Email failed: {e}")
        return False


# ── SMS via Twilio ─────────────────────────────────────────────
def get_twilio_client():
    if not settings.twilio_account_sid or not settings.twilio_auth_token:
        return None
    return Client(settings.twilio_account_sid, settings.twilio_auth_token)


def send_sms(to_number: str, body: str) -> bool:
    client = get_twilio_client()
    if not client:
        print("Twilio not configured")
        return False
    try:
        client.messages.create(
            body=body,
            from_=settings.twilio_phone_number,
            to=to_number,
        )
        return True
    except Exception as e:
        print(f"SMS failed: {e}")
        return False


def send_whatsapp(to_number: str, body: str) -> bool:
    client = get_twilio_client()
    if not client:
        return False
    try:
        client.messages.create(
            body=body,
            from_="whatsapp:+14155238886",  # Twilio sandbox number
            to=f"whatsapp:{to_number}",
        )
        return True
    except Exception as e:
        print(f"WhatsApp failed: {e}")
        return False


# ── Unified sender ─────────────────────────────────────────────
def notify_user(
    email: str = None,
    phone: str = None,
    subject: str = "",
    message: str = "",
    via_email: bool = True,
    via_sms: bool = False,
    via_whatsapp: bool = False,
) -> dict:
    results = {}
    if via_email and email:
        results["email"] = send_email(email, subject, message)
    if via_sms and phone:
        results["sms"] = send_sms(phone, message)
    if via_whatsapp and phone:
        results["whatsapp"] = send_whatsapp(phone, message)
    return results
