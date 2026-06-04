from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from ..database import get_db
from ..models import Order, OrderItem, Product, Customer
from pydantic import BaseModel

router = APIRouter(prefix="/api/reports", tags=["reports"])


class DailyBreakdown(BaseModel):
    date: str
    order_count: int
    total_amount: float


class SalesReportResponse(BaseModel):
    total_sales: float
    total_orders: int
    daily_breakdown: list[DailyBreakdown]


@router.get("/sales-by-date", response_model=SalesReportResponse)
def get_sales_by_date(start_date: str = None, end_date: str = None, db: Session = Depends(get_db)):
    """Get sales breakdown by date with daily totals"""

    # Parse dates
    if start_date:
        start = datetime.fromisoformat(start_date)
    else:
        start = datetime.utcnow() - timedelta(days=30)

    if end_date:
        end = datetime.fromisoformat(end_date)
    else:
        end = datetime.utcnow()

    # Add one day to end to include the full end date
    end = end + timedelta(days=1)

    # Get all paid orders in the date range
    orders = db.query(Order).filter(
        Order.created_at >= start,
        Order.created_at < end,
        Order.status == "paid"
    ).order_by(Order.created_at).all()

    # Calculate totals
    total_sales = 0
    total_orders = 0
    daily_data = {}

    for order in orders:
        order_total = sum(item.quantity * item.unit_price for item in order.items)
        if order_total > 0:
            total_sales += order_total
            total_orders += 1

            # Group by date
            date_key = order.created_at.date().isoformat()
            if date_key not in daily_data:
                daily_data[date_key] = {"order_count": 0, "total_amount": 0}

            daily_data[date_key]["order_count"] += 1
            daily_data[date_key]["total_amount"] += order_total

    # Format daily breakdown
    daily_breakdown = [
        DailyBreakdown(
            date=date,
            order_count=data["order_count"],
            total_amount=data["total_amount"]
        )
        for date, data in sorted(daily_data.items())
    ]

    return {
        "total_sales": total_sales,
        "total_orders": total_orders,
        "daily_breakdown": daily_breakdown
    }


class ProductSaleData(BaseModel):
    product_name: str
    quantity_sold: int
    revenue: float


class ProductSalesResponse(BaseModel):
    total_quantity_sold: int
    top_products: list[ProductSaleData]


@router.get("/product-sales", response_model=ProductSalesResponse)
def get_product_sales_analysis(db: Session = Depends(get_db)):
    """Get product sales analysis with quantities and revenue"""

    # Query all order items
    order_items = db.query(
        Product.name,
        func.sum(OrderItem.quantity).label("total_quantity"),
        func.sum(OrderItem.quantity * OrderItem.unit_price).label("total_revenue")
    ).join(OrderItem).join(Order).filter(
        Order.status == "paid"
    ).group_by(Product.id, Product.name).order_by(
        func.sum(OrderItem.quantity).desc()
    ).limit(10).all()

    # Calculate total quantity
    total_qty = sum(item[1] or 0 for item in order_items)

    # Format response
    products = [
        ProductSaleData(
            product_name=item[0],
            quantity_sold=int(item[1] or 0),
            revenue=float(item[2] or 0)
        )
        for item in order_items
    ]

    return {
        "total_quantity_sold": total_qty,
        "top_products": products
    }


class CustomerSpendingData(BaseModel):
    id: int
    name: str
    phone: str
    total_spent: float
    order_count: int


class CustomerSpendingResponse(BaseModel):
    total_customers: int
    total_spending: float
    top_customers: list[CustomerSpendingData]


@router.get("/customer-spending", response_model=CustomerSpendingResponse)
def get_customer_spending_analysis(db: Session = Depends(get_db)):
    """Get customer spending analysis sorted by highest spender"""

    # Get all customers with their spending
    customers = db.query(Customer).all()

    customer_data = []
    total_spending = 0

    for customer in customers:
        # Get paid orders for this customer
        orders = db.query(Order).filter(
            Order.customer_id == customer.id,
            Order.status == "paid"
        ).all()

        if len(orders) == 0:
            continue

        # Calculate spending
        total_spent = sum(
            sum(item.quantity * item.unit_price for item in order.items)
            for order in orders
        )

        if total_spent > 0:
            total_spending += total_spent
            customer_data.append({
                "id": customer.id,
                "name": customer.name,
                "phone": customer.phone,
                "total_spent": total_spent,
                "order_count": len(orders)
            })

    # Sort by total spent descending
    customer_data.sort(key=lambda x: x["total_spent"], reverse=True)

    # Format response
    top_customers = [
        CustomerSpendingData(**data)
        for data in customer_data[:20]  # Top 20 customers
    ]

    return {
        "total_customers": len(customer_data),
        "total_spending": total_spending,
        "top_customers": top_customers
    }
