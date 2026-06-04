"""
ASGI entry point for Cloudflare Workers deployment.
Run: wrangler deploy
"""
from app.main import app

# FastAPI app is already an ASGI application
__all__ = ['app']
