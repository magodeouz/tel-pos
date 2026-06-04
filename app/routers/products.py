from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Category, Product
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["products"])


class CategoryCreate(BaseModel):
    name: str
    sort_order: int = 0


class CategoryResponse(BaseModel):
    id: int
    name: str
    sort_order: int

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    category_id: int
    name: str
    price: float


class ProductUpdate(BaseModel):
    name: str = None
    price: float = None
    active: bool = None


class ProductResponse(BaseModel):
    id: int
    category_id: int
    name: str
    price: float
    active: bool

    class Config:
        from_attributes = True


class CategoryWithProducts(BaseModel):
    id: int
    name: str
    sort_order: int
    products: list[ProductResponse]

    class Config:
        from_attributes = True


@router.get("/categories", response_model=list[CategoryWithProducts])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).order_by(Category.sort_order).all()
    return categories


@router.post("/categories", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    new_category = Category(**category.dict())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category


@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int, category: CategoryCreate, db: Session = Depends(get_db)
):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı")

    db_category.name = category.name
    db_category.sort_order = category.sort_order
    db.commit()
    db.refresh(db_category)
    return db_category


@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı")

    db.delete(db_category)
    db.commit()
    return {"ok": True}


@router.post("/products", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == product.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı")

    new_product = Product(**product.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int, product: ProductUpdate, db: Session = Depends(get_db)
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    for key, value in product.dict(exclude_unset=True).items():
        setattr(db_product, key, value)

    db.commit()
    db.refresh(db_product)
    return db_product


@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    db_product.active = False
    db.commit()
    return {"ok": True}
