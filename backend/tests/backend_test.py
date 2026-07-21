"""RevvCars backend API tests."""
import os
import uuid
import pytest
import requests
from datetime import datetime, timezone, timedelta

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://auto-reserve-64.preview.emergentagent.com").rstrip("/")
API = f"{BASE}/api"

ADMIN_EMAIL = "admin@revvcars.com"
ADMIN_PASS = "RevvAdmin@2026"


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"X-Admin-Token": admin_token}


# ---------- Health ----------
def test_root(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ---------- Cars ----------
def test_list_cars(s):
    r = s.get(f"{API}/cars")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) >= 10


def test_filter_suv(s):
    r = s.get(f"{API}/cars", params={"category": "suv"})
    assert r.status_code == 200
    for c in r.json():
        assert c["category"] == "suv"


def test_get_car_detail(s):
    cars = s.get(f"{API}/cars").json()
    cid = cars[0]["id"]
    r = s.get(f"{API}/cars/{cid}")
    assert r.status_code == 200
    assert r.json()["id"] == cid


def test_get_car_404(s):
    r = s.get(f"{API}/cars/nonexistent-id")
    assert r.status_code == 404


# ---------- Leads ----------
lead_id_holder = {}


def test_create_lead(s):
    payload = {"name": "TEST_Lead", "email": "test_lead@example.com", "phone": "9999999999",
               "city": "Delhi", "requirement": "SUV for weekend"}
    r = s.post(f"{API}/leads", json=payload)
    assert r.status_code == 200
    j = r.json()
    assert j["success"] is True
    lead_id_holder["id"] = j["lead_id"]


# ---------- Bookings ----------
booking_holder = {}


def test_create_booking(s):
    cars = s.get(f"{API}/cars").json()
    car = cars[0]
    pickup = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    drop = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
    payload = {
        "car_id": car["id"],
        "customer_email": "book@example.com",
        "customer_name": "TEST_Book",
        "customer_phone": "8888888888",
        "pickup_city": "Delhi",
        "pickup_location": "Airport",
        "pickup_datetime": pickup,
        "drop_datetime": drop,
    }
    # quote
    q = s.post(f"{API}/bookings/quote", json=payload)
    assert q.status_code == 200
    assert q.json()["days"] >= 1
    # book
    r = s.post(f"{API}/bookings", json=payload)
    assert r.status_code == 200
    b = r.json()
    assert b["car_id"] == car["id"]
    assert b["total_amount"] > 0
    booking_holder["id"] = b["id"]
    booking_holder["amount"] = b["total_amount"]


def test_get_booking(s):
    bid = booking_holder["id"]
    r = s.get(f"{API}/bookings/{bid}")
    assert r.status_code == 200
    assert r.json()["id"] == bid


# ---------- Payments ----------
session_holder = {}


def test_create_checkout(s):
    bid = booking_holder["id"]
    r = s.post(f"{API}/payments/checkout", json={"booking_id": bid, "origin_url": BASE})
    assert r.status_code == 200, r.text
    j = r.json()
    assert j.get("checkout_url", "").startswith("http")
    assert j.get("session_id")
    session_holder["sid"] = j["session_id"]


def test_payment_status(s):
    sid = session_holder["sid"]
    r = s.get(f"{API}/payments/status/{sid}")
    assert r.status_code == 200
    j = r.json()
    assert j["session_id"] == sid
    assert "status" in j and "payment_status" in j


# ---------- Admin auth ----------
def test_admin_wrong_password(s):
    r = s.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
    assert r.status_code == 401


def test_admin_login_ok(admin_token):
    assert admin_token and len(admin_token) > 20


# ---------- Admin cars CRUD ----------
created_car_holder = {}


def test_admin_list_cars(s, admin_headers):
    r = s.get(f"{API}/admin/cars", headers=admin_headers)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_admin_create_car(s, admin_headers):
    payload = {
        "name": "TEST_Model", "brand": "TEST_Brand", "category": "sedan",
        "transmission": "manual", "fuel": "petrol", "seats": 5,
        "price_per_day": 1000, "price_per_hour": 100,
        "image_url": "https://example.com/x.jpg",
        "features": ["AC"], "cities": ["Delhi"], "description": "test",
    }
    r = s.post(f"{API}/admin/cars", json=payload, headers=admin_headers)
    assert r.status_code == 200, r.text
    car = r.json()
    assert car["name"] == "TEST_Model"
    created_car_holder["id"] = car["id"]


def test_admin_update_car(s, admin_headers):
    cid = created_car_holder["id"]
    payload = {
        "name": "TEST_Updated", "brand": "TEST_Brand", "category": "sedan",
        "transmission": "manual", "fuel": "petrol", "seats": 5,
        "price_per_day": 1200, "price_per_hour": 120,
        "image_url": "https://example.com/x.jpg", "features": ["AC"],
        "cities": ["Delhi"], "description": "u",
    }
    r = s.put(f"{API}/admin/cars/{cid}", json=payload, headers=admin_headers)
    assert r.status_code == 200
    assert r.json()["name"] == "TEST_Updated"


def test_admin_delete_car(s, admin_headers):
    cid = created_car_holder["id"]
    r = s.delete(f"{API}/admin/cars/{cid}", headers=admin_headers)
    assert r.status_code == 200
    # verify gone
    r2 = s.get(f"{API}/cars/{cid}")
    assert r2.status_code == 404


# ---------- Admin bookings & leads ----------
def test_admin_bookings(s, admin_headers):
    r = s.get(f"{API}/admin/bookings", headers=admin_headers)
    assert r.status_code == 200
    assert any(b["id"] == booking_holder["id"] for b in r.json())


def test_admin_update_booking(s, admin_headers):
    bid = booking_holder["id"]
    r = s.put(f"{API}/admin/bookings/{bid}", json={"status": "confirmed"}, headers=admin_headers)
    assert r.status_code == 200
    assert r.json()["status"] == "confirmed"


def test_admin_leads(s, admin_headers):
    r = s.get(f"{API}/admin/leads", headers=admin_headers)
    assert r.status_code == 200
    assert any(l["id"] == lead_id_holder["id"] for l in r.json())


def test_admin_update_lead(s, admin_headers):
    lid = lead_id_holder["id"]
    r = s.put(f"{API}/admin/leads/{lid}", json={"status": "contacted"}, headers=admin_headers)
    assert r.status_code == 200
    assert r.json()["status"] == "contacted"


def test_admin_stats(s, admin_headers):
    r = s.get(f"{API}/admin/stats", headers=admin_headers)
    assert r.status_code == 200
    j = r.json()
    for k in ["cars", "bookings", "leads"]:
        assert k in j


def test_admin_requires_token(s):
    r = s.get(f"{API}/admin/cars")
    assert r.status_code == 401


# ---------- Auth session ----------
def test_me_without_cookie(s):
    r = requests.get(f"{API}/auth/me")
    assert r.status_code == 401


def test_me_with_mock_session():
    """Insert a mocked user + session into MongoDB and verify /api/auth/me returns user."""
    from pymongo import MongoClient
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.environ.get("DB_NAME", "test_database")
    mc = MongoClient(mongo_url)
    db = mc[db_name]
    user_id = f"user_TEST_{uuid.uuid4().hex[:8]}"
    session_token = f"TEST_TOK_{uuid.uuid4().hex}"
    db.users.insert_one({
        "user_id": user_id, "email": "admin@revvcars.com",
        "name": "Test Admin", "picture": "", "created_at": datetime.now(timezone.utc).isoformat(),
    })
    db.user_sessions.insert_one({
        "user_id": user_id, "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=1),
        "created_at": datetime.now(timezone.utc),
    })
    try:
        r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {session_token}"})
        assert r.status_code == 200, r.text
        j = r.json()
        assert j["email"] == "admin@revvcars.com"
        assert j["is_admin"] is True
    finally:
        db.users.delete_one({"user_id": user_id})
        db.user_sessions.delete_one({"session_token": session_token})
