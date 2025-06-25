from __future__ import annotations
from pydantic import BaseModel, EmailStr
from typing import Optional,List

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

# 一个专门用于在评论中展示用户信息的Schema
class UserInComment(BaseModel):
    UserID: int
    Username: str

    class Config:
        from_attributes = True

# 一个能够展示用户及其所有评论的完整模型
class UserWithComments(UserRead):
    # 关键修改：使用字符串 "CommentRead" 作为列表的类型提示
    comments: List["comment_schema.CommentRead"] = []

# 在所有类都定义完毕后，再导入可能引起循环的模块
from . import comment_schema

# 调用 model_rebuild() 来解析之前用字符串定义的类型
UserWithComments.model_rebuild()