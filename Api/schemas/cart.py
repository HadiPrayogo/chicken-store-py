from pydantic import BaseModel
from typing import List


class AddCart(BaseModel):
    name_product: str
    price: int
    quantity: int


class Cart(BaseModel):
    id: int
    name_product: str
    price: int
    quantity: int


class CartOut(BaseModel):
    Carts: List[Cart]
    total_price: int


class CartUpdate(BaseModel):
    id: int
    price: int
    quantity: int
