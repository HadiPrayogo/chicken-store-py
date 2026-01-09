from fastapi import (
    APIRouter,
    Depends,
    status,
    HTTPException,
    Response,
    UploadFile,
    File,
    Form,
    HTTPException,
)
import shutil
import os
from sqlalchemy.orm import Session, joinedload
from ..database.database import get_db
from .. import models
from ..schemas import order
from typing import List
from ..JWT import oauth2

router = APIRouter(prefix="/order", tags=["Order"])


@router.get("/", response_model=List[order.OrderOut])
def get_all_order(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):

    if current_user.role != "admin":
        return Response(status_code=status.HTTP_403_FORBIDDEN)

    orders = (
        db.query(models.Order)
        .filter(models.Order.status != "Selesai")
        .options(joinedload(models.Order.owner))
        .all()
    )

    return orders


@router.put("/{id}")
def update_order_status(
    id: int,
    order_data: order.UpdateOrderStatus,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    if current_user.role != "admin":
        return Response(status_code=status.HTTP_403_FORBIDDEN)

    query = db.query(models.Order).filter(models.Order.id == id)

    orders = query.first()

    if not orders:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id: {id} was not found",
        )

    if orders.payment_method == "COD":
        if order_data.status == "Selesai":
            query.update(
                {"status": order_data.status, "payment_status": "Lunas"},
                synchronize_session=False,
            )

    query.update(
        {"status": order_data.status},
        synchronize_session=False,
    )
    db.commit()

    return {"message": "Update Success"}


@router.get("/user", response_model=List[order.OrderOut])
def get_order_user(
    db: Session = Depends(get_db), current_user: int = Depends(oauth2.get_current_user)
):
    if current_user.role != "user":
        return Response(status_code=status.HTTP_403_FORBIDDEN)

    orders = (
        db.query(models.Order).filter(models.Order.user_id == current_user.id).all()
    )

    return orders


@router.get("/{id}", response_model=order.OrderOut)
def get_one_order(
    id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    orders = (
        db.query(models.Order)
        .options(joinedload(models.Order.owner))
        .filter(models.Order.id == id)
        .first()
    )

    if not orders:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id: {id} was not found",
        )

    return orders


@router.post("/checkout", status_code=status.HTTP_201_CREATED)
def checkout_products(
    items: List[order.CartItem],
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    if current_user.role != "user":
        return Response(status_code=status.HTTP_403_FORBIDDEN)

    total_order_price = 0
    order_details = []

    for item in items:
        # 1. Cari semua ID yang namanya sama, urutkan dari ID terkecil (batch terlama)
        batches = (
            db.query(models.Product)
            .filter(
                models.Product.name == item.product_name,
                models.Product.status == "Siap Jual",
                models.Product.stok > 0,
            )
            .order_by(models.Product.id.asc())
            .all()
        )

        # Cek apakah total stok gabungan cukup?
        total_stok_tersedia = sum(b.stok for b in batches)
        if total_stok_tersedia < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Stok {item.product_name} tidak cukup. Tersedia: {total_stok_tersedia}",
            )

        sisa_kebutuhan = item.quantity

        # 2. Mulai potong stok secara berantai
        for batch in batches:
            if sisa_kebutuhan <= 0:
                break

            potong = min(batch.stok, sisa_kebutuhan)
            batch.stok -= potong
            sisa_kebutuhan -= potong

            # Jika stok batch ini habis, ubah statusnya (opsional)
            if batch.stok == 0:
                batch.status = "Habis"

            # Hitung subtotal untuk batch ini
            total_order_price += potong * batch.price

            # Simpan rincian untuk dimasukkan ke tabel OrderItem nanti
            order_details.append(
                {
                    "product_id": batch.id,
                    "quantity": potong,
                    "subtotal": potong * batch.price,
                }
            )

    # 3. Simpan ke Tabel Order (Induk)
    new_order = models.Order(
        user_id=current_user.id,
        total_price=total_order_price,
        status="Menunggu Pembayaran",
    )
    db.add(new_order)
    db.flush()  # Ambil ID order tanpa commit dulu

    # 4. Simpan ke Tabel OrderItem (Rincian)
    for detail in order_details:
        new_item = models.OrderItem(
            order_id=new_order.id,
            product_id=detail["product_id"],
            quantity=detail["quantity"],
            subtotal=detail["subtotal"],
        )
        db.add(new_item)

    # Hapus item di cart
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id)
    cart.delete(synchronize_session=False)

    db.commit()
    return {"order_id": new_order.id, "message": "Checkout Berhasil"}


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_order(
    id: int,
    items: List[order.CartItem],
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    if current_user.role != "user":
        return Response(status_code=status.HTTP_403_FORBIDDEN)

    for item in items:
        batches = (
            db.query(models.Product)
            .filter(
                models.Product.name == item.product_name,
                models.Product.status == "Siap Jual",
                models.Product.stok > 0,
            )
            .order_by(models.Product.id.asc())
            .all()
        )

        sisa_kebutuhan = item.quantity

        for batch in batches:
            potong = min(batch.stok, sisa_kebutuhan)
            batch.stok += potong
            sisa_kebutuhan -= potong

    query = db.query(models.Order).filter(models.Order.id == id)

    found_order = query.first()

    if found_order.payment_proof:
        path_file = found_order.payment_proof

        if os.path.exists(path_file):
            try:
                os.remove(path_file)
                print(f"Berhasil menghapus: {path_file}")
            except Exception as e:
                print(f"Gagal menghapus file: {e}")
        else:
            print(f"File tidak ditemukan di path: {path_file}")

    if not found_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id: {id} was not found",
        )

    query.delete(synchronize_session=False)

    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/payment/{id}", status_code=status.HTTP_201_CREATED)
async def payment(
    id: int,
    address: str = Form(...),
    payment_method: str = Form(...),
    file: UploadFile = File(None),  # Menangkap file gambar dari FormData
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    if current_user.role != "user":
        raise HTTPException(status_code=403, detail="Forbidden")

    order_query = db.query(models.Order).filter(models.Order.id == id)
    exist_order = order_query.first()

    if not exist_order:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")

    filename_path = None
    if file and payment_method == "Transfer":
        # Pastikan punya folder berikut
        upload_dir = "static/payments"
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)

        filename_path = f"{upload_dir}/proof_{id}_{file.filename}"
        with open(filename_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    if payment_method == "Transfer":
        update_data = {
            "payment_method": payment_method,
            "payment_status": "Menunggu Konfirmasi",
        }

    if payment_method == "COD":
        update_data = {
            "status": "Diproses",
            "payment_method": payment_method,
            "payment_status": "Bayar Ketika Barang Sampai",
        }

    if filename_path:
        update_data["payment_proof"] = filename_path

    order_query.update(update_data, synchronize_session=False)

    # Update Alamat User
    user_query = db.query(models.User).filter(models.User.id == current_user.id)
    user_query.update({"address": address}, synchronize_session=False)

    db.commit()

    return {"message": "pembayaran berhasil dikirim"}


@router.put("/payment/status/{id}", status_code=status.HTTP_201_CREATED)
def update_payment_status(
    id: int,
    payment_data: order.PaymentStatus,
    db: Session = Depends(get_db),
    current_user: int = Depends(oauth2.get_current_user),
):
    if current_user.role != "admin":
        return Response(status_code=status.HTTP_403_FORBIDDEN)

    query = db.query(models.Order).filter(models.Order.id == id)

    found_order = query.first()

    if not found_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id: {id} was not found",
        )

    if found_order.payment_method == "Transfer":
        if payment_data.payment_status == "Lunas":
            query.update(
                {"status": "Diproses", "payment_status": payment_data.payment_status},
                synchronize_session=False,
            )

    query.update(payment_data.model_dump(), synchronize_session=False)

    db.commit()

    return {"message": "success"}
