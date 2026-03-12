import hmac
import hashlib
import json
import time
from urllib.parse import parse_qsl
from app.core.config import settings

# Maximum age of initData in seconds (1 hour)
MAX_AUTH_AGE = 3600


def validate_init_data(init_data: str) -> dict | None:
    """
    Validates Telegram Web App initData using HMAC-SHA256.
    Also checks that auth_date is not older than MAX_AUTH_AGE.
    Returns the parsed user data if valid, otherwise None.
    """
    try:
        parsed_data = dict(parse_qsl(init_data))
        if "hash" not in parsed_data:
            return None

        received_hash = parsed_data.pop("hash")

        # ── Check auth_date freshness ──
        auth_date_str = parsed_data.get("auth_date")
        if auth_date_str:
            try:
                auth_date = int(auth_date_str)
                if time.time() - auth_date > MAX_AUTH_AGE:
                    return None
            except ValueError:
                return None

        # Sort keys alphabetically and build data-check-string
        data_check_string = "\n".join(
            f"{k}={v}" for k, v in sorted(parsed_data.items())
        )

        # Calculate secret key
        secret_key = hmac.new(
            key=b"WebAppData",
            msg=settings.BOT_TOKEN.encode(),
            digestmod=hashlib.sha256
        ).digest()

        # Calculate HMAC-SHA256 signature
        calculated_hash = hmac.new(
            key=secret_key,
            msg=data_check_string.encode(),
            digestmod=hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(calculated_hash, received_hash):
            return None

        # Parse user JSON
        if "user" in parsed_data:
            parsed_data["user"] = json.loads(parsed_data["user"])
        return parsed_data

    except Exception:
        return None
