from fastapi import APIRouter, Depends, status, HTTPException, Response
from sqlalchemy.orm import Session
from ..database.database import get_db
from .. import models
from ..schemas import product
from typing import List
from ..JWT import oauth2
from sqlalchemy import func, extract

router = APIRouter(prefix="/products", tags=["Products"])


@router.get(
    "/", status_code=status.HTTP_200_OK, response_model=List[product.ProductOut]
)
def get_products(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):
    if current_user.role != "admin":
        return Response(status_code=status.HTTP_403_FORBIDDEN)

    products = models.Product.count_age(
        db=db, product=models.Product, func=func, extract=extract
    )

    return products


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    if current_user.role != "admin":
        return Response(status_code=status.HTTP_403_FORBIDDEN)
    query = db.query(models.Product).filter(models.Product.id == id)
    product = query.first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id: {id} doesnt't exists",
        )

    query.delete(synchronize_session=False)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_product(
    product: product.ProductCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    if current_user.role != "admin":
        return Response(status_code=status.HTTP_403_FORBIDDEN)
    query = models.Product(**product.dict())
    db.add(query)
    db.commit()

    return {"message": "Success"}


@router.put("/{id}", status_code=status.HTTP_201_CREATED)
def update_product(
    id: int,
    product: product.ProductUpdate,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    if current_user.role != "admin":
        return Response(status_code=status.HTTP_403_FORBIDDEN)

    query = db.query(models.Product).filter(models.Product.id == id)

    product_data = product

    product = query.first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id: {id} was not found",
        )

    query.update(product_data.dict(), synchronize_session=False)
    db.commit()

    return {"message": "Update Success"}


@router.get("/user", response_model=product.UserProductResponse)
def get_product_user(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):
    if current_user.role != "user":
        return Response(status_code=status.HTTP_403_FORBIDDEN)

    query = (
        db.query(
            models.Product.name,
            models.Product.price,
            func.sum(models.Product.stok).label("total_stok"),
            func.min(models.Product.created_at).label("batch_terlama"),
            func.count(models.Product.id).label("jumlah_batch"),
        )
        .filter(models.Product.status == "Siap Jual")
        .group_by(models.Product.name, models.Product.price)
        .having(func.sum(models.Product.stok) > 0)
        .all()
    )

    return {"owner": current_user.id, "products": query}


@router.get("/{id}", response_model=product.Product)
def get_one_products(
    id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    if current_user.role != "admin":
        return Response(status_code=status.HTTP_403_FORBIDDEN)
    product = db.query(models.Product).filter(models.Product.id == id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id: {id} does not exist",
        )

    return product
