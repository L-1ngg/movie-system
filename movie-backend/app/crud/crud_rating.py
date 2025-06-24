from sqlalchemy.orm import Session
from app.models import rating_model
from app.schemas import rating_schema

def get_rating(db: Session, user_id: int, movie_id: int):
    return db.query(rating_model.Rating).filter(
        rating_model.Rating.UserID == user_id,
        rating_model.Rating.MovieID == movie_id
    ).first()

def create_or_update_rating(db: Session, rating: rating_schema.RatingCreate, user_id: int, movie_id: int):
    db_rating = get_rating(db, user_id=user_id, movie_id=movie_id)
    if db_rating:
        # 更新已有评分
        db_rating.Score = rating.Score
    else:
        # 创建新评分
        db_rating = rating_model.Rating(
            UserID=user_id,
            MovieID=movie_id,
            Score=rating.Score
        )
        db.add(db_rating)
    db.commit()
    db.refresh(db_rating)
    return db_rating

def delete_rating(db: Session, user_id: int, movie_id: int):
    db_rating = get_rating(db, user_id=user_id, movie_id=movie_id)
    if db_rating:
        db.delete(db_rating)
        db.commit()
    return db_rating