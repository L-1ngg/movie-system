from sqlalchemy.orm import Session
from app.models import user_model
from app.schemas import user_schema
from app.core.security import get_password_hash
from sqlalchemy import or_
from fastapi import HTTPException


def get_user(db: Session, user_id: int):
    """通过用户ID查询用户"""
    return db.query(user_model.User).filter(user_model.User.UserID == user_id).first()
def get_user_by_email(db: Session, email: str):
    """通过邮箱查询用户"""
    return db.query(user_model.User).filter(user_model.User.Email == email).first()


def get_user_by_username_or_email(db: Session, username: str, email: str):
    return db.query(user_model.User).filter(
        or_(user_model.User.Username == username, user_model.User.Email == email)
    ).first()

def create_user(db: Session, user: user_schema.UserCreate):
    """创建新用户"""
    hashed_password = get_password_hash(user.password)
    db_user = user_model.User(
        Email=user.Email,
        Username=user.Username,
        PasswordHash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_avatar(db: Session, user_id: int, avatar_url: str) -> user_model.User:
    db_user = db.query(user_model.User).filter(user_model.User.UserID == user_id).first()
    if db_user:
        db_user.AvatarURL = avatar_url
        db.commit()
        db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: user_schema.UserUpdate):
    db_user = get_user(db, user_id=user_id)
    if not db_user:
        return None

    update_data = user_update.model_dump(exclude_unset=True)

    # 检查新的用户名或邮箱是否已被其他用户占用
    if "Username" in update_data or "Email" in update_data:
        existing_user = get_user_by_username_or_email(db, username=update_data.get("Username"), email=update_data.get("Email"))
        if existing_user and existing_user.UserID != user_id:
            raise HTTPException(status_code=409, detail="用户名或邮箱已被占用")

    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user