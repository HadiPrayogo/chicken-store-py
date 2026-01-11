from pydantic import BaseModel
from datetime import datetime
from enum import Enum
from typing import Optional, List


class StatusEnum(str, Enum):
    MENUNGGU_PEMBAYARAN = "Menunggu Pembayaran"
    DIPROSES = "Diproses"
    DIKEMAS = "Dikemas"
    DIKIRIM = "Dikirim"
    SELESAI = "Selesai"


class UpdateOrderStatus(BaseModel):
    status: Optional[StatusEnum]


class OwnerOrder(BaseModel):
    name: str
    address: str


class ProductOrder(BaseModel):
    name: str
    price: int


class OrderItemOut(BaseModel):
    product: ProductOrder  # Bisa didapat dari join
    quantity: int
    subtotal: int


class OrderOut(BaseModel):
    id: int
    total_price: int
    created_at: datetime
    payment_status: str
    payment_proof: Optional[str]
    payment_method: Optional[str]
    status: Optional[StatusEnum]
    owner: OwnerOrder  # Diambil dari join
    items: List[OrderItemOut]

    class Config:
        from_attributes = True


class OrderPagination(BaseModel):
    total: int
    data: List[OrderOut]


class CartItem(BaseModel):
    product_name: str  # User pilih berdasarkan nama hasil GROUP BY
    quantity: int


class PaymentStatus(BaseModel):
    payment_status: Optional[str]
