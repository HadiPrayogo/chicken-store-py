from fastapi import APIRouter, status, HTTPException, Depends, Response
from .. import models
from ..database.database import get_db
from ..JWT import oauth2
from ..schemas import order
from typing import List
from sqlalchemy.orm import Session, joinedload

router = APIRouter(prefix="/sales", tags=["Sales"])


@router.get("/", response_model=List[order.OrderOut])
def get_sales(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):
    if current_user.role != "admin":
        return Response(status_code=status.HTTP_403_FORBIDDEN)

    sales = (
        db.query(models.Order)
        .filter(models.Order.status == "Selesai")
        .options(joinedload(models.Order.owner))
        .all()
    )

    return sales
