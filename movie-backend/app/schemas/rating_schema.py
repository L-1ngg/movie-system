from pydantic import BaseModel, Field
from datetime import datetime

class RatingBase(BaseModel):
    Score: int = Field(..., ge=1, le=10, description="评分必须在1到10之间")

class RatingCreate(RatingBase):
    pass

class RatingRead(RatingBase):
    UserID: int
    MovieID: int
    CreatedAt: datetime

    class Config:
        from_attributes = True