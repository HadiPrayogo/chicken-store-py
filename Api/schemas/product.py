from pydantic import BaseModel
from enum import Enum
from typing import Optional, List
from datetime import datetime


class StatusEnum(str, Enum):
    BERTUMBUH = "Bertumbuh"
    SIAP_JUAL = "Siap Jual"
    HABIS = "Habis"


class Product(BaseModel):
    id: int
    name: str
    stok: int
    price: int
    status: StatusEnum = StatusEnum.BERTUMBUH


class ProductCreate(BaseModel):
    name: str
    stok: int
    price: int


class ProductOut(BaseModel):
    Product: Product
    age: int

    class Config:
        from_attributes = True


class ProductUpdate(BaseModel):
    stok: Optional[int] = None
    price: Optional[int] = None
    status: Optional[StatusEnum] = None


class ProductCatalog(BaseModel):
    name: str
    price: int
    total_stok: int
    batch_terlama: datetime
    jumlah_batch: int

    class Config:
        from_attributes = True


# Schema pembungkus untuk response akhir
class UserProductResponse(BaseModel):
    owner: int
    products: List[ProductCatalog]
