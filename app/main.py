from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import webbrowser
import os
import sys
from pathlib import Path

from .database import engine, Base
from .models import Customer, Category, Product, Order
from .routers import customers, products, orders, incoming_call, ws
from .printer import PrinterController
from .config import PORT, HOST
from .routers.incoming_call import set_ws_manager

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Tel-POS")

# Initialize printer
printer = PrinterController()

# Register routers
app.include_router(customers.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(incoming_call.router)
app.include_router(ws.router)

# WebSocket manager
set_ws_manager(ws.manager)

# Static files - resolve path for PyInstaller
if getattr(sys, "frozen", False):
    base_path = Path(sys._MEIPASS) / "app" / "static"
else:
    base_path = Path(__file__).parent / "static"

if base_path.exists():
    app.mount("/static", StaticFiles(directory=base_path), name="static")


@app.get("/")
async def root():
    html_path = base_path / "index.html"
    if html_path.exists():
        return FileResponse(html_path)
    return {"message": "Tel-POS çalışıyor"}


@app.get("/admin")
async def admin():
    html_path = base_path / "admin.html"
    if html_path.exists():
        return FileResponse(html_path)
    return {"message": "Admin paneli"}


@app.get("/api/printer/status")
async def printer_status():
    return printer.check_printer()


@app.post("/api/orders/{order_id}/print")
async def print_order(order_id: int):
    from .database import SessionLocal

    db = SessionLocal()
    try:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return {"ok": False, "error": "Sipariş bulunamadı"}

        order_data = {
            "id": order.id,
            "customer": (
                {
                    "id": order.customer.id,
                    "name": order.customer.name,
                }
                if order.customer
                else None
            ),
            "items": [
                {
                    "product_name": item.product.name,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                }
                for item in order.items
            ],
        }

        return printer.print_receipt(order_data)
    finally:
        db.close()


@app.on_event("startup")
async def startup_event():
    # Seed data - only if empty
    from .database import SessionLocal

    db = SessionLocal()
    try:
        if db.query(Category).count() == 0:
            categories = [
                Category(name="İçecekler", sort_order=1),
                Category(name="Yemekler", sort_order=2),
                Category(name="Tatlılar", sort_order=3),
            ]
            db.add_all(categories)
            db.commit()

            # Add sample products
            cat_icecek = db.query(Category).filter(Category.name == "İçecekler").first()
            cat_yemek = db.query(Category).filter(Category.name == "Yemekler").first()

            products = [
                Product(category_id=cat_icecek.id, name="Çay", price=10),
                Product(category_id=cat_icecek.id, name="Kahve", price=15),
                Product(category_id=cat_yemek.id, name="Döner", price=50),
                Product(category_id=cat_yemek.id, name="Pide", price=40),
            ]
            db.add_all(products)
            db.commit()
    finally:
        db.close()

    # Open browser
    try:
        webbrowser.open(f"http://localhost:{PORT}")
    except:
        pass


def run():
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=HOST,
        port=PORT,
        reload=False,
    )


if __name__ == "__main__":
    run()
