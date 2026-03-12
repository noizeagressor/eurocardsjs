from pydantic import BaseModel
from typing import Optional

class OrderCreate(BaseModel):
    bank_id: str
    full_name: str
    tg_username: str
    price: int
    promo_code: Optional[str] = None

class OrderResponse(OrderCreate):
    id: int
    status: str
    
    class Config:
        from_attributes = True