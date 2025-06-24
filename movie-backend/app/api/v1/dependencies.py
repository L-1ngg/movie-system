# app/api/v1/dependencies.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from typing import Annotated

from app.crud import crud_user
from app.schemas import user_schema
from app.core.config import settings
from app.database import get_db
from app.models.user_model import User as UserModel

# 定义OAuth2方案，它会告诉FastAPI从哪里“携带”Token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/users/login/token")

def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)) -> UserModel:
    """
    解码Token,并从数据库中获取当前用户对象(SQLAlchemy模型)。
    这是所有需要登录的接口的基础依赖。
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        #jwt.decode()负责签名验证和有效期验证
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        # 注意这里我们直接使用email，不需要再创建TokenData的实例
    except JWTError:
        raise credentials_exception
    
    user = crud_user.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

def get_current_admin_user(current_user: Annotated[UserModel, Depends(get_current_user)]) -> UserModel:
    """
    获取当前用户，并验证是否为管理员。
    如果不是管理员，则抛出403 Forbidden错误。
    """
    if current_user.Role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您没有权限执行此操作，需要管理员身份",
        )
    return current_user