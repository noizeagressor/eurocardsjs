from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.db.session import engine, Base
from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from app.models.user import User
from app.models.order import Order
from app.models.promocode import PromoCode


# ── SQLAdmin authentication ──
class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username, password = form["username"], form["password"]
        if username == "admin" and password == settings.SECRET_KEY:
            request.session.update({"token": settings.SECRET_KEY})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        token = request.session.get("token")
        return token == settings.SECRET_KEY


# ── Admin Views ──
class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.telegram_id, User.username, User.first_name, User.created_at]

class OrderAdmin(ModelView, model=Order):
    column_list = [Order.id, Order.user_telegram_id, Order.bank_id, Order.price, Order.status, Order.created_at]

class PromoCodeAdmin(ModelView, model=PromoCode):
    column_list = [PromoCode.code, PromoCode.discount_amount, PromoCode.discount_type, PromoCode.is_active, PromoCode.used_count]


# ── Lifespan (replaces deprecated on_event) ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables + register admin
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    authentication_backend = AdminAuth(secret_key=settings.SECRET_KEY)
    admin = Admin(app, engine, authentication_backend=authentication_backend)
    admin.add_view(UserAdmin)
    admin.add_view(OrderAdmin)
    admin.add_view(PromoCodeAdmin)

    yield
    # Shutdown: nothing to clean up


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# ── CORS ──
origins = [
    "http://localhost:3000",
    "https://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.(github\.dev|trycloudflare\.com|ngrok-free\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "X-Telegram-Init-Data"],
)

# ── Routes ──
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {"message": "EuroCards API is running!"}
