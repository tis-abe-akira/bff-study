from fastapi import APIRouter, Request, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
import httpx
import logging
from typing import Dict, Any, Optional, List
import json

from config import Config
from routers.auth import require_auth

logger = logging.getLogger(__name__)

router = APIRouter()

# HTTP client for API Gateway communication
http_client = httpx.AsyncClient()

@router.get("/trainings")
async def get_trainings(
    request: Request,
    user: Dict[str, Any] = Depends(require_auth),
    type: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    minDuration: Optional[int] = Query(None),
    maxDuration: Optional[int] = Query(None)
):
    """Get trainings with optional filters"""
    try:
        # Build query parameters
        params = {}
        if type:
            params["type"] = type
        if difficulty:
            params["difficulty"] = difficulty
        if search:
            params["search"] = search
        if minDuration:
            params["minDuration"] = minDuration
        if maxDuration:
            params["maxDuration"] = maxDuration
        
        # Make request to API Gateway
        headers = {"X-User-ID": user["id"]}
        response = await http_client.get(
            f"{Config.API_GATEWAY_URL}/api/trainings",
            headers=headers,
            params=params
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"API Gateway error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch trainings")
            
    except httpx.RequestError as e:
        logger.error(f"HTTP request error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to communicate with API Gateway")

@router.post("/trainings")
async def create_training(
    request: Request,
    training_data: Dict[str, Any],
    user: Dict[str, Any] = Depends(require_auth)
):
    """Create a new training"""
    try:
        headers = {
            "X-User-ID": user["id"],
            "Content-Type": "application/json"
        }
        
        response = await http_client.post(
            f"{Config.API_GATEWAY_URL}/api/trainings",
            headers=headers,
            json=training_data
        )
        
        if response.status_code in [200, 201]:
            return response.json()
        else:
            logger.error(f"API Gateway error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=response.status_code, detail="Failed to create training")
            
    except httpx.RequestError as e:
        logger.error(f"HTTP request error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to communicate with API Gateway")

@router.get("/trainings/{training_id}")
async def get_training(
    training_id: str,
    request: Request,
    user: Dict[str, Any] = Depends(require_auth)
):
    """Get a specific training by ID"""
    try:
        headers = {"X-User-ID": user["id"]}
        
        response = await http_client.get(
            f"{Config.API_GATEWAY_URL}/api/trainings/{training_id}",
            headers=headers
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"API Gateway error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch training")
            
    except httpx.RequestError as e:
        logger.error(f"HTTP request error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to communicate with API Gateway")

@router.put("/trainings/{training_id}")
async def update_training(
    training_id: str,
    training_data: Dict[str, Any],
    request: Request,
    user: Dict[str, Any] = Depends(require_auth)
):
    """Update a training"""
    try:
        headers = {
            "X-User-ID": user["id"],
            "Content-Type": "application/json"
        }
        
        response = await http_client.put(
            f"{Config.API_GATEWAY_URL}/api/trainings/{training_id}",
            headers=headers,
            json=training_data
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"API Gateway error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=response.status_code, detail="Failed to update training")
            
    except httpx.RequestError as e:
        logger.error(f"HTTP request error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to communicate with API Gateway")

@router.delete("/trainings/{training_id}")
async def delete_training(
    training_id: str,
    request: Request,
    user: Dict[str, Any] = Depends(require_auth)
):
    """Delete a training"""
    try:
        headers = {"X-User-ID": user["id"]}
        
        response = await http_client.delete(
            f"{Config.API_GATEWAY_URL}/api/trainings/{training_id}",
            headers=headers
        )
        
        if response.status_code in [200, 204]:
            return {"message": "Training deleted successfully"}
        else:
            logger.error(f"API Gateway error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=response.status_code, detail="Failed to delete training")
            
    except httpx.RequestError as e:
        logger.error(f"HTTP request error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to communicate with API Gateway")

@router.get("/trainings/types")
async def get_training_types(request: Request):
    """Get available training types"""
    try:
        response = await http_client.get(f"{Config.API_GATEWAY_URL}/api/trainings/types")
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"API Gateway error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch training types")
            
    except httpx.RequestError as e:
        logger.error(f"HTTP request error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to communicate with API Gateway")

@router.get("/trainings/difficulties")
async def get_difficulties(request: Request):
    """Get available difficulty levels"""
    try:
        response = await http_client.get(f"{Config.API_GATEWAY_URL}/api/trainings/difficulties")
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"API Gateway error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch difficulties")
            
    except httpx.RequestError as e:
        logger.error(f"HTTP request error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to communicate with API Gateway")