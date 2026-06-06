from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from ..database import get_db
from ..models import Customer, Order, IncomingCall
from ..security import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["incoming"])


class IncomingCallPayload(BaseModel):
    phone: str


def _build_customer_data(customer, db):
    orders = db.query(Order).filter(
        Order.customer_id == customer.id
    ).order_by(Order.created_at.desc()).limit(5).all()

    orders_data = []
    for order in orders:
        items = [
            {"product_name": item.product.name, "quantity": item.quantity, "unit_price": item.unit_price}
            for item in order.items
        ]
        orders_data.append({
            "id": order.id,
            "status": order.status,
            "created_at": order.created_at.isoformat(),
            "items": items,
            "total": sum(i["quantity"] * i["unit_price"] for i in items),
        })

    return {
        "id": customer.id,
        "phone": customer.phone,
        "name": customer.name,
        "address": customer.address,
        "note": customer.note,
        "orders": orders_data,
    }


@router.post("/incoming-call")
async def incoming_call(payload: IncomingCallPayload, db: Session = Depends(get_db)):
    phone = payload.phone.strip()

    # Store in DB for polling
    call = IncomingCall(phone=phone)
    db.add(call)
    db.commit()
    db.refresh(call)

    customer = db.query(Customer).filter(Customer.phone == phone).first()
    customer_data = _build_customer_data(customer, db) if customer else None

    return {"ok": True, "customer": customer_data, "found": customer is not None}


@router.get("/incoming-call/pending")
def get_pending_calls(db: Session = Depends(get_db), _: str = Depends(get_current_user)):
    """Frontend polls this every 3s to check for new calls."""
    cutoff = datetime.utcnow() - timedelta(minutes=2)
    calls = db.query(IncomingCall).filter(
        IncomingCall.acknowledged == False,
        IncomingCall.created_at >= cutoff,
    ).order_by(IncomingCall.created_at.desc()).all()

    result = []
    for call in calls:
        customer = db.query(Customer).filter(Customer.phone == call.phone).first()
        result.append({
            "id": call.id,
            "phone": call.phone,
            "created_at": call.created_at.isoformat(),
            "customer": _build_customer_data(customer, db) if customer else None,
        })

    return result


@router.post("/incoming-call/{call_id}/ack")
def acknowledge_call(call_id: int, db: Session = Depends(get_db), _: str = Depends(get_current_user)):
    """Mark a call as acknowledged (modal was shown/closed)."""
    call = db.query(IncomingCall).filter(IncomingCall.id == call_id).first()
    if call:
        call.acknowledged = True
        db.commit()
    return {"ok": True}
