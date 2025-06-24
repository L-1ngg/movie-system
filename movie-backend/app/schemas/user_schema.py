from pydantic import BaseModel, EmailStr
from typing import Optional

# Token 相关
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# User 相关
class UserBase(BaseModel):
    Username: str
    Email: EmailStr

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    UserID: int
    Role: str
    AvatarURL: Optional[str] = None
    # 这个内嵌类 Pydantic 模型中的配置,用于简化从数据库层到API层的序列化
    class Config:
        from_attributes = True # 开启从对象的属性中读取数据的能力

class UserUpdate(BaseModel):
    Username: Optional[str] = None
    Email: Optional[EmailStr] = None

class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str