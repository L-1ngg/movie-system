from pydantic import BaseModel
from typing import Optional
from datetime import date

class ActorBase(BaseModel):
    Name: str
    Gender: Optional[str] = None
    BirthDate: Optional[date] = None
    Nationality: Optional[str] = None

class ActorCreate(ActorBase):
    pass

class ActorUpdate(BaseModel):
    Name: Optional[str] = None
    Gender: Optional[str] = None
    BirthDate: Optional[date] = None
    Nationality: Optional[str] = None

class ActorRead(ActorBase):
    ActorID: int
    PhotoURL: Optional[str] = None

    class Config:
        from_attributes = True