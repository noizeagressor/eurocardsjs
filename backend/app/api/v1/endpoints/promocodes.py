from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.models.promocode import PromoCode
from app.api.deps import get_current_user
from pydantic import BaseModel

router = APIRouter()

class PromoCodeValidateRequest(BaseModel):
    code: str

class PromoCodeValidateResponse(BaseModel):
    valid: bool
    discount_amount: int
    discount_type: str
    message: str

@router.post("/validate", response_model=PromoCodeValidateResponse)
async def validate_promocode(
    request: PromoCodeValidateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(PromoCode).where(PromoCode.code == request.code))
    promo = result.scalar_one_or_none()
    
    if not promo:
        return {"valid": False, "discount_amount": 0, "discount_type": "fixed", "message": "Invalid promo code"}
        
    if not promo.is_active:
        return {"valid": False, "discount_amount": 0, "discount_type": "fixed", "message": "Promo code is inactive"}
        
    if promo.used_count >= promo.usage_limit:
        return {"valid": False, "discount_amount": 0, "discount_type": "fixed", "message": "Promo code usage limit reached"}
        
    return {
        "valid": True,
        "discount_amount": promo.discount_amount,
        "discount_type": promo.discount_type,
        "message": "Promo code applied!"
    }
