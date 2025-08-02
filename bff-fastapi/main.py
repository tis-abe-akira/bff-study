from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import os
import logging
from config import Config

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Training App BFF",
    description="FastAPI Backend for Frontend with KeyCloak OAuth2",
    version="1.0.0"
)

# Session middleware for authentication state
app.add_middleware(
    SessionMiddleware,
    secret_key=Config.SECRET_KEY,
    max_age=3600,  # 1 hour
    same_site="lax",
    https_only=False  # Set to True in production
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Training App FastAPI BFF", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "bff-fastapi"}

@app.get("/favicon.ico")
async def favicon():
    """Return 404 for favicon requests to avoid errors"""
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Favicon not found")

# Include routers
from routers import auth, training
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(training.router, prefix="/api", tags=["training"])

# SpringBoot OAuth2 compatibility routes
@app.get("/oauth2/authorization/keycloak")
async def springboot_oauth_keycloak(request: Request):
    """SpringBoot OAuth2 compatibility route - redirect to FastAPI auth login"""
    return await auth.login(request)

@app.get("/login/oauth2/code/keycloak")
async def springboot_oauth_callback(request: Request):
    """SpringBoot OAuth2 callback compatibility route"""
    return await auth.auth_callback(request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)