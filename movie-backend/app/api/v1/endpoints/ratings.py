from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud import crud_rating
from app.schemas import rating_schema
from app.database import get_db
from app.api.v1.dependencies import get_current_user
from app.models.user_model import User as UserModel

router = APIRouter()

@router.post("/movies/{movie_id}/ratings", response_model=rating_schema.RatingRead)
def create_or_update_movie_rating(
    movie_id: int,
    rating: rating_schema.RatingCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    为指定电影创建或更新评分 (需要用户登录)
    """
    return crud_rating.create_or_update_rating(db=db, rating=rating, user_id=current_user.UserID, movie_id=movie_id)

@router.delete("/movies/{movie_id}/ratings", status_code=status.HTTP_204_NO_CONTENT)
def delete_movie_rating(
    movie_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    删除当前用户对指定电影的评分 (需要用户登录)
    """
    db_rating = crud_rating.delete_rating(db=db, user_id=current_user.UserID, movie_id=movie_id)
    if db_rating is None:
        # 即使用户本来就没评分，也返回成功，因为最终状态符合用户的期望
        pass
    return