import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed.seed_data import seed_database
import app.models  # ensure models are registered

# Import API routers
from app.api import (
    health,
    dashboard,
    operators,
    vehicles,
    trips,
    bookings,
    incidents,
    consolidation,
    passenger_offers,
    refunds,
    analytics,
    demo
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fleetripple")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables and seed data if empty
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        logger.info("Seeding demonstration operational dataset...")
        seed_database(db, force=False)
        logger.info("FleetRipple AI Backend operational database ready.")
    finally:
        db.close()
    yield
    logger.info("FleetRipple AI Backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Fleet Recovery, Passenger Reallocation and Cross-Company Trip Consolidation",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes under API_PREFIX
prefix = settings.API_PREFIX

app.include_router(health.router, prefix=prefix, tags=["Health"])
app.include_router(dashboard.router, prefix=prefix, tags=["Dashboard"])
app.include_router(operators.router, prefix=prefix, tags=["Operators"])
app.include_router(vehicles.router, prefix=prefix, tags=["Vehicles"])
app.include_router(trips.router, prefix=prefix, tags=["Trips"])
app.include_router(bookings.router, prefix=prefix, tags=["Bookings"])
app.include_router(incidents.router, prefix=prefix, tags=["Breakdown Recovery (RippleOps)"])
app.include_router(consolidation.router, prefix=prefix, tags=["Consolidation Brokerage (TripMerge)"])
app.include_router(passenger_offers.router, prefix=prefix, tags=["Passenger Communications"])
app.include_router(refunds.router, prefix=prefix, tags=["Refunds"])
app.include_router(analytics.router, prefix=prefix, tags=["Analytics & Audit"])
app.include_router(demo.router, prefix=prefix, tags=["Demo State Control"])

@app.get("/")
def root():
    return {
        "message": "Welcome to FleetRipple AI Backend API",
        "docs": "/docs",
        "health": f"{prefix}/health"
    }
