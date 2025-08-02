import os
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Server settings
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8080"))
    
    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    
    # KeyCloak Settings
    KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "training-app")
    KEYCLOAK_CLIENT_SECRET = os.getenv("KEYCLOAK_CLIENT_SECRET", "")
    KEYCLOAK_BASE_URL = os.getenv("KEYCLOAK_BASE_URL", "http://localhost:8180")
    KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "training-app")
    
    # KeyCloak URLs (auto-generated from base settings)
    KEYCLOAK_AUTH_URL = f"{KEYCLOAK_BASE_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/auth"
    KEYCLOAK_TOKEN_URL = f"{KEYCLOAK_BASE_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/token"
    KEYCLOAK_USERINFO_URL = f"{KEYCLOAK_BASE_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/userinfo"
    KEYCLOAK_LOGOUT_URL = f"{KEYCLOAK_BASE_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/logout"
    
    # OAuth2 Configuration
    OAUTH2_CONFIG = {
        "client_id": KEYCLOAK_CLIENT_ID,
        "client_secret": KEYCLOAK_CLIENT_SECRET,
        # Use direct endpoint URLs instead of metadata discovery
        "authorize_url": KEYCLOAK_AUTH_URL,
        "access_token_url": KEYCLOAK_TOKEN_URL,
        "userinfo_endpoint": KEYCLOAK_USERINFO_URL,
        "client_kwargs": {
            "scope": "openid profile email"
        }
    }
    
    # Service URLs
    API_GATEWAY_URL = os.getenv("API_GATEWAY_URL", "http://localhost:8082")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Redirect URIs (matching SpringBoot configuration)
    REDIRECT_URI = f"http://localhost:{PORT}/login/oauth2/code/keycloak"
    POST_LOGOUT_REDIRECT_URI = f"{FRONTEND_URL}?logout=success"
    
    # Development Settings
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    LOG_LEVEL = os.getenv("LOG_LEVEL", "info")