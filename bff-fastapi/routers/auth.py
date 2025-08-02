from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse, JSONResponse
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config as StarletteConfig
from starlette.middleware.sessions import SessionMiddleware
import httpx
import logging
from typing import Dict, Any, Optional
from urllib.parse import urlencode
import json

from config import Config

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize OAuth
starlette_config = StarletteConfig()
oauth = OAuth(starlette_config)

# KeyCloak OAuth client (will be initialized on first use)
keycloak = None

def get_keycloak_client():
    """Get or initialize KeyCloak OAuth client"""
    global keycloak
    if keycloak is None:
        keycloak = oauth.register(
            name='keycloak',
            client_id=Config.OAUTH2_CONFIG['client_id'],
            client_secret=Config.OAUTH2_CONFIG['client_secret'],
            authorize_url=Config.OAUTH2_CONFIG['authorize_url'],
            access_token_url=Config.OAUTH2_CONFIG['access_token_url'],
            userinfo_endpoint=Config.OAUTH2_CONFIG['userinfo_endpoint'],
            client_kwargs={
                'scope': 'openid profile email',
                'response_type': 'code',
                'response_mode': 'query'
            }
        )
    return keycloak

def get_current_user(request: Request) -> Optional[Dict[str, Any]]:
    """Get current user from session"""
    return request.session.get("user")

def require_auth(request: Request) -> Dict[str, Any]:
    """Dependency to require authentication"""
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user

@router.get("/login")
async def login(request: Request):
    """Redirect to KeyCloak login"""
    try:
        keycloak_client = get_keycloak_client()
        redirect_uri = Config.REDIRECT_URI
        logger.debug(f"Redirecting to KeyCloak login with redirect_uri: {redirect_uri}")
        return await keycloak_client.authorize_redirect(request, redirect_uri)
    except Exception as e:
        logger.error(f"KeyCloak connection error: {str(e)}")
        # Return error response instead of crashing
        raise HTTPException(
            status_code=503, 
            detail=f"Authentication service unavailable. Please ensure KeyCloak is running on {Config.KEYCLOAK_BASE_URL}"
        )

@router.get("/callback")
async def auth_callback(request: Request):
    """Handle OAuth callback from KeyCloak"""
    try:
        keycloak_client = get_keycloak_client()
        token = await keycloak_client.authorize_access_token(request)
        logger.debug(f"Received token: {type(token)}")
        
        # Get user info from token
        user_info = token.get('userinfo')
        if not user_info:
            # If userinfo is not in token, fetch it
            async with httpx.AsyncClient() as client:
                headers = {"Authorization": f"Bearer {token['access_token']}"}
                response = await client.get(Config.KEYCLOAK_USERINFO_URL, headers=headers)
                if response.status_code == 200:
                    user_info = response.json()
                else:
                    logger.error(f"Failed to fetch user info: {response.status_code}")
                    raise HTTPException(status_code=500, detail="Failed to fetch user info")
        
        # Store user info in session
        user_data = {
            "id": user_info.get("sub"),
            "username": user_info.get("preferred_username"),
            "email": user_info.get("email"),
            "name": user_info.get("name"),
            "access_token": token.get("access_token"),
            "id_token": token.get("id_token")
        }
        
        logger.debug(f"Token keys: {list(token.keys())}")
        logger.debug(f"ID Token present: {token.get('id_token') is not None}")
        
        request.session["user"] = user_data
        request.session["token"] = token
        
        logger.info(f"User logged in: {user_data['username']}")
        
        # Redirect to frontend dashboard
        return RedirectResponse(url=f"{Config.FRONTEND_URL}/dashboard")
        
    except Exception as e:
        logger.error(f"OAuth callback error: {str(e)}")
        return RedirectResponse(url=f"{Config.FRONTEND_URL}?error=auth_failed")

@router.get("/status")
async def auth_status(request: Request):
    """Get authentication status"""
    user = get_current_user(request)
    
    if user:
        return {
            "authenticated": True,
            "user": {
                "id": user.get("id"),
                "username": user.get("username"),
                "email": user.get("email"),
                "name": user.get("name")
            }
        }
    else:
        return {"authenticated": False}

@router.get("/success")
async def login_success():
    """Login success endpoint (for compatibility)"""
    return RedirectResponse(url=f"{Config.FRONTEND_URL}/dashboard")

@router.post("/logout")
@router.get("/logout")
async def logout(request: Request):
    """Logout user and redirect to KeyCloak logout"""
    user = get_current_user(request)
    username = user.get('username') if user else 'unknown'
    
    # Clear session first
    request.session.clear()
    
    try:
        if user and user.get("id_token"):
            # Redirect to KeyCloak logout with ID token
            logout_url = f"{Config.KEYCLOAK_LOGOUT_URL}?id_token_hint={user['id_token']}&post_logout_redirect_uri={Config.POST_LOGOUT_REDIRECT_URI}"
            logger.info(f"User logged out with ID token: {username}")
        else:
            # Simple logout without ID token (fallback)
            logout_url = f"{Config.KEYCLOAK_LOGOUT_URL}?post_logout_redirect_uri={Config.POST_LOGOUT_REDIRECT_URI}"
            logger.warning(f"User logged out without ID token: {username}")
        
        return RedirectResponse(url=logout_url)
        
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        # Fallback: redirect directly to frontend with logout success
        return RedirectResponse(url=Config.POST_LOGOUT_REDIRECT_URI)

@router.get("/logout-success") 
async def logout_success():
    """Logout success endpoint"""
    return {"message": "Logout completed"}

@router.get("/failure")
async def login_failure():
    """Login failure endpoint"""
    return JSONResponse(
        status_code=400,
        content={"message": "Login failed"}
    )

@router.get("/debug")
async def debug_session(request: Request):
    """Debug endpoint to check session state"""
    session_data = dict(request.session)
    user = get_current_user(request)
    
    return {
        "session_keys": list(session_data.keys()),
        "user_present": user is not None,
        "user_id": user.get("id") if user else None,
        "id_token_present": user.get("id_token") is not None if user else False,
        "session_id": request.session.get("_session_id", "none")
    }

@router.get("/health")
async def auth_health():
    """Check authentication service health"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{Config.KEYCLOAK_BASE_URL}/realms/{Config.KEYCLOAK_REALM}/.well-known/openid_configuration")
            if response.status_code == 200:
                return {
                    "status": "healthy",
                    "keycloak": "connected",
                    "realm": Config.KEYCLOAK_REALM,
                    "base_url": Config.KEYCLOAK_BASE_URL
                }
            else:
                return {
                    "status": "degraded",
                    "keycloak": "unreachable",
                    "error": f"HTTP {response.status_code}",
                    "base_url": Config.KEYCLOAK_BASE_URL
                }
    except Exception as e:
        return {
            "status": "unhealthy",
            "keycloak": "error",
            "error": str(e),
            "base_url": Config.KEYCLOAK_BASE_URL
        }