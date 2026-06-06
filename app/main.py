from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, PlainTextResponse
from pathlib import Path

from .database import engine, Base
from .models import Customer, Category, Product, Order, User
from .routers import customers, products, orders, incoming_call, ws, reports
from .routers import auth
from .config import PORT, HOST
from .security import get_current_user

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Tel-POS")

# Public routes (no auth required)
app.include_router(auth.router)
app.include_router(incoming_call.router)  # APK uses this without token
app.include_router(ws.router)

# Protected routes
app.include_router(customers.router, dependencies=[Depends(get_current_user)])
app.include_router(products.router, dependencies=[Depends(get_current_user)])
app.include_router(orders.router, dependencies=[Depends(get_current_user)])
app.include_router(reports.router, dependencies=[Depends(get_current_user)])

# Static files
base_path = Path(__file__).parent / "static"
if base_path.exists():
    app.mount("/static", StaticFiles(directory=base_path), name="static")


@app.get("/robots.txt")
async def robots():
    content = "User-agent: *\nDisallow: /"
    return PlainTextResponse(content, headers={"X-Robots-Tag": "noindex, nofollow"})


@app.get("/")
async def root():
    html_path = base_path / "login.html"
    if html_path.exists():
        return FileResponse(html_path)
    return {"message": "Tel-POS çalışıyor"}


@app.get("/pos")
async def pos():
    html_path = base_path / "index.html"
    if html_path.exists():
        return FileResponse(html_path)
    return {"message": "POS paneli"}


@app.get("/admin")
async def admin():
    html_path = base_path / "admin.html"
    if html_path.exists():
        return FileResponse(html_path)
    return {"message": "Admin paneli"}


@app.get("/management")
async def management():
    html_path = base_path / "management.html"
    if html_path.exists():
        return FileResponse(html_path)
    return {"message": "Management paneli"}


@app.get("/api/health")
async def health():
    return {"ok": True}


@app.get("/api/printer/status")
async def printer_status():
    return {"connected": False, "message": "Browser print aktif"}


@app.on_event("startup")
async def startup_event():
    from .database import SessionLocal
    from .security import hash_password

    db = SessionLocal()
    try:
        # Seed categories
        if db.query(Category).count() == 0:
            categories = [
                Category(name="İçecekler", sort_order=1),
                Category(name="Yemekler", sort_order=2),
                Category(name="Tatlılar", sort_order=3),
            ]
            db.add_all(categories)
            db.commit()

            cat_icecek = db.query(Category).filter(Category.name == "İçecekler").first()
            cat_yemek = db.query(Category).filter(Category.name == "Yemekler").first()

            sample_products = [
                Product(category_id=cat_icecek.id, name="Çay", price=10),
                Product(category_id=cat_icecek.id, name="Kahve", price=15),
                Product(category_id=cat_yemek.id, name="Döner", price=50),
                Product(category_id=cat_yemek.id, name="Pide", price=40),
            ]
            db.add_all(sample_products)
            db.commit()

        # Create default admin user
        if db.query(User).count() == 0:
            admin_user = User(
                username="admin",
                password_hash=hash_password("admin123"),
            )
            db.add(admin_user)
            db.commit()
    finally:
        db.close()


def run():
    import uvicorn
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=False)


if __name__ == "__main__":
    run()
