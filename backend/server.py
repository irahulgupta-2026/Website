"""
FastAPI server for RevvCars — car rental booking & lead-gen platform.
"""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, Cookie, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import requests as pyrequests
import jwt

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionRequest, CheckoutSessionResponse,
    CheckoutStatusResponse,
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ---------- Setup ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="RevvCars API")
api = APIRouter(prefix="/api")

ADMIN_EMAILS = [e.strip().lower() for e in os.environ.get("ADMIN_EMAILS", "").split(",") if e.strip()]
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "RevvAdmin@2026")
ADMIN_JWT_SECRET = os.environ.get("ADMIN_JWT_SECRET", "revv-admin-secret-key-2026")
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "sk_test_emergent")

logger = logging.getLogger("revvcars")
logging.basicConfig(level=logging.INFO)


# ---------- Models ----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class Car(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    brand: str
    category: Literal["hatchback", "sedan", "suv", "luxury", "muv"]
    transmission: Literal["manual", "automatic"]
    fuel: Literal["petrol", "diesel", "electric", "hybrid"]
    seats: int = 5
    price_per_day: float  # INR
    price_per_hour: float
    image_url: str
    features: List[str] = []
    cities: List[str] = ["Delhi", "Mumbai", "Bangalore"]
    description: str = ""
    active: bool = True
    created_at: str = Field(default_factory=now_iso)


class CarCreate(BaseModel):
    name: str
    brand: str
    category: str
    transmission: str
    fuel: str
    seats: int = 5
    price_per_day: float
    price_per_hour: float
    image_url: str
    features: List[str] = []
    cities: List[str] = ["Delhi", "Mumbai", "Bangalore"]
    description: str = ""
    active: bool = True


class Lead(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    city: str = ""
    requirement: str = ""
    source: str = "landing"
    status: Literal["new", "contacted", "converted", "closed"] = "new"
    created_at: str = Field(default_factory=now_iso)


class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    city: str = ""
    requirement: str = ""
    source: str = "landing"


class Booking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    car_id: str
    car_name: str = ""
    customer_email: str
    customer_name: str
    customer_phone: str
    pickup_city: str
    pickup_location: str = ""
    pickup_datetime: str  # ISO
    drop_datetime: str
    days: int = 1
    total_amount: float
    currency: str = "inr"
    status: Literal["pending", "confirmed", "cancelled", "completed"] = "pending"
    payment_status: Literal["unpaid", "pending", "paid", "failed", "expired"] = "unpaid"
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


class BookingCreate(BaseModel):
    car_id: str
    customer_email: EmailStr
    customer_name: str
    customer_phone: str
    pickup_city: str
    pickup_location: str = ""
    pickup_datetime: str
    drop_datetime: str


class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: str = ""
    created_at: str = Field(default_factory=now_iso)


class CheckoutReq(BaseModel):
    booking_id: str
    origin_url: str


# ---------- Auth helpers (Emergent Google Auth) ----------
async def get_user_from_session(request: Request) -> Optional[dict]:
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        return None
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        return None
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        return None
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    return user


async def require_user(request: Request) -> dict:
    user = await get_user_from_session(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


async def require_admin(x_admin_token: Optional[str] = Header(None)) -> dict:
    if not x_admin_token:
        raise HTTPException(status_code=401, detail="Admin token required")
    try:
        payload = jwt.decode(x_admin_token, ADMIN_JWT_SECRET, algorithms=["HS256"])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Not admin")
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid admin token")


# ---------- Public routes ----------
@api.get("/")
async def root():
    return {"message": "RevvCars API", "status": "ok"}


@api.get("/cars")
async def list_cars(
    city: Optional[str] = None,
    category: Optional[str] = None,
    transmission: Optional[str] = None,
    fuel: Optional[str] = None,
    max_price: Optional[float] = None,
):
    query: dict = {"active": True}
    if city:
        query["cities"] = city
    if category:
        query["category"] = category
    if transmission:
        query["transmission"] = transmission
    if fuel:
        query["fuel"] = fuel
    if max_price is not None:
        query["price_per_day"] = {"$lte": max_price}
    cars = await db.cars.find(query, {"_id": 0}).sort("price_per_day", 1).to_list(200)
    return cars


@api.get("/cars/{car_id}")
async def get_car(car_id: str):
    car = await db.cars.find_one({"id": car_id, "active": True}, {"_id": 0})
    if not car:
        raise HTTPException(404, "Car not found")
    return car


@api.post("/leads")
async def create_lead(payload: LeadCreate):
    lead = Lead(**payload.model_dump())
    await db.leads.insert_one(lead.model_dump())
    return {"success": True, "lead_id": lead.id}


@api.post("/bookings/quote")
async def quote_booking(payload: BookingCreate):
    car = await db.cars.find_one({"id": payload.car_id, "active": True}, {"_id": 0})
    if not car:
        raise HTTPException(404, "Car not found")
    pickup = datetime.fromisoformat(payload.pickup_datetime.replace("Z", "+00:00"))
    drop = datetime.fromisoformat(payload.drop_datetime.replace("Z", "+00:00"))
    hours = max(1, int((drop - pickup).total_seconds() // 3600))
    days = max(1, (hours + 23) // 24)
    total = car["price_per_day"] * days
    return {"car": car, "days": days, "hours": hours, "total_amount": total, "currency": "inr"}


@api.post("/bookings")
async def create_booking(payload: BookingCreate, request: Request):
    car = await db.cars.find_one({"id": payload.car_id, "active": True}, {"_id": 0})
    if not car:
        raise HTTPException(404, "Car not found")
    pickup = datetime.fromisoformat(payload.pickup_datetime.replace("Z", "+00:00"))
    drop = datetime.fromisoformat(payload.drop_datetime.replace("Z", "+00:00"))
    if drop <= pickup:
        raise HTTPException(400, "Drop time must be after pickup time")
    hours = max(1, int((drop - pickup).total_seconds() // 3600))
    days = max(1, (hours + 23) // 24)
    total = car["price_per_day"] * days
    user = await get_user_from_session(request)
    booking = Booking(
        car_id=payload.car_id,
        car_name=f'{car["brand"]} {car["name"]}',
        customer_email=payload.customer_email,
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        pickup_city=payload.pickup_city,
        pickup_location=payload.pickup_location,
        pickup_datetime=payload.pickup_datetime,
        drop_datetime=payload.drop_datetime,
        days=days,
        total_amount=total,
        user_id=user["user_id"] if user else None,
    )
    await db.bookings.insert_one(booking.model_dump())
    return booking.model_dump()


@api.get("/bookings/{booking_id}")
async def get_booking(booking_id: str):
    b = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not b:
        raise HTTPException(404, "Booking not found")
    return b


# ---------- Payments (Flow B — emergentintegrations) ----------
@api.post("/payments/checkout")
async def create_checkout(req: CheckoutReq, request: Request):
    booking = await db.bookings.find_one({"id": req.booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(404, "Booking not found")

    host_url = str(request.base_url)  # e.g. https://.../
    webhook_url = f"{host_url.rstrip('/')}/api/webhook/stripe"
    checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    success_url = f"{req.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/payment/cancel?booking_id={req.booking_id}"

    session_req = CheckoutSessionRequest(
        amount=float(booking["total_amount"]),
        currency="inr",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "booking_id": req.booking_id,
            "customer_email": booking["customer_email"],
            "car_name": booking.get("car_name", ""),
        },
    )
    session: CheckoutSessionResponse = await checkout.create_checkout_session(session_req)

    # Insert payment_transactions BEFORE redirect
    await db.payment_transactions.insert_one({
        "session_id": session.session_id,
        "booking_id": req.booking_id,
        "amount": float(booking["total_amount"]),
        "currency": "inr",
        "status": "initiated",
        "payment_status": "pending",
        "metadata": {"booking_id": req.booking_id},
        "created_at": now_iso(),
        "updated_at": now_iso(),
    })
    await db.bookings.update_one(
        {"id": req.booking_id},
        {"$set": {"session_id": session.session_id, "payment_status": "pending"}},
    )
    return {"checkout_url": session.url, "session_id": session.session_id}


@api.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, request: Request):
    record = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not record:
        raise HTTPException(404, "Transaction not found")

    if record.get("payment_status") != "paid":
        try:
            host_url = str(request.base_url)
            webhook_url = f"{host_url.rstrip('/')}/api/webhook/stripe"
            checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
            status: CheckoutStatusResponse = await checkout.get_checkout_status(session_id)
            if status.payment_status == "paid" or status.status == "complete":
                await db.payment_transactions.update_one(
                    {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {"$set": {"status": "completed", "payment_status": "paid", "updated_at": now_iso()}},
                )
                await db.bookings.update_one(
                    {"session_id": session_id},
                    {"$set": {"payment_status": "paid", "status": "confirmed"}},
                )
                record = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        except Exception as e:
            logger.warning(f"Status fetch failed: {e}")

    return {
        "session_id": record["session_id"],
        "status": record["status"],
        "payment_status": record["payment_status"],
        "booking_id": record.get("booking_id"),
    }


@api.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body_bytes = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    host_url = str(request.base_url)
    webhook_url = f"{host_url.rstrip('/')}/api/webhook/stripe"
    checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    try:
        wr = await checkout.handle_webhook(body_bytes, sig)
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(400, "Invalid webhook")

    if wr.payment_status == "paid":
        await db.payment_transactions.update_one(
            {"session_id": wr.session_id, "payment_status": {"$ne": "paid"}},
            {"$set": {"status": "completed", "payment_status": "paid", "updated_at": now_iso()}},
        )
        await db.bookings.update_one(
            {"session_id": wr.session_id},
            {"$set": {"payment_status": "paid", "status": "confirmed"}},
        )
    return {"ok": True}


# ---------- Auth (Emergent Google Auth) ----------
@api.post("/auth/session")
async def process_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(400, "session_id required")
    r = pyrequests.get(
        "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
        headers={"X-Session-ID": session_id},
        timeout=10,
    )
    if r.status_code != 200:
        raise HTTPException(401, "Invalid session")
    data = r.json()
    email = data["email"]

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": data.get("name", existing.get("name", "")),
                      "picture": data.get("picture", existing.get("picture", ""))}},
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": data.get("name", ""),
            "picture": data.get("picture", ""),
            "created_at": now_iso(),
        })

    session_token = data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc),
    })
    response.set_cookie(
        "session_token", session_token,
        httponly=True, secure=True, samesite="none",
        path="/", max_age=60 * 60 * 24 * 7,
    )
    return {"user_id": user_id, "email": email, "name": data.get("name", ""),
            "picture": data.get("picture", ""), "is_admin": email.lower() in ADMIN_EMAILS}


@api.get("/auth/me")
async def get_me(request: Request):
    user = await get_user_from_session(request)
    if not user:
        raise HTTPException(401, "Not authenticated")
    return {**user, "is_admin": user["email"].lower() in ADMIN_EMAILS}


@api.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


@api.get("/bookings/me/list")
async def my_bookings(request: Request):
    user = await require_user(request)
    bookings = await db.bookings.find(
        {"$or": [{"user_id": user["user_id"]}, {"customer_email": user["email"]}]},
        {"_id": 0},
    ).sort("created_at", -1).to_list(200)
    return bookings


# ---------- Admin ----------
class AdminLoginReq(BaseModel):
    email: EmailStr
    password: str


@api.post("/admin/login")
async def admin_login(payload: AdminLoginReq):
    if payload.email.lower() not in ADMIN_EMAILS or payload.password != ADMIN_PASSWORD:
        raise HTTPException(401, "Invalid credentials")
    token = jwt.encode(
        {"email": payload.email.lower(), "role": "admin",
         "exp": datetime.now(timezone.utc) + timedelta(days=7)},
        ADMIN_JWT_SECRET, algorithm="HS256",
    )
    return {"token": token, "email": payload.email}


@api.get("/admin/cars")
async def admin_list_cars(_: dict = Depends(require_admin)):
    return await db.cars.find({}, {"_id": 0}).to_list(500)


@api.post("/admin/cars")
async def admin_create_car(payload: CarCreate, _: dict = Depends(require_admin)):
    car = Car(**payload.model_dump())
    await db.cars.insert_one(car.model_dump())
    return car.model_dump()


@api.put("/admin/cars/{car_id}")
async def admin_update_car(car_id: str, payload: CarCreate, _: dict = Depends(require_admin)):
    result = await db.cars.update_one({"id": car_id}, {"$set": payload.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(404, "Car not found")
    return await db.cars.find_one({"id": car_id}, {"_id": 0})


@api.delete("/admin/cars/{car_id}")
async def admin_delete_car(car_id: str, _: dict = Depends(require_admin)):
    result = await db.cars.delete_one({"id": car_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Car not found")
    return {"ok": True}


@api.get("/admin/bookings")
async def admin_list_bookings(_: dict = Depends(require_admin)):
    return await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.put("/admin/bookings/{booking_id}")
async def admin_update_booking(booking_id: str, body: dict, _: dict = Depends(require_admin)):
    allowed = {k: body[k] for k in ("status", "payment_status") if k in body}
    if not allowed:
        raise HTTPException(400, "No valid fields")
    r = await db.bookings.update_one({"id": booking_id}, {"$set": allowed})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return await db.bookings.find_one({"id": booking_id}, {"_id": 0})


@api.get("/admin/leads")
async def admin_list_leads(_: dict = Depends(require_admin)):
    return await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.put("/admin/leads/{lead_id}")
async def admin_update_lead(lead_id: str, body: dict, _: dict = Depends(require_admin)):
    allowed = {k: body[k] for k in ("status",) if k in body}
    if not allowed:
        raise HTTPException(400, "No valid fields")
    r = await db.leads.update_one({"id": lead_id}, {"$set": allowed})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return await db.leads.find_one({"id": lead_id}, {"_id": 0})


@api.get("/admin/stats")
async def admin_stats(_: dict = Depends(require_admin)):
    return {
        "cars": await db.cars.count_documents({}),
        "bookings": await db.bookings.count_documents({}),
        "paid_bookings": await db.bookings.count_documents({"payment_status": "paid"}),
        "leads": await db.leads.count_documents({}),
        "new_leads": await db.leads.count_documents({"status": "new"}),
        "users": await db.users.count_documents({}),
    }


# ---------- Seed ----------
SEED_CARS = [
    {"name": "Swift", "brand": "Maruti Suzuki", "category": "hatchback", "transmission": "manual", "fuel": "petrol", "seats": 5, "price_per_day": 1499, "price_per_hour": 149,
     "image_url": "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200&auto=format&fit=crop",
     "features": ["Bluetooth", "Power Steering", "Music System", "AC"], "description": "Zippy, fuel-efficient hatchback — perfect for city drives."},
    {"name": "i20", "brand": "Hyundai", "category": "hatchback", "transmission": "automatic", "fuel": "petrol", "seats": 5, "price_per_day": 1899, "price_per_hour": 189,
     "image_url": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&auto=format&fit=crop",
     "features": ["Sunroof", "Automatic", "Reverse Camera", "Cruise Control"], "description": "Premium hatchback with sunroof and automatic transmission."},
    {"name": "City", "brand": "Honda", "category": "sedan", "transmission": "automatic", "fuel": "petrol", "seats": 5, "price_per_day": 2499, "price_per_hour": 249,
     "image_url": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&auto=format&fit=crop",
     "features": ["Automatic", "Sunroof", "Cruise Control", "Leather Seats"], "description": "Spacious premium sedan for business or leisure."},
    {"name": "Verna", "brand": "Hyundai", "category": "sedan", "transmission": "automatic", "fuel": "diesel", "seats": 5, "price_per_day": 2799, "price_per_hour": 279,
     "image_url": "https://images.unsplash.com/photo-1616549972169-0a0d961c9905?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
     "features": ["Ventilated Seats", "ADAS", "360° Camera", "Wireless Charging"], "description": "Feature-loaded diesel sedan with ADAS."},
    {"name": "Creta", "brand": "Hyundai", "category": "suv", "transmission": "automatic", "fuel": "diesel", "seats": 5, "price_per_day": 3499, "price_per_hour": 349,
     "image_url": "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&auto=format&fit=crop",
     "features": ["Panoramic Sunroof", "4WD Ready", "Ventilated Seats", "Adaptive Cruise"], "description": "India's favourite midsize SUV — reliable and stylish."},
    {"name": "Seltos", "brand": "Kia", "category": "suv", "transmission": "automatic", "fuel": "petrol", "seats": 5, "price_per_day": 3299, "price_per_hour": 329,
     "image_url": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&auto=format&fit=crop",
     "features": ["Bose Audio", "Heads Up Display", "Sunroof", "Auto AC"], "description": "Bold styling meets premium tech in this urban SUV."},
    {"name": "Innova Crysta", "brand": "Toyota", "category": "muv", "transmission": "automatic", "fuel": "diesel", "seats": 7, "price_per_day": 3999, "price_per_hour": 399,
     "image_url": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&auto=format&fit=crop",
     "features": ["7 Seater", "Captain Seats", "AC Vents All Rows", "Cruise"], "description": "The ultimate family & long-trip MUV."},
    {"name": "Fortuner", "brand": "Toyota", "category": "suv", "transmission": "automatic", "fuel": "diesel", "seats": 7, "price_per_day": 6499, "price_per_hour": 649,
     "image_url": "https://images.unsplash.com/photo-1758223725140-3855ec687a16?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
     "features": ["4x4", "7 Seater", "Leather Interior", "Off-road Ready"], "description": "Full-size premium SUV for road trips and rough terrain."},
    {"name": "E-Class", "brand": "Mercedes-Benz", "category": "luxury", "transmission": "automatic", "fuel": "petrol", "seats": 5, "price_per_day": 12499, "price_per_hour": 1249,
     "image_url": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&auto=format&fit=crop",
     "features": ["Chauffeur Ready", "Massage Seats", "Ambient Lighting", "Burmester Audio"], "description": "Iconic luxury sedan for special occasions."},
    {"name": "5 Series", "brand": "BMW", "category": "luxury", "transmission": "automatic", "fuel": "petrol", "seats": 5, "price_per_day": 11999, "price_per_hour": 1199,
     "image_url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&auto=format&fit=crop",
     "features": ["Executive Package", "Adaptive Cruise", "Harman Kardon", "Gesture Control"], "description": "Business luxury with sporty performance."},
]


@api.post("/seed")
async def seed():
    count = await db.cars.count_documents({})
    if count > 0:
        return {"seeded": False, "reason": "cars already exist", "count": count}
    for c in SEED_CARS:
        car = Car(**c)
        await db.cars.insert_one(car.model_dump())
    return {"seeded": True, "count": len(SEED_CARS)}


# ---------- Register & Middleware ----------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    # auto-seed if empty
    count = await db.cars.count_documents({})
    if count == 0:
        for c in SEED_CARS:
            car = Car(**c)
            await db.cars.insert_one(car.model_dump())
        logger.info(f"Seeded {len(SEED_CARS)} cars")


@app.on_event("shutdown")
async def shutdown_event():
    client.close()
