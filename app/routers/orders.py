from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Order, OrderItem, Product, Customer
from pydantic import BaseModel

router = APIRouter(prefix="/api/orders", tags=["orders"])


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product_name: str

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    customer_id: int | None = None
    note: str = ""


class OrderStatusUpdate(BaseModel):
    status: str  # open / paid / cancelled


class OrderResponse(BaseModel):
    id: int
    customer_id: int | None
    status: str
    note: str
    created_at: str
    items: list[OrderItemResponse] = []
    total: float = 0

    class Config:
        from_attributes = True


@router.get("/", response_model=list[OrderResponse])
def list_orders(status: str = "open", db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.status == status).all()
    result = []
    for order in orders:
        total = sum(item.quantity * item.unit_price for item in order.items)
        items = [
            OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                product_name=item.product.name,
            )
            for item in order.items
        ]
        result.append(
            OrderResponse(
                id=order.id,
                customer_id=order.customer_id,
                status=order.status,
                note=order.note,
                created_at=order.created_at.isoformat(),
                items=items,
                total=total,
            )
        )
    return result


class PaginatedOrderResponse(BaseModel):
    total: int
    page: int
    per_page: int
    pages: int
    orders: list[OrderResponse]


@router.get("/list/paginated", response_model=PaginatedOrderResponse)
def list_orders_paginated(page: int = 1, per_page: int = 10, status: str = None, db: Session = Depends(get_db)):
    query = db.query(Order).order_by(Order.created_at.desc())

    if status:
        query = query.filter(Order.status == status)

    total = query.count()
    pages = (total + per_page - 1) // per_page

    if page < 1:
        page = 1
    if page > pages and pages > 0:
        page = pages

    offset = (page - 1) * per_page
    orders = query.offset(offset).limit(per_page).all()

    result = []
    for order in orders:
        total_price = sum(item.quantity * item.unit_price for item in order.items)
        items = [
            OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                product_name=item.product.name,
            )
            for item in order.items
        ]
        result.append(
            OrderResponse(
                id=order.id,
                customer_id=order.customer_id,
                status=order.status,
                note=order.note,
                created_at=order.created_at.isoformat(),
                items=items,
                total=total_price,
            )
        )

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
        "orders": result,
    }


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")

    total = sum(item.quantity * item.unit_price for item in order.items)
    items = [
        OrderItemResponse(
            id=item.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            product_name=item.product.name,
        )
        for item in order.items
    ]
    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        status=order.status,
        note=order.note,
        created_at=order.created_at.isoformat(),
        items=items,
        total=total,
    )


@router.post("/", response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    new_order = Order(customer_id=order.customer_id, note=order.note)
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return OrderResponse(
        id=new_order.id,
        customer_id=new_order.customer_id,
        status=new_order.status,
        note=new_order.note,
        created_at=new_order.created_at.isoformat(),
        items=[],
        total=0,
    )


@router.post("/{order_id}/items", response_model=OrderItemResponse)
def add_item(order_id: int, item: OrderItemCreate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")

    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    order_item = OrderItem(
        order_id=order_id, product_id=item.product_id, quantity=item.quantity, unit_price=product.price
    )
    db.add(order_item)
    db.commit()
    db.refresh(order_item)

    return OrderItemResponse(
        id=order_item.id,
        product_id=order_item.product_id,
        quantity=order_item.quantity,
        unit_price=order_item.unit_price,
        product_name=product.name,
    )


@router.delete("/{order_id}/items/{item_id}")
def remove_item(order_id: int, item_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")

    order_item = db.query(OrderItem).filter(OrderItem.id == item_id).first()
    if not order_item:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    db.delete(order_item)
    db.commit()
    return {"ok": True}


@router.patch("/{order_id}/status")
def update_order_status(order_id: int, status_update: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")

    order.status = status_update.status
    db.commit()
    return {"ok": True, "status": order.status}


class OrderNoteUpdate(BaseModel):
    note: str


@router.patch("/{order_id}/note")
def update_order_note(order_id: int, note_update: OrderNoteUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")

    order.note = note_update.note
    db.commit()
    return {"ok": True, "note": order.note}


class PaymentUpdate(BaseModel):
    payment_method: str  # nakit / kredi_karti / cari / odenmes


@router.patch("/{order_id}/payment")
def update_payment_method(order_id: int, payment: PaymentUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")

    order.payment_method = payment.payment_method
    db.commit()
    return {"ok": True, "payment_method": order.payment_method}


class DiscountUpdate(BaseModel):
    discount_amount: float = 0  # Rakamsal indirim
    discount_percent: float = 0  # Yüzdesel indirim


@router.patch("/{order_id}/discount")
def update_discount(order_id: int, discount: DiscountUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")

    order.discount_amount = discount.discount_amount
    order.discount_percent = discount.discount_percent
    db.commit()
    return {
        "ok": True,
        "discount_amount": order.discount_amount,
        "discount_percent": order.discount_percent,
    }
