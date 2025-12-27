from fastapi import APIRouter, Depends, status, HTTPException, Response
from sqlalchemy.orm import Session
from ..database.database import get_db
from .. import models, utils
from ..schemas import tokenjwt, user
from ..JWT import oauth2
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: user.UserCreate, db: Session = Depends(get_db)):
    hashed_password = utils.hash(user.password)
    user.password = hashed_password

    query = models.User(**user.dict())
    db.add(query)
    db.commit()
    db.refresh(query)

    return {"message": "success"}


@router.post("/login", response_model=tokenjwt.Token)
def login(
    user_credential: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = (
        db.query(models.User)
        .filter(models.User.email == user_credential.username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Email/Password Salah"
        )

    if user.role == "admin":
        if user_credential.password != user.password:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Username/Password Salah"
            )

    if user.role == "user":
        if not utils.verify(user_credential.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Username/Password Salah"
            )

    # CREATE TOKEN
    access_token = oauth2.create_access_token(data={"sup": user.id, "role": user.role})

    # Return Token
    return {"access_token": access_token, "token_type": "bearer"}
