from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    func,
    Enum,
    ForeignKey,
    Boolean,
)
from .database.database import Base
from sqlalchemy.orm import relationship


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, nullable=False, primary_key=True)
    name = Column(String, nullable=False)
    stok = Column(Integer, nullable=False)
    price = Column(Integer, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    status = Column(
        Enum("Bertumbuh", "Siap Jual", "Habis", name="statusproduk"),
        nullable=False,
        server_default="Bertumbuh",
    )
    is_active = Column(Boolean, default=True)

    def count_age(product, db, func, extract, limit, offset):
        query = (
            db.query(
                product,
                extract("day", func.age(func.current_date(), product.created_at)).label(
                    "age"
                ),
            )
            .filter(product.is_active != "False")
            .limit(limit)
            .offset(offset)
        )

        return query.all()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, nullable=False, primary_key=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    role = Column(
        Enum("user", "admin", name="userrole"),
        nullable=False,
        server_default="user",
    )


class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True)
    total_price = Column(Integer)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    status = Column(
        Enum(
            "Menunggu Pembayaran",
            "Diproses",
            "Dikemas",
            "Dikirim",
            "Selesai",
            name="status",
        ),
        nullable=False,
        server_default="Menunggu Pembayaran",
    )

    payment_method = Column(String, nullable=True)  # "COD" atau "Transfer"
    payment_proof = Column(String, nullable=True)  # Link foto bukti transfer

    payment_status = Column(
        String,
        server_default="Belum Dibayar",  # Belum Dibayar, Menunggu Verifikasi, Lunas
    )

    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    # Relationship ke rincian produk
    owner = relationship("User")
    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True)
    order_id = Column(
        Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer)
    subtotal = Column(Integer)

    # Relationship back to Order
    order = relationship("Order", back_populates="items")
    product = relationship("Product")


class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True)
    name_product = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Integer, nullable=False)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    subtotal = Column(Integer, nullable=False)
