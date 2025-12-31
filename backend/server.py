from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
import uuid
import base64
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "kostify-secret-key-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    phone: str
    role: str  # owner, pengelola
    owner_id: Optional[str] = None  # untuk pengelola, ini ID owner yang invite
    is_owner: bool = True
    subscription_status: str = "trial"
    trial_end_date: Optional[datetime] = None
    permissions: List[str] = []  # untuk pengelola: ["manage_rooms", "manage_tenants", dll]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str
    role: str = "owner"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Property(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    owner_id: str
    name: str
    address: str
    total_rooms: int
    description: Optional[str] = None
    facilities: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PropertyCreate(BaseModel):
    name: str
    address: str
    total_rooms: int
    description: Optional[str] = None
    facilities: List[str] = []

class Room(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    property_id: str
    room_number: str
    room_type: str
    price: float
    status: str = "available"
    facilities: List[str] = []
    photos: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RoomCreate(BaseModel):
    property_id: str
    room_number: str
    room_type: str
    price: float
    facilities: List[str] = []

class Tenant(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    property_id: str
    room_id: str
    full_name: str
    email: EmailStr

class CanteenProduct(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    property_id: str
    name: str
    price: float
    stock: int
    category: str = "makanan"  # makanan, minuman, snack, dll
    photo_url: Optional[str] = None
    is_available: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CanteenProductCreate(BaseModel):
    property_id: str
    name: str
    price: float
    stock: int
    category: str = "makanan"

class CanteenTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    property_id: str
    product_id: str
    tenant_id: Optional[str] = None
    quantity: int
    total_price: float
    transaction_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CanteenTransactionCreate(BaseModel):
    property_id: str
    product_id: str
    tenant_id: Optional[str] = None
    quantity: int
    notes: Optional[str] = None

class PengelolaCreate(BaseModel):
    email: EmailStr
    full_name: str
    phone: str
    password: str
    property_id: str
    permissions: List[str] = ["manage_rooms", "manage_tenants"]

    phone: str
    id_card_number: str
    check_in_date: datetime
    check_out_date: Optional[datetime] = None
    payment_status: str = "unpaid"
    deposit_amount: float = 0
    deposit_status: str = "unpaid"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TenantCreate(BaseModel):
    property_id: str
    room_id: str
    full_name: str
    email: EmailStr
    phone: str
    id_card_number: str
    check_in_date: datetime
    deposit_amount: float = 0

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    property_id: str
    room_id: str
    amount: float
    payment_date: datetime
    payment_method: str = "transfer"
    status: str = "pending"
    proof_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PaymentCreate(BaseModel):
    tenant_id: str
    property_id: str
    room_id: str
    amount: float
    payment_date: datetime
    payment_method: str = "transfer"
    notes: Optional[str] = None

class UtilityMeter(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    room_id: str
    property_id: str
    meter_type: str
    reading_date: datetime
    current_reading: float
    previous_reading: float = 0
    cost_per_unit: float
    total_cost: float = 0
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UtilityMeterCreate(BaseModel):
    room_id: str
    property_id: str
    meter_type: str
    reading_date: datetime
    current_reading: float
    previous_reading: float = 0
    cost_per_unit: float
    notes: Optional[str] = None

class Complaint(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    property_id: str
    room_id: str
    title: str
    description: str
    status: str = "open"
    priority: str = "medium"
    photos: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ComplaintCreate(BaseModel):
    tenant_id: str
    property_id: str
    room_id: str
    title: str
    description: str
    priority: str = "medium"

# Auth functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth endpoints
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.model_dump()
    user_dict.pop("password")
    
    user = User(**user_dict)
    user.trial_end_date = datetime.now(timezone.utc) + timedelta(days=14)
    
    doc = user.model_dump()
    doc["password"] = hashed_password
    doc["created_at"] = doc["created_at"].isoformat()
    doc["trial_end_date"] = doc["trial_end_date"].isoformat()
    
    await db.users.insert_one(doc)
    
    access_token = create_access_token({"sub": user.id, "email": user.email})
    return {"access_token": access_token, "user": user.model_dump()}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token({"sub": user["id"], "email": user["email"]})
    user.pop("password")
    return {"access_token": access_token, "user": user}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

# Properties
@api_router.post("/properties", response_model=Property)
async def create_property(property_data: PropertyCreate, current_user: dict = Depends(get_current_user)):
    property_obj = Property(owner_id=current_user["id"], **property_data.model_dump())
    doc = property_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.properties.insert_one(doc)
    return property_obj

@api_router.get("/properties", response_model=List[Property])
async def get_properties(current_user: dict = Depends(get_current_user)):
    properties = await db.properties.find({"owner_id": current_user["id"]}, {"_id": 0}).to_list(100)
    for prop in properties:
        if isinstance(prop["created_at"], str):
            prop["created_at"] = datetime.fromisoformat(prop["created_at"])
    return properties

@api_router.get("/properties/{property_id}", response_model=Property)
async def get_property(property_id: str, current_user: dict = Depends(get_current_user)):
    prop = await db.properties.find_one({"id": property_id, "owner_id": current_user["id"]}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if isinstance(prop["created_at"], str):
        prop["created_at"] = datetime.fromisoformat(prop["created_at"])
    return prop

@api_router.put("/properties/{property_id}")
async def update_property(property_id: str, property_data: PropertyCreate, current_user: dict = Depends(get_current_user)):
    result = await db.properties.update_one(
        {"id": property_id, "owner_id": current_user["id"]},
        {"$set": property_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"message": "Property updated successfully"}

@api_router.delete("/properties/{property_id}")
async def delete_property(property_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.properties.delete_one({"id": property_id, "owner_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"message": "Property deleted successfully"}

# Rooms
@api_router.post("/rooms", response_model=Room)
async def create_room(room_data: RoomCreate, current_user: dict = Depends(get_current_user)):
    room = Room(**room_data.model_dump())
    doc = room.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.rooms.insert_one(doc)
    return room

@api_router.get("/rooms", response_model=List[Room])
async def get_rooms(property_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if property_id:
        query["property_id"] = property_id
    rooms = await db.rooms.find(query, {"_id": 0}).to_list(500)
    for room in rooms:
        if isinstance(room["created_at"], str):
            room["created_at"] = datetime.fromisoformat(room["created_at"])
    return rooms

@api_router.put("/rooms/{room_id}")
async def update_room(room_id: str, updates: dict, current_user: dict = Depends(get_current_user)):
    result = await db.rooms.update_one({"id": room_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"message": "Room updated successfully"}

@api_router.delete("/rooms/{room_id}")
async def delete_room(room_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.rooms.delete_one({"id": room_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"message": "Room deleted successfully"}

# Tenants
@api_router.post("/tenants", response_model=Tenant)
async def create_tenant(tenant_data: TenantCreate, current_user: dict = Depends(get_current_user)):
    tenant = Tenant(**tenant_data.model_dump())
    doc = tenant.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["check_in_date"] = doc["check_in_date"].isoformat()
    if doc.get("check_out_date"):
        doc["check_out_date"] = doc["check_out_date"].isoformat()
    
    await db.tenants.insert_one(doc)
    await db.rooms.update_one({"id": tenant_data.room_id}, {"$set": {"status": "occupied"}})
    return tenant

@api_router.get("/tenants", response_model=List[Tenant])
async def get_tenants(property_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if property_id:
        query["property_id"] = property_id
    tenants = await db.tenants.find(query, {"_id": 0}).to_list(500)
    for tenant in tenants:
        if isinstance(tenant["created_at"], str):
            tenant["created_at"] = datetime.fromisoformat(tenant["created_at"])
        if isinstance(tenant["check_in_date"], str):
            tenant["check_in_date"] = datetime.fromisoformat(tenant["check_in_date"])
        if tenant.get("check_out_date") and isinstance(tenant["check_out_date"], str):
            tenant["check_out_date"] = datetime.fromisoformat(tenant["check_out_date"])
    return tenants

@api_router.get("/tenants/{tenant_id}", response_model=Tenant)
async def get_tenant(tenant_id: str, current_user: dict = Depends(get_current_user)):
    tenant = await db.tenants.find_one({"id": tenant_id}, {"_id": 0})
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    if isinstance(tenant["created_at"], str):
        tenant["created_at"] = datetime.fromisoformat(tenant["created_at"])
    if isinstance(tenant["check_in_date"], str):
        tenant["check_in_date"] = datetime.fromisoformat(tenant["check_in_date"])
    if tenant.get("check_out_date") and isinstance(tenant["check_out_date"], str):
        tenant["check_out_date"] = datetime.fromisoformat(tenant["check_out_date"])
    return tenant

@api_router.put("/tenants/{tenant_id}")
async def update_tenant(tenant_id: str, updates: dict, current_user: dict = Depends(get_current_user)):
    result = await db.tenants.update_one({"id": tenant_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"message": "Tenant updated successfully"}

# Payments
@api_router.post("/payments", response_model=Payment)
async def create_payment(payment_data: PaymentCreate, current_user: dict = Depends(get_current_user)):
    payment = Payment(**payment_data.model_dump())
    doc = payment.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["payment_date"] = doc["payment_date"].isoformat()
    await db.payments.insert_one(doc)
    return payment

@api_router.get("/payments", response_model=List[Payment])
async def get_payments(property_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if property_id:
        query["property_id"] = property_id
    payments = await db.payments.find(query, {"_id": 0}).to_list(500)

# Pengelola Management
@api_router.post("/pengelola")
async def create_pengelola(pengelola_data: PengelolaCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Only owner can add pengelola")
    
    existing = await db.users.find_one({"email": pengelola_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(pengelola_data.password)
    
    pengelola = User(
        email=pengelola_data.email,
        full_name=pengelola_data.full_name,
        phone=pengelola_data.phone,
        role="pengelola",
        owner_id=current_user["id"],
        is_owner=False,
        permissions=pengelola_data.permissions
    )
    
    doc = pengelola.model_dump()
    doc["password"] = hashed_password
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.users.insert_one(doc)
    
    return {"message": "Pengelola berhasil ditambahkan", "pengelola_id": pengelola.id}

@api_router.get("/pengelola")
async def get_pengelola_list(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Only owner can view pengelola list")
    
    pengelola_list = await db.users.find(
        {"owner_id": current_user["id"], "role": "pengelola"},
        {"_id": 0, "password": 0}
    ).to_list(100)
    
    for p in pengelola_list:
        if isinstance(p["created_at"], str):
            p["created_at"] = datetime.fromisoformat(p["created_at"])
    
    return pengelola_list

@api_router.delete("/pengelola/{pengelola_id}")
async def delete_pengelola(pengelola_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Only owner can delete pengelola")
    
    result = await db.users.delete_one({"id": pengelola_id, "owner_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pengelola not found")
    
    return {"message": "Pengelola berhasil dihapus"}

# Canteen Products
@api_router.post("/canteen/products", response_model=CanteenProduct)
async def create_canteen_product(product_data: CanteenProductCreate, current_user: dict = Depends(get_current_user)):
    product = CanteenProduct(**product_data.model_dump())
    doc = product.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.canteen_products.insert_one(doc)
    return product

@api_router.get("/canteen/products", response_model=List[CanteenProduct])
async def get_canteen_products(property_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if property_id:
        query["property_id"] = property_id
    
    products = await db.canteen_products.find(query, {"_id": 0}).to_list(500)
    for product in products:
        if isinstance(product["created_at"], str):
            product["created_at"] = datetime.fromisoformat(product["created_at"])
    return products

@api_router.put("/canteen/products/{product_id}")
async def update_canteen_product(product_id: str, updates: dict, current_user: dict = Depends(get_current_user)):
    result = await db.canteen_products.update_one({"id": product_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product updated successfully"}

@api_router.delete("/canteen/products/{product_id}")
async def delete_canteen_product(product_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.canteen_products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# Canteen Transactions
@api_router.post("/canteen/transactions", response_model=CanteenTransaction)
async def create_canteen_transaction(transaction_data: CanteenTransactionCreate, current_user: dict = Depends(get_current_user)):
    # Get product to calculate price
    product = await db.canteen_products.find_one({"id": transaction_data.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    total_price = product["price"] * transaction_data.quantity
    
    transaction = CanteenTransaction(
        **transaction_data.model_dump(),
        total_price=total_price
    )
    
    doc = transaction.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["transaction_date"] = doc["transaction_date"].isoformat()
    await db.canteen_transactions.insert_one(doc)
    
    # Update stock
    new_stock = product["stock"] - transaction_data.quantity
    await db.canteen_products.update_one(
        {"id": transaction_data.product_id},
        {"$set": {"stock": new_stock, "is_available": new_stock > 0}}
    )
    
    return transaction

@api_router.get("/canteen/transactions", response_model=List[CanteenTransaction])
async def get_canteen_transactions(property_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if property_id:
        query["property_id"] = property_id
    
    transactions = await db.canteen_transactions.find(query, {"_id": 0}).to_list(500)
    for trans in transactions:
        if isinstance(trans["created_at"], str):
            trans["created_at"] = datetime.fromisoformat(trans["created_at"])
        if isinstance(trans["transaction_date"], str):
            trans["transaction_date"] = datetime.fromisoformat(trans["transaction_date"])
    return transactions

@api_router.get("/canteen/sales-report")
async def get_canteen_sales_report(property_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {} if not property_id else {"property_id": property_id}
    
    # Total revenue
    total_revenue = await db.canteen_transactions.aggregate([
        {"$match": query},
        {"$group": {"_id": None, "total": {"$sum": "$total_price"}}}
    ]).to_list(1)
    
    revenue = total_revenue[0]["total"] if total_revenue else 0
    
    # Total transactions
    total_transactions = await db.canteen_transactions.count_documents(query)
    
    # Top products
    top_products = await db.canteen_transactions.aggregate([
        {"$match": query},
        {"$group": {
            "_id": "$product_id",
            "total_quantity": {"$sum": "$quantity"},
            "total_revenue": {"$sum": "$total_price"}
        }},
        {"$sort": {"total_quantity": -1}},
        {"$limit": 5}
    ]).to_list(5)
    
    return {
        "total_revenue": revenue,
        "total_transactions": total_transactions,
        "top_products": top_products
    }

    for payment in payments:
        if isinstance(payment["created_at"], str):
            payment["created_at"] = datetime.fromisoformat(payment["created_at"])
        if isinstance(payment["payment_date"], str):
            payment["payment_date"] = datetime.fromisoformat(payment["payment_date"])
    return payments

@api_router.put("/payments/{payment_id}/approve")
async def approve_payment(payment_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.payments.update_one({"id": payment_id}, {"$set": {"status": "approved"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment = await db.payments.find_one({"id": payment_id}, {"_id": 0})
    if payment:
        await db.tenants.update_one({"id": payment["tenant_id"]}, {"$set": {"payment_status": "paid"}})
    
    return {"message": "Payment approved successfully"}

@api_router.put("/payments/{payment_id}/reject")
async def reject_payment(payment_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.payments.update_one({"id": payment_id}, {"$set": {"status": "rejected"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"message": "Payment rejected"}

# Utility Meters
@api_router.post("/utility-meters", response_model=UtilityMeter)
async def create_utility_meter(meter_data: UtilityMeterCreate, current_user: dict = Depends(get_current_user)):
    meter = UtilityMeter(**meter_data.model_dump())
    meter.total_cost = (meter.current_reading - meter.previous_reading) * meter.cost_per_unit
    doc = meter.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["reading_date"] = doc["reading_date"].isoformat()
    await db.utility_meters.insert_one(doc)
    return meter

@api_router.get("/utility-meters", response_model=List[UtilityMeter])
async def get_utility_meters(room_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if room_id:
        query["room_id"] = room_id
    meters = await db.utility_meters.find(query, {"_id": 0}).to_list(500)
    for meter in meters:
        if isinstance(meter["created_at"], str):
            meter["created_at"] = datetime.fromisoformat(meter["created_at"])
        if isinstance(meter["reading_date"], str):
            meter["reading_date"] = datetime.fromisoformat(meter["reading_date"])
    return meters

# Complaints
@api_router.post("/complaints", response_model=Complaint)
async def create_complaint(complaint_data: ComplaintCreate, current_user: dict = Depends(get_current_user)):
    complaint = Complaint(**complaint_data.model_dump())
    doc = complaint.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.complaints.insert_one(doc)
    return complaint

@api_router.get("/complaints", response_model=List[Complaint])
async def get_complaints(property_id: Optional[str] = None, status: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if property_id:
        query["property_id"] = property_id
    if status:
        query["status"] = status
    complaints = await db.complaints.find(query, {"_id": 0}).to_list(500)
    for complaint in complaints:
        if isinstance(complaint["created_at"], str):
            complaint["created_at"] = datetime.fromisoformat(complaint["created_at"])
        if isinstance(complaint["updated_at"], str):
            complaint["updated_at"] = datetime.fromisoformat(complaint["updated_at"])
    return complaints

@api_router.put("/complaints/{complaint_id}/status")
async def update_complaint_status(complaint_id: str, status: str, current_user: dict = Depends(get_current_user)):
    result = await db.complaints.update_one(
        {"id": complaint_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return {"message": "Complaint status updated"}

# Dashboard Analytics
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(property_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {} if not property_id else {"property_id": property_id}
    owner_query = {"owner_id": current_user["id"]}
    
    properties_count = await db.properties.count_documents(owner_query)
    total_rooms = await db.rooms.count_documents(query if property_id else {})
    occupied_rooms = await db.rooms.count_documents({**query, "status": "occupied"})
    available_rooms = total_rooms - occupied_rooms
    occupancy_rate = (occupied_rooms / total_rooms * 100) if total_rooms > 0 else 0
    
    tenants_count = await db.tenants.count_documents(query)
    pending_payments = await db.payments.count_documents({**query, "status": "pending"})
    total_revenue = await db.payments.aggregate([
        {"$match": {**query, "status": "approved"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    
    revenue = total_revenue[0]["total"] if total_revenue else 0
    
    open_complaints = await db.complaints.count_documents({**query, "status": "open"})
    
    return {
        "properties_count": properties_count,
        "total_rooms": total_rooms,
        "occupied_rooms": occupied_rooms,
        "available_rooms": available_rooms,
        "occupancy_rate": round(occupancy_rate, 2),
        "tenants_count": tenants_count,
        "pending_payments": pending_payments,
        "total_revenue": revenue,
        "open_complaints": open_complaints
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()