import logging
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.order import Order
from app.models.promocode import PromoCode
from app.schemas.order import OrderCreate, OrderResponse
from app.core.config import settings
from app.api.deps import get_current_user
from sqlalchemy.future import select

logger = logging.getLogger(__name__)

router = APIRouter()

# ── Server-side price catalog (prevents price tampering) ──
PRICES = {
    'myfin': 24900,
    'stables': 8900,
    'wayex': 9900,
    'coca': 11900,
    'emcd': 14900,
    'wirex': 19900,
    'redotpay': 10000,
    'wise': 15000,
    'revolut': 18000,
    'paypal': 7000,
}


async def send_telegram_notification(order: Order) -> None:
    """Send order notification to admin. Failures are logged but don't break the response."""
    text = (
        f"\U0001f514 <b>Новый заказ EuroCards!</b>\n\n"
        f"\U0001f464 <b>Клиент:</b> {order.full_name}\n"
        f"\u2708\ufe0f <b>TG:</b> {order.tg_username}\n"
        f"\U0001f4b3 <b>Банк:</b> {order.bank_id}\n"
        f"\U0001f4b0 <b>Сумма:</b> {order.price} \u20bd\n"
        f"\U0001f194 <b>Order ID:</b> #{order.id}"
    )
    url = f"https://api.telegram.org/bot{settings.BOT_TOKEN}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(url, json={
                "chat_id": settings.ADMIN_ID,
                "text": text,
                "parse_mode": "HTML"
            })
    except Exception as e:
        logger.error(f"Failed to send Telegram notification for order #{order.id}: {e}")


@router.post("/create", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_info = current_user.get("user", {})

    # ── Validate bank_id and get server-side price ──
    base_price = PRICES.get(order_data.bank_id)
    if base_price is None:
        raise HTTPException(status_code=400, detail=f"Unknown bank_id: {order_data.bank_id}")

    final_price = base_price

    # ── Apply promo code if provided ──
    if order_data.promo_code:
        result = await db.execute(
            select(PromoCode).where(PromoCode.code == order_data.promo_code)
        )
        promo = result.scalar_one_or_none()

        if promo and promo.is_active and promo.used_count < promo.usage_limit:
            if promo.discount_type == "percent":
                final_price = int(final_price * (1 - promo.discount_amount / 100))
            else:
                final_price = max(0, final_price - promo.discount_amount)

            promo.used_count += 1
            db.add(promo)

    new_order = Order(
        user_telegram_id=user_info.get("id"),
        bank_id=order_data.bank_id,
        full_name=order_data.full_name,
        tg_username=order_data.tg_username,
        price=final_price
    )
    db.add(new_order)
    await db.commit()
    await db.refresh(new_order)

    # Send notification (non-blocking — failures logged, not raised)
    await send_telegram_notification(new_order)

    return new_order


@router.get("/my", response_model=list[OrderResponse])
async def get_my_orders(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_info = current_user.get("user", {})
    telegram_id = user_info.get("id")

    result = await db.execute(
        select(Order)
        .where(Order.user_telegram_id == telegram_id)
        .order_by(Order.created_at.desc())
    )
    orders = result.scalars().all()
    return orders
