from fastapi import APIRouter, Depends, status, HTTPException, Response
from .. import models
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..JWT import oauth2
from sqlalchemy import func, select

router = APIRouter(prefix="/dashboard", tags={"Dashboard"})


@router.get("/")
def get_info_dashboard(
    db: Session = Depends(get_db), current_user: str = Depends(oauth2.get_current_user)
):

    if current_user.role != "admin":
        return Response(status_code=status.HTTP_403_FORBIDDEN)

    total_stok_product = db.query(func.sum(models.Product.stok)).scalar()

    total_stok_product = total_stok_product or 0

    orders = db.query(models.Order).filter(models.Order.status != "Selesai").all()
    orders_count = len(orders)

    return {"products_stok_count": total_stok_product, "orders_count": orders_count}
