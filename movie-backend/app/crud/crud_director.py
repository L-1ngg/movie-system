from sqlalchemy.orm import Session
from app.models import director_model
from app.schemas import director_schema

def create_director(db: Session, director: director_schema.DirectorCreate):
    db_director = director_model.Director(**director.model_dump())
    db.add(db_director)
    db.commit()
    db.refresh(db_director)
    return db_director

def get_director(db: Session, director_id: int):
    return db.query(director_model.Director).filter(director_model.Director.DirectorID == director_id).first()

def get_directors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(director_model.Director).offset(skip).limit(limit).all()

def update_director(db: Session, director_id: int, director_update: director_schema.DirectorUpdate):
    db_director = get_director(db, director_id)
    if not db_director:
        return None
    update_data = director_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_director, key, value)
    db.add(db_director)
    db.commit()
    db.refresh(db_director)
    return db_director

def delete_director(db: Session, director_id: int):
    db_director = get_director(db, director_id)
    if not db_director:
        return None
    db.delete(db_director)
    db.commit()
    return db_director


def update_director_photo(db: Session, director_id: int, photo_url: str) -> director_model.Director:
    """更新导演的照片URL"""
    db_director = get_director(db, director_id = director_id)
    if db_director:
        db_director.PhotoURL = photo_url
        db.commit()
        db.refresh(db_director)
    return db_director