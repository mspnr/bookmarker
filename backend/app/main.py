import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .api import auth, bookmarks

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Bookmarker API",
    description="Simple bookmarking application API",
    version="1.0.0"
)

# Configure CORS
# Same-origin enforced via nginx (production) and Vite proxy (development)
# Extensions allowed via moz-extension:// regex
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],  # Same-origin only (handled by reverse proxy)
    allow_origin_regex=r"moz-extension://.*",  # Firefox extension
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(bookmarks.router, prefix="/bookmarks", tags=["bookmarks"])


@app.get("/")
def root():
    return {"message": "Bookmarker API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
