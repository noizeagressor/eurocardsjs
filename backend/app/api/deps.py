from fastapi import Header, HTTPException, status
from app.core.security import validate_init_data
from typing import Optional
from app.core.config import settings

async def get_current_user(x_telegram_init_data: Optional[str] = Header(None)):
    if settings.DEBUG and not x_telegram_init_data:
        # Mock user for development
        return {
            "user": {
                "id": 123456789,
                "first_name": "Test User",
                "username": "testuser",
                "is_premium": True
            },
            "auth_date": 1234567890,
            "hash": "mock_hash"
        }

    if not x_telegram_init_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-Telegram-Init-Data header",
        )

    user_data = validate_init_data(x_telegram_init_data)
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid initData",
        )
    
    return user_data
