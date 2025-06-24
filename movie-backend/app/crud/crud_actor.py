from sqlalchemy.orm import Session
from app.models import actor_model
from app.schemas import actor_schema

def create_actor(db: Session, actor: actor_schema.ActorCreate):
    db_actor = actor_model.Actor(**actor.model_dump())
    db.add(db_actor)
    db.commit()
    db.refresh(db_actor)
    return db_actor

def get_actor(db: Session, actor_id: int):
    return db.query(actor_model.Actor).filter(actor_model.Actor.ActorID == actor_id).first()

def get_actors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(actor_model.Actor).offset(skip).limit(limit).all()

def update_actor(db: Session, actor_id: int, actor_update: actor_schema.ActorUpdate):
    db_actor = get_actor(db, actor_id)
    if not db_actor:
        return None
    update_data = actor_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_actor, key, value)
    db.add(db_actor)
    db.commit()
    db.refresh(db_actor)
    return db_actor

def delete_actor(db: Session, actor_id: int):
    db_actor = get_actor(db, actor_id)
    if not db_actor:
        return None
    db.delete(db_actor)
    db.commit()
    return db_actor

def update_actor_photo(db: Session, actor_id: int, photo_url: str) -> actor_model.Actor:
    """仅更新演员的照片URL"""
    db_actor = get_actor(db, actor_id=actor_id)
    if db_actor:
        db_actor.PhotoURL = photo_url
        db.commit()
        db.refresh(db_actor)
    return db_actor