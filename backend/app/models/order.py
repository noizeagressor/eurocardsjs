from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_telegram_id = Column(Integer, index=True) # Кто заказал
    bank_id = Column(String)     # Например, 'myfin'
    full_name = Column(String)   # ИМЯ ФАМИЛИЯ (LATIN)
    tg_username = Column(String) # Юзернейм для связи
    price = Column(Integer)      # Финальная цена со скидкой
    status = Column(String, default="pending") # pending, processing, completed
    created_at = Column(DateTime, default=datetime.utcnow)