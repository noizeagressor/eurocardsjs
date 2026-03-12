from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.models.user import User
from app.models.order import Order
from app.api.deps import get_current_user
from pydantic import BaseModel
from sqlalchemy import func, distinct

router = APIRouter()

class UserAuthResponse(BaseModel):
    id: int
    telegram_id: int
    username: str | None
    first_name: str
    is_admin: bool
    referrer_id: int | None

@router.post("/auth", response_model=UserAuthResponse)
async def authenticate_user(
    current_user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_info = current_user_data.get("user", {})
    telegram_id = user_info.get("id")
    username = user_info.get("username")
    first_name = user_info.get("first_name")
    
    # Check if user exists
    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    user = result.scalar_one_or_none()

    if not user:
        # Create new user
        referrer_db_id = None
        start_param = current_user_data.get("start_param")
        
        if start_param:
            try:
                ref_tg_id = int(start_param)
                if ref_tg_id != telegram_id:
                    ref_result = await db.execute(select(User).where(User.telegram_id == ref_tg_id))
                    referrer = ref_result.scalar_one_or_none()
                    if referrer:
                        referrer_db_id = referrer.id
            except ValueError:
                pass
        
        new_user = User(
            telegram_id=telegram_id,
            username=username,
            first_name=first_name,
            referrer_id=referrer_db_id
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        user = new_user
    
    return user

@router.get("/me/referrals")
async def get_referrals(
    current_user_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_info = current_user_data.get("user", {})
    telegram_id = user_info.get("id")
    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Total invited
    invited_result = await db.execute(select(func.count()).where(User.referrer_id == user.id))
    invited_count = invited_result.scalar()
    
    # Confirmed (paid)
    referrals_subquery = select(User.telegram_id).where(User.referrer_id == user.id)
    
    confirmed_result = await db.execute(
        select(func.count(distinct(Order.user_telegram_id)))
        .where(Order.status == 'paid')
        .where(Order.user_telegram_id.in_(referrals_subquery))
    )
    confirmed_count = confirmed_result.scalar()
    
    return {
        "invited_count": invited_count,
        "confirmed_count": confirmed_count,
        "earnings": confirmed_count * 2000
    }
