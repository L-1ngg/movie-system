from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.crud import crud_comment
from app.schemas import comment_schema
from app.database import get_db
from app.api.v1.dependencies import get_current_user
from app.models.user_model import User as UserModel

router = APIRouter()

# 为电影添加新评论
@router.post(
    "/movies/{movie_id}/comments",
    response_model=comment_schema.CommentRead,
    status_code=status.HTTP_201_CREATED,
    summary="为电影添加新评论"
)
def create_comment_for_movie(
    movie_id: int,
    comment: comment_schema.CommentCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """
    为指定电影添加一条新评论。需要用户登录。
    """
    return crud_comment.create_comment(
        db=db, comment=comment, user_id=current_user.UserID, movie_id=movie_id
    )

# 获取单个电影的所有评论
@router.get(
    "/movies/{movie_id}/comments",
    response_model=List[comment_schema.CommentRead],
    summary="获取电影的评论列表"
)
def read_comments_for_movie(
    movie_id: int, 
    db: Session = Depends(get_db), 
    skip: int = 0, 
    limit: int = 100
):
    """
    根据电影ID获取所有评论，支持分页。
    """
    comments = crud_comment.get_comments_by_movie(db=db, movie_id=movie_id, skip=skip, limit=limit)
    return comments

@router.put("/comments/{comment_id}", response_model=comment_schema.CommentRead)
def update_user_comment(
    comment_id: int,
    comment_update: comment_schema.CommentUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    更新用户自己的评论 (需要用户登录)
    """
    db_comment = crud_comment.get_comment(db, comment_id)
    if not db_comment:
        raise HTTPException(status_code=404, detail="评论未找到")
    if db_comment.UserID != current_user.UserID:
        raise HTTPException(status_code=403, detail="没有权限修改他人的评论")
    return crud_comment.update_comment(db=db, comment_id=comment_id, comment_update=comment_update)

@router.delete("/comments/{comment_id}", response_model=comment_schema.CommentRead)
def delete_user_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    删除用户自己的评论 (需要用户登录)
    """
    db_comment = crud_comment.get_comment(db, comment_id)
    if not db_comment:
        raise HTTPException(status_code=404, detail="评论未找到")
    if db_comment.UserID != current_user.UserID:
        raise HTTPException(status_code=403, detail="没有权限删除他人的评论")
    return crud_comment.delete_comment(db=db, comment_id=comment_id)