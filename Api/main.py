from fastapi import FastAPI
from .routes import products, auth, order, dashboard, cart, sale
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


static_dir = Path(__file__).parent.parent / "static"
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
app.include_router(products.router)
app.include_router(auth.router)
app.include_router(order.router)
app.include_router(dashboard.router)
app.include_router(cart.router)
app.include_router(sale.router)
