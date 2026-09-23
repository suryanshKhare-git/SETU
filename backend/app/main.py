from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import (
    search,
    entities,
    cases,
    reviews,
    records,
    audit,
    auth,
)

from .core.rate_limiter import rate_limiter

# Database
from .core.database import engine, Base
from .models.user import User


# =========================================================
# DATABASE INITIALIZATION
# =========================================================

# Importing User above registers the users table with SQLAlchemy.
# This creates the table if it does not already exist.
Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description=(
        "SETU (सेतु) Law-Enforcement Record-Linking & Explainable "
        "Network Graph Platform. Provides normalized ingestion, "
        "3-tier entity resolution, bounded graph traversal, "
        "grounded explanation generation, cross-case linkage "
        "detection, and tamper-evident audit logging."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# RATE LIMITER & ANOMALY DETECTION
# =========================================================

@app.middleware("http")
async def rate_limit_middleware(
    request: Request,
    call_next,
):
    client_ip = (
        request.client.host
        if request.client
        else "127.0.0.1"
    )

    badge = request.headers.get(
        "X-Officer-Badge",
        "ANON_OPERATOR",
    )

    # Apply rate limiting only to API routes
    if request.url.path.startswith(
        settings.api_v1_prefix
    ):
        allowed, msg = rate_limiter.check_request(
            client_ip=client_ip,
            officer_badge=badge,
            endpoint=request.url.path,
        )

        if not allowed:
            return Response(
                content=msg,
                status_code=429,
                media_type="text/plain",
            )

    response = await call_next(request)

    return response


# =========================================================
# API ROUTERS
# =========================================================

app.include_router(
    search.router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    entities.router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    cases.router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    reviews.router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    records.router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    audit.router,
    prefix=settings.api_v1_prefix,
)

# ---------------------------------------------------------
# AUTH ROUTER
# ---------------------------------------------------------

app.include_router(
    auth.router,
    prefix=settings.api_v1_prefix,
)


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get(
    "/health",
    tags=["Health"],
)
def health_check():
    return {
        "status": "HEALTHY",
        "system": "SETU Enterprise Intelligence Engine",
        "version": settings.version,
        "classification": (
            "RESTRICTED // LAW ENFORCEMENT SENSITIVE"
        ),
    }


# =========================================================
# ROOT
# =========================================================

@app.get(
    "/",
    tags=["System"],
)
def root():
    return {
        "title": settings.app_name,
        "version": settings.version,
        "documentation": "/docs",
        "jurisdiction": (
            "NCR & Inter-State Crime Branch"
        ),
        "active_case": (
            "FIR No. 492/2024 "
            "(Operation Northern Haul)"
        ),
    }