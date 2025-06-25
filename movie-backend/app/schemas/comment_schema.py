from __future__ import annotations
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
    CreatedAt: datetime
    
    user: Optional["user_schema.UserInComment"] = None

    class Config:
        from_attributes = True

from . import user_schema
CommentRead.model_rebuild()