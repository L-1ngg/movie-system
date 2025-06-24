from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CommentBase(BaseModel):
    Content: str

class CommentCreate(CommentBase):
    pass

class CommentUpdate(BaseModel):
    Content: str

class CommentRead(CommentBase):
    CommentID: int
    MovieID: int
    UserID: int
    CreatedAt: datetime

    class Config:
        from_attributes = True