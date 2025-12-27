# Ayam (FastAPI Project)

**Deskripsi singkat** ✅

Proyek ini adalah backend berbasis **FastAPI** untuk aplikasi penjualan (produk, keranjang, pesanan, dashboard admin). Aplikasi memakai **PostgreSQL** sebagai database, menggunakan **SQLAlchemy** sebagai ORM, dan **Alembic** untuk migrasi skema. Autentikasi memakai JWT.

---

## Fitur utama 🔧

- Autentikasi: register & login (JWT)
- Manajemen produk (CRUD) dengan peran **admin**
- Endpoints untuk user/owner yang membatasi akses berdasarkan role
- Template & static files untuk admin dan user (HTML/CSS/JS)
- Migrasi database dengan Alembic

---

## Struktur proyek (ringkasan) 📁

- `Api/` - kode aplikasi (FastAPI)
  - `main.py` - inisialisasi FastAPI, mounting `static`, dan router
  - `routes/` - definisi route: `auth`, `products`, `cart`, `order`, `dashboard`
  - `models.py`, `schemas/` - model & schema
  - `database/` - koneksi DB dan session
  - `JWT/` - utilitas token (oauth2)
  - `config.py` - pengaturan (dibaca dari `.env`)
- `alembic/` - konfigurasi & skrip migrasi
- `static/`, `templates/` - aset frontend (admin, auth, user)

---

## Persyaratan (Requirements) ⚙️

- Python 3.10+ (sesuaikan dengan environment)
- PostgreSQL
- Lihat `requirements.txt` untuk dependensi (FastAPI, SQLAlchemy, uvicorn, dll.)

Instal dependensi:

```bash
py -m pip install -r requirements.txt
```

---

## Variabel lingkungan (.env) 🔑

Buat file `.env` di root proyek dengan variabel berikut:

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=nama_database
DATABASE_USERNAME=your_user
DATABASE_PASSWORD=your_pass
SECRET_KEY=some_secret_string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRES_MINUTES=60
```

Catatan: `Api/config.py` membaca `env_file=".env"`.

---

## Menjalankan lokal (Development) ▶️

1. Pastikan PostgreSQL berjalan dan database sudah dibuat.
2. Pastikan variabel di `.env` benar.
3. Jalankan migrasi Alembic (jika belum) untuk membuat tabel:

```bash
alembic upgrade head
```

4. Jalankan server:

```bash
uvicorn Api.main:app --reload --host 0.0.0.0 --port 8000
```

Akses dokumentasi otomatis di:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Migrasi Database (Alembic) 🗂️

- Membuat revisi migrasi:

```bash
alembic revision --autogenerate -m "pesan migrasi"
```

- Terapkan migrasi ke DB:

```bash
alembic upgrade head
```

---

## Ringkasan Endpoint Penting 🔍

- Auth

  - `POST /auth/register` → register user
  - `POST /auth/login` → login (mengembalikan access token)

- Products (`/products`) (membutuhkan token, role-based)
  - `GET /products/` → list (admin)
  - `POST /products/` → create (admin)
  - `PUT /products/{id}` → update (admin)
  - `DELETE /products/{id}` → delete (admin)
  - `GET /products/user` → query khusus untuk user
  - `GET /products/{id}` → get single product (admin)

(Cek folder `Api/routes/` untuk detail endpoint lainnya: `cart`, `order`, `dashboard`)

---

## Catatan Pengembangan & Tips 💡

- Pastikan header Authorization: `Bearer <token>` saat mengakses endpoint yang butuh autentikasi.
- Role `admin` dan `user` dipakai untuk membatasi akses.
- Static dan template sudah disediakan di folder `static/` dan `templates/` untuk UI sederhana.

---

## Kontribusi & Lisensi ✍️

- Silakan buat issue / PR untuk perbaikan.
- Tambahkan file `LICENSE` sesuai kebutuhan. (Tidak ada lisensi default di repo saat ini.)

---

Jika Anda ingin, saya bisa menambahkan contoh `.env.example`, skrip start di `Makefile`/`tasks`, atau dokumentasi endpoint yang lebih lengkap (contoh request/response). ✨
