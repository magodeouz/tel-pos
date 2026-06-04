"""
ASGI entry point for Cloudflare Workers deployment.
Run: wrangler deploy
"""
from app.main import app

# Cloudflare Workers Python runtime handler
async def handle(request):
    # Convert Cloudflare request to ASGI
    return await app(request)

# Export for Cloudflare
__all__ = ['handle']
