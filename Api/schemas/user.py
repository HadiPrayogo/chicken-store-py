from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    address: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str
