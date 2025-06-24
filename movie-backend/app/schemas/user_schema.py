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

    class Config:
        from_attributes = True 

class UserUpdate(BaseModel):
    Username: Optional[str] = None
    Email: Optional[EmailStr] = None