import asyncio
import logging
import sys
import os

# Add backend directory to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart, CommandObject
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from sqlalchemy.future import select
from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.models.user import User

logging.basicConfig(level=logging.INFO)

bot = Bot(token=settings.BOT_TOKEN)
dp = Dispatcher()

@dp.message(CommandStart())
async def cmd_start(message: types.Message, command: CommandObject):
    telegram_id = message.from_user.id
    username = message.from_user.username
    first_name = message.from_user.first_name
    
    args = command.args # This is the ref code

    async with AsyncSessionLocal() as session:
        # Check if user exists
        result = await session.execute(select(User).where(User.telegram_id == telegram_id))
        user = result.scalar_one_or_none()

        if not user:
            referrer_db_id = None
            if args:
                try:
                    # Assuming ref code is the referrer's telegram_id
                    ref_tg_id = int(args)
                    if ref_tg_id != telegram_id:
                        # Check if referrer exists
                        ref_result = await session.execute(select(User).where(User.telegram_id == ref_tg_id))
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
            session.add(new_user)
            await session.commit()
        
    # Unified welcome message
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Запустить приложение", web_app=WebAppInfo(url="https://t.me/EuroCardsBot/app"))],
        [InlineKeyboardButton(text="Поддержка", url="https://t.me/support")]
    ])
    
    await message.answer(
        f"Привет, {first_name}! Добро пожаловать в EuroCards Premium.",
        reply_markup=keyboard
    )

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
