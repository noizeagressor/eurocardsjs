from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.db.session import Base

class PromoCode(Base):
    __tablename__ = "promocodes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    discount_amount = Column(Integer) # Amount to deduct or percent value
    discount_type = Column(String, default="fixed") # fixed or percent
    is_active = Column(Boolean, default=True)
    usage_limit = Column(Integer, default=100)
    used_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
