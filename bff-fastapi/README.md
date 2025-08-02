# FastAPI BFF for Training App

A FastAPI-based Backend for Frontend (BFF) that replaces the SpringBoot BFF with Python implementation.

## Features

- **OAuth2 Authentication**: KeyCloak integration with session management
- **API Gateway Communication**: Proxies requests to the API Gateway (port 8082)
- **CORS Support**: Configured for frontend (port 3000) communication
- **Session Management**: Secure session handling with cookies

## Requirements

- Python 3.11+
- uv (Python package manager)
- KeyCloak running on port 8180
- API Gateway running on port 8082
- Backend running on port 8081

## Installation & Setup

```bash
# Install dependencies
uv sync

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your specific settings

# Run the development server
uv run python run.py

# Alternative: Run with main.py
uv run python main.py
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Server Settings
HOST=0.0.0.0
PORT=8080

# Security
SECRET_KEY=your-secret-key-change-in-production

# KeyCloak OAuth2 Settings
KEYCLOAK_CLIENT_ID=training-app
KEYCLOAK_CLIENT_SECRET=your-client-secret
KEYCLOAK_BASE_URL=http://localhost:8180
KEYCLOAK_REALM=training-app

# Service URLs
API_GATEWAY_URL=http://localhost:8082
FRONTEND_URL=http://localhost:3000

# Development Settings
DEBUG=true
LOG_LEVEL=debug
```

**Important**: Update `KEYCLOAK_CLIENT_SECRET` with your actual KeyCloak client secret.

## Configuration

The application is configured in `config.py` with the following services:

- **FastAPI BFF**: http://localhost:8080
- **KeyCloak**: http://localhost:8180
- **API Gateway**: http://localhost:8082
- **Frontend**: http://localhost:3000

## API Endpoints

### Authentication
- `GET /api/auth/login` - Redirect to KeyCloak login
- `GET /api/auth/callback` - OAuth callback handler
- `GET /api/auth/status` - Get authentication status
- `GET|POST /api/auth/logout` - Logout user

### Training API (Protected)
- `GET /api/trainings` - Get trainings with filters
- `POST /api/trainings` - Create new training
- `GET /api/trainings/{id}` - Get specific training
- `PUT /api/trainings/{id}` - Update training
- `DELETE /api/trainings/{id}` - Delete training
- `GET /api/trainings/types` - Get training types
- `GET /api/trainings/difficulties` - Get difficulty levels

## Architecture

```
Frontend (3000) � FastAPI BFF (8080) � API Gateway (8082) � Backend (8081)
                        �
                KeyCloak (8180)
```

## Development

- Uses `uv` for dependency management
- Auto-reload enabled in development mode
- Debug logging enabled
- Session-based authentication with KeyCloak OAuth2