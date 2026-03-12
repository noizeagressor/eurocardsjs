from fastapi import APIRouter
from app.api.v1.endpoints import orders, users, promocodes # Импортируем файл с логикой заказов

api_router = APIRouter()

# Соединяем: /api/v1 + /orders + /create
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(promocodes.router, prefix="/promocodes", tags=["promocodes"])

@api_router.get("/health")
async def health_check():
    return {"status": "ok", "message": "EuroCards API is healthy!"}