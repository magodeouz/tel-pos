from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Customer
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["incoming"])

# Global WebSocket manager - imported in main.py
_ws_manager = None


def set_ws_manager(manager):
    global _ws_manager
    _ws_manager = manager


class IncomingCallPayload(BaseModel):
    phone: str


@router.post("/incoming-call")
async def incoming_call(payload: IncomingCallPayload, db: Session = Depends(get_db)):
    from ..models import Order

    phone = payload.phone.strip()

    customer = db.query(Customer).filter(Customer.phone == phone).first()

    # If customer doesn't exist, we still send notification but with None
    customer_data = None
    if customer:
        # Get customer's past orders
        orders = db.query(Order).filter(Order.customer_id == customer.id).order_by(Order.created_at.desc()).limit(5).all()

        orders_data = []
        for order in orders:
            items = [
                {
                    "product_name": item.product.name,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                }
                for item in order.items
            ]
            total = sum(item.quantity * item.unit_price for item in order.items)
            orders_data.append(
                {
                    "id": order.id,
                    "status": order.status,
                    "created_at": order.created_at.isoformat(),
                    "items": items,
                    "total": total,
                }
            )

        customer_data = {
            "id": customer.id,
            "phone": customer.phone,
            "name": customer.name,
            "address": customer.address,
            "note": customer.note,
            "orders": orders_data,
        }

    if _ws_manager:
        await _ws_manager.broadcast(
            {
                "type": "incoming_call",
                "phone": phone,
                "customer": customer_data,
            }
        )

    return {"ok": True, "customer": customer_data, "found": customer is not None}
