from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from app.models import movie_model, actor_model, director_model
from app.schemas import movie_schema

def get_movie(db: Session, movie_id: int):
    return db.query(movie_model.Movie).filter(movie_model.Movie.MovieID == movie_id).first()

def get_movies(
    db: Session, 
    genre: Optional[str] = None,
    year: Optional[int] = None,
    min_rating: Optional[float] = None,
    search: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100
):
    # 1. 创建一个基础查询
    query = db.query(movie_model.Movie)

    # 2. 如果有搜索词，则应用一个更健壮的筛选条件
    if search:
        # SQLAlchemy的 relationship().any() 是处理这种“是否存在一个关联对象满足某条件”的最佳方式
        # 它会生成一个高效的、正确的 EXISTS 子查询，避免了JOIN带来的问题
        search_filter = or_(
            movie_model.Movie.Title.ilike(f"%{search}%"),
            movie_model.Movie.actors.any(actor_model.Actor.Name.ilike(f"%{search}%")),
            movie_model.Movie.directors.any(director_model.Director.Name.ilike(f"%{search}%"))
        )
        query = query.filter(search_filter)

    # 3. 应用其他筛选条件
    if genre:
        query = query.filter(movie_model.Movie.Genre.ilike(f"%{genre}%"))
    
    if year:
        query = query.filter(movie_model.Movie.ReleaseYear == year)
    
    if min_rating is not None:
        query = query.filter(movie_model.Movie.AverageRating >= min_rating)

    # 4. 最后应用分页和distinct来获取所有结果
    # distinct() 确保在复杂查询中不会返回重复的电影
    return query.distinct().offset(skip).limit(limit).all()

def create_movie(db: Session, movie: movie_schema.MovieCreate):
    db_movie = movie_model.Movie(**movie.model_dump())
    db.add(db_movie)
    db.commit()
    db.refresh(db_movie)
    return db_movie

def update_movie(db: Session, movie_id: int, movie_update: movie_schema.MovieUpdate):
    db_movie = get_movie(db, movie_id)
    if not db_movie:
        return None
    
    update_data = movie_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_movie, key, value)
    
    db.add(db_movie)
    db.commit()
    db.refresh(db_movie)
    return db_movie

def delete_movie(db: Session, movie_id: int):
    db_movie = get_movie(db, movie_id)
    if not db_movie:
        return None
    db.delete(db_movie)
    db.commit()
    return db_movie

def update_movie_cover(db: Session, movie_id: int, cover_url: str) -> movie_model.Movie:
    db_movie = get_movie(db, movie_id)
    if db_movie:
        db_movie.CoverURL = cover_url
        db.commit()
        db.refresh(db_movie)
    return db_movie