from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, distinct
from typing import Optional,List
from app.models import movie_model, actor_model, director_model
from app.schemas import movie_schema

# 从数据库当中返回指定的单部电影信息
def get_movie(db: Session, movie_id: int):
    return db.query(movie_model.Movie).filter(movie_model.Movie.MovieID == movie_id).first()

def get_movies(
    db: Session, 
    genre: Optional[str] = None,
    year: Optional[int] = None,
    min_rating: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100
):
    # 1. 创建一个基础查询
    query = db.query(movie_model.Movie)

    # 2. 如果有搜索词，则应用一个更健壮的筛选条件
    if search:
        search_filter = or_(
            # 不区分大小写(insensitive)
            movie_model.Movie.Title.ilike(f"%{search}%"),  
            # 远比使用JOIN查询更优，因为JOIN可能会因为一部电影有多个匹配的演员而返回重复的电影记录。
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

    # 4. 增加排序逻辑
    if sort_by == "release_year_desc":
        query = query.order_by(desc(movie_model.Movie.ReleaseYear))
    elif sort_by == "rating_desc":
        query = query.order_by(desc(movie_model.Movie.AverageRating))
    else:
        # 默认按评分排序
        query = query.order_by(desc(movie_model.Movie.AverageRating))

    # 5. 最后应用分页和distinct来获取所有结果
    # distinct() 确保在复杂查询中不会返回重复的电影
    return query.distinct().offset(skip).limit(limit).all()

def get_genres(db: Session) -> List[str]:
    """从数据库中获取所有不重复的电影类型"""
    # 查找所有不为空的 Genre 字段
    results = db.query(distinct(movie_model.Movie.Genre)).filter(movie_model.Movie.Genre.isnot(None)).all()
    genres = set()
    for (genre_string,) in results:
        # 将 "剧情/犯罪" 这样的字符串拆分成独立的类型
        genres.update(g.strip() for g in genre_string.split('/'))
    # 过滤掉空字符串并排序返回
    return sorted([genre for genre in genres if genre])

def create_movie(db: Session, movie: movie_schema.MovieCreate):
    
    # pydantic的model_dump方法先将schema转换成一个字典对象,再解包为一个model对象
    # 1. 将电影基本数据和ID列表分开
    movie_data = movie.model_dump(exclude={'actor_ids', 'director_ids'})
    db_movie = movie_model.Movie(**movie_data)

    db.add(db_movie)
    # 2. 根据传入的ID，从数据库中查询出对应的演员和导演对象
    if movie.actor_ids:
        actors = db.query(actor_model.Actor).filter(actor_model.Actor.ActorID.in_(movie.actor_ids)).all()
        db_movie.actors = actors
        
    if movie.director_ids:
        directors = db.query(director_model.Director).filter(director_model.Director.DirectorID.in_(movie.director_ids)).all()
        db_movie.directors = directors
    
    db.commit()
    db.refresh(db_movie)
    return db_movie

def update_movie(db: Session, movie_id: int, movie_update: movie_schema.MovieUpdate):
    # print(f"--- [后端接收到的数据] --- 电影标题: {movie_update.Title}, 演员ID: {movie_update.actor_ids}, 导演ID: {movie_update.director_ids}")
    db_movie = get_movie(db, movie_id)
    if not db_movie:
        return None
    
    # 只导出被更改的字段
    update_data = movie_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_movie, key, value)
    
    # 更新演员关系
    if movie_update.actor_ids is not None:
        actors = db.query(actor_model.Actor).filter(actor_model.Actor.ActorID.in_(movie_update.actor_ids)).all()
        db_movie.actors = actors
        
    # 更新导演关系
    if movie_update.director_ids is not None:
        directors = db.query(director_model.Director).filter(director_model.Director.DirectorID.in_(movie_update.director_ids)).all()
        db_movie.directors = directors

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