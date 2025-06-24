from pydantic import BaseModel
from typing import Optional
from datetime import date

class DirectorBase(BaseModel):
    Name: str
    Gender: Optional[str] = None
    BirthDate: Optional[date] = None
    Nationality: Optional[str] = None

class DirectorCreate(DirectorBase):
    pass

class DirectorUpdate(BaseModel):
    Name: Optional[str] = None
    Gender: Optional[str] = None
    BirthDate: Optional[date] = None
    Nationality: Optional[str] = None

class DirectorRead(DirectorBase):
    DirectorID: int
    PhotoURL: Optional[str] = None

    class Config:
        from_attributes = True