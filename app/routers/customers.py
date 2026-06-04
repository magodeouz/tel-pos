from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Customer
from pydantic import BaseModel

router = APIRouter(prefix="/api/customers", tags=["customers"])


class CustomerCreate(BaseModel):
    phone: str
    name: str
    address: str = ""
    note: str = ""


class CustomerUpdate(BaseModel):
    name: str = None
    address: str = None
    note: str = None


class CustomerResponse(BaseModel):
    id: int
    phone: str
    name: str
    address: str
    note: str

    class Config:
        from_attributes = True


@router.get("/", response_model=list[CustomerResponse])
def list_customers(db: Session = Depends(get_db)):
    return db.query(Customer).all()


@router.get("/search", response_model=CustomerResponse | None)
def search_customer(phone: str, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.phone == phone).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Müşteri bulunamadı")
    return customer


@router.post("/", response_model=CustomerResponse)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    existing = db.query(Customer).filter(Customer.phone == customer.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu numara zaten kayıtlı")

    new_customer = Customer(**customer.dict())
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int, customer: CustomerUpdate, db: Session = Depends(get_db)
):
    db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Müşteri bulunamadı")

    for key, value in customer.dict(exclude_unset=True).items():
        setattr(db_customer, key, value)

    db.commit()
    db.refresh(db_customer)
    return db_customer


@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Müşteri bulunamadı")

    db.delete(db_customer)
    db.commit()
    return {"ok": True}
