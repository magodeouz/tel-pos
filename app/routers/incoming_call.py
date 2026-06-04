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
    phone = payload.phone.strip()

    customer = db.query(Customer).filter(Customer.phone == phone).first()

    # If customer doesn't exist, we still send notification but with None
    customer_data = (
        {
            "id": customer.id,
            "phone": customer.phone,
            "name": customer.name,
            "address": customer.address,
            "note": customer.note,
        }
        if customer
        else None
    )

    if _ws_manager:
        await _ws_manager.broadcast(
            {
                "type": "incoming_call",
                "phone": phone,
                "customer": customer_data,
            }
        )

    return {"ok": True, "customer": customer_data, "found": customer is not None}
