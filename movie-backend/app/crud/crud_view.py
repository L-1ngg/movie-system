from sqlalchemy.orm import Session
from app.models.view_models import VMovieDetails # 导入视图模型
from app.schemas.view_schemas import MovieDetails # 导入视图 Schema
from typing import Optional

def get_movie_details(db: Session, movie_id: int) -> Optional[VMovieDetails]:
    """
    通过电影ID从 V_MovieDetails 视图中查询详细信息。

    Args:
        db (Session): 数据库会话。
        movie_id (int): 要查询的电影ID。

    Returns:
        Optional[VMovieDetails]: 包含电影详细信息的视图模型实例，如果找不到则返回 None。
    """
    return db.query(VMovieDetails).filter(VMovieDetails.MovieID == movie_id).first()

# 将其组织成一个类
class CRUDMovieView:
    def get_details(self, db: Session, *, movie_id: int) -> Optional[VMovieDetails]:
        return db.query(VMovieDetails).filter(VMovieDetails.MovieID == movie_id).first()

movie_view = CRUDMovieView()