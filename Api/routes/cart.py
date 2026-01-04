from fastapi import APIRouter, Depends, status, HTTPException, Response
from sqlalchemy.orm import Session, joinedload
from ..database.database import get_db
from .. import models
from ..schemas import cart
from typing import List
from ..JWT import oauth2

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def add_cart(
    cart_data: cart.AddCart,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    if current_user.role != "user":
        return Response(status_code=status.HTTP_403_FORBIDDEN)

    price = cart_data.price
    quantity = cart_data.quantity

    subtotal = price * quantity

    query = models.Cart(
        **cart_data.dict(),
        user_id=current_user.id,
        subtotal=subtotal,
    )
    db.add(query)

    db.commit()

    return {"message": "Ditambahkan ke Keranjang"}


@router.get("/", response_model=cart.CartOut)
def get_carts(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):
    if current_user.role != "user":
        return Response(status_code=status.HTTP_403_FORBIDDEN)

    total_price = 0
    carts = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).all()

    count = len(carts)

    for cart in carts:
        total_price += cart.subtotal

    return {"Carts": carts, "total_price": total_price, "cart_count": count}


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cart(
    id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    if current_user.role != "user":
        return Response(status_code=status.HTTP_403_FORBIDDEN)

    query = db.query(models.Cart).filter(models.Cart.id == id)

    found_cart = query.first()

    if not found_cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cart with id: {id} was not found",
        )

    query.delete(synchronize_session=False)

    if found_cart.user_id != current_user.id:
        return Response(status_code=status.HTTP_403_FORBIDDEN)

    db.commit()

    return {"message": "Success"}


@router.put("/", status_code=status.HTTP_201_CREATED)
def update_cart(
    carts: List[cart.CartUpdate],
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    if current_user.role != "user":
        return Response(status_code=status.HTTP_403_FORBIDDEN)

    for cart in carts:
        query = db.query(models.Cart).filter(models.Cart.id == cart.id)
        quantity = cart.quantity
        price = cart.price
        subtotal = quantity * price

        query.update(
            {"quantity": cart.quantity, "subtotal": subtotal}, synchronize_session=False
        )
    db.commit()

    return {"message": "Success"}
