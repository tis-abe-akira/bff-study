#!/usr/bin/env python3
"""
FastAPI BFF Runner
Usage: uv run python run.py
"""

import uvicorn
from config import Config

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=Config.HOST,
        port=Config.PORT,
        reload=True,  # Enable auto-reload for development
        log_level="debug"
    )